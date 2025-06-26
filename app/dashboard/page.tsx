'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
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
      // Check if this is a fresh page load (not a sign out redirect)
      // If user manually navigates to dashboard without auth, redirect to login
      // If they just signed out, they should go to home page
      const isSignOutRedirect = sessionStorage.getItem('signing-out') === 'true';
      if (!isSignOutRedirect) {
        router.push(ROUTES.LOGIN);
      } else {
        // Clear the sign out flag and redirect to home
        sessionStorage.removeItem('signing-out');
        router.push(ROUTES.HOME);
      }
    }
  }, [user, loading, router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Set flag to indicate this is a sign out process
      sessionStorage.setItem('signing-out', 'true');
      await signOut();
      // Use window.location for immediate redirect to avoid race condition with useEffect
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
      // Even if there's an error, still redirect to home since local state is cleared
      window.location.href = '/';
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

  // Show performance dashboard if requested
  if (showPerformanceDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setShowPerformanceDashboard(false)}
                  className="mr-4 text-blue-600 hover:text-blue-500"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-gray-900">⚡ Performance Monitor</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Performance Dashboard */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Monitor</h2>
            <p className="text-gray-600">Performance monitoring coming soon...</p>
          </div>
        </main>
      </div>
    );
  }

  // Show security dashboard if requested
  if (showSecurityDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setShowSecurityDashboard(false)}
                  className="mr-4 text-blue-600 hover:text-blue-500"
                >
                  ← Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold text-gray-900">🔒 Security Center</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Security Dashboard */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <SecurityDashboard />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">🏠 Personal Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email}
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
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">🔐</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Password Vault</h3>
                      <p className="text-sm text-gray-500">Secure password storage</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Access your encrypted password vault with zero-knowledge security.
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Security Center Card */}
            <div 
              onClick={() => setShowSecurityDashboard(true)}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">🛡️</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Security Center</h3>
                    <p className="text-sm text-gray-500">Monitor account security</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    View security events, manage sessions, and configure security settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Monitor Card */}
            <div 
              onClick={() => setShowPerformanceDashboard(true)}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">⚡</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Performance Monitor</h3>
                    <p className="text-sm text-gray-500">Application performance</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      New
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Monitor app performance, load times, and optimization metrics.
                  </p>
                </div>
              </div>
            </div>

            {/* Secure Notes Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg opacity-60">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">📝</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Secure Notes</h3>
                    <p className="text-sm text-gray-500">Encrypted note storage</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Coming Soon
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Store sensitive notes and documents with end-to-end encryption.
                  </p>
                </div>
              </div>
            </div>

            {/* Watchlists Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg opacity-60">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">👁️</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Watchlists</h3>
                    <p className="text-sm text-gray-500">Monitor important items</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Coming Soon
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Keep track of stocks, cryptocurrency, and other investments.
                  </p>
                </div>
              </div>
            </div>

            {/* Pomodoro Timer Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg opacity-60">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">⏱️</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Pomodoro Timer</h3>
                    <p className="text-sm text-gray-500">Productivity tracking</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Coming Soon
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Focus sessions with time tracking and productivity analytics.
                  </p>
                </div>
              </div>
            </div>

            {/* Task Manager Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg opacity-60">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">✅</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Task Manager</h3>
                    <p className="text-sm text-gray-500">Project organization</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Coming Soon
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Organize tasks, projects, and deadlines with advanced filtering.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Overview Section */}
          <div className="mt-12">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Overview</h3>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">Account Settings</h4>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Address</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-500">
                    Update
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Change Vault Master Password</p>
                    <p className="text-sm text-gray-500">Update your vault encryption password</p>
                  </div>
                  <button 
                    onClick={() => {
                      sessionStorage.setItem('vault-access-allowed', 'true');
                      sessionStorage.setItem('vault-action', 'change-password');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    <Link href={ROUTES.VAULT}>Change Password</Link>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 