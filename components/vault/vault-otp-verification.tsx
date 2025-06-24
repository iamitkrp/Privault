'use client';

import { useState, useEffect } from 'react';
import { OTPService } from '@/services/otp.service';

interface VaultOTPVerificationProps {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  purpose: 'vault_access' | 'vault_password_change';
  onVerified: () => void;
  onCancel?: () => void;
}

export default function VaultOTPVerification({ 
  user, 
  purpose, 
  onVerified, 
  onCancel 
}: VaultOTPVerificationProps) {
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Auto-send OTP on component mount
  useEffect(() => {
    sendOTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await OTPService.sendVaultOTP(user.id, user.email, purpose);
      
      if (result.success) {
        setSuccess('OTP sent to your email address');
        setCountdown(60); // 60 second cooldown
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode.trim() || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await OTPService.verifyOTP(user.id, otpCode.trim(), purpose);
      
      if (result.success) {
        setSuccess('OTP verified successfully!');
        
        // Clear logout marker if this was for vault access
        if (purpose === 'vault_access') {
          OTPService.clearLogoutMarker(user.id);
        }
        
        // Small delay to show success message
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setError(result.error || 'Invalid OTP code');
        setOtpCode(''); // Clear invalid code
      }
    } catch {
      setError('OTP verification failed. Please try again.');
      setOtpCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOTPInput = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/[^0-9]/g, '').substring(0, 6);
    setOtpCode(numericValue);
    setError(null);
  };

  const purposeText = purpose === 'vault_access' ? 'Vault Access' : 'Vault Password Change';
  const purposeIcon = purpose === 'vault_access' ? (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ) : (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            {purposeIcon}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Security Verification</h2>
          <p className="text-indigo-100">Enter the OTP sent to your email for {purposeText}</p>
        </div>

        {/* Form */}
        <div className="px-6 py-8">
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {/* Email display */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                OTP sent to: <strong>{user.email}</strong>
              </p>
            </div>

            {/* OTP Input */}
            <div>
              <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-2">
                6-Digit OTP Code
              </label>
              <input
                id="otpCode"
                type="text"
                value={otpCode}
                onChange={(e) => handleOTPInput(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors text-center text-lg font-mono tracking-widest"
                placeholder="000000"
                disabled={isVerifying}
                autoFocus
                maxLength={6}
              />
            </div>

            {/* Success message */}
            {success && (
              <div className="bg-green-50 border border-green-300 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

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
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isVerifying || otpCode.length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify OTP
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <button
                type="button"
                onClick={sendOTP}
                disabled={isSending || countdown > 0}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2 inline-block"></div>
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend OTP (${countdown}s)`
                ) : (
                  'Resend OTP'
                )}
              </button>

              {/* Cancel button (if provided) */}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isVerifying || isSending}
                  className="w-full py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
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
                  <strong>Security Notice:</strong> OTP codes expire in 10 minutes. Check your email inbox and spam folder for the verification code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 