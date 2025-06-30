'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES, APP_NAME } from '@/constants';
import Link from 'next/link';
import SecurityDashboard from '@/components/security/security-dashboard';
// import PerformanceDashboard from '@/components/performance/performance-dashboard';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);

  // Redirect if not authenticated (but not during sign out process)
  useEffect(() => {
    if (!loading && !user) {
      const isSignOutRedirect = sessionStorage.getItem('signing-out') === 'true';
      if (!isSignOutRedirect) {
        router.push(ROUTES.LOGIN);
      } else {
        sessionStorage.removeItem('signing-out');
        router.push(ROUTES.HOME);
      }
    }
  }, [user, loading, router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      sessionStorage.setItem('signing-out', 'true');
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
      window.location.href = '/';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-t-2 border-blue-400 animate-spin" style={{ animationDuration: '1.2s' }}></div>
            <div className="absolute inset-4 rounded-full border-t-2 border-blue-300 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-600 font-light animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Show performance dashboard if requested
  if (showPerformanceDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowPerformanceDashboard(false)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">Back to Dashboard</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">Performance Monitor</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Performance Monitor</h2>
            <p className="text-gray-600 max-w-md mx-auto">Track application performance, load times, and optimization metrics. Coming soon...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show security dashboard if requested
  if (showSecurityDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSecurityDashboard(false)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">Back to Dashboard</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">Security Center</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <SecurityDashboard />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Personal Dashboard</h1>
                <p className="text-xs text-gray-500">{APP_NAME}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to Your Personal Space
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Manage your digital life securely and efficiently
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Vault Card */}
          <Link 
            href={ROUTES.VAULT} 
            onClick={() => {
              sessionStorage.setItem('vault-access-allowed', 'true');
            }}
            className="group"
          >
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 border border-white/50 group-hover:scale-105">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Password Vault</h3>
                <p className="text-sm text-gray-600 mb-4">Secure password storage</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Access your encrypted password vault with zero-knowledge security.
                </p>
              </div>
            </div>
          </Link>

          {/* Security Center Card */}
          <div 
            onClick={() => setShowSecurityDashboard(true)}
            className="group cursor-pointer"
          >
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 border border-white/50 group-hover:scale-105">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Active
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Security Center</h3>
                <p className="text-sm text-gray-600 mb-4">Monitor account security</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  View security events, manage sessions, and configure security settings.
                </p>
              </div>
            </div>
          </div>

          {/* Performance Monitor Card */}
          <div 
            onClick={() => setShowPerformanceDashboard(true)}
            className="group cursor-pointer"
          >
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 border border-white/50 group-hover:scale-105">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    New
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Performance Monitor</h3>
                <p className="text-sm text-gray-600 mb-4">Application performance</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Monitor app performance, load times, and optimization metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Secure Notes Card */}
          <div className="group">
            <div className="bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-2xl border border-white/50 opacity-75">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Notes</h3>
                <p className="text-sm text-gray-600 mb-4">Encrypted note storage</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Store sensitive notes and documents with end-to-end encryption.
                </p>
              </div>
            </div>
          </div>

          {/* Watchlists Card */}
          <div className="group">
            <div className="bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-2xl border border-white/50 opacity-75">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Watchlists</h3>
                <p className="text-sm text-gray-600 mb-4">Monitor important items</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Keep track of stocks, cryptocurrency, and other investments.
                </p>
              </div>
            </div>
          </div>

          {/* Pomodoro Timer Card */}
          <div className="group">
            <div className="bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-2xl border border-white/50 opacity-75">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pomodoro Timer</h3>
                <p className="text-sm text-gray-600 mb-4">Productivity tracking</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Focus sessions with time tracking and productivity analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Task Manager Card */}
          <div className="group md:col-span-2 lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-sm overflow-hidden shadow-lg rounded-2xl border border-white/50 opacity-75">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Task Manager</h3>
                <p className="text-sm text-gray-600 mb-4">Project organization</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Organize tasks, projects, and deadlines with advanced filtering.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Overview Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Account Overview</h3>
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/50">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <h4 className="text-lg font-semibold text-gray-900">Account Settings</h4>
            </div>
            <div className="px-8 py-6 space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-gray-100/50">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email Address</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Update
                </button>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-100/50">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Change Vault Master Password</p>
                  <p className="text-sm text-gray-600">Update your vault encryption password</p>
                </div>
                <Link
                  href={ROUTES.VAULT}
                  onClick={() => {
                    sessionStorage.setItem('vault-access-allowed', 'true');
                    sessionStorage.setItem('vault-action', 'change-password');
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Change Password
                </Link>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Account Created</p>
                  <p className="text-sm text-gray-600">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 