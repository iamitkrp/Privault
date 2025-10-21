/**
 * Privault Vault V2 - Repository Implementation
 * 
 * Supabase-based repository for vault credentials with full CRUD operations.
 */

import { supabase } from '@/lib/supabase/client';
import { IVaultRepository } from '../services/vault.service';
import { VaultCredential, CredentialFilters, SortOrder, ExpirationStatus, CredentialCategory } from '../core/types';
import { PAGINATION } from '../core/constants';

/**
 * Supabase Repository Implementation
 */
export class SupabaseVaultRepository implements IVaultRepository {
  /**
   * Find a credential by ID
   */
  async findById(userId: string, credentialId: string): Promise<VaultCredential | null> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { data, error } = await supabase
      .from('vault_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('credential_id', credentialId)
      .eq('is_deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to find credential: ${error.message}`);
    }

    return this.mapToVaultCredential(data);
  }

  /**
   * Find credentials by user with optional filters
   */
  async findByUser(userId: string, filters?: CredentialFilters): Promise<VaultCredential[]> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    let query = supabase
      .from('vault_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false);

    // Apply filters
    if (filters) {
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters.is_favorite !== undefined) {
        query = query.eq('is_favorite', filters.is_favorite);
      }

      if (filters.expiration_status) {
        query = query.eq('expiration_status', filters.expiration_status);
      }

      // Sorting
      if (filters.sort_by) {
        const order = filters.sort_order === SortOrder.DESC ? { ascending: false } : { ascending: true };
        
        switch (filters.sort_by) {
          case 'created_at':
            query = query.order('created_at', order);
            break;
          case 'updated_at':
            query = query.order('updated_at', order);
            break;
          case 'last_accessed':
            query = query.order('last_accessed', { ...order, nullsFirst: false });
            break;
          case 'expires_at':
            query = query.order('expires_at', { ...order, nullsFirst: false });
            break;
          case 'category':
            query = query.order('category', order);
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
      } else {
        // Default sort by created_at DESC
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      const limit = filters.limit ?? PAGINATION.DEFAULT_LIMIT;
      const offset = filters.offset ?? PAGINATION.DEFAULT_OFFSET;
      query = query.range(offset, offset + limit - 1);
    } else {
      // Default sorting and pagination
      query = query
        .order('created_at', { ascending: false })
        .limit(PAGINATION.DEFAULT_LIMIT);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find credentials: ${error.message}`);
    }

    return (data || []).map(item => this.mapToVaultCredential(item));
  }

  /**
   * Find ALL credentials by user without pagination or filters
   * Used for operations that need to process every credential (e.g., master password change)
   */
  async findAllByUser(userId: string): Promise<VaultCredential[]> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { data, error } = await supabase
      .from('vault_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find all credentials: ${error.message}`);
    }

    return (data || []).map(item => this.mapToVaultCredential(item));
  }

  /**
   * Create a new credential
   */
  async create(credential: Omit<VaultCredential, 'id' | 'created_at' | 'updated_at'>): Promise<VaultCredential> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { data, error } = await supabase
      .from('vault_credentials')
      .insert({
        user_id: credential.user_id,
        credential_id: credential.credential_id,
        encrypted_data: credential.encrypted_data,
        iv: credential.iv,
        category: credential.category,
        tags: credential.tags as string[],
        is_favorite: credential.is_favorite,
        expires_at: credential.expires_at?.toISOString() || null,
        expiration_status: credential.expiration_status,
        last_password_change: credential.last_password_change.toISOString(),
        access_count: credential.access_count,
        last_accessed: credential.last_accessed?.toISOString() || null,
        version: credential.version,
        is_deleted: credential.is_deleted,
        deleted_at: credential.deleted_at?.toISOString() || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create credential: ${error.message}`);
    }

    return this.mapToVaultCredential(data);
  }

  /**
   * Update an existing credential
   */
  async update(userId: string, credentialId: string, data: Partial<VaultCredential>): Promise<VaultCredential> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    // Build update object, only including defined fields
    const updateData: Record<string, any> = {};

    if (data.encrypted_data !== undefined) updateData.encrypted_data = data.encrypted_data;
    if (data.iv !== undefined) updateData.iv = data.iv;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags as string[];
    if (data.is_favorite !== undefined) updateData.is_favorite = data.is_favorite;
    if (data.expires_at !== undefined) updateData.expires_at = data.expires_at?.toISOString() || null;
    if (data.expiration_status !== undefined) updateData.expiration_status = data.expiration_status;
    if (data.last_password_change !== undefined) updateData.last_password_change = data.last_password_change.toISOString();
    if (data.access_count !== undefined) updateData.access_count = data.access_count;
    if (data.last_accessed !== undefined) updateData.last_accessed = data.last_accessed?.toISOString() || null;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.is_deleted !== undefined) updateData.is_deleted = data.is_deleted;
    if (data.deleted_at !== undefined) updateData.deleted_at = data.deleted_at?.toISOString() || null;

    const { data: updatedData, error } = await supabase
      .from('vault_credentials')
      .update(updateData)
      .eq('user_id', userId)
      .eq('credential_id', credentialId)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update credential: ${error.message}`);
    }

