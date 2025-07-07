/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { OTPService } from '@/services/otp.service';
import { useRouter } from 'next/navigation';

interface VaultOTPVerificationProps {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  purpose: 'vault_access' | 'vault_password_change' | 'email_update' | 'profile_delete';
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
  const [hasSentInitialOTP, setHasSentInitialOTP] = useState(false);
  const [isManualResend, setIsManualResend] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  // Auto-send OTP on component mount (with duplicate prevention)
  useEffect(() => {
    if (!hasSentInitialOTP && user?.id && purpose) {
      console.log('🚀 VaultOTPVerification: Attempting to send initial OTP for', purpose);
      setHasSentInitialOTP(true);
      setIsManualResend(false); // This is the initial send, not a manual resend
      sendOTP();
    }
  }, [user?.id, purpose, hasSentInitialOTP]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  const sendOTP = async () => {
    // Prevent multiple simultaneous sends
    if (isSending) {
      console.log('⚠️ VaultOTPVerification: sendOTP called but already sending, ignoring');
      return;
    }

    console.log('📧 VaultOTPVerification: Starting OTP send process');
    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await OTPService.sendVaultOTP(user.id, user.email, purpose, isManualResend);
      
      console.log('📧 VaultOTPVerification: OTP send result:', result);
      
      if (result.success) {
        setSuccess(result.message || 'OTP sent to your email address');
        setCountdown(60); // 60 second cooldown
      } else {
        // Check if it's a fallback case (email failed but OTP is in console)
        if ('fallback' in result && result.fallback) {
          setError(`${result.error}\n\n⚠️ Email delivery failed - please check the browser console for your OTP code.`);
        } else {
          setError(result.error || 'Failed to send OTP');
        }
      }
    } catch (error) {
      console.error('OTP sending error:', error);
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

  const handleResendOTP = () => {
    setIsManualResend(true); // This is a manual resend attempt
    sendOTP();
  };

  // Handle back navigation
  const handleBackToDashboard = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onCancel) {
        onCancel();
      } else {
        router.push('/dashboard');
      }
    }, 500);
  };

  const purposeText = purpose === 'vault_access' ? 'Vault Access' : purpose === 'vault_password_change' ? 'Vault Password Change' : purpose === 'email_update' ? 'Email Update' : 'Profile Delete';
  const purposeIcon = purpose === 'vault_access' ? (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ) : purpose === 'vault_password_change' ? (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ) : purpose === 'email_update' ? (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ) : (
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 overflow-hidden transition-all duration-500 ease-in-out ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
      {/* Back to Dashboard */}
      <button
        onClick={handleBackToDashboard}
        disabled={isExiting || isVerifying || isSending}
        className="absolute top-8 left-8 z-20 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-neuemontreal-medium">Back to Dashboard</span>
      </button>

      {/* Geometric background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/15 to-purple-500/10 transform rotate-45 rounded-3xl transition-transform duration-300 ease-out"
          style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px) rotate(45deg)` }}
        ></div>
        <div
          className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-purple-400/12 to-indigo-400/8 transform -rotate-12 rounded-full transition-transform duration-300 ease-out"
          style={{ transform: `translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px) rotate(-12deg)` }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-24 h-24 border-r-2 border-t-2 border-indigo-200/30 transform -rotate-45 transition-transform duration-300 ease-out"
          style={{ transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px) rotate(-45deg)` }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className={`w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-500 ease-in-out ${isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>  
          {/* Left Info */}
          <div className="text-left">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
              {purposeIcon}
            </div>
            <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 leading-tight">
              Security
              <span className="block font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Verification</span>
            </h1>
            <p className="text-xl text-gray-600 font-neuemontreal-medium mb-6 leading-relaxed">
              Enter the OTP sent to your email for {purposeText}
            </p>
            <p className="text-gray-500 font-light leading-relaxed">OTP codes expire in 10 minutes.</p>
          </div>

          {/* Right Form */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 p-8 shadow-lg">
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">OTP sent to: <strong>{user.email}</strong></p>
              </div>
              <div>
                <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-2">6-Digit OTP Code</label>
                <input
                  id="otpCode"
                  type="text"
                  value={otpCode}
                  onChange={(e) => handleOTPInput(e.target.value)}
                  className="block w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm transition-all duration-200 text-center text-lg font-mono tracking-widest"
                  placeholder="000000"
                  disabled={isVerifying}
                  autoFocus
                  maxLength={6}
                />
              </div>

              {success && (
                <div className="bg-green-50 border border-green-300 rounded-2xl p-4">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-300 rounded-2xl p-4">
                  <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || otpCode.length !== 6}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isSending || countdown > 0}
                className="w-full flex justify-center items-center py-4 px-6 border border-indigo-600 rounded-2xl text-base font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSending ? 'Sending...' : countdown > 0 ? `Resend OTP (${countdown})` : 'Resend OTP'}
              </button>

              <button
                type="button"
                onClick={handleBackToDashboard}
                disabled={isVerifying || isSending}
                className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 