import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import {
    Result,
    EncryptedCredential,
    DecryptedCredential,
    VaultCredential,
    CredentialCategory
} from '@/types';
import { ERROR_MESSAGES } from '@/constants';
import { encryptData, decryptData } from '@/lib/crypto/engine';
import { passphraseManager } from '@/lib/crypto/passphrase';
import { AuditService } from './audit.service';

export class VaultService {
    private audit: AuditService;
    constructor(private supabase: SupabaseClient<Database>) {
        this.audit = new AuditService(supabase);
    }

    private getActiveKey(): CryptoKey {
        try {
            return passphraseManager.getKey();
        } catch {
            throw new Error("Vault is locked");
        }
    }

    /**
     * Helper to derive the visual "expiration_status" based on the expires_at date.
     */
    private calculateExpirationStatus(expiresAt: string | null): "active" | "expiring_soon" | "expired" {
        if (!expiresAt) return "active";

        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return "expired";
        if (diffDays <= 14) return "expiring_soon";
        return "active";
    }

    /**
     * Decrypts a single EncryptedCredential from the database.
     */
    private async decryptCredentialRow(row: EncryptedCredential, key: CryptoKey): Promise<VaultCredential> {
        const decryptedJsonStr = await decryptData(row.encrypted_data, row.iv, key);
        const decrypted: DecryptedCredential = JSON.parse(decryptedJsonStr);

        return {
            id: row.id,
            credential_id: row.credential_id,
            decrypted,
            category: row.category,
            tags: row.tags,
            is_favorite: row.is_favorite,
            expires_at: row.expires_at,
            expiration_status: this.calculateExpirationStatus(row.expires_at),
            last_password_change: row.last_password_change,
            access_count: row.access_count,
            last_accessed: row.last_accessed,
            version: row.version,
            created_at: row.created_at,
            updated_at: row.updated_at
        };
    }

