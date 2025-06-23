import { 
  encrypt, 
  decrypt, 
  generateSalt, 
  createPassphraseVerification, 
  generateSecurePassword,
  hashData,
  wipeSensitiveData 
} from '@/lib/crypto/crypto-utils';
import { passphraseManager } from '@/lib/crypto/passphrase-manager';
import type { VaultItem } from '@/types';

/**
 * Crypto Service
 * High-level cryptographic operations for the password manager
 * Provides a clean interface for all encryption/decryption operations
 */

export class CryptoService {
  /**
   * Initialize a new user's cryptographic setup
   */
  async initializeUserCrypto(masterPassphrase: string): Promise<{
    success: boolean;
    salt?: string;
    testEncryptedData?: string;
    testIv?: string;
    error?: string;
  }> {
    try {
      // Generate a unique salt for this user
      const salt = generateSalt();

      // Create passphrase verification data
      const { testEncryptedData, testIv } = await createPassphraseVerification(
        masterPassphrase,
        salt
      );

      // Initialize the passphrase session
      const sessionResult = await passphraseManager.initializeSession(
        masterPassphrase,
        salt
      );

      if (!sessionResult.success) {
        return { success: false, error: sessionResult.error };
      }

      return {
        success: true,
        salt,
        testEncryptedData,
        testIv,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize crypto',
      };
    }
  }

  /**
   * Unlock the user's vault with their master passphrase
   */
  async unlockVault(
    masterPassphrase: string,
    salt: string,
    testEncryptedData: string,
    testIv: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await passphraseManager.initializeSession(
        masterPassphrase,
        salt,
        testEncryptedData,
        testIv
      );

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unlock vault',
      };
    }
  }

  /**
   * Check if the vault is currently unlocked
   */
  isVaultUnlocked(): boolean {
    return passphraseManager.hasActiveSession();
  }

  /**
   * Lock the vault (clear the session)
   */
  lockVault(): void {
    passphraseManager.clearSession();
  }

  /**
   * Get session information
   */
  getSessionInfo() {
    return passphraseManager.getSessionInfo();
  }

  /**
   * Extend the current session
   */
  extendSession(additionalTime?: number): boolean {
    return passphraseManager.extendSession(additionalTime);
  }

  /**
   * Encrypt a single vault item
   */
  async encryptVaultItem(item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean;
    encryptedData?: string;
    iv?: string;
    error?: string;
  }> {
    try {
      const key = passphraseManager.getDerivedKey();
      if (!key) {
        return { success: false, error: 'Vault is locked' };
      }

      // Record activity
      passphraseManager.recordActivity();

      // Serialize the item data
      const itemData = JSON.stringify(item);

      // Encrypt the data
      const { encryptedData, iv } = await encrypt(itemData, key);

      return {
        success: true,
        encryptedData,
        iv,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to encrypt item',
      };
    }
  }

  /**
   * Decrypt a single vault item
   */
  async decryptVaultItem(
    encryptedData: string,
    iv: string
  ): Promise<{
    success: boolean;
    item?: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>;
    error?: string;
  }> {
    try {
      const key = passphraseManager.getDerivedKey();
      if (!key) {
        return { success: false, error: 'Vault is locked' };
      }

      // Record activity
      passphraseManager.recordActivity();

      // Decrypt the data
      const decryptedData = await decrypt(encryptedData, iv, key);

      // Parse the item data
      const item = JSON.parse(decryptedData);

      return {
        success: true,
        item,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to decrypt item',
      };
    }
  }

  /**
   * Encrypt an entire vault (collection of items)
   */
  async encryptVault(items: VaultItem[]): Promise<{
    success: boolean;
    encryptedData?: string;
    iv?: string;
    error?: string;
  }> {
    try {
      const key = passphraseManager.getDerivedKey();
      if (!key) {
        return { success: false, error: 'Vault is locked' };
      }

      // Record activity
      passphraseManager.recordActivity();

      // Serialize the vault data
      const vaultData = JSON.stringify(items);

      // Encrypt the entire vault
      const { encryptedData, iv } = await encrypt(vaultData, key);

      return {
        success: true,
        encryptedData,
        iv,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to encrypt vault',
      };
    }
  }

  /**
   * Decrypt an entire vault
   */
  async decryptVault(
    encryptedData: string,
    iv: string
  ): Promise<{
    success: boolean;
    items?: VaultItem[];
    error?: string;
  }> {
    try {
      const key = passphraseManager.getDerivedKey();
      if (!key) {
        return { success: false, error: 'Vault is locked' };
      }

      // Record activity
      passphraseManager.recordActivity();

      // Decrypt the vault
      const decryptedData = await decrypt(encryptedData, iv, key);

      // Parse the vault data
      const items = JSON.parse(decryptedData);

      return {
        success: true,
        items,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to decrypt vault',
      };
    }
  }

  /**
   * Generate a secure password for a new item
   */
  generatePassword(
    length: number = 16,
    includeSymbols: boolean = true
  ): string {
    return generateSecurePassword(length, includeSymbols);
  }

  /**
   * Create a secure hash of data (for search/deduplication)
   */
  async hashData(data: string): Promise<string> {
    return hashData(data);
  }

  /**
   * Securely wipe sensitive data from memory
   */
  wipeSensitiveData(data: unknown): void {
    wipeSensitiveData(data);
  }

  /**
   * Update passphrase verification data (when user changes master passphrase)
   */
  async updatePassphraseVerification(
    newMasterPassphrase: string,
    salt: string
  ): Promise<{
    success: boolean;
    testEncryptedData?: string;
    testIv?: string;
    error?: string;
  }> {
    try {
      // Create new passphrase verification data
      const { testEncryptedData, testIv } = await createPassphraseVerification(
        newMasterPassphrase,
        salt
      );

      return {
        success: true,
        testEncryptedData,
        testIv,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update passphrase verification',
      };
    }
  }

  /**
   * Re-encrypt vault data with a new passphrase
   * This is used when the user changes their master passphrase
   */
  async reEncryptVault(
    currentEncryptedData: string,
    currentIv: string,
    newMasterPassphrase: string,
    salt: string
  ): Promise<{
    success: boolean;
    newEncryptedData?: string;
    newIv?: string;
    error?: string;
  }> {
    try {
      // First decrypt with current session
      const decryptResult = await this.decryptVault(currentEncryptedData, currentIv);
      
      if (!decryptResult.success || !decryptResult.items) {
        return { success: false, error: decryptResult.error || 'Failed to decrypt vault' };
      }

      // Clear current session
      this.lockVault();

      // Initialize new session with new passphrase
      const { testEncryptedData, testIv } = await createPassphraseVerification(
        newMasterPassphrase,
        salt
      );

      const unlockResult = await this.unlockVault(
        newMasterPassphrase,
        salt,
        testEncryptedData,
        testIv
      );

      if (!unlockResult.success) {
        return { success: false, error: unlockResult.error };
      }

      // Re-encrypt with new session
      const encryptResult = await this.encryptVault(decryptResult.items);

      if (!encryptResult.success) {
        return { success: false, error: encryptResult.error };
      }

      return {
        success: true,
        newEncryptedData: encryptResult.encryptedData,
        newIv: encryptResult.iv,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to re-encrypt vault',
      };
    }
  }
}

// Create a singleton instance
export const cryptoService = new CryptoService();

// Export the service
export default cryptoService; 