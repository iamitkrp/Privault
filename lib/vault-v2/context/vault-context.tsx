/**
 * Privault Vault V2 - Vault Context
 * 
 * React Context provider for vault services and state.
 * Combines session management with credential operations.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { VaultService } from '../services/vault.service';
import { createVaultRepository } from '../storage/repository';
import { createEncryptionService } from '../encryption/encryption.service';
import { createHistoryService } from '../services/history.service';
import { createExpirationService } from '../services/expiration.service';
import { useVaultSession, VaultSessionState, VaultSessionActions } from '../hooks/use-vault-session';
import { useCredentials, CredentialsState, CredentialsActions } from '../hooks/use-credentials';
import { passphraseManager } from '@/lib/crypto/passphrase-manager';
import { useAuth } from '@/lib/auth/auth-context';

// Mock password strength service (replace with actual zxcvbn wrapper)
const mockPasswordStrengthService = {
  analyze: (password: string) => ({
    score: Math.min(4, Math.floor(password.length / 4)) as 0 | 1 | 2 | 3 | 4,
    feedback: {
      warning: '',
      suggestions: [],
    },
  }),
};

interface VaultContextValue extends VaultSessionState, VaultSessionActions, CredentialsState, CredentialsActions {
  vaultService: VaultService | null;
}

const VaultContext = createContext<VaultContextValue | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [vaultService, setVaultService] = useState<VaultService | null>(null);
  
  // Session management
  const sessionHook = useVaultSession();
  
  // Credentials management (depends on vault service)
  const credentialsHook = useCredentials(vaultService);

  // Initialize vault service when session is unlocked
  useEffect(() => {
    if (!sessionHook.isLocked && user) {
      const masterKey = passphraseManager.getDerivedKey();
      
      if (masterKey) {
        const repository = createVaultRepository();
        const encryptionService = createEncryptionService();
        const historyService = createHistoryService(user.id, masterKey);
        const expirationService = createExpirationService(user.id);
        
        const service = new VaultService(
          repository,
          encryptionService,
          historyService,
          expirationService,
          mockPasswordStrengthService,
          user.id,
          masterKey
        );
        
        setVaultService(service);
        
        // Load initial data
        credentialsHook.loadCredentials();
        credentialsHook.loadStats();
      }
    } else {
      // Clear vault service when locked
      setVaultService(null);
    }
  }, [sessionHook.isLocked, user]);

  const contextValue: VaultContextValue = useMemo(() => ({
    vaultService,
    ...sessionHook,
    ...credentialsHook,
  }), [vaultService, sessionHook, credentialsHook]);

  return (
    <VaultContext.Provider value={contextValue}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault(): VaultContextValue {
  const context = useContext(VaultContext);
  
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  
  return context;
}

