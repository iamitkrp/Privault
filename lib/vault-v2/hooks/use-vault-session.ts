/**
 * Privault Vault V2 - Vault Session Hook
 * 
 * Manages vault unlock/lock state and master key session.
 * Integrates with passphrase-manager for session management.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { passphraseManager } from '@/lib/crypto/passphrase-manager';

export interface VaultSessionState {
  isLocked: boolean;
  isUnlocking: boolean;
  isInitialized: boolean;
  sessionInfo: {
    expiresAt: number | null;
    timeRemaining: number | null;
  } | null;
  error: string | null;
}

export interface VaultSessionActions {
  unlock: (passphrase: string, salt: string, testData?: string, testIv?: string) => Promise<boolean>;
  lock: () => void;
  extendSession: (additionalTime?: number) => boolean;
}

export function useVaultSession(): VaultSessionState & VaultSessionActions {
  const [state, setState] = useState<VaultSessionState>({
    isLocked: true,
    isUnlocking: false,
    isInitialized: false,
    sessionInfo: null,
    error: null,
  });

  // Check initial session state
  useEffect(() => {
    const hasActiveSession = passphraseManager.hasActiveSession();
    const sessionInfo = passphraseManager.getSessionInfo();
    
    setState(prev => ({
      ...prev,
      isLocked: !hasActiveSession,
      isInitialized: true,
      sessionInfo: hasActiveSession ? {
        expiresAt: sessionInfo.expiresAt,
        timeRemaining: sessionInfo.timeRemaining,
      } : null,
    }));
  }, []);

  // Listen for session expiry
  useEffect(() => {
    const handleSessionExpired = () => {
      setState(prev => ({
        ...prev,
        isLocked: true,
        sessionInfo: null,
        error: 'Session expired due to inactivity',
      }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('passphraseSessionExpired', handleSessionExpired);
      return () => {
        window.removeEventListener('passphraseSessionExpired', handleSessionExpired);
      };
    }
  }, []);

  // Update session info periodically
  useEffect(() => {
    if (state.isLocked) return;

    const interval = setInterval(() => {
      const sessionInfo = passphraseManager.getSessionInfo();
      if (sessionInfo.isActive) {
        setState(prev => ({
          ...prev,
          sessionInfo: {
            expiresAt: sessionInfo.expiresAt,
            timeRemaining: sessionInfo.timeRemaining,
          },
        }));
      } else {
        // Session expired
        setState(prev => ({
          ...prev,
          isLocked: true,
          sessionInfo: null,
        }));
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [state.isLocked]);

  const unlock = useCallback(async (
    passphrase: string,
    salt: string,
    testData?: string,
    testIv?: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isUnlocking: true, error: null }));

    try {
      const result = await passphraseManager.initializeSession(
        passphrase,
        salt,
        testData,
        testIv
      );

      if (result.success) {
        const sessionInfo = passphraseManager.getSessionInfo();
        setState({
          isLocked: false,
          isUnlocking: false,
          isInitialized: true,
          sessionInfo: {
            expiresAt: sessionInfo.expiresAt,
            timeRemaining: sessionInfo.timeRemaining,
          },
          error: null,
        });
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isUnlocking: false,
          error: result.error || 'Failed to unlock vault',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUnlocking: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      return false;
    }
  }, []);

  const lock = useCallback(() => {
    passphraseManager.clearSession();
    setState({
      isLocked: true,
      isUnlocking: false,
      isInitialized: true,
      sessionInfo: null,
      error: null,
    });
  }, []);

  const extendSession = useCallback((additionalTime?: number): boolean => {
    const extended = passphraseManager.extendSession(additionalTime);
    if (extended) {
      const sessionInfo = passphraseManager.getSessionInfo();
      setState(prev => ({
        ...prev,
        sessionInfo: {
          expiresAt: sessionInfo.expiresAt,
          timeRemaining: sessionInfo.timeRemaining,
        },
      }));
    }
    return extended;
  }, []);

  return {
    ...state,
    unlock,
    lock,
    extendSession,
  };
}

