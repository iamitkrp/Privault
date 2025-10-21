/**
 * Privault Vault V2 - Vault Service
 * 
 * Main service for vault operations with clean architecture.
 * Uses dependency injection for testability and maintainability.
 */

import { 
  VaultCredential, 
  DecryptedCredential,
  DecryptedCredentialData,
  CreateCredentialDTO, 
  UpdateCredentialDTO,
  CredentialFilters,
  VaultStats,
  Result,
  ExpirationStatus,
  CredentialCategory,
  ChangeReason,
  ChangeMasterPasswordResult,
  MasterPasswordChangeProgress,
  IEncryptionService,
  DecryptionInput,
} from '../core/types';
import {
  VaultError,
  CredentialNotFoundError,
  ConcurrencyError,
  EncryptionError,
  DecryptionError,
  InvalidPassphraseError,
  MasterPasswordChangeError,
  RollbackError,
  success,
  failure,
  createVaultError,
} from '../core/errors';
import { generateSalt, deriveKey, createPassphraseVerification, verifyPassphrase } from '@/lib/crypto/crypto-utils';
import { passphraseManager } from '@/lib/crypto/passphrase-manager';
import { supabase } from '@/lib/supabase/client';
import { validateCreateCredential, validateUpdateCredential, sanitizeCredentialData } from '../core/validators';
import { PAGINATION } from '../core/constants';
import { CRYPTO_CONFIG } from '@/constants';

// ==========================================
// INTERFACES FOR DEPENDENCIES
// ==========================================

/**
 * Repository interface for data access
 */
export interface IVaultRepository {
  findById(userId: string, credentialId: string): Promise<VaultCredential | null>;
  findByUser(userId: string, filters?: CredentialFilters): Promise<VaultCredential[]>;
  findAllByUser(userId: string): Promise<VaultCredential[]>;
  create(credential: Omit<VaultCredential, 'id' | 'created_at' | 'updated_at'>): Promise<VaultCredential>;
  update(userId: string, credentialId: string, data: Partial<VaultCredential>): Promise<VaultCredential>;
  delete(userId: string, credentialId: string, hard?: boolean): Promise<void>;
  count(userId: string): Promise<number>;
  incrementAccessCount(userId: string, credentialId: string): Promise<void>;
}

/**
 * History service interface
 */
export interface IHistoryService {
  addToHistory(userId: string, credentialId: string, oldPassword: string, reason: ChangeReason): Promise<void>;
  checkPasswordReuse(userId: string, passwordHash: string, excludeCredentialId?: string): Promise<boolean>;
}

/**
 * Expiration service interface  
 */
export interface IExpirationService {
  calculateExpirationDate(days: number | null): Date | null;
  calculateExpirationStatus(expiresAt: Date | null): ExpirationStatus;
}

/**
 * Password strength service interface
 */
export interface IPasswordStrengthService {
  analyze(password: string): { score: 0 | 1 | 2 | 3 | 4; feedback: { warning: string; suggestions: string[] } };
}

// ==========================================
// VAULT SERVICE
// ==========================================

export class VaultService {
  constructor(
    private readonly repository: IVaultRepository,
    private readonly encryptionService: IEncryptionService,
    private readonly historyService: IHistoryService,
    private readonly expirationService: IExpirationService,
    private readonly passwordStrengthService: IPasswordStrengthService,
    private readonly userId: string,
    private masterKey: CryptoKey
  ) {}

  /**
   * Creates a new credential
   */
  async createCredential(data: CreateCredentialDTO): Promise<Result<VaultCredential>> {
    try {
      // 1. Validate input
      const sanitizedData = sanitizeCredentialData(data);
      validateCreateCredential(sanitizedData);

      // 2. Calculate password strength
      const passwordStrength = this.passwordStrengthService.analyze(sanitizedData.password);

      // 3. Calculate expiration date
      const expiresAt = sanitizedData.expiration_config?.enabled
        ? this.expirationService.calculateExpirationDate(sanitizedData.expiration_config.days)
        : null;

      const expirationStatus = this.expirationService.calculateExpirationStatus(expiresAt);

      // 4. Prepare credential data for encryption
      const credentialData: DecryptedCredentialData = {
        site: sanitizedData.site,
        username: sanitizedData.username,
        password: sanitizedData.password,
        url: sanitizedData.url,
        notes: sanitizedData.notes,
        custom_fields: sanitizedData.custom_fields,
      };

      // 5. Encrypt credential data
      const { encrypted, iv } = await this.encryptionService.encrypt(
        JSON.stringify(credentialData),
        this.masterKey
      );

      // 6. Create credential record
      const credential = await this.repository.create({
        user_id: this.userId,
        credential_id: crypto.randomUUID(),
        encrypted_data: encrypted,
        iv,
        category: sanitizedData.category,
        tags: sanitizedData.tags || [],
        is_favorite: sanitizedData.is_favorite || false,
        expires_at: expiresAt,
        expiration_status: expirationStatus,
        last_password_change: new Date(),
        access_count: 0,
        last_accessed: null,
        version: 1,
        is_deleted: false,
        deleted_at: null,
      });

      return success(credential);
    } catch (error) {
      const vaultError = createVaultError(error);
      return failure(vaultError);
    }
  }

