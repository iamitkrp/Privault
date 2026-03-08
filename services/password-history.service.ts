import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { Result } from '@/types';
import { encryptData, decryptData } from '@/lib/crypto/engine';
import { hashPasswordForStorage } from '@/lib/crypto/engine';
import { passphraseManager } from '@/lib/crypto/passphrase';

export class PasswordHistoryService {
    constructor(private supabase: SupabaseClient<Database>) { }

    private getActiveKey(): CryptoKey {
        return passphraseManager.getKey();
    }

    /**
     * Saves the old password to history when a credential's password is changed.
     * Encrypts the old password and stores a hash for reuse detection.
     */
    async savePasswordHistory(
        userId: string,
        credentialId: string,
        oldPassword: string,
        changeReason: string = 'manual'
    ): Promise<Result<void>> {
        try {
            const key = this.getActiveKey();

            // Encrypt the old password
            const { encryptedData, iv } = await encryptData(oldPassword, key);

            // Hash the old password for reuse detection
            const passwordHash = await hashPasswordForStorage(oldPassword);

            const { error } = await this.supabase
                .from('password_history')
                // @ts-expect-error - Database types are restrictive
                .insert({
                    user_id: userId,
                    credential_id: credentialId,
                    encrypted_old_password: encryptedData,
                    iv: iv,
                    password_hash: passwordHash,
                    change_reason: changeReason,
                });

            if (error) {
                console.error('Password history insert error:', error);
                return { success: false, error: new Error('Failed to save password history.') };
            }

            return { success: true, data: undefined };
        } catch (e) {
            console.error('Failed to save password history:', e);
            return { success: false, error: new Error('Failed to save password history.') };
        }
    }

    /**
     * Fetches the last N password history entries for a credential.
     * Returns decrypted old passwords.
     */
    async getHistory(
        credentialId: string,
        limit: number = 10
    ): Promise<Result<{ password: string; changed_at: string; change_reason: string | null }[]>> {
        try {
            const key = this.getActiveKey();

            const { data, error } = await this.supabase
                .from('password_history')
                .select('*')
                .eq('credential_id', credentialId)
                .order('changed_at', { ascending: false })
                .limit(limit);

            if (error) {
                return { success: false, error: new Error('Failed to fetch password history.') };
            }

            if (!data || data.length === 0) {
                return { success: true, data: [] };
            }

            const entries = await Promise.all(
                data.map(async (row: any) => {
                    const decryptedPassword = await decryptData(row.encrypted_old_password, row.iv, key);
                    return {
                        password: decryptedPassword,
                        changed_at: row.changed_at,
                        change_reason: row.change_reason,
                    };
                })
            );

            return { success: true, data: entries };
        } catch (e) {
            console.error('Failed to get password history:', e);
            return { success: false, error: new Error('Failed to fetch password history.') };
        }
    }
}
