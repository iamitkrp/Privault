'use client';

import { useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { passphraseManager } from '@/lib/crypto/passphrase-manager';
import { SECURITY_CONFIG } from '@/constants';
import zxcvbn from 'zxcvbn';
import VaultOTPVerification from './vault-otp-verification';

interface VaultChangePasswordProps {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onPasswordChanged: () => void;
  onCancel: () => void;
}

export default function VaultChangePassword({ 
  user, 
  onPasswordChanged, 
  onCancel 
}: VaultChangePasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);

  // Calculate password strength
  const passwordStrength = newPassword ? zxcvbn(newPassword) : null;

  const handleRequestOTP = () => {
    // Validate new password before requesting OTP
    if (!newPassword.trim()) {
      setError('New vault password is required');
      return;
    }

    if (newPassword.length < SECURITY_CONFIG.MASTER_PASSWORD_MIN_LENGTH) {
      setError(`New password must be at least ${SECURITY_CONFIG.MASTER_PASSWORD_MIN_LENGTH} characters long`);
      return;
    }

    if (passwordStrength && passwordStrength.score < SECURITY_CONFIG.MASTER_PASSWORD_STRENGTH_REQUIREMENT) {
      setError('New password is too weak. Please choose a stronger password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setError(null);
    setShowOTPVerification(true);
  };

  const handleOTPVerified = () => {
    setShowOTPVerification(false);
    // Immediately proceed to change password after OTP verification
    changePasswordAfterOTPVerification();
  };

  const changePasswordAfterOTPVerification = async () => {
    setIsChanging(true);
    setError(null);

    try {
      // Get user profile with salt
      const { data: profile, error: profileError } = await AuthService.getProfile(user.id);
      
      if (profileError || !profile) {
        throw new Error('Failed to load user profile');
      }

      // Clear any existing session before creating new one
      passphraseManager.clearSession();

      // Initialize with new password to create new verification data
      const newSessionResult = await passphraseManager.initializeSession(
        newPassword,
        profile.salt
      );

      if (!newSessionResult.success || !newSessionResult.cryptoKey) {
        throw new Error('Failed to set new password');
      }

      // Create new encrypted verification data with the new password
      const testData = 'VAULT_PASSWORD_VERIFICATION_DATA';
      const { encrypt } = await import('@/lib/crypto/crypto-utils');
      
      const encryptionResult = await encrypt(testData, newSessionResult.cryptoKey);
      
      // Combine encrypted data and IV into a single string for storage
      const newVerificationData = JSON.stringify({
        encryptedData: encryptionResult.encryptedData,
        iv: encryptionResult.iv
      });

      // Store the new encrypted verification data in the user's profile
      const { error: updateError } = await AuthService.updateProfile(user.id, {
        vault_verification_data: newVerificationData
      });

      if (updateError) {
        throw new Error('Failed to save new password verification data');
      }

      console.log('Vault password changed successfully with OTP verification!');
      
      // Notify parent component
      onPasswordChanged();
      
    } catch (err) {
      console.error('Password change error:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password');
      setNewPassword('');
      setConfirmPassword('');
      setIsChanging(false);
    }
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  // Show OTP verification screen
  if (showOTPVerification) {
    return (
      <VaultOTPVerification 
        user={user}
        purpose="vault_password_change"
        onVerified={handleOTPVerified}
        onCancel={() => setShowOTPVerification(false)}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Change Vault Password</h2>
          <p className="text-orange-100">Update your vault master password with email verification</p>
        </div>

        {/* Form */}
        <div className="px-6 py-8">
          <form onSubmit={(e) => { e.preventDefault(); handleRequestOTP(); }} className="space-y-6">
            {/* New Password field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Vault Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-colors pr-10"
                  placeholder="Enter your new password"
                  disabled={isChanging}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isChanging}
                >
                  {showNewPassword ? (
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
              
              {/* Password strength indicator */}
              {newPassword && passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score >= 3 ? 'text-green-600' : passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${((passwordStrength.score + 1) / 5) * 100}%` }}
                    ></div>
                  </div>
                  {passwordStrength.feedback.suggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">Suggestions:</p>
                      <ul className="text-xs text-gray-500 list-disc list-inside">
                        {passwordStrength.feedback.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-colors pr-10"
                  placeholder="Confirm your new password"
                  disabled={isChanging}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isChanging}
                >
                  {showConfirmPassword ? (
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

            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isChanging}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChanging || !newPassword.trim() || !confirmPassword.trim() || newPassword !== confirmPassword}
                className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isChanging ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Changing Password...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </div>
          </form>

          {/* Security notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Enhanced Security:</strong> We&apos;ll send a verification code to your email address ({user.email}) to confirm this password change. Your existing stored passwords will remain encrypted and accessible with the new password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 