  /**
   * Gets a credential by ID (decrypted)
   */
  async getCredential(credentialId: string): Promise<Result<DecryptedCredential>> {
    try {
      // 1. Fetch credential
      const credential = await this.repository.findById(this.userId, credentialId);

      if (!credential) {
        throw new CredentialNotFoundError(credentialId);
      }

      // 2. Decrypt data
      const decryptedData = await this.decryptCredentialData(credential);

      // 3. Calculate password strength
      const passwordStrength = this.passwordStrengthService.analyze(decryptedData.password);

      // 4. Update access tracking (async, don't wait)
      this.recordAccess(credentialId).catch(err => 
        console.error('Failed to record access:', err)
      );

      // 5. Return decrypted credential
      const decryptedCredential: DecryptedCredential = {
        ...credential,
        decrypted_data: decryptedData,
        password_strength: passwordStrength,
      };

      return success(decryptedCredential);
    } catch (error) {
      const vaultError = createVaultError(error);
      return failure(vaultError);
    }
  }

  /**
   * Updates an existing credential
   */
  async updateCredential(credentialId: string, data: UpdateCredentialDTO): Promise<Result<VaultCredential>> {
    try {
      // 1. Validate input
      const sanitizedData = sanitizeCredentialData(data);
      validateUpdateCredential(sanitizedData);

      // 2. Fetch current credential
      const current = await this.repository.findById(this.userId, credentialId);

      if (!current) {
        throw new CredentialNotFoundError(credentialId);
      }

      // 3. Check version for optimistic locking
      if (current.version !== data.version) {
        throw new ConcurrencyError(
          'Version mismatch - credential was modified',
          data.version,
          current.version
        );
      }

      // 4. Decrypt current data to check for password change
      const currentData = await this.decryptCredentialData(current);
      const passwordChanged = data.password !== undefined && data.password !== currentData.password;

      // 5. Add to history if password changed
      if (passwordChanged && data.password) {
        await this.historyService.addToHistory(
          this.userId,
          credentialId,
          currentData.password,
          ChangeReason.MANUAL_UPDATE
        );
      }

      // 6. Prepare updated credential data
      const updatedCredentialData: DecryptedCredentialData = {
        site: data.site ?? currentData.site,
        username: data.username ?? currentData.username,
        password: data.password ?? currentData.password,
        url: data.url ?? currentData.url,
        notes: data.notes ?? currentData.notes,
        custom_fields: data.custom_fields ?? currentData.custom_fields,
      };

      // 7. Encrypt updated data
      const { encrypted, iv } = await this.encryptionService.encrypt(
        JSON.stringify(updatedCredentialData),
        this.masterKey
      );

      // 8. Calculate new expiration if config provided
      let expiresAt = current.expires_at;
      if (data.expiration_config !== undefined) {
        expiresAt = data.expiration_config.enabled
          ? this.expirationService.calculateExpirationDate(data.expiration_config.days)
          : null;
      }

      const expirationStatus = this.expirationService.calculateExpirationStatus(expiresAt);

      // 9. Construct partial update object with only defined fields
      const updatePayload: Partial<VaultCredential> = {
        encrypted_data: encrypted,
        iv,
        version: current.version + 1,
      };

      // Only include fields that are explicitly provided
      if (data.category !== undefined) updatePayload.category = data.category;
      if (data.tags !== undefined) updatePayload.tags = data.tags;
      if (data.is_favorite !== undefined) updatePayload.is_favorite = data.is_favorite;
      if (data.expiration_config !== undefined) {
        updatePayload.expires_at = expiresAt;
        updatePayload.expiration_status = expirationStatus;
      }
      if (passwordChanged) {
        updatePayload.last_password_change = new Date();
      }

      // 10. Update credential
      const updated = await this.repository.update(this.userId, credentialId, updatePayload);

      return success(updated);
    } catch (error) {
      const vaultError = createVaultError(error);
      return failure(vaultError);
    }
  }