    /**
     * Fetches all credentials for the current user and decrypts them.
     */
    async getCredentials(): Promise<Result<VaultCredential[]>> {
        try {
            const key = this.getActiveKey();

            const { data, error } = await this.supabase
                .from('vault_credentials')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Fetch DB Error:", error);
                return { success: false, error: new Error(ERROR_MESSAGES.vault.loadFailed) };
            }

            if (!data) return { success: true, data: [] };

            // Decrypt all rows dynamically
            const decryptedRows = await Promise.all(
                data.map(row => this.decryptCredentialRow(row as unknown as EncryptedCredential, key))
            );

            // Audit log: record bulk credential read (non-blocking, only when user is identified)
            try {
                const { data: { user } } = await this.supabase.auth.getUser();
                if (user?.id) {
                    this.audit.logAction(user.id, 'credential_read', 'vault', undefined, { count: decryptedRows.length });
                } else {
                    console.warn('Skipping credential_read audit: no authenticated user session.');
                }
            } catch { /* non-blocking */ }

            return { success: true, data: decryptedRows };

        } catch (e) {
            console.error('Failed to get credentials:', e);
            return { success: false, error: new Error(ERROR_MESSAGES.vault.loadFailed) };
        }
    }

    /**
     * Adds a new credential to the vault.
     * Encrypts the sensitive payload before hitting the database API.
     */
    async addCredential(
        userId: string,
        decrypted: DecryptedCredential,
        metadata: {
            category?: CredentialCategory,
            tags?: string[],
            is_favorite?: boolean,
            expires_at?: string | null
        } = {}
    ): Promise<Result<VaultCredential>> {
        try {
            const key = this.getActiveKey();

            // 1. Serialize and encrypt sensitive body
            const plaintext = JSON.stringify(decrypted);
            const { encryptedData, iv } = await encryptData(plaintext, key);

            // 2. Insert to Supabase along with public metadata
            const { data, error } = await this.supabase
                .from('vault_credentials')
                .insert({
                    user_id: userId,
                    encrypted_data: encryptedData,
                    iv: iv,
                    category: metadata.category || 'other',
                    tags: metadata.tags || [],
                    is_favorite: metadata.is_favorite || false,
                    expires_at: metadata.expires_at || null,
                } as any)
                .select()
                .single();

            if (error) {
                console.error("Insert error:", error);
                return { success: false, error: new Error(ERROR_MESSAGES.vault.saveFailed) };
            }

            // 3. Decrypt and return the full credential to update local state without reloading
            const newCredential = await this.decryptCredentialRow(data as unknown as EncryptedCredential, key);

            // Audit log
            this.audit.logAction(userId, 'credential_created', 'credential', newCredential.id);

            return { success: true, data: newCredential };

        } catch (e) {
            console.error('Failed to add credential:', e);
            return { success: false, error: new Error(ERROR_MESSAGES.vault.saveFailed) };
        }
    }

    /**
     * Updates an existing credential.
     */
    async updateCredential(
        id: string,
        decrypted: DecryptedCredential,
        metadata: {
            category?: CredentialCategory,
            tags?: string[],
            is_favorite?: boolean,
            expires_at?: string | null
        } = {}
    ): Promise<Result<VaultCredential>> {
        try {
            const key = this.getActiveKey();

            // Ensure we hit the API properly, we don't increment version/access_count here 
            // directly as that is just metadata handling
            const plaintext = JSON.stringify(decrypted);
            const { encryptedData, iv } = await encryptData(plaintext, key);

            const { data, error } = await this.supabase
                .from('vault_credentials')
                // @ts-expect-error
                .update({
                    encrypted_data: encryptedData,
                    iv: iv,
                    category: metadata.category,
                    tags: metadata.tags,
                    is_favorite: metadata.is_favorite,
                    expires_at: metadata.expires_at !== undefined ? metadata.expires_at : undefined,
                    // DB triggers handle updated_at
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error("Update error:", error);
                return { success: false, error: new Error(ERROR_MESSAGES.vault.saveFailed) };
            }

            const updatedCred = await this.decryptCredentialRow(data as unknown as EncryptedCredential, key);

            // Audit log
            this.audit.logAction(updatedCred.decrypted.site_name ? id : id, 'credential_updated', 'credential', id);

            return { success: true, data: updatedCred };

        } catch (e) {
            console.error('Failed to update credential:', e);
            return { success: false, error: new Error(ERROR_MESSAGES.vault.saveFailed) };
        }
    }

    /**
     * Deletes a credential.
     */
    async deleteCredential(id: string): Promise<Result<void>> {
        try {
            // Just confirming vault is unlocked before allowing destructive action
            this.getActiveKey();

            // Retrieve authenticated user for audit trail — fail early if unavailable
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user?.id) {
                return { success: false, error: new Error('Authentication session expired. Please log in again.') };
            }

            const { error } = await this.supabase
                .from('vault_credentials')
                .delete()
                .eq('id', id);

            if (error) {
                return { success: false, error: new Error(ERROR_MESSAGES.vault.deleteFailed) };
            }

            // Audit log
            this.audit.logAction(user.id, 'credential_deleted', 'credential', id);

            return { success: true, data: undefined };
        } catch (e) {
            console.error('Failed to delete credential:', e);
            return { success: false, error: new Error(ERROR_MESSAGES.vault.deleteFailed) };
        }
    }

    /**
     * Rotates the master password.
     * 1. Verify old password against the stored verification data.
     * 2. Decrypt ALL credentials with the old key (at old iterations).
     * 3. Derive a NEW key from the new password + existing salt (at current best iterations).
     * 4. Re-encrypt ALL credentials with the new key.
     * 5. Generate new vault_verification_data with the new key.
     * 6. Batch-update Supabase (all credentials + profile verification data + kdf_iterations).
     * 7. Re-unlock the passphrase manager with the new key.
     */
    async rotateMasterPassword(
        userId: string,
        oldPassword: string,
        newPassword: string,
        saltBase64: string,
        currentVerificationData: string | null,
        kdfIterations: number | null
    ): Promise<Result<{ newVerificationData: string }>> {
        const { deriveKeyFromPassword } = await import('@/lib/crypto/engine');
        const { passphraseManager } = await import('@/lib/crypto/passphrase');
        const { CRYPTO_CONFIG } = await import('@/constants');

        // The effective old iteration count
        const oldIterations = kdfIterations ?? CRYPTO_CONFIG.legacyIterations;

        try {
            // ── Step 1: Verify old password ──
            const { isValid } = await passphraseManager.verifyOrSetupMasterPassword(
                oldPassword,
                saltBase64,
                currentVerificationData,
                kdfIterations
            );
            if (!isValid) {
                return { success: false, error: new Error("Current master password is incorrect.") };
            }

            // ── Step 2: Derive both keys ──
            // Old key at user's stored iterations; new key always at current best
            const oldKey = await deriveKeyFromPassword(oldPassword, saltBase64, oldIterations);
            const newKey = await deriveKeyFromPassword(newPassword, saltBase64, CRYPTO_CONFIG.iterations);

            // ── Step 3: Fetch all raw encrypted rows ──
            const { data: rows, error: fetchErr } = await this.supabase
                .from('vault_credentials')
                .select('*')
                .eq('user_id', userId);

            if (fetchErr) {
                return { success: false, error: new Error("Failed to fetch credentials for re-encryption.") };
            }

            // ── Step 4: Decrypt with old key → re-encrypt with new key ──
            const updates: { id: string; encrypted_data: string; iv: string }[] = [];

            for (const row of (rows || [])) {
                const r = row as unknown as EncryptedCredential;
                const plaintext = await decryptData(r.encrypted_data, r.iv, oldKey);
                const { encryptedData, iv } = await encryptData(plaintext, newKey);
                updates.push({ id: r.id, encrypted_data: encryptedData, iv });
            }

            // ── Step 5: Create new verification data with the new key ──
            const verResult = await encryptData(CRYPTO_CONFIG.verificationString, newKey);
            const newVerificationData = JSON.stringify(verResult);

            // ── Step 6: Atomically update all credentials via RPC ──
            // The rotate_vault_credentials function runs within a single PostgreSQL
            // transaction — if any row update fails, the entire batch rolls back,
            // preventing partial-key corruption of the vault.
            // @ts-expect-error - Database types don't include custom RPC functions
            const { error: rpcErr } = await this.supabase.rpc('rotate_vault_credentials', {
                p_user_id: userId,
                p_updates: updates,
            });

            if (rpcErr) {
                console.error('Atomic credential rotation failed:', rpcErr);
                return { success: false, error: new Error('Re-encryption failed. No credentials were modified.') };
            }

            // Update profile verification data AND upgrade kdf_iterations
            const { error: profileErr } = await this.supabase
                .from('profiles')
                // @ts-expect-error
                .update({
                    vault_verification_data: newVerificationData,
                    kdf_iterations: CRYPTO_CONFIG.iterations,
                })
                .eq('user_id', userId);

            if (profileErr) {
                return { success: false, error: new Error("Failed to update verification data.") };
            }

            // ── Step 7: Re-unlock passphrase manager with new key at new iterations ──
            passphraseManager.lock();
            await passphraseManager.unlock(newPassword, saltBase64, CRYPTO_CONFIG.iterations);

            return { success: true, data: { newVerificationData } };

        } catch (e) {
            console.error("Master password rotation failed:", e);
            return { success: false, error: new Error("Password change failed. Your old password is still active.") };
        }
    }
}
