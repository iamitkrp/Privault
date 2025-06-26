import { supabase } from '@/lib/supabase/client';

export interface OTPVerification {
  id: string;
  user_id: string;
  otp_code: string;
  purpose: 'vault_access' | 'vault_password_change';
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

/**
 * OTP Service for Vault Security
 * Handles email-based OTP verification for vault access and password changes
 */
export class OTPService {
  /**
   * Generate a 6-digit OTP code
   */
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP via email using API route
   */
  private static async sendEmail(
    email: string,
    otpCode: string,
    purpose: 'vault_access' | 'vault_password_change',
    expiresAt: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otpCode,
          purpose,
          expiresAt: expiresAt.toISOString(),
        }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        console.error('API email send error:', result.error);
        return { success: false, error: result.error || 'Failed to send email' };
      }

      console.log('✅ OTP email sent successfully via API');
      return { success: true };
      
    } catch (error) {
      console.error('Email API call error:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  /**
   * Send OTP via email for vault security
   */
  static async sendVaultOTP(
    userId: string, 
    email: string, 
    purpose: 'vault_access' | 'vault_password_change'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Generate OTP code
      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database (we'll create this table)
      const { error: insertError } = await supabase
        .from('vault_otp_verifications')
        .insert({
          user_id: userId,
          otp_code: otpCode,
          purpose,
          expires_at: expiresAt.toISOString(),
          is_used: false
        });

      if (insertError) {
        console.error('Failed to store OTP:', insertError);
        throw new Error('Failed to generate OTP');
      }

      // Try to send email via API
      const emailResult = await this.sendEmail(email, otpCode, purpose, expiresAt);
      
      if (emailResult.success) {
        console.log('✅ OTP email sent successfully to:', email);
        return { 
          success: true,
          message: 'OTP sent to your email address'
        };
      } else {
        // Fallback: Log to console for development
        console.error('❌ Email sending failed, showing OTP in console:');
        console.log(`
🔐 PRIVAULT SECURITY OTP (EMAIL FAILED - CONSOLE FALLBACK)
════════════════════════════════════════════════════════
To: ${email}
Purpose: ${purpose === 'vault_access' ? 'Vault Access' : 'Vault Password Change'}
Code: ${otpCode}
Expires: ${expiresAt.toLocaleString()}
Email Error: ${emailResult.error}

📋 COPY THIS CODE: ${otpCode}
════════════════════════════════════════════════════════
        `);
        
        // Return error so user knows email failed
        return { 
          success: false, 
          error: `Email sending failed: ${emailResult.error}. Check console for OTP code.`,
          fallback: true
        };
      }
      
    } catch (error) {
      console.error('OTP send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP'
      };
    }
  }

  /**
   * Verify OTP code
   */
  static async verifyOTP(
    userId: string,
    otpCode: string,
    purpose: 'vault_access' | 'vault_password_change'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Find valid OTP
      const { data: otpRecord, error: fetchError } = await supabase
        .from('vault_otp_verifications')
        .select('*')
        .eq('user_id', userId)
        .eq('otp_code', otpCode)
        .eq('purpose', purpose)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !otpRecord) {
        return { success: false, error: 'Invalid or expired OTP code' };
      }

      // Mark OTP as used
      const { error: updateError } = await supabase
        .from('vault_otp_verifications')
        .update({ is_used: true })
        .eq('id', otpRecord.id);

      if (updateError) {
        console.error('Failed to mark OTP as used:', updateError);
        return { success: false, error: 'OTP verification failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OTP verification failed'
      };
    }
  }

  /**
   * Check if user needs OTP for vault access
   * (Called after login to determine if OTP is required)
   */
  static needsOTPForVaultAccess(userId: string): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check if user recently logged out and back in
    const lastLogout = localStorage.getItem(`last-logout-${userId}`);
    const now = Date.now();
    
    if (lastLogout) {
      const logoutTime = parseInt(lastLogout);
      // If logout was within last 24 hours, require OTP
      return (now - logoutTime) < (24 * 60 * 60 * 1000);
    }
    
    return false;
  }

  /**
   * Mark that user logged out (called from signOut)
   */
  static markUserLogout(userId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`last-logout-${userId}`, Date.now().toString());
    }
  }

  /**
   * Clear logout marker (called after successful OTP verification)
   */
  static clearLogoutMarker(userId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`last-logout-${userId}`);
    }
  }

  /**
   * Cleanup expired OTPs (can be called periodically)
   */
  static async cleanupExpiredOTPs(): Promise<void> {
    try {
      if (!supabase) return;

      await supabase
        .from('vault_otp_verifications')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Failed to cleanup expired OTPs:', error);
    }
  }
} 