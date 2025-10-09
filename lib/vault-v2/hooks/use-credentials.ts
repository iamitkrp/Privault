/**
 * Privault Vault V2 - Credentials Hook
 * 
 * Manages credential CRUD operations with loading/error states.
 * Integrates with VaultService for encrypted credential management.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { VaultService } from '../services/vault.service';
import { 
  VaultCredential, 
  DecryptedCredential, 
  CreateCredentialDTO, 
  UpdateCredentialDTO,
  CredentialFilters,
  VaultStats,
} from '../core/types';

export interface CredentialsState {
  credentials: VaultCredential[];
  decryptedCredentials: Map<string, DecryptedCredential>;
  stats: VaultStats | null;
  loading: boolean;
  error: string | null;
  searchResults: DecryptedCredential[] | null;
}

export interface CredentialsActions {
  loadCredentials: (filters?: CredentialFilters) => Promise<void>;
  loadStats: () => Promise<void>;
  createCredential: (data: CreateCredentialDTO) => Promise<VaultCredential | null>;
  updateCredential: (id: string, data: UpdateCredentialDTO) => Promise<VaultCredential | null>;
  deleteCredential: (id: string, hard?: boolean) => Promise<boolean>;
  getDecryptedCredential: (id: string) => Promise<DecryptedCredential | null>;
  searchCredentials: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export function useCredentials(
  vaultService: VaultService | null
): CredentialsState & CredentialsActions {
  const [state, setState] = useState<CredentialsState>({
    credentials: [],
    decryptedCredentials: new Map(),
    stats: null,
    loading: false,
    error: null,
    searchResults: null,
  });

  const loadCredentials = useCallback(async (filters?: CredentialFilters) => {
    if (!vaultService) {
      setState(prev => ({ ...prev, error: 'Vault service not initialized' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await vaultService.listCredentials(filters);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          credentials: result.data,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error.message,
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load credentials',
        loading: false,
      }));
    }
  }, [vaultService]);

  const loadStats = useCallback(async () => {
    if (!vaultService) return;

    try {
      const result = await vaultService.getVaultStats();
      
      if (result.success) {
        setState(prev => ({ ...prev, stats: result.data }));
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [vaultService]);

  const createCredential = useCallback(async (data: CreateCredentialDTO): Promise<VaultCredential | null> => {
    if (!vaultService) {
      setState(prev => ({ ...prev, error: 'Vault service not initialized' }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await vaultService.createCredential(data);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          credentials: [...prev.credentials, result.data],
          loading: false,
        }));
        
        // Reload stats
        loadStats();
        
        return result.data;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error.message,
          loading: false,
        }));
        return null;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create credential',
        loading: false,
      }));
      return null;
    }
  }, [vaultService, loadStats]);

  const updateCredential = useCallback(async (
    id: string, 
    data: UpdateCredentialDTO
  ): Promise<VaultCredential | null> => {
    if (!vaultService) {
      setState(prev => ({ ...prev, error: 'Vault service not initialized' }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await vaultService.updateCredential(id, data);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          credentials: prev.credentials.map(c => 
            c.credential_id === id ? result.data : c
          ),
          loading: false,
        }));
        
        // Remove from decrypted cache to force re-decryption
        setState(prev => {
          const newDecrypted = new Map(prev.decryptedCredentials);
          newDecrypted.delete(id);
          return { ...prev, decryptedCredentials: newDecrypted };
        });
        
        // Reload stats
        loadStats();
        
        return result.data;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error.message,
          loading: false,
        }));
        return null;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update credential',
        loading: false,
      }));
      return null;
    }
  }, [vaultService, loadStats]);

  const deleteCredential = useCallback(async (id: string, hard: boolean = false): Promise<boolean> => {
    if (!vaultService) {
      setState(prev => ({ ...prev, error: 'Vault service not initialized' }));
      return false;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await vaultService.deleteCredential(id, hard);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          credentials: prev.credentials.filter(c => c.credential_id !== id),
          loading: false,
        }));
        
        // Remove from decrypted cache
        setState(prev => {
          const newDecrypted = new Map(prev.decryptedCredentials);
          newDecrypted.delete(id);
          return { ...prev, decryptedCredentials: newDecrypted };
        });
        
        // Reload stats
        loadStats();
        
        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error.message,
          loading: false,
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete credential',
        loading: false,
      }));
      return false;
    }
  }, [vaultService, loadStats]);

  const getDecryptedCredential = useCallback(async (id: string): Promise<DecryptedCredential | null> => {
    if (!vaultService) return null;

    // Check cache first
    if (state.decryptedCredentials.has(id)) {
      return state.decryptedCredentials.get(id)!;
    }

    try {
      const result = await vaultService.getCredential(id);
      
      if (result.success) {
        // Cache the decrypted credential
        setState(prev => {
          const newDecrypted = new Map(prev.decryptedCredentials);
          newDecrypted.set(id, result.data);
          return { ...prev, decryptedCredentials: newDecrypted };
        });
        
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to decrypt credential:', error);
      return null;
    }
  }, [vaultService, state.decryptedCredentials]);

  const searchCredentials = useCallback(async (query: string) => {
    if (!vaultService) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await vaultService.searchCredentials(query);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          searchResults: result.data,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error.message,
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        loading: false,
      }));
    }
  }, [vaultService]);

  const clearSearch = useCallback(() => {
    setState(prev => ({ ...prev, searchResults: null }));
  }, []);

  return {
    ...state,
    loadCredentials,
    loadStats,
    createCredential,
    updateCredential,
    deleteCredential,
    getDecryptedCredential,
    searchCredentials,
    clearSearch,
  };
}

