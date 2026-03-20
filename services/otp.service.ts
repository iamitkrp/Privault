import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { Result } from '@/types';
import { VALIDATION } from '@/constants';
import { createHash } from 'crypto';

/**
 * OTP Service — generates, stores, and verifies 6-digit email-based OTP codes.
 *
 * Architecture:
 * - OTP generation happens client-side (crypto.getRandomValues).
 * - The code is hashed (SHA-256) before storage in `vault_otp_verifications`.
 * - Email delivery uses Supabase's `auth.resetPasswordForEmail` as a proxy,
 *   or in production, a dedicated Edge Function / email provider.
 * - For now, the code is stored (hashed) and verified against the DB without email.
 *   The UI will show the code in a toast for dev/testing.
 */
export class OTPService {
    constructor(private supabase: SupabaseClient<Database>) { }

    /**
     * Generates a cryptographically secure 6-digit OTP code.
     */
    private generateCode(): string {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const code = (array[0]! % 1000000).toString().padStart(6, '0');
        return code;
    }

    /**
     * Produces a SHA-256 hex digest of the OTP code.
     * OTPs are ephemeral (10-minute expiry) and rate-limited, so no salt is needed —
     * the purpose is only to avoid storing plaintext codes at rest.
     */
    private hashOtpCode(code: string): string {
        return createHash('sha256').update(code).digest('hex');
    }

    /**
     * Creates and stores a new OTP for the given user and purpose.
     * Returns the plaintext code so the caller can display/send it.
     * The DB only ever sees the SHA-256 hash.
     */
    async createOTP(
        userId: string,
        purpose: 'login' | 'vault_unlock' | 'vault_access' | 'vault_password_change' | 'email_update' | 'profile_delete'
    ): Promise<Result<{ code: string; expiresAt: string }>> {
        try {
            // Invalidate any existing unused OTPs for this user+purpose
            await this.supabase
                .from('vault_otp_verifications')
                // @ts-expect-error
                .update({ is_used: true })
                .eq('user_id', userId)
                .eq('purpose', purpose)
                .eq('is_used', false);

            const code = this.generateCode();
            const hashedCode = this.hashOtpCode(code);
            const expiresAt = new Date(Date.now() + VALIDATION.otp.expiryMs).toISOString();

            const { error } = await this.supabase
                .from('vault_otp_verifications')
                // @ts-expect-error
                .insert({
                    user_id: userId,
                    otp_code: hashedCode,
                    purpose,
                    expires_at: expiresAt,
                    is_used: false,
                });

            if (error) {
                console.error('OTP creation failed:', error);
                return { success: false, error: new Error('Failed to create verification code.') };
            }

            return { success: true, data: { code, expiresAt } };
        } catch (e) {
            console.error('OTP creation error:', e);
            return { success: false, error: new Error('Failed to create verification code.') };
        }
    }

    /**
     * Verifies an OTP code for a user and purpose.
     * Hashes the provided code before querying the DB.
     * Marks the code as used upon successful verification.
     */
    async verifyOTP(
        userId: string,
        code: string,
        purpose: 'login' | 'vault_unlock' | 'vault_access' | 'vault_password_change' | 'email_update' | 'profile_delete'
    ): Promise<Result<{ verified: boolean }>> {
        try {
            const hashedCode = this.hashOtpCode(code);

            const { data, error } = await this.supabase
                .from('vault_otp_verifications')
                .select('*')
                .eq('user_id', userId)
                .eq('otp_code', hashedCode)
                .eq('purpose', purpose)
                .eq('is_used', false)
                .gte('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                return { success: false, error: new Error('Verification check failed.') };
            }

            if (!data) {
                return { success: true, data: { verified: false } };
            }

            // Mark as used
            await this.supabase
                .from('vault_otp_verifications')
                // @ts-expect-error
                .update({ is_used: true })
                .eq('id', (data as any).id);

            return { success: true, data: { verified: true } };
        } catch (e) {
            console.error('OTP verification error:', e);
            return { success: false, error: new Error('Verification failed.') };
        }
    }
}