  /**
   * Deletes a credential
   */
  async deleteCredential(credentialId: string, hard: boolean = false): Promise<Result<void>> {
    try {
      const credential = await this.repository.findById(this.userId, credentialId);

      if (!credential) {
        throw new CredentialNotFoundError(credentialId);
      }

      await this.repository.delete(this.userId, credentialId, hard);

      return success(undefined);
    } catch (error) {
      const vaultError = createVaultError(error);
      return failure(vaultError);
    }
  }

  /**
   * Lists credentials with optional filters
   */
  async listCredentials(filters?: CredentialFilters): Promise<Result<VaultCredential[]>> {
    try {
      const credentials = await this.repository.findByUser(this.userId, filters);
      return success(credentials);
    } catch (error) {
      const vaultError = createVaultError(error);
      return failure(vaultError);
    }
  }

  /**
   * Searches credentials using client-side fuzzy search
   * 
   * @deprecated This method performs full decryption on every search query.
   * Use the SearchService via useCredentials hook instead, which maintains
   * a client-side Fuse.js index for fast, privacy-preserving search without
   * per-query decryption.
   * 
   * This method is kept for backward compatibility and small datasets only.
   * For production use with large vaults, always use hook-level search.
   */
  async searchCredentials(query: string): Promise<Result<DecryptedCredential[]>> {
    try {
      // Simple fallback implementation (not recommended for production)
      // Use SearchService via useCredentials hook for better performance
      const credentials = await this.repository.findByUser(this.userId);
      const results: DecryptedCredential[] = [];
      const searchLower = query.toLowerCase();

      for (const credential of credentials) {
        try {
          const decryptedData = await this.decryptCredentialData(credential);
          
          // Simple substring search
          const matchesSite = decryptedData.site.toLowerCase().includes(searchLower);
          const matchesUsername = decryptedData.username.toLowerCase().includes(searchLower);
          const matchesNotes = decryptedData.notes?.toLowerCase().includes(searchLower) || false;
          const matchesUrl = decryptedData.url?.toLowerCase().includes(searchLower) || false;

          if (matchesSite || matchesUsername || matchesNotes || matchesUrl) {
            const passwordStrength = this.passwordStrengthService.analyze(decryptedData.password);
            results.push({
              ...credential,
              decrypted_data: decryptedData,
              password_strength: passwordStrength,
            });
          }
        } catch (err) {
          // Skip credentials that fail to decrypt
          console.error(`Failed to decrypt credential ${credential.id}:`, err);
        }
      }

      return success(results);
    } catch (error) {
      const vaultError = createVaultError(error);
      return failure(vaultError);
    }
  }

