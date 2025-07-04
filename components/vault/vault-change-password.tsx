'use client';

import { useState, useEffect } from 'react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      
      console.log('🔐 Creating new verification data with test string:', testData);
      const encryptionResult = await encrypt(testData, newSessionResult.cryptoKey);
      console.log('✅ Encryption successful:', {
        encryptedDataLength: encryptionResult.encryptedData.length,
        ivLength: encryptionResult.iv.length
      });
      
      // Combine encrypted data and IV into a single string for storage
      const newVerificationData = JSON.stringify({
        encryptedData: encryptionResult.encryptedData,
        iv: encryptionResult.iv
      });

      console.log('💾 Storing verification data:', {
        dataLength: newVerificationData.length,
        preview: newVerificationData.substring(0, 100) + '...'
      });

      // Store the new encrypted verification data in the user's profile
      const { error: updateError } = await AuthService.updateProfile(user.id, {
        vault_verification_data: newVerificationData
      });

      if (updateError) {
        throw new Error('Failed to save new password verification data');
      }

      console.log('✅ Vault password changed successfully with OTP verification!');
      
      // Show success feedback briefly, then smooth transition
      setIsChanging(false);
      setIsSuccess(true);
      
      // Wait a moment to show success, then start exit animation
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onPasswordChanged();
        }, 500);
      }, 1000);
      
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

  // Handle smooth transition back to dashboard
  const handleBackToDashboard = () => {
    setIsExiting(true);
    // Wait for slide-out animation to complete before navigating
    setTimeout(() => {
      onCancel();
    }, 500);
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
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden transition-all duration-500 ease-in-out ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
      {/* Cuberto-style Abstract Geometric Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large abstract geometric shapes */}
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/15 to-emerald-500/10 transform rotate-45 rounded-3xl transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px) rotate(45deg)`
          }}
        ></div>
        <div 
          className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-emerald-400/12 to-green-400/8 transform -rotate-12 rounded-full transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px) rotate(-12deg)`
          }}
        ></div>
        
        {/* Corner geometric elements */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 border-l-2 border-b-2 border-green-200/30 transform rotate-45 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px) rotate(45deg)`
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-0 w-24 h-24 border-r-2 border-t-2 border-emerald-200/30 transform -rotate-45 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px) rotate(-45deg)`
          }}
        ></div>
        
        {/* Abstract floating shapes */}
        <div 
          className="absolute top-1/4 right-1/3 w-12 h-12 bg-gradient-to-br from-green-300/30 to-transparent transform rotate-45 rounded-lg transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 1.2}px, ${mousePosition.y * 1.2}px) rotate(45deg)`
          }}
        ></div>
        <div 
          className="absolute bottom-1/3 left-1/4 w-8 h-8 bg-gradient-to-tr from-emerald-300/20 to-transparent transform -rotate-12 rounded-lg transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * -0.8}px, ${mousePosition.y * -0.8}px) rotate(-12deg)`
          }}
        ></div>
        <div 
          className="absolute bottom-8 left-1/6 w-16 h-16 bg-gradient-to-tr from-emerald-300/20 to-transparent transform -rotate-12 rounded-lg transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePosition.x * -1.2}px, ${mousePosition.y * -1.2}px) rotate(-12deg)`
          }}
        ></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className={`w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-500 ease-in-out ${isExiting ? 'transform translate-y-4 opacity-0' : 'transform translate-y-0 opacity-100'}`}>
          
          {/* Left Side - Header Content */}
          <div className="text-left">
            {/* Back Button */}
            <div className="mb-8">
              <button
                onClick={handleBackToDashboard}
                disabled={isExiting || isSuccess}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-neuemontreal-medium">Back to Dashboard</span>
              </button>
            </div>

            <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 leading-tight">
              Change Vault
              <span className="block font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Password</span>
            </h1>
            
            <p className="text-xl text-gray-600 font-neuemontreal-medium mb-6 leading-relaxed">
              Update your vault master password with email verification
            </p>
            
            <p className="text-gray-500 font-light leading-relaxed">
              Enhanced security with OTP verification
            </p>

            {/* Security info */}
            <div className="mt-8 p-6 bg-green-50/80 backdrop-blur-sm rounded-2xl border border-green-200/50">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-green-800 mb-2">Enhanced Security</h3>
                  <p className="text-sm text-green-700 leading-relaxed">
                    We&apos;ll send a verification code to your email before updating your vault password. This ensures only you can make security changes to your vault.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 p-8 shadow-lg">
            <form onSubmit={(e) => { e.preventDefault(); handleRequestOTP(); }} className="space-y-6">
              {/* New Password field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-3">
                  New Vault Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full px-4 py-4 border-0 rounded-2xl bg-white/60 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:bg-white/80 transition-all duration-200 pr-12 shadow-sm"
                    placeholder="Enter your new password"
                    disabled={isChanging || isSuccess}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-20 hover:bg-gray-100/50 rounded-r-2xl transition-colors focus:outline-none"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isChanging || isSuccess}
                    tabIndex={-1}
                    aria-label="Toggle new password visibility"
                  >
                    {showNewPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password strength indicator */}
                {newPassword && passwordStrength && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Password Strength</span>
                      <span className={`text-sm font-medium ${
                        passwordStrength.score >= SECURITY_CONFIG.MASTER_PASSWORD_STRENGTH_REQUIREMENT 
                          ? 'text-green-600' 
                          : 'text-gray-500'
                      }`}>
                        {getStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200/60 rounded-full h-2.5 backdrop-blur-sm">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`} 
                        style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                      ></div>
                    </div>
                    {passwordStrength.feedback.suggestions.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <ul className="list-disc list-inside space-y-1">
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-3">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-4 border-0 rounded-2xl bg-white/60 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:bg-white/80 transition-all duration-200 pr-12 shadow-sm"
                    placeholder="Confirm your new password"
                    disabled={isChanging || isSuccess}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-20 hover:bg-gray-100/50 rounded-r-2xl transition-colors focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isChanging || isSuccess}
                    tabIndex={-1}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
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
                disabled={isChanging || isSuccess || !newPassword || !confirmPassword}
                className={`w-full py-4 px-6 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
                  isSuccess 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 focus:ring-green-500' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:ring-green-500 disabled:opacity-50'
                }`}
              >
                {isSuccess ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Password Updated Successfully!
                  </div>
                ) : isChanging ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </div>
                ) : (
                  'Request OTP & Update'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}