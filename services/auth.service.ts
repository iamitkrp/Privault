import { supabase } from '@/lib/supabase/client';
import { Profile, ProfileInsert } from '@/types/database';
import { CRYPTO_CONFIG, ERROR_MESSAGES } from '@/constants';

/**
 * Authentication Service
 * Handles user profile creation, salt generation, and user management
 */
export class AuthService {
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

      const { data, error } = await supabase
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
   * Get user profile by user ID
   */
  static async getProfile(userId: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { error } = await supabase
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
   */
  static async getOrCreateProfile(userId: string, email: string): Promise<{ data: Profile | null; error: string | null }> {
    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await this.getProfile(userId);
    
    if (fetchError) {
      return { data: null, error: fetchError };
    }

    // If profile exists, return it
    if (existingProfile) {
      return { data: existingProfile, error: null };
    }

    // If no profile exists, create one
    return await this.createProfile(userId, email);
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

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
      const { data, error } = await supabase
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
      const { error } = await supabase
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
} 