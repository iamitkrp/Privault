'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, loading, router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push(ROUTES.HOME); // Redirect to intro page, not login
    } catch (err) {
      console.error('Sign out error:', err);
      // Even if there's an error, still redirect to home since local state is cleared
      router.push(ROUTES.HOME);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🔒 Privault</h1>
              <span className="ml-4 text-sm text-gray-500">Personal Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Your Personal Space
            </h2>
            <p className="text-gray-600">
              Manage your digital life securely and efficiently
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vault Card */}
            <Link 
              href={ROUTES.VAULT} 
              onClick={() => {
                // Set session flag to allow vault access
                sessionStorage.setItem('vault-access-allowed', 'true');
              }}
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Password Vault</h3>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <p className="text-gray-600 mb-4">
                    Securely store and manage your passwords with zero-knowledge encryption
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    Access Vault
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Notes Card - Coming Soon */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden opacity-75">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Secure Notes</h3>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-600 mb-4">
                  Encrypted personal notes and documents
                </p>
                <div className="flex items-center text-gray-400 text-sm font-medium">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs mr-2">Coming Soon</span>
                  Notes & Documents
                </div>
              </div>
            </div>

            {/* Watchlists Card - Coming Soon */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden opacity-75">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Watchlists</h3>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-600 mb-4">
                  Track stocks, crypto, and personal goals
                </p>
                <div className="flex items-center text-gray-400 text-sm font-medium">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs mr-2">Coming Soon</span>
                  Investment Tracking
                </div>
              </div>
            </div>

            {/* Pomodoro Card - Coming Soon */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden opacity-75">
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Pomodoro Timer</h3>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-600 mb-4">
                  Boost productivity with time management
                </p>
                <div className="flex items-center text-gray-400 text-sm font-medium">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs mr-2">Coming Soon</span>
                  Productivity Timer
                </div>
              </div>
            </div>

            {/* Tasks Card - Coming Soon */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden opacity-75">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Task Manager</h3>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-600 mb-4">
                  Organize your daily tasks and projects
                </p>
                <div className="flex items-center text-gray-400 text-sm font-medium">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs mr-2">Coming Soon</span>
                  Task Organization
                </div>
              </div>
            </div>

            {/* Settings Card - Active */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden opacity-75 cursor-pointer">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Settings</h3>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-600 mb-4">
                  Customize your Privault experience
                </p>
                
                {/* Vault Settings */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Vault Settings</h4>
                  <button 
                    onClick={() => {
                      // Set flag to allow changing vault password
                      sessionStorage.setItem('vault-access-allowed', 'true');
                      sessionStorage.setItem('vault-action', 'change-password');
                      window.location.href = ROUTES.VAULT;
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500 underline"
                  >
                    Change Vault Master Password
                  </button>
                </div>

                <div className="flex items-center text-gray-400 text-sm font-medium">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs mr-2">Coming Soon</span>
                  More Settings
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-sm text-gray-600">Active Vault</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Encryption Status</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{new Date().toLocaleDateString()}</div>
                <div className="text-sm text-gray-600">Last Login</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 