  /**
   * Records access to a credential
   */
  private async recordAccess(credentialId: string): Promise<void> {
    try {
      await this.repository.incrementAccessCount(this.userId, credentialId);
    } catch (error) {
      console.error('Failed to record access:', error);
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Gets vault statistics
   */
  async getVaultStats(): Promise<Result<VaultStats>> {
    try {
      const credentials = await this.repository.findByUser(this.userId);

      let weakCount = 0;
      let reusedCount = 0;
      let totalStrength = 0;
      let analyzedCount = 0; // Track successfully decrypted credentials
      const categoryCount: Record<CredentialCategory, number> = {
        [CredentialCategory.SOCIAL]: 0,
        [CredentialCategory.WORK]: 0,
        [CredentialCategory.SHOPPING]: 0,
        [CredentialCategory.ENTERTAINMENT]: 0,
        [CredentialCategory.UTILITIES]: 0,
        [CredentialCategory.DEVELOPMENT]: 0,
        [CredentialCategory.PERSONAL]: 0,
        [CredentialCategory.OTHER]: 0,
      };

      let mostAccessed: { credential_id: string; access_count: number } | undefined;
      const passwordHashes = new Map<string, number>();

      for (const credential of credentials) {
        // Category count
        categoryCount[credential.category]++;

        // Most accessed
        if (!mostAccessed || credential.access_count > mostAccessed.access_count) {
          mostAccessed = {
            credential_id: credential.credential_id,
            access_count: credential.access_count,
          };
        }

        // Decrypt for strength and reuse analysis
        try {
          const decryptedData = await this.decryptCredentialData(credential);
          const strength = this.passwordStrengthService.analyze(decryptedData.password);
          
          totalStrength += strength.score;
          analyzedCount++; // Increment only on successful decryption
          
          if (strength.score < 3) {
            weakCount++;
          }

          // Check for reuse
          const hash = await this.hashPassword(decryptedData.password);
          const count = passwordHashes.get(hash) || 0;
          passwordHashes.set(hash, count + 1);
          
          if (count > 0) {
            reusedCount++;
          }
        } catch (err) {
          console.error(`Failed to analyze credential ${credential.id}:`, err);
          // Don't increment analyzedCount for failed decryptions
        }
      }

      const activeCount = credentials.filter(c => c.expiration_status === ExpirationStatus.ACTIVE).length;
      const expiringCount = credentials.filter(c => c.expiration_status === ExpirationStatus.EXPIRING_SOON).length;
      const expiredCount = credentials.filter(c => c.expiration_status === ExpirationStatus.EXPIRED).length;
      const favoriteCount = credentials.filter(c => c.is_favorite).length;
      const totalAccessCount = credentials.reduce((sum, c) => sum + c.access_count, 0);
      
      // Calculate average strength only from successfully analyzed credentials
      const avgStrength = analyzedCount > 0 ? totalStrength / analyzedCount : 0;

      // Calculate health score (0-100) using analyzed count
      const healthScore = this.calculateHealthScore({
        total: analyzedCount, // Use analyzed count instead of total for accurate metrics
        weak: weakCount,
        reused: reusedCount,
        expired: expiredCount,
        avgStrength,
      });

      const stats: VaultStats = {
        total_credentials: credentials.length,
        active_credentials: activeCount,
        favorites: favoriteCount,
        expired: expiredCount,
        expiring_soon: expiringCount,
        weak_passwords: weakCount,
        reused_passwords: reusedCount,
        average_password_strength: avgStrength,
        total_access_count: totalAccessCount,
        by_category: categoryCount,
        most_accessed: mostAccessed,
        health_score: healthScore,
      };

      return success(stats);
    } catch (error) {
      const vaultError = createVaultError(error);
      return failure(vaultError);
    }
  }

  /**
   * Decrypts credential data
   */
  private async decryptCredentialData(credential: VaultCredential): Promise<DecryptedCredentialData> {
    try {
      const decryptedJson = await this.encryptionService.decrypt(
        {
          encrypted: credential.encrypted_data,
          iv: credential.iv,
        },
        this.masterKey
      );

      return JSON.parse(decryptedJson) as DecryptedCredentialData;
    } catch (error) {
      throw new DecryptionError('Failed to decrypt credential data', { credentialId: credential.id, error });
    }
  }

  /**
   * Hashes a password for reuse detection
   */
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Calculates vault health score
   */
  private calculateHealthScore(metrics: {
    total: number;
    weak: number;
    reused: number;
    expired: number;
    avgStrength: number;
  }): number {
    if (metrics.total === 0) return 100;

    const weakPenalty = (metrics.weak / metrics.total) * 30;
    const reusePenalty = (metrics.reused / metrics.total) * 30;
    const expiredPenalty = (metrics.expired / metrics.total) * 20;
    const strengthBonus = (metrics.avgStrength / 4) * 20;

    const score = 100 - weakPenalty - reusePenalty - expiredPenalty + strengthBonus;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Changes the master password and re-encrypts all credentials
   */
  async changeMasterPassword(
    currentPassword: string,
    newPassword: string,
    progressCallback?: (progress: MasterPasswordChangeProgress) => void,
    keepSalt?: boolean
  ): Promise<Result<ChangeMasterPasswordResult>> {
    try {
      // Phase 1: Verification
      progressCallback?.({
        phase: 'verifying',
        totalCredentials: 0,
        processedCredentials: 0,
        message: 'Verifying current password...',
      });

      // Verify current password matches the master key in session
      const currentKey = passphraseManager.getDerivedKey();
      if (!currentKey) {
        throw new InvalidPassphraseError('No active session. Please unlock your vault first.');
      }

      // Fetch user's profile to get vault_verification_data and salt
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('vault_verification_data, salt')
        .eq('user_id', this.userId)
        .single();

      if (profileError || !profile) {
        throw new Error('Failed to fetch user profile for verification');
      }

      if (!profile.salt) {
        throw new Error('User profile missing salt for verification');
      }

      // Verify current password using profile verification data
      if (profile.vault_verification_data) {
        try {
          const verificationData = JSON.parse(profile.vault_verification_data);
          const { testEncryptedData, testIv } = verificationData;
          
          const isValid = await verifyPassphrase(
            currentPassword,
            profile.salt,
            testEncryptedData,
            testIv,
            CRYPTO_CONFIG.PASSPHRASE_TEST_STRING
          );

          if (!isValid) {
            throw new InvalidPassphraseError('Current password verification failed.');
          }
        } catch (error) {
          if (error instanceof InvalidPassphraseError) {
            throw error;
          }
          throw new InvalidPassphraseError('Current password verification failed.');
        }
      } else {
        // Fallback: If no verification data exists, try to decrypt a credential if any exist
        const testCredentials = await this.repository.findByUser(this.userId, { limit: 1 });
        if (testCredentials.length > 0) {
          try {
            await this.decryptCredentialData(testCredentials[0]);
          } catch (error) {
            throw new InvalidPassphraseError('Current password verification failed.');
          }
        }
      }

      // Phase 2: Fetch all credentials
      progressCallback?.({
        phase: 'fetching',
        totalCredentials: 0,
        processedCredentials: 0,
        message: 'Fetching all credentials...',
      });

      const allCredentials = await this.repository.findAllByUser(this.userId);
      const totalCredentials = allCredentials.length;

      progressCallback?.({
        phase: 'fetching',
        totalCredentials,
        processedCredentials: 0,
        message: `Found ${totalCredentials} credential(s) to process.`,
      });

      // Phase 3: Decrypt all credentials
      progressCallback?.({
        phase: 'decrypting',
        totalCredentials,
        processedCredentials: 0,
        message: 'Decrypting credentials...',
      });

      const decryptedCredentials: Array<{
        credential: VaultCredential;
        decryptedData: DecryptedCredentialData;
        originalEncrypted: string;
        originalIv: string;
      }> = [];

      for (let i = 0; i < allCredentials.length; i++) {
        const credential = allCredentials[i];
        try {
          const decryptedData = await this.decryptCredentialData(credential);
          decryptedCredentials.push({
            credential,
            decryptedData,
            originalEncrypted: credential.encrypted_data,
            originalIv: credential.iv,
          });

          progressCallback?.({
            phase: 'decrypting',
            totalCredentials,
            processedCredentials: i + 1,
            message: `Decrypted ${i + 1} of ${totalCredentials} credential(s)...`,
          });
        } catch (error) {
          throw new DecryptionError(
            `Failed to decrypt credential ${credential.credential_id}`,
            { credentialId: credential.credential_id, error }
          );
        }
      }

      // Phase 4: Key Derivation
      // If keepSalt is true, reuse existing salt; otherwise generate new salt
      const newSalt = keepSalt ? profile.salt : generateSalt();
      const newMasterKey = await deriveKey(newPassword, newSalt);
      const { testEncryptedData, testIv } = await createPassphraseVerification(newPassword, newSalt);

      // Phase 5: Re-encrypt all credentials
      progressCallback?.({
        phase: 're-encrypting',
        totalCredentials,
        processedCredentials: 0,
        message: 'Re-encrypting credentials with new password...',
      });

      const reencryptedCredentials: Array<{
        credentialId: string;
        encrypted: string;
        iv: string;
        version: number;
      }> = [];

      for (let i = 0; i < decryptedCredentials.length; i++) {
        const { credential, decryptedData } = decryptedCredentials[i];
        try {
          const { encrypted, iv } = await this.encryptionService.encrypt(
            JSON.stringify(decryptedData),
            newMasterKey
          );

          reencryptedCredentials.push({
            credentialId: credential.credential_id,
            encrypted,
            iv,
            version: credential.version,
          });

          progressCallback?.({
            phase: 're-encrypting',
            totalCredentials,
            processedCredentials: i + 1,
            message: `Re-encrypted ${i + 1} of ${totalCredentials} credential(s)...`,
          });
        } catch (error) {
          throw new EncryptionError(
            `Failed to encrypt credential ${credential.credential_id}`,
            { credentialId: credential.credential_id, error }
          );
        }
      }

      // Phase 6: Update database
      progressCallback?.({
        phase: 'updating',
        totalCredentials,
        processedCredentials: 0,
        message: 'Updating credentials in database...',
      });

      const updatedCredentialIds: string[] = [];

      for (let i = 0; i < reencryptedCredentials.length; i++) {
        const reencrypted = reencryptedCredentials[i];
        try {
          await this.repository.update(this.userId, reencrypted.credentialId, {
            encrypted_data: reencrypted.encrypted,
            iv: reencrypted.iv,
            version: reencrypted.version + 1,
          });

          updatedCredentialIds.push(reencrypted.credentialId);

          progressCallback?.({
            phase: 'updating',
            totalCredentials,
            processedCredentials: i + 1,
            message: `Updated ${i + 1} of ${totalCredentials} credential(s)...`,
          });
        } catch (error) {
          // Attempt rollback
          console.error(`Failed to update credential ${reencrypted.credentialId}. Attempting rollback...`);
          
          try {
            await this.rollbackCredentialUpdates(
              decryptedCredentials.filter(dc => 
                updatedCredentialIds.includes(dc.credential.credential_id)
              )
            );
          } catch (rollbackError) {
            throw new RollbackError(
              'Failed to rollback credential updates',
              error,
              updatedCredentialIds,
              { rollbackError }
            );
          }

          throw new MasterPasswordChangeError(
            `Failed to update credential ${reencrypted.credentialId}`,
            'updating',
            { error }
          );
        }
      }

      // Phase 7: Update profile verification data
      progressCallback?.({
        phase: 'finalizing',
        totalCredentials,
        processedCredentials: totalCredentials,
        message: 'Updating profile verification data...',
      });

      try {
        await this.updateProfileVerificationData(
          this.userId,
          newSalt,
          testEncryptedData,
          testIv
        );
      } catch (error) {
        // Attempt rollback
        console.error('Failed to update profile verification data. Attempting rollback...');
        
        try {
          await this.rollbackCredentialUpdates(decryptedCredentials);
        } catch (rollbackError) {
          throw new RollbackError(
            'Failed to rollback after profile update failure',
            error,
            updatedCredentialIds,
            { rollbackError }
          );
        }

        throw new MasterPasswordChangeError(
          'Failed to update profile verification data',
          'finalizing',
          { error }
        );
      }

      // Phase 8: Update PassphraseManager session and masterKey
      const updateResult = await passphraseManager.updateDerivedKey(
        newPassword,
        newSalt,
        testEncryptedData,
        testIv
      );

      let sessionUpdated = false;
      if (!updateResult.success) {
        console.error('Failed to update passphrase manager session:', updateResult.error);
        // This is not critical - user can re-login
      } else {
        sessionUpdated = true;
        // Update the VaultService masterKey to use the new key
        this.masterKey = newMasterKey;
      }

      // Phase 9: Success
      progressCallback?.({
        phase: 'finalizing',
        totalCredentials,
        processedCredentials: totalCredentials,
        message: 'Master password changed successfully!',
      });

      return success({
        credentialsUpdated: totalCredentials,
        verificationDataUpdated: true,
        sessionUpdated,
        newSalt,
      });
    } catch (error) {
      const vaultError = createVaultError(error);
      return failure(vaultError);
    }
  }

  /**
   * Updates profile verification data in database
   */
  private async updateProfileVerificationData(
    userId: string,
    newSalt: string,
    testEncryptedData: string,
    testIv: string
  ): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const verificationData = JSON.stringify({
      testEncryptedData,
      testIv,
    });

    const { error } = await supabase
      .from('profiles')
      .update({
        salt: newSalt,
        vault_verification_data: verificationData,
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update profile verification data: ${error.message}`);
    }
  }

  /**
   * Rollback credential updates to original state
   */
  private async rollbackCredentialUpdates(
    credentialsToRollback: Array<{
      credential: VaultCredential;
      originalEncrypted: string;
      originalIv: string;
    }>
  ): Promise<void> {
    const errors: Array<{ credentialId: string; error: unknown }> = [];

    for (const { credential, originalEncrypted, originalIv } of credentialsToRollback) {
      try {
        await this.repository.update(this.userId, credential.credential_id, {
          encrypted_data: originalEncrypted,
          iv: originalIv,
          version: credential.version, // Restore original version
        });

        console.log(`Rolled back credential ${credential.credential_id}`);
      } catch (error) {
        console.error(`Failed to rollback credential ${credential.credential_id}:`, error);
        errors.push({
          credentialId: credential.credential_id,
          error,
        });
      }
    }

    if (errors.length > 0) {
      console.error('Rollback completed with errors:', errors);
      // Don't throw - this is best-effort rollback
    }
  }
}

