import { supabase } from '@/lib/supabase/client';
import { cryptoService } from './crypto.service';
// import { performanceService } from './performance.service';
import type { 
  Credential, 
  PasswordHistory as PasswordHistoryType 
} from '@/types';
import type { 
  Vault, 
  VaultInsert, 
  VaultUpdate,
  VaultItem,
  VaultItemInsert,
  VaultItemUpdate,
  PasswordHistory,
  PasswordHistoryInsert
} from '@/types/database';

/**
 * Vault Service
 * Handles encrypted CRUD operations and synchronization with Supabase
 * Supports both storage approaches: single vault blob and individual items
 */
export class VaultService {
  private readonly STORAGE_APPROACH: 'single_vault' | 'individual_items' = 'single_vault';

  /**
   * Load and decrypt the user's vault
   */
  async loadVault(userId: string): Promise<{
    success: boolean;
    credentials?: Credential[];
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      if (!cryptoService.isVaultUnlocked()) {
        return { success: false, error: 'Vault is locked' };
      }

      if (this.STORAGE_APPROACH === 'single_vault') {
        return await this.loadVaultFromSingleBlob(userId);
      } else {
        return await this.loadVaultFromIndividualItems(userId);
      }
    } catch (error) {
      console.error('Load vault error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load vault'
      };
    }
  }

  /**
   * Save the entire vault (encrypt and store)
   */
  async saveVault(userId: string, credentials: Credential[]): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      if (!cryptoService.isVaultUnlocked()) {
        return { success: false, error: 'Vault is locked' };
      }

      if (this.STORAGE_APPROACH === 'single_vault') {
        return await this.saveVaultAsSingleBlob(userId, credentials);
      } else {
        return await this.saveVaultAsIndividualItems(userId, credentials);
      }
    } catch (error) {
      console.error('Save vault error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save vault'
      };
    }
  }

  /**
   * Add a new credential to the vault
   */
  async addCredential(userId: string, credential: Omit<Credential, 'id' | 'created_at' | 'updated_at'>): Promise<{
    success: boolean;
    credential?: Credential;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      if (!cryptoService.isVaultUnlocked()) {
        return { success: false, error: 'Vault is locked' };
      }

      // Create a new credential with ID and timestamps
      const newCredential: Credential = {
        ...credential,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (this.STORAGE_APPROACH === 'single_vault') {
        return await this.addCredentialToSingleBlob(userId, newCredential);
      } else {
        return await this.addCredentialAsIndividualItem(userId, newCredential);
      }
    } catch (error) {
      console.error('Add credential error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add credential'
      };
    }
  }

  /**
   * Update an existing credential
   */
  async updateCredential(userId: string, credentialId: string, updates: Partial<Omit<Credential, 'id' | 'created_at' | 'updated_at'>>): Promise<{
    success: boolean;
    credential?: Credential;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      if (!cryptoService.isVaultUnlocked()) {
        return { success: false, error: 'Vault is locked' };
      }

      if (this.STORAGE_APPROACH === 'single_vault') {
        return await this.updateCredentialInSingleBlob(userId, credentialId, updates);
      } else {
        return await this.updateCredentialAsIndividualItem(userId, credentialId, updates);
      }
    } catch (error) {
      console.error('Update credential error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update credential'
      };
    }
  }

  /**
   * Delete a credential from the vault
   */
  async deleteCredential(userId: string, credentialId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      if (!cryptoService.isVaultUnlocked()) {
        return { success: false, error: 'Vault is locked' };
      }

      if (this.STORAGE_APPROACH === 'single_vault') {
        return await this.deleteCredentialFromSingleBlob(userId, credentialId);
      } else {
        return await this.deleteCredentialAsIndividualItem(userId, credentialId);
      }
    } catch (error) {
      console.error('Delete credential error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete credential'
      };
    }
  }

  /**
   * Add password to history when changing
   */
  async addPasswordHistory(userId: string, credentialId: string, oldPassword: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      // Hash the old password for comparison (not storing the actual password)
      const oldPasswordHash = await cryptoService.hashData(oldPassword);

      const historyEntry: PasswordHistoryInsert = {
        user_id: userId,
        credential_id: credentialId,
        old_password_hash: oldPasswordHash,
        changed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('password_history')
        .insert(historyEntry);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Add password history error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add password history'
      };
    }
  }

  /**
   * Get password history for a credential
   */
  async getPasswordHistory(userId: string, credentialId: string): Promise<{
    success: boolean;
    history?: PasswordHistory[];
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { data, error } = await supabase
        .from('password_history')
        .select('*')
        .eq('user_id', userId)
        .eq('credential_id', credentialId)
        .order('changed_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, history: data || [] };
    } catch (error) {
      console.error('Get password history error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get password history'
      };
    }
  }

  /**
   * Check if vault exists for user
   */
  async vaultExists(userId: string): Promise<{
    success: boolean;
    exists?: boolean;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      if (this.STORAGE_APPROACH === 'single_vault') {
        const { data, error } = await supabase
          .from('vaults')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }

        return { success: true, exists: !!data };
      } else {
        const { data, error } = await supabase
          .from('vault_items')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (error) {
          throw new Error(error.message);
        }

        return { success: true, exists: (data?.length || 0) > 0 };
      }
    } catch (error) {
      console.error('Check vault exists error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check vault existence'
      };
    }
  }

  /**
   * Initialize empty vault for new user
   */
  async initializeVault(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      return await this.saveVault(userId, []);
    } catch (error) {
      console.error('Initialize vault error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize vault'
      };
    }
  }

  // Private methods for single vault blob approach
  private async loadVaultFromSingleBlob(userId: string): Promise<{
    success: boolean;
    credentials?: Credential[];
    error?: string;
  }> {
    const { data, error } = await supabase!
      .from('vaults')
      .select('encrypted_data')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      // No vault exists yet, return empty array
      return { success: true, credentials: [] };
    }

    // Parse the encrypted data (stored as JSON with data and iv)
    const encryptedVault = JSON.parse(data.encrypted_data);
    
    const decryptResult = await cryptoService.decryptVault(
      encryptedVault.data,
      encryptedVault.iv
    );

    if (!decryptResult.success) {
      throw new Error(decryptResult.error || 'Failed to decrypt vault');
    }

    // For single vault approach, we store complete Credential objects
    // So we can directly return them after parsing
    const credentials: Credential[] = decryptResult.items as Credential[];

    return { success: true, credentials: credentials || [] };
  }

  private async saveVaultAsSingleBlob(userId: string, credentials: Credential[]): Promise<{
    success: boolean;
    error?: string;
  }> {
    // For single vault approach, we store complete Credential objects
    const encryptResult = await cryptoService.encryptVault(credentials);

    if (!encryptResult.success) {
      throw new Error(encryptResult.error || 'Failed to encrypt vault');
    }

    // Store encrypted data as JSON with data and iv
    const encryptedData = JSON.stringify({
      data: encryptResult.encryptedData,
      iv: encryptResult.iv,
    });

    // Check if vault exists
    const { data: existingVault } = await supabase!
      .from('vaults')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingVault) {
      // Update existing vault
      const { error } = await supabase!
        .from('vaults')
        .update({ 
          encrypted_data: encryptedData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      // Create new vault
      const { error } = await supabase!
        .from('vaults')
        .insert({
          user_id: userId,
          encrypted_data: encryptedData,
        });

      if (error) {
        throw new Error(error.message);
      }
    }

    return { success: true };
  }

  private async addCredentialToSingleBlob(userId: string, credential: Credential): Promise<{
    success: boolean;
    credential?: Credential;
    error?: string;
  }> {
    // Load existing vault
    const loadResult = await this.loadVaultFromSingleBlob(userId);
    if (!loadResult.success) {
      throw new Error(loadResult.error);
    }

    // Add new credential
    const updatedCredentials = [...(loadResult.credentials || []), credential];

    // Save updated vault
    const saveResult = await this.saveVaultAsSingleBlob(userId, updatedCredentials);
    if (!saveResult.success) {
      throw new Error(saveResult.error);
    }

    return { success: true, credential };
  }

  private async updateCredentialInSingleBlob(userId: string, credentialId: string, updates: Partial<Credential>): Promise<{
    success: boolean;
    credential?: Credential;
    error?: string;
  }> {
    // Load existing vault
    const loadResult = await this.loadVaultFromSingleBlob(userId);
    if (!loadResult.success) {
      throw new Error(loadResult.error);
    }

    const credentials = loadResult.credentials || [];
    const credentialIndex = credentials.findIndex(c => c.id === credentialId);
    
    if (credentialIndex === -1) {
      throw new Error('Credential not found');
    }

    // Update credential
    const updatedCredential = {
      ...credentials[credentialIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    credentials[credentialIndex] = updatedCredential;

    // Save updated vault
    const saveResult = await this.saveVaultAsSingleBlob(userId, credentials);
    if (!saveResult.success) {
      throw new Error(saveResult.error);
    }

    return { success: true, credential: updatedCredential };
  }

  private async deleteCredentialFromSingleBlob(userId: string, credentialId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Load existing vault
    const loadResult = await this.loadVaultFromSingleBlob(userId);
    if (!loadResult.success) {
      throw new Error(loadResult.error);
    }

    const credentials = loadResult.credentials || [];
    const filteredCredentials = credentials.filter(c => c.id !== credentialId);

    if (filteredCredentials.length === credentials.length) {
      throw new Error('Credential not found');
    }

    // Save updated vault
    const saveResult = await this.saveVaultAsSingleBlob(userId, filteredCredentials);
    if (!saveResult.success) {
      throw new Error(saveResult.error);
    }

    return { success: true };
  }

  // Private methods for individual items approach
  private async loadVaultFromIndividualItems(userId: string): Promise<{
    success: boolean;
    credentials?: Credential[];
    error?: string;
  }> {
    const { data, error } = await supabase!
      .from('vault_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return { success: true, credentials: [] };
    }

    const credentials: Credential[] = [];

    for (const item of data) {
      // Parse the encrypted credential
      const encryptedCredential = JSON.parse(item.encrypted_credential);
      
      const decryptResult = await cryptoService.decryptVaultItem(
        encryptedCredential.data,
        encryptedCredential.iv
      );

      if (!decryptResult.success || !decryptResult.item) {
        console.error(`Failed to decrypt credential ${item.credential_id}:`, decryptResult.error);
        continue; // Skip corrupted items
      }

      // Convert VaultItem back to Credential
      const credential: Credential = {
        id: item.credential_id,
        site: decryptResult.item.site,
        username: decryptResult.item.username,
        password: decryptResult.item.password,
        url: decryptResult.item.url,
        notes: decryptResult.item.notes,
        category: decryptResult.item.category,
        isFavorite: decryptResult.item.isFavorite,
        tags: decryptResult.item.tags,
        passwordStrength: decryptResult.item.passwordStrength,
        lastPasswordChange: decryptResult.item.lastPasswordChange,
        accessCount: decryptResult.item.accessCount,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      credentials.push(credential);
    }

    return { success: true, credentials };
  }

  private async saveVaultAsIndividualItems(userId: string, credentials: Credential[]): Promise<{
    success: boolean;
    error?: string;
  }> {
    // This approach would be more complex and is not recommended for full vault saves
    // Instead, use addCredential, updateCredential, deleteCredential for individual operations
    throw new Error('Full vault save not supported with individual items approach. Use individual CRUD operations.');
  }

  private async addCredentialAsIndividualItem(userId: string, credential: Credential): Promise<{
    success: boolean;
    credential?: Credential;
    error?: string;
  }> {
    // Extract the credential data for encryption (without database metadata)
    const credentialData = {
      site: credential.site,
      username: credential.username,
      password: credential.password,
      url: credential.url,
      notes: credential.notes,
      category: credential.category,
      isFavorite: credential.isFavorite,
      tags: credential.tags,
      passwordStrength: credential.passwordStrength,
      lastPasswordChange: credential.lastPasswordChange,
      accessCount: credential.accessCount,
    };

    const encryptResult = await cryptoService.encryptVaultItem(credentialData);

    if (!encryptResult.success) {
      throw new Error(encryptResult.error || 'Failed to encrypt credential');
    }

    // Store encrypted data as JSON with data and iv
    const encryptedCredential = JSON.stringify({
      data: encryptResult.encryptedData,
      iv: encryptResult.iv,
    });

    const vaultItemInsert: VaultItemInsert = {
      user_id: userId,
      credential_id: credential.id,
      encrypted_credential: encryptedCredential,
    };

    const { error } = await supabase!
      .from('vault_items')
      .insert(vaultItemInsert);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, credential };
  }

  private async updateCredentialAsIndividualItem(userId: string, credentialId: string, updates: Partial<Credential>): Promise<{
    success: boolean;
    credential?: Credential;
    error?: string;
  }> {
    // First, get the existing item
    const { data, error: fetchError } = await supabase!
      .from('vault_items')
      .select('*')
      .eq('user_id', userId)
      .eq('credential_id', credentialId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (!data) {
      throw new Error('Credential not found');
    }

    // Decrypt existing credential
    const encryptedCredential = JSON.parse(data.encrypted_credential);
    const decryptResult = await cryptoService.decryptVaultItem(
      encryptedCredential.data,
      encryptedCredential.iv
    );

    if (!decryptResult.success || !decryptResult.item) {
      throw new Error(decryptResult.error || 'Failed to decrypt existing credential');
    }

    // Create updated credential
    const existingCredential: Credential = {
      id: credentialId,
      site: decryptResult.item.site,
      username: decryptResult.item.username,
      password: decryptResult.item.password,
      url: decryptResult.item.url,
      notes: decryptResult.item.notes,
      category: decryptResult.item.category,
      isFavorite: decryptResult.item.isFavorite,
      tags: decryptResult.item.tags,
      passwordStrength: decryptResult.item.passwordStrength,
      lastPasswordChange: decryptResult.item.lastPasswordChange,
      accessCount: decryptResult.item.accessCount,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    const updatedCredential = {
      ...existingCredential,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Extract credential data for encryption (without database metadata)
    const credentialData = {
      site: updatedCredential.site,
      username: updatedCredential.username,
      password: updatedCredential.password,
      url: updatedCredential.url,
      notes: updatedCredential.notes,
      category: updatedCredential.category,
      isFavorite: updatedCredential.isFavorite,
      tags: updatedCredential.tags,
      passwordStrength: updatedCredential.passwordStrength,
      lastPasswordChange: updatedCredential.lastPasswordChange,
      accessCount: updatedCredential.accessCount,
    };

    const encryptResult = await cryptoService.encryptVaultItem(credentialData);

    if (!encryptResult.success) {
      throw new Error(encryptResult.error || 'Failed to encrypt updated credential');
    }

    // Store encrypted data
    const newEncryptedCredential = JSON.stringify({
      data: encryptResult.encryptedData,
      iv: encryptResult.iv,
    });

    const { error: updateError } = await supabase!
      .from('vault_items')
      .update({
        encrypted_credential: newEncryptedCredential,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('credential_id', credentialId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { success: true, credential: updatedCredential };
  }

  private async deleteCredentialAsIndividualItem(userId: string, credentialId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const { error } = await supabase!
      .from('vault_items')
      .delete()
      .eq('user_id', userId)
      .eq('credential_id', credentialId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }
}

// Create a singleton instance
export const vaultService = new VaultService();

// Export the service
export default vaultService; 