    return this.mapToVaultCredential(updatedData);
  }

  /**
   * Delete a credential (soft delete by default)
   */
  async delete(userId: string, credentialId: string, hard: boolean = false): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    if (hard) {
      // Hard delete - permanently remove from database
      const { error } = await supabase
        .from('vault_credentials')
        .delete()
        .eq('user_id', userId)
        .eq('credential_id', credentialId);

      if (error) {
        throw new Error(`Failed to delete credential: ${error.message}`);
      }
    } else {
      // Soft delete - mark as deleted
      const { error } = await supabase
        .from('vault_credentials')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('credential_id', credentialId)
        .eq('is_deleted', false);

      if (error) {
        throw new Error(`Failed to soft delete credential: ${error.message}`);
      }
    }
  }

  /**
   * Count total credentials for a user
   */
  async count(userId: string): Promise<number> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { count, error } = await supabase
      .from('vault_credentials')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false);

    if (error) {
      throw new Error(`Failed to count credentials: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Increment access count and update last_accessed timestamp
   */
  async incrementAccessCount(userId: string, credentialId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    // Use Postgres function to atomically increment
    // This avoids race conditions with concurrent access
    const { error } = await supabase.rpc('increment_credential_access', {
      p_user_id: userId,
      p_credential_id: credentialId,
    });

    // Fallback to manual increment if RPC not available
    if (error && error.code === '42883') { // function does not exist
      // First get the current access count
      const { data: current, error: fetchError } = await supabase
        .from('vault_credentials')
        .select('access_count')
        .eq('user_id', userId)
        .eq('credential_id', credentialId)
        .eq('is_deleted', false)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch credential for access count: ${fetchError.message}`);
      }

      // Increment and update
      const { error: updateError } = await supabase
        .from('vault_credentials')
        .update({
          access_count: (current?.access_count || 0) + 1,
          last_accessed: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('credential_id', credentialId)
        .eq('is_deleted', false);

      if (updateError) {
        throw new Error(`Failed to increment access count: ${updateError.message}`);
      }
    } else if (error) {
      throw new Error(`Failed to increment access count: ${error.message}`);
    }
  }

  /**
   * Map database row to VaultCredential type
   */
  private mapToVaultCredential(data: any): VaultCredential {
    return {
      id: data.id,
      user_id: data.user_id,
      credential_id: data.credential_id,
      encrypted_data: data.encrypted_data,
      iv: data.iv,
      category: data.category as CredentialCategory,
      tags: (data.tags || []) as readonly string[],
      is_favorite: data.is_favorite,
      expires_at: data.expires_at ? new Date(data.expires_at) : null,
      expiration_status: data.expiration_status as ExpirationStatus,
      last_password_change: new Date(data.last_password_change),
      access_count: data.access_count,
      last_accessed: data.last_accessed ? new Date(data.last_accessed) : null,
      version: data.version,
      is_deleted: data.is_deleted,
      deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }
}

/**
 * Factory function to create a repository instance
 */
export function createVaultRepository(): IVaultRepository {
  return new SupabaseVaultRepository();
}

