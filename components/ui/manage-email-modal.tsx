'use client';

import React, { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth.service';
import VaultOTPVerification from '@/components/vault/vault-otp-verification';
import { useRouter } from 'next/navigation';

interface ManageEmailModalProps {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isOpen: boolean;
  onClose: () => void;
  onEmailUpdated?: () => void;
}

type ManageAction = 'email_update' | 'profile_delete' | null;

export default function ManageEmailModal({ user, isOpen, onClose, onEmailUpdated }: ManageEmailModalProps) {
  const [activeAction, setActiveAction] = useState<ManageAction>(null);
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<'email_update' | 'profile_delete'>('email_update');
  const [uiStage, setUiStage] = useState<'selection' | 'email_update' | 'profile_delete'>('selection');
  const router = useRouter();

  // Track mouse movement for parallax effect (same pattern as vault pages)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isOpen) return null;

  const handleEmailUpdate = () => {
    setError(null);
    setSuccess(null);
    
    if (!newEmail.trim()) {
      setError('Please enter a new email address');
      return;
    }

    if (newEmail === user.email) {
      setError('New email must be different from current email');
      return;
    }

    if (newEmail !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setActiveAction('email_update');
    setOtpPurpose('email_update');
    setShowOTPVerification(true);
  };

  const handleProfileDelete = () => {
    setActiveAction('profile_delete');
    setOtpPurpose('profile_delete');
    setShowOTPVerification(true);
  };

  // Handlers for selecting actions on initial stage
  const selectUpdateEmail = () => setUiStage('email_update');
  const selectDeleteAccount = () => setUiStage('profile_delete');
  const goBackToSelection = () => setUiStage('selection');

  const handleOTPVerified = async () => {
    setShowOTPVerification(false);
    setIsProcessing(true);
    setError(null);

    try {
      if (activeAction === 'email_update') {
        const result = await AuthService.updateUserEmail(user.id, newEmail);
        
        if (result.success) {
          setSuccess('Email updated successfully! Please check your new email for verification.');
          setTimeout(() => {
            onEmailUpdated?.();
            onClose();
          }, 2000);
        } else {
          setError(result.error || 'Failed to update email');
        }
      } else if (activeAction === 'profile_delete') {
        // Immediately navigate to the confirmation page *before* the user is signed out
        // to avoid the protected Dashboard route briefly redirecting to /signup.
        router.replace('/account-deleted');

        const result = await AuthService.deleteUserAccount(user.id, user.email);

        if (!result.success) {
          // If something went wrong, surface the error (will show on AccountDeleted page)
          console.error('Account deletion error:', result.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  const handleOTPCancel = () => {
    setShowOTPVerification(false);
    setActiveAction(null);
  };

  const resetForm = () => {
    setNewEmail('');
    setConfirmEmail('');
    setError(null);
    setSuccess(null);
    setActiveAction(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (showOTPVerification) {
    return (
      <VaultOTPVerification
        user={user}
        purpose={otpPurpose}
        onVerified={handleOTPVerified}
        onCancel={handleOTPCancel}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden relative">
        {/* Parallax geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-purple-500/10 rounded-3xl rotate-45 transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px) rotate(45deg)`,
            }}
          />
          <div
            className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-indigo-400/12 to-blue-400/8 rounded-full -rotate-12 transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px) rotate(-12deg)`,
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-96 h-72 bg-gradient-to-tl from-blue-500/8 via-purple-500/5 to-transparent skew-x-12 rounded-tl-[100px] transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px) skewX(12deg)`,
            }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-blue-500/15 rounded-3xl -rotate-45 transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * -0.5}px, ${mousePosition.y * -0.5}px) rotate(-45deg)`,
            }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left side – header and info */}
            <div className="text-left">
              {/* Back button */}
              <div className="mb-8">
                <button
                  onClick={handleClose}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors font-neuemontreal-medium"
                  disabled={isProcessing}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>

              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 leading-tight">
                Manage Account
                <span className="block font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Email</span>
              </h1>

              <p className="text-xl text-gray-600 font-neuemontreal-medium mb-6 leading-relaxed">
                Update your account email or delete your profile securely
              </p>

              <p className="text-gray-500 font-light leading-relaxed">
                All changes require OTP verification for enhanced security
              </p>

              {/* Security info */}
              <div className="mt-8 p-6 bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/50">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-blue-800 mb-2">OTP Verification</h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      We send a verification code to your current email before any sensitive changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side – card */}
            <div className="p-2 w-full max-h-[80vh] overflow-hidden">

              {uiStage === 'selection' && (
                <div className="grid gap-6">
                  {/* Update email option */}
                  <button
                    onClick={selectUpdateEmail}
                    className="w-full max-w-md mx-auto px-6 py-4 text-left bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-200 transition-transform duration-200 transform hover:scale-[1.02] group focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <h4 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-blue-600">Update Email Address</h4>
                    <p className="text-gray-600 text-sm">Change your account email address</p>
                  </button>

                  {/* Delete profile option */}
                  <button
                    onClick={selectDeleteAccount}
                    className="w-full max-w-md mx-auto px-6 py-4 text-left bg-red-50 hover:bg-red-100 rounded-2xl border border-red-200 transition-transform duration-200 transform hover:scale-[1.02] group focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  >
                    <h4 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-red-600">Delete Account</h4>
                    <p className="text-gray-600 text-sm">Permanently remove your profile and data</p>
                  </button>
                </div>
              )}

              {uiStage !== 'selection' && (
                <div className="overflow-y-auto max-h-[70vh] pr-2 scrollbar-thin scrollbar-thumb-blue-200">

                  {/* Back link inside card */}
                  <button
                    onClick={goBackToSelection}
                    className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center mb-6"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>

                  {/* Current Email display */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Current Email Address</h3>
                    <p className="text-lg text-gray-900 break-all">{user.email}</p>
                  </div>

                  {uiStage === 'email_update' && (
                    <>
                      {/* Update Email Form (same as before) */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Update Email Address
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Email Address</label>
                            <input type="email" value={newEmail} onChange={(e)=>setNewEmail(e.target.value)}
                              className="block w-full px-4 py-4 border-0 rounded-2xl bg-white/60 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white/80 transition-all duration-200"
                              placeholder="Enter new email address" disabled={isProcessing}/>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Email</label>
                            <input type="email" value={confirmEmail} onChange={(e)=>setConfirmEmail(e.target.value)}
                              className="block w-full px-4 py-4 border-0 rounded-2xl bg-white/60 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white/80 transition-all duration-200"
                              placeholder="Confirm new email address" disabled={isProcessing}/>
                          </div>
                          <button onClick={handleEmailUpdate} disabled={isProcessing||!newEmail||!confirmEmail}
                            className="w-full py-4 px-6 rounded-2xl text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isProcessing?'Processing...':'Request OTP & Update'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {uiStage === 'profile_delete' && (
                    <>
                      <h3 className="text-lg font-medium text-red-600 flex items-center mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Account
                      </h3>
                      <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-red-800">Warning: This action cannot be undone</h4>
                            <p className="text-sm text-red-700 mt-1">Deleting your account will permanently remove all your data, including your vault, passwords, and settings.</p>
                          </div>
                        </div>
                      </div>
                      <button onClick={handleProfileDelete} disabled={isProcessing}
                        className="w-full py-4 px-6 rounded-2xl text-white font-medium bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isProcessing?'Processing...':'Delete Account (Requires OTP)'}
                      </button>
                    </>
                  )}

                  {/* Error/Success messages */}
                  {error && (
                    <div className="mt-6 bg-red-50/80 backdrop-blur-sm border border-red-300/50 rounded-2xl p-4">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="mt-6 bg-green-50/80 backdrop-blur-sm border border-green-300/50 rounded-2xl p-4">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 