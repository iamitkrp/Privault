import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { Result, UserProfile } from '@/types';
import { ERROR_MESSAGES } from '@/constants';
import { generateSalt } from '@/lib/crypto/core';

export class AuthService {
    constructor(private supabase: SupabaseClient<Database>) { }

    /**
     * Generates a persistent cryptographic salt and signs up a new user.
     * Stores the salt in the user's auth metadata so it survives email verification.
     */
    async signUp(email: string, password: string): Promise<Result<{ id: string }>> {
        try {
            // 1. Generate a robust cryptographic salt on the client
            const salt = generateSalt();

            // 2. Sign up with Supabase, throwing the salt into user_metadata
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        crypto_salt: salt,
                    },
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
                },
            });

            if (error) {
                console.error('Signup error:', error.message);
                return { success: false, error: new Error(ERROR_MESSAGES.auth.signupFailed) };
            }

            if (!data.user) {
                return { success: false, error: new Error(ERROR_MESSAGES.auth.signupFailed) };
            }

            // Note: If email confirmation is ON, the user is not signed in yet.
            // The profile will be created upon first login or via an edge function / webhook callback.
            // To keep it simple, we create the profile upon the first successful login or auth callback.

            return { success: true, data: { id: data.user.id } };
        } catch (e) {
            console.error('Unexpected signup error.');
            return { success: false, error: new Error(ERROR_MESSAGES.generic.unexpected) };
        }
    }

    /**
     * Logs in a user. Automatically ensures their profile exists.
     */
    async signIn(email: string, password: string): Promise<Result<{ id: string }>> {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: new Error(ERROR_MESSAGES.auth.invalidCredentials) };
            }

            if (!data.user) {
                return { success: false, error: new Error(ERROR_MESSAGES.auth.invalidCredentials) };
            }

            // Profile creation is handled by auth-context's onAuthStateChange (SIGNED_IN event).
            // Do NOT await ensureProfileExists here — it runs concurrently via the auth listener
            // and blocking on it causes the modal to stay stuck on "AUTHENTICATING..." on first login.

            return { success: true, data: { id: data.user.id } };
        } catch (e) {
            console.error('Unexpected login error.');
            return { success: false, error: new Error(ERROR_MESSAGES.generic.unexpected) };
        }
    }

    /**
     * Signs out the current user.
     */
    async signOut(): Promise<Result<void>> {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            return { success: true, data: undefined };
        } catch (e) {
            console.error('Signout error.');
            return { success: false, error: new Error(ERROR_MESSAGES.generic.unexpected) };
        }
    }

    /**
     * Fetches the current user's profile.
     */
    async getProfile(userId: string): Promise<Result<UserProfile>> {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                return { success: false, error: new Error(ERROR_MESSAGES.generic.unexpected) };
            }

            if (!data) {
                return { success: false, error: new Error(ERROR_MESSAGES.generic.unexpected) };
            }

            return {
                success: true,
                data: data as unknown as UserProfile
            };
        } catch (e) {
            console.error('Get profile error.');
            return { success: false, error: new Error(ERROR_MESSAGES.generic.unexpected) };
        }
    }

    /**
     * Helper to ensure a user's `profiles` row exists.
     * Returns success/error so callers can act on failures.
     */
    async ensureProfileExists(user: any): Promise<{ success: boolean; error?: Error }> {
        try {
            // 1. Check if it already exists
            const { data: existingProfile } = await this.supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingProfile) return { success: true }; // All good

            // 2. We need to create it. Re-extract the salt from user metadata.
            let salt = user.user_metadata?.crypto_salt;

            if (!salt) {
                // Fallback: generate a fresh salt so the user isn't left without a profile.
                // Note: this means any data encrypted with the original (missing) salt
                // will be unrecoverable, but it prevents a broken account state.

                salt = generateSalt();
            }

            // 3. Insert the profile
            // @ts-expect-error - Manual mock Database types are overly restrictive. Real DB types will fix this.
            const { error: insertError } = await this.supabase.from('profiles').insert({
                user_id: user.id,
                email: user.email!,
                salt: salt,
                security_settings: {
                    autoLockTimeout: 900000,
                    requireOtp: false,
                    require_otp_on_login: true,
                    require_otp_on_vault_unlock: false,
                }
            });

            if (insertError) {
                console.error('Profile insertion failed. Code:', insertError?.code);
                return { success: false, error: new Error('Failed to create user profile.') };
            }

            return { success: true };
        } catch (e) {
            console.error('Failed to ensure profile exists.');
            return { success: false, error: new Error('Failed to create user profile.') };
        }
    }
}

