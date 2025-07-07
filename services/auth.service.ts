import { supabase } from '@/lib/supabase/client';
import { Profile, ProfileInsert } from '@/types/database';
import { CRYPTO_CONFIG, ERROR_MESSAGES } from '@/constants';

/**
 * Authentication Service
 * Handles user profile creation, salt generation, and user management
 */
export class AuthService {
  // In-memory cache to prevent concurrent calls for the same user
  private static profileCreationPromises = new Map<string, Promise<{ data: Profile | null; error: string | null }>>();

  /**
   * Check if supabase client is initialized
   */
  private static ensureSupabaseClient() {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    return supabase;
  }

  /**
   * Generate a cryptographic salt for PBKDF2 key derivation
   */
  static generateSalt(): string {
    const saltArray = new Uint8Array(CRYPTO_CONFIG.SALT_LENGTH);
    crypto.getRandomValues(saltArray);
    return btoa(String.fromCharCode(...saltArray));
  }

  /**
   * Create user profile after successful authentication
   */
  static async createProfile(userId: string, email: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
      // Generate unique salt for this user
      const salt = this.generateSalt();

      const profileData: ProfileInsert = {
        user_id: userId,
        email: email.toLowerCase().trim(),
        salt,
        security_settings: {
          autoLockTimeout: 900000, // 15 minutes
          requireMasterPasswordConfirm: false,
          enableBiometric: false,
        },
      };

      const client = this.ensureSupabaseClient();
      const { data, error } = await client
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Profile creation failed:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR 
      };
    }
  }

  /**
   * Create or update profile using UPSERT to prevent race conditions
   * This is the preferred method for ensuring profile exists
   */
  static async createOrUpdateProfile(userId: string, email: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
      // Generate unique salt for this user (only used if creating new profile)
      const salt = this.generateSalt();

      const profileData: ProfileInsert = {
        user_id: userId,
        email: email.toLowerCase().trim(),
        salt,
        security_settings: {
          autoLockTimeout: 900000, // 15 minutes
          requireMasterPasswordConfirm: false,
          enableBiometric: false,
        },
      };

      const client = this.ensureSupabaseClient();
      
      // Use UPSERT (INSERT ... ON CONFLICT) to handle race conditions
      const { data, error } = await client
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Profile upsert error:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Profile upsert failed:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR 
      };
    }
  }

  /**
   * Get user profile by user ID
   */
  static async getProfile(userId: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const client = this.ensureSupabaseClient();
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, that's not necessarily an error
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        console.error('Profile fetch error:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Profile fetch failed:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR 
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string, 
    updates: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const client = this.ensureSupabaseClient();
      const { data, error } = await client
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Profile update failed:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR 
      };
    }
  }

  /**
   * Delete user profile (and associated data)
   */
  static async deleteProfile(userId: string): Promise<{ error: string | null }> {
    try {
      const client = this.ensureSupabaseClient();
      const { error } = await client
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Profile deletion error:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error('Profile deletion failed:', err);
      return { 
        error: err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR 
      };
    }
  }

  /**
   * Get or create profile (helper for login flow)
   * Uses proper concurrency control to prevent race conditions
   */
  static async getOrCreateProfile(userId: string, email: string): Promise<{ data: Profile | null; error: string | null }> {
    // Check if there's already a profile creation in progress for this user
    const existingPromise = this.profileCreationPromises.get(userId);
    if (existingPromise) {
      console.log(`Reusing existing profile creation promise for user ${userId}`);
      return existingPromise;
    }

    // Create a new promise for this user and cache it
    const profilePromise = this.executeGetOrCreateProfile(userId, email);
    this.profileCreationPromises.set(userId, profilePromise);

    try {
      const result = await profilePromise;
      return result;
    } finally {
      // Clean up the cache after completion (success or failure)
      this.profileCreationPromises.delete(userId);
    }
  }

  /**
   * Internal method that performs the actual profile creation logic
   */
  private static async executeGetOrCreateProfile(userId: string, email: string): Promise<{ data: Profile | null; error: string | null }> {
    // First, try the UPSERT approach which handles race conditions at the database level
    try {
      const { data: upsertProfile, error: upsertError } = await this.createOrUpdateProfile(userId, email);
      
      if (!upsertError && upsertProfile) {
        return { data: upsertProfile, error: null };
      }
      
      // If upsert failed, fall back to retry logic
      console.log('UPSERT approach failed, falling back to retry logic:', upsertError);
    } catch (err) {
      console.log('UPSERT approach threw exception, falling back to retry logic:', err);
    }

    // Fallback: Use retry logic for additional safety
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // First, try to get existing profile
        const { data: existingProfile, error: fetchError } = await this.getProfile(userId);
        
        if (fetchError) {
          return { data: null, error: fetchError };
        }

        // If profile exists, return it
        if (existingProfile) {
          return { data: existingProfile, error: null };
        }

        // Attempt to create profile
        const { data: newProfile, error: createError } = await this.createProfile(userId, email);
        
        if (!createError && newProfile) {
          return { data: newProfile, error: null };
        }

        // Handle the specific duplicate key error (race condition)
        if (createError && createError.includes('duplicate key value violates unique constraint')) {
          console.log(`Profile creation race condition detected on attempt ${attempt}, retrying...`);
          
          // Another thread created the profile, try to fetch it again
          const { data: retryProfile, error: retryError } = await this.getProfile(userId);
          
          if (!retryError && retryProfile) {
            return { data: retryProfile, error: null };
          }
          
          // If we still can't get the profile, continue to next retry
          lastError = createError;
          continue;
        }

        // For other errors, return immediately
        if (createError) {
          return { data: null, error: createError };
        }

      } catch (err) {
        console.error(`Profile creation attempt ${attempt} failed:`, err);
        lastError = err instanceof Error ? err.message : 'Unknown error';
        
        // Add small delay before retry to reduce contention
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        }
      }
    }

    // If all approaches failed, return the last error
    return { 
      data: null, 
      error: lastError || 'Failed to get or create profile after multiple attempts' 
    };
  }

  /**
   * Validate user session and ensure profile exists
   */
  static async validateSession(): Promise<{ 
    user: any | null; 
    profile: Profile | null; 
    error: string | null 
  }> {
    try {
      // Get current session
      const client = this.ensureSupabaseClient();
      const { data: { session }, error: sessionError } = await client.auth.getSession();

      if (sessionError) {
        return { user: null, profile: null, error: sessionError.message };
      }

      if (!session?.user) {
        return { user: null, profile: null, error: null };
      }

      // Get or create profile
      const { data: profile, error: profileError } = await this.getOrCreateProfile(
        session.user.id,
        session.user.email || ''
      );

      if (profileError) {
        return { user: session.user, profile: null, error: profileError };
      }

      return { user: session.user, profile, error: null };
    } catch (err) {
      console.error('Session validation failed:', err);
      return { 
        user: null, 
        profile: null, 
        error: err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR 
      };
    }
  }

  /**
   * Check if email is available for registration
   */
  static async checkEmailAvailability(email: string): Promise<{ available: boolean; error: string | null }> {
    try {
      const client = this.ensureSupabaseClient();
      const { data, error } = await client
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error) {
        // If no profile found, email is available
        if (error.code === 'PGRST116') {
          return { available: true, error: null };
        }
        return { available: false, error: error.message };
      }

      // If profile found, email is taken
      return { available: false, error: null };
    } catch (err) {
      console.error('Email availability check failed:', err);
      return { 
        available: false, 
        error: err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR 
      };
    }
  }

  /**
   * Update user security settings
   */
  static async updateSecuritySettings(
    userId: string, 
    settings: Record<string, any>
  ): Promise<{ error: string | null }> {
    try {
      const client = this.ensureSupabaseClient();
      const { error } = await client
        .from('profiles')
        .update({ security_settings: settings })
        .eq('user_id', userId);

      if (error) {
        console.error('Security settings update error:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error('Security settings update failed:', err);
      return { 
        error: err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR 
      };
    }
  }

  /**
   * Clear the profile creation cache (utility for testing/debugging)
   */
  static clearProfileCreationCache(): void {
    this.profileCreationPromises.clear();
    console.log('Profile creation cache cleared');
  }

  /**
   * Get cache status (utility for debugging)
   */
  static getProfileCreationCacheStatus(): { activePromises: string[] } {
    return {
      activePromises: Array.from(this.profileCreationPromises.keys())
    };
  }

  /**
   * Update user email address (requires OTP verification)
   */
  static async updateUserEmail(
    userId: string,
    newEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const client = this.ensureSupabaseClient();
      
      // Update email in Supabase Auth
      const { error: authError } = await client.auth.updateUser({
        email: newEmail.toLowerCase().trim()
      });

      if (authError) {
        console.error('Auth email update error:', authError);
        return { success: false, error: authError.message };
      }

      // Update email in profile
      const { error: profileError } = await client
        .from('profiles')
        .update({ email: newEmail.toLowerCase().trim() })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Profile email update error:', profileError);
        return { success: false, error: profileError.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Email update failed:', err);
      return { 
        success: false,
        error: err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR 
      };
    }
  }

  /**
   * Delete user profile and all associated data (requires OTP verification)
   */
  static async deleteUserAccount(userId: string, email?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = this.ensureSupabaseClient();

      // Call secure API route to permanently delete the Supabase Auth user (and, by cascade, all owned rows)
      const resp = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });

      if (!resp.ok) {
        const { error } = await resp.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Account deletion API error:', error);
        return { success: false, error: error || 'Failed to delete account' };
      }

      // Sign the user out locally – their token is now invalid anyway, but this
      // clears local storage/session.
      await client.auth.signOut();

      // Clear any cached promises to avoid stale state if the user re-registers in the same tab.
      this.clearProfileCreationCache();

      return { success: true };
    } catch (err) {
      console.error('Account deletion failed:', err);
      return { 
        success: false,
        error: err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR 
      };
    }
  }
} 