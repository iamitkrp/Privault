'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import Link from 'next/link';
import { usePassphraseSession } from '@/hooks/use-passphrase-session';
import { passphraseManager } from '@/lib/crypto/passphrase-manager';
// import { CryptoService } from '@/services/crypto.service';
import { AuthService } from '@/services/auth.service';

// Components
import VaultSetup from '@/components/vault/vault-setup';
import VaultUnlock from '@/components/vault/vault-unlock';
import VaultDashboard from '@/components/vault/vault-dashboard';
import VaultChangePassword from '@/components/vault/vault-change-password';
import VaultOTPVerification from '@/components/vault/vault-otp-verification';
import { OTPService } from '@/services/otp.service';

export default function VaultPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { isUnlocked, sessionInfo, isLoading: sessionLoading } = usePassphraseSession();
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [vaultExists, setVaultExists] = useState<boolean | null>(null);
  const [accessFromDashboard, setAccessFromDashboard] = useState<boolean | null>(null);
  const [vaultAction, setVaultAction] = useState<string | null>(null);
  const [needsOTP, setNeedsOTP] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Redirect if not authenticated (but not during sign out process)
  useEffect(() => {
    if (!loading && !user) {
      // Check if this is a fresh page load (not a sign out redirect)
      // If user manually navigates to vault without auth, redirect to login
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

  // Security: Clear any vault session when component mounts
  // This ensures a fresh vault state after login
  useEffect(() => {
    if (user) {
      // Clear any existing vault session for security
      passphraseManager.clearSession();
      console.log('Vault session cleared for security');
    }
  }, [user]);

  // Security: Check if user accessed vault properly through dashboard
  useEffect(() => {
    if (typeof window !== 'undefined' && user && !loading) {
      // Check if there's a proper session flag or if user came from dashboard
      const vaultAccessFlag = sessionStorage.getItem('vault-access-allowed');
      const referrer = document.referrer;
      
      // Allow access if:
      // 1. They have the session flag (came from dashboard)
      // 2. They came from the dashboard page referrer
      // 3. This is a development environment (for testing)
      const isDev = process.env.NODE_ENV === 'development';
      const fromDashboard = vaultAccessFlag === 'true' || referrer.includes('/dashboard');
      
      if (isDev || fromDashboard) {
        setAccessFromDashboard(true);
        // Clear the access flag but keep the action flag for now
        if (vaultAccessFlag) {
          sessionStorage.removeItem('vault-access-allowed');
        }
      } else {
        // Redirect to dashboard if not accessed properly
        console.log('Redirecting to dashboard - vault must be accessed through dashboard');
        router.push(ROUTES.DASHBOARD);
        return;
      }
    } else if (user && !loading) {
      // Fallback for SSR - allow access but clear session
      setAccessFromDashboard(true);
    }
  }, [user, loading, router]);

  // Check if OTP is needed for vault access after logout
  useEffect(() => {
    if (accessFromDashboard && user && !otpVerified) {
      const needsOTPCheck = OTPService.needsOTPForVaultAccess(user.id);
      setNeedsOTP(needsOTPCheck);
    }
  }, [accessFromDashboard, user, otpVerified]);

  // Handle vault actions after access is confirmed
  useEffect(() => {
    if (accessFromDashboard && typeof window !== 'undefined') {
      const action = sessionStorage.getItem('vault-action');
      if (action) {
        setVaultAction(action);
        sessionStorage.removeItem('vault-action');
      }
    }
  }, [accessFromDashboard]);

  // Initialize user crypto if needed
  useEffect(() => {
    const initializeUserCrypto = async () => {
      if (!user || isInitializing || profileInitialized) return;

      try {
        setIsInitializing(true);
        setError(null);

        // Get or create user profile
        const { data: profile, error: profileError } = await AuthService.getOrCreateProfile(user.id, user.email || '');
        
        if (profileError) {
          throw new Error(`Profile error: ${profileError}`);
        }

        if (!profile) {
          throw new Error('Failed to load or create user profile');
        }

        // Mark profile as initialized
        setProfileInitialized(true);

        // Check if vault exists by looking for vault setup flag in profile metadata
        // For Phase 5 demo: use localStorage to track vault setup status
        if (typeof window !== 'undefined') {
          const vaultSetupCompleted = localStorage.getItem(`vault-setup-${user.id}`);
          setVaultExists(vaultSetupCompleted === 'true');
        } else {
          // SSR fallback - assume vault exists to show unlock screen
          setVaultExists(true);
        }

      } catch (err) {
        console.error('Failed to initialize user crypto:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize vault');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeUserCrypto();
  }, [user, isInitializing, profileInitialized]);

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
  if (loading || isInitializing || sessionLoading || vaultExists === null || accessFromDashboard === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {loading ? 'Loading...' : sessionLoading ? 'Checking vault status...' : 'Initializing vault...'}
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Vault Error</h1>
          </div>
          
          <p className="text-gray-600 mb-4">{error}</p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setError(null);
                setIsInitializing(false);
                setProfileInitialized(false);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Retry
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - only show when not changing password or unlocking vault */}
      {vaultAction !== 'change-password' && !(vaultExists && !isUnlocked) && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">🔒 Privault</h1>
                {isUnlocked && (
                  <div className="ml-4 flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Unlocked • {Math.ceil((sessionInfo.timeRemaining || 0) / 60000)}m remaining</span>
                  </div>
                )}
              </div>
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
      )}

      {/* Main Content */}
      <main className={`${vaultAction === 'change-password' || (vaultExists && !isUnlocked) ? '' : 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'}`}>
        <div className={`${vaultAction === 'change-password' || (vaultExists && !isUnlocked) ? '' : 'px-4 py-6 sm:px-0'}`}>
          {/* Breadcrumb - only show when not changing password or unlocking vault */}
          {vaultAction !== 'change-password' && !(vaultExists && !isUnlocked) && (
            <nav className="flex mb-6" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link
                    href={ROUTES.DASHBOARD}
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Password Vault</span>
                  </div>
                </li>
              </ol>
            </nav>
          )}

          {vaultAction === 'change-password' ? (
            // Password change now handles its own OTP verification internally
            <VaultChangePassword 
              user={user}
              onPasswordChanged={() => {
                setVaultAction(null);
                // After password change, go back to dashboard
                router.push(ROUTES.DASHBOARD);
              }}
              onCancel={() => {
                setVaultAction(null);
                router.push(ROUTES.DASHBOARD);
              }}
            />
          ) : needsOTP && !otpVerified ? (
            // Show OTP verification for vault access after logout
            <VaultOTPVerification
              user={user}
              purpose="vault_access"
              onVerified={() => {
                setOtpVerified(true);
                setNeedsOTP(false);
              }}
              onCancel={() => {
                router.push(ROUTES.DASHBOARD);
              }}
            />
          ) : isUnlocked ? (
            <VaultDashboard user={user} />
          ) : vaultExists === false ? (
            <VaultSetup 
              user={user} 
              onVaultCreated={() => setVaultExists(true)}
            />
          ) : (
            <VaultUnlock user={user} />
          )}
        </div>
      </main>
    </div>
  );
} 