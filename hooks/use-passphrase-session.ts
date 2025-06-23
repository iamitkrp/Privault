'use client';

import { useState, useEffect, useCallback } from 'react';
import { cryptoService } from '@/services/crypto.service';

interface UsePassphraseSessionReturn {
  isUnlocked: boolean;
  sessionInfo: {
    isActive: boolean;
    expiresAt: number | null;
    lastActivity: number | null;
    timeRemaining: number | null;
  };
  unlock: (passphrase: string, salt: string, testEncryptedData: string, testIv: string) => Promise<{ success: boolean; error?: string }>;
  lock: () => void;
  extendSession: (additionalTime?: number) => boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * React hook for managing the passphrase session
 * Provides state management and convenient methods for vault operations
 */
export const usePassphraseSession = (): UsePassphraseSessionReturn => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{
    isActive: boolean;
    expiresAt: number | null;
    lastActivity: number | null;
    timeRemaining: number | null;
  }>({
    isActive: false,
    expiresAt: null,
    lastActivity: null,
    timeRemaining: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update session info
  const updateSessionInfo = useCallback(() => {
    const info = cryptoService.getSessionInfo();
    setSessionInfo(info);
    setIsUnlocked(info.isActive);
  }, []);

  // Unlock vault
  const unlock = useCallback(async (
    passphrase: string,
    salt: string,
    testEncryptedData: string,
    testIv: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cryptoService.unlockVault(
        passphrase,
        salt,
        testEncryptedData,
        testIv
      );

      if (result.success) {
        updateSessionInfo();
      } else {
        setError(result.error || 'Failed to unlock vault');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlock vault';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [updateSessionInfo]);

  // Lock vault
  const lock = useCallback(() => {
    cryptoService.lockVault();
    updateSessionInfo();
    setError(null);
  }, [updateSessionInfo]);

  // Extend session
  const extendSession = useCallback((additionalTime?: number) => {
    const result = cryptoService.extendSession(additionalTime);
    updateSessionInfo();
    return result;
  }, [updateSessionInfo]);

  // Listen for session expiry events
  useEffect(() => {
    const handleSessionExpiry = () => {
      updateSessionInfo();
      setError('Session expired');
    };

    window.addEventListener('passphraseSessionExpired', handleSessionExpiry);

    return () => {
      window.removeEventListener('passphraseSessionExpired', handleSessionExpiry);
    };
  }, [updateSessionInfo]);

  // Check session status on mount and periodically
  useEffect(() => {
    updateSessionInfo();

    // Check session status every 30 seconds
    const interval = setInterval(updateSessionInfo, 30000);

    return () => clearInterval(interval);
  }, [updateSessionInfo]);

  // Activity tracking - extend session on user interaction
  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      if (isUnlocked) {
        // Extend session on activity (debounced to avoid excessive calls)
        extendSession();
      }
    };

    // Debounce activity handler
    let activityTimeout: NodeJS.Timeout;
    const debouncedActivityHandler = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(handleActivity, 60000); // Extend every minute of activity
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, debouncedActivityHandler, { passive: true });
    });

    return () => {
      clearTimeout(activityTimeout);
      activityEvents.forEach(event => {
        document.removeEventListener(event, debouncedActivityHandler);
      });
    };
  }, [isUnlocked, extendSession]);

  return {
    isUnlocked,
    sessionInfo,
    unlock,
    lock,
    extendSession,
    isLoading,
    error,
  };
}; 