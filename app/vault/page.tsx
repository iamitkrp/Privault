'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';

export default function VaultPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🔒 Privault</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <button
                onClick={() => {
                  // TODO: Implement sign out
                  console.log('Sign out clicked');
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Authentication Successful!
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              Your account has been verified and you're now logged in to your secure vault.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                ✅ Phase 3: Authentication System - COMPLETE!
              </h3>
              
              <div className="text-left space-y-2 text-sm text-blue-800">
                <p>✅ User registration working</p>
                <p>✅ Email verification working</p>
                <p>✅ Login flow working</p>
                <p>✅ Authentication state management working</p>
                <p>✅ Route protection working</p>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Next:</strong> Ready to build Phase 5 - Core Vault Functionality (password management interface)
                </p>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p>User ID: {user.id}</p>
              <p>Email: {user.email}</p>
              <p>Verified: {user.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 