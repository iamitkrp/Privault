/**
 * Privault Vault V2 - Encryption Service
 * 
 * Handles encryption/decryption using existing crypto utilities.
 * Implements IEncryptionService interface for dependency injection.
 */

import { encrypt as cryptoEncrypt, decrypt as cryptoDecrypt } from '@/lib/crypto/crypto-utils';
import { IEncryptionService } from '../services/vault.service';

/**
 * Encryption Service Implementation
 */
export class EncryptionService implements IEncryptionService {
  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(data: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
    try {
      const result = await cryptoEncrypt(data, key);
      
      return {
        encrypted: result.encryptedData,
        iv: result.iv,
      };
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  async decrypt(encrypted: string, iv: string, key: CryptoKey): Promise<string> {
    try {
      const decrypted = await cryptoDecrypt(encrypted, iv, key);
      return decrypted;
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Factory function to create an encryption service instance
 */
export function createEncryptionService(): IEncryptionService {
  return new EncryptionService();
}

