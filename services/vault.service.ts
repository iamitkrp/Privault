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

export class VaultService {
    constructor(private supabase: SupabaseClient<Database>) { }

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

            const { error } = await this.supabase
                .from('vault_credentials')
                .delete()
                .eq('id', id);

            if (error) {
                return { success: false, error: new Error(ERROR_MESSAGES.vault.deleteFailed) };
            }

            return { success: true, data: undefined };
        } catch (e) {
            console.error('Failed to delete credential:', e);
            return { success: false, error: new Error(ERROR_MESSAGES.vault.deleteFailed) };
        }
    }
}
