import { deriveKey, verifyPassphrase, wipeSensitiveData } from './crypto-utils';
import { CRYPTO_CONFIG } from '@/constants';

/**
 * Master Passphrase Manager
 * Handles secure storage and management of the user's master passphrase in memory
 * Follows zero-knowledge principles - passphrase never leaves client
 */

interface PassphraseSession {
  derivedKey: CryptoKey;
  expiresAt: number;
  lastActivity: number;
}

class PassphraseManager {
  private session: PassphraseSession | null = null;
  private timeoutId: NodeJS.Timeout | null = null;

  /**
   * Initialize a new passphrase session
   */
  async initializeSession(
    passphrase: string,
    salt: string,
    testEncryptedData?: string,
    testIv?: string
  ): Promise<{ success: boolean; error?: string; cryptoKey?: CryptoKey }> {
    try {
      // Clear any existing session
      this.clearSession();

      // Verify passphrase if test data is provided
      if (testEncryptedData && testIv) {
        const isValid = await verifyPassphrase(
          passphrase,
          salt,
          testEncryptedData,
          testIv,
          CRYPTO_CONFIG.PASSPHRASE_TEST_STRING
        );

        if (!isValid) {
          return { success: false, error: 'Invalid passphrase' };
        }
      }

      // Derive encryption key
      const derivedKey = await deriveKey(passphrase, salt);

      // Create session
      const now = Date.now();
      this.session = {
        derivedKey,
        expiresAt: now + CRYPTO_CONFIG.SESSION_TIMEOUT,
        lastActivity: now,
      };

      // Wipe the passphrase from memory
      wipeSensitiveData(passphrase);

      // Set up auto-timeout
      this.setupAutoTimeout();

      return { success: true, cryptoKey: derivedKey };
    } catch (error) {
      // Wipe the passphrase from memory on error
      wipeSensitiveData(passphrase);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize session',
      };
    }
  }

  /**
   * Get the current derived key if session is active
   */
  getDerivedKey(): CryptoKey | null {
    if (!this.session) {
      return null;
    }

    const now = Date.now();

    // Check if session has expired
    if (now > this.session.expiresAt) {
      this.clearSession();
      return null;
    }

    // Update last activity
    this.session.lastActivity = now;
    
    // Reset auto-timeout
    this.setupAutoTimeout();

    return this.session.derivedKey;
  }

  /**
   * Check if there's an active session
   */
  hasActiveSession(): boolean {
    if (!this.session) {
      return false;
    }

    const now = Date.now();
    if (now > this.session.expiresAt) {
      this.clearSession();
      return false;
    }

    return true;
  }

  /**
   * Extend the current session timeout
   */
  extendSession(additionalTime?: number): boolean {
    if (!this.session) {
      return false;
    }

    const extension = additionalTime || CRYPTO_CONFIG.SESSION_TIMEOUT;
    const now = Date.now();

    this.session.expiresAt = now + extension;
    this.session.lastActivity = now;

    this.setupAutoTimeout();
    return true;
  }

  /**
   * Get session info without exposing sensitive data
   */
  getSessionInfo(): {
    isActive: boolean;
    expiresAt: number | null;
    lastActivity: number | null;
    timeRemaining: number | null;
  } {
    if (!this.session) {
      return {
        isActive: false,
        expiresAt: null,
        lastActivity: null,
        timeRemaining: null,
      };
    }

    const now = Date.now();
    const timeRemaining = Math.max(0, this.session.expiresAt - now);

    return {
      isActive: timeRemaining > 0,
      expiresAt: this.session.expiresAt,
      lastActivity: this.session.lastActivity,
      timeRemaining,
    };
  }

  /**
   * Clear the current session and wipe sensitive data
   */
  clearSession(): void {
    if (this.session) {
      // Try to wipe the crypto key (though JS doesn't guarantee this)
      try {
        wipeSensitiveData(this.session.derivedKey);
      } catch {
        // Best effort cleanup
      }

      this.session = null;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Setup automatic session timeout
   */
  private setupAutoTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (!this.session) {
      return;
    }

    const timeUntilExpiry = this.session.expiresAt - Date.now();
    
    if (timeUntilExpiry > 0) {
      this.timeoutId = setTimeout(() => {
        console.log('Passphrase session expired due to timeout');
        this.clearSession();
        
        // Emit custom event for UI to react to session expiry
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('passphraseSessionExpired'));
        }
      }, timeUntilExpiry);
    }
  }

  /**
   * Reset the inactivity timer
   * Call this when user performs sensitive operations
   */
  recordActivity(): void {
    if (this.session) {
      this.session.lastActivity = Date.now();
    }
  }

  /**
   * Force immediate session expiry
   */
  expireSession(): void {
    if (this.session) {
      this.session.expiresAt = Date.now() - 1;
    }
    this.clearSession();
  }
}

// Create a singleton instance
export const passphraseManager = new PassphraseManager();

// Setup cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    passphraseManager.clearSession();
  });

  // Also clear session on visibility change (when tab becomes hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Optionally expire session when tab becomes hidden
      // This is configurable based on security preferences
      const sessionInfo = passphraseManager.getSessionInfo();
      if (sessionInfo.isActive && sessionInfo.timeRemaining) {
        // Reduce remaining time when tab is hidden for security
        const reducedTime = Math.min(sessionInfo.timeRemaining, CRYPTO_CONFIG.HIDDEN_TAB_TIMEOUT);
        passphraseManager.extendSession(reducedTime - sessionInfo.timeRemaining);
      }
    }
  });
}

// Export the manager and useful types
export type { PassphraseSession };
export default passphraseManager; 