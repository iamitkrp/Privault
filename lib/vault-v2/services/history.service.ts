/**
 * Privault Vault V2 - History Service
 * 
 * Manages password history for audit trail and reuse detection.
 */

import { supabase } from '@/lib/supabase/client';
import { IHistoryService } from './vault.service';
import { ChangeReason } from '../core/types';
import { encrypt as cryptoEncrypt } from '@/lib/crypto/crypto-utils';

/**
 * History Service Implementation
 */
export class HistoryService implements IHistoryService {
  constructor(
    private readonly userId: string,
    private readonly masterKey: CryptoKey
  ) {}

  /**
   * Add a password to history when it's changed
   */
  async addToHistory(
    userId: string,
    credentialId: string,
    oldPassword: string,
    reason: ChangeReason
  ): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      // Encrypt the old password for potential recovery
      const { encryptedData, iv } = await cryptoEncrypt(oldPassword, this.masterKey);
      
      // Hash the password for reuse detection (SHA-256)
      const passwordHash = await this.hashPassword(oldPassword);

      // Insert into password_history
      const { error } = await supabase
        .from('password_history')
        .insert({
          user_id: userId,
          credential_id: credentialId,
          encrypted_old_password: encryptedData,
          password_hash: passwordHash,
          change_reason: reason,
          changed_by: 'user',
        });

      if (error) {
        throw new Error(`Failed to add to history: ${error.message}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to add password to history: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if a password has been used before (reuse detection)
   */
  async checkPasswordReuse(
    userId: string,
    passwordHash: string,
    excludeCredentialId?: string
  ): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    try {
      let query = supabase
        .from('password_history')
        .select('id')
        .eq('user_id', userId)
        .eq('password_hash', passwordHash);

      if (excludeCredentialId) {
        query = query.neq('credential_id', excludeCredentialId);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        throw new Error(`Failed to check password reuse: ${error.message}`);
      }

      return (data && data.length > 0) || false;
    } catch (error) {
      throw new Error(
        `Failed to check password reuse: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Hash a password using SHA-256
   */
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Factory function to create a history service instance
 */
export function createHistoryService(userId: string, masterKey: CryptoKey): IHistoryService {
  return new HistoryService(userId, masterKey);
}

