'use client';

import { useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { passphraseManager } from '@/lib/crypto/passphrase-manager';
import { ERROR_MESSAGES } from '@/constants';

interface VaultUnlockProps {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function VaultUnlock({ user }: VaultUnlockProps) {
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!masterPassword.trim()) {
      setError('Master password is required');
      return;
    }

    setIsUnlocking(true);
    setError(null);

    try {
      // Get user profile with salt
      const { data: profile, error: profileError } = await AuthService.getProfile(user.id);
      
      if (profileError || !profile) {
        throw new Error('Failed to load user profile');
      }

      // Initialize the passphrase session to derive the crypto key
      const sessionResult = await passphraseManager.initializeSession(
        masterPassword,
        profile.salt
      );

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || ERROR_MESSAGES.INVALID_MASTER_PASSWORD);
      }

      if (!sessionResult.cryptoKey) {
        throw new Error('Failed to obtain crypto key');
      }

      // Verify the password is correct by attempting to decrypt the verification data
      if (profile.vault_verification_data) {
        try {
          const { decrypt } = await import('@/lib/crypto/crypto-utils');
          
          // Parse the stored verification data
          const verificationData = JSON.parse(profile.vault_verification_data);
          const decryptedData = await decrypt(
            verificationData.encryptedData, 
            verificationData.iv, 
            sessionResult.cryptoKey
          );
          
          if (decryptedData !== 'VAULT_PASSWORD_VERIFICATION_DATA') {
            throw new Error(ERROR_MESSAGES.INVALID_MASTER_PASSWORD);
          }
        } catch (err) {
          console.error('Password verification failed:', err);
          throw new Error(ERROR_MESSAGES.INVALID_MASTER_PASSWORD);
        }
      } else {
        // If no verification data exists, this is an old vault that needs to be secured
        // Create verification data for the first time using the current password
        console.warn('Old vault detected. Creating verification data for security upgrade...');
        
        try {
          const testData = 'VAULT_PASSWORD_VERIFICATION_DATA';
          const { encrypt } = await import('@/lib/crypto/crypto-utils');
          
          const encryptionResult = await encrypt(testData, sessionResult.cryptoKey);
          
          // Combine encrypted data and IV into a single string for storage
          const verificationData = JSON.stringify({
            encryptedData: encryptionResult.encryptedData,
            iv: encryptionResult.iv
          });

          // Store the encrypted verification data in the user's profile
          const { error: updateError } = await AuthService.updateProfile(user.id, {
            vault_verification_data: verificationData
          });

          if (updateError) {
            console.error('Failed to upgrade vault security:', updateError);
            // Still allow access this time, but warn user
            console.warn('Vault security upgrade failed. Please change your vault password to enable proper security.');
          } else {
            console.log('Vault security upgraded successfully!');
          }
        } catch (upgradeError) {
          console.error('Vault security upgrade failed:', upgradeError);
          // Still allow access this time for backward compatibility
        }
      }

      // Success - the vault is now unlocked and the parent component will detect this
      console.log('Vault unlocked successfully!');
      
      // Show success state briefly before parent component transitions
      setIsSuccess(true);
      setIsUnlocking(false);
      
    } catch (err) {
      console.error('Vault unlock error:', err);
      setError(err instanceof Error ? err.message : 'Failed to unlock vault');
      setMasterPassword(''); // Clear password on error
      setIsUnlocking(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Unlock Your Vault</h2>
          <p className="text-blue-100">Enter your vault master password to access your encrypted passwords</p>
        </div>

        {/* Form */}
        <div className="px-6 py-8">
          <form onSubmit={handleUnlock} className="space-y-6">
            <div>
              <label htmlFor="masterPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Vault Master Password
              </label>
              <div className="relative">
                <input
                  id="masterPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors pr-10"
                  placeholder="Enter your vault master password"
                  disabled={isUnlocking}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isUnlocking}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isUnlocking || isSuccess || !masterPassword.trim()}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-colors ${
                isSuccess 
                  ? 'bg-green-600 focus:ring-green-500' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50'
              }`}
            >
              {isUnlocking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Unlocking...
                </>
              ) : isSuccess ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Success! Loading vault...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Unlock Vault
                </>
              )}
            </button>
          </form>

          {/* Security notice */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  <strong>Zero-knowledge security:</strong> Your vault master password is different from your login password and is used to decrypt your data locally. It never leaves your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 