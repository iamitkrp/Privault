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
  const { isUnlocked, isLoading: sessionLoading } = usePassphraseSession();
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

        // Check if vault exists by looking for vault_verification_data in profile
        // This is more reliable than localStorage as it checks actual database state
        const hasVaultVerificationData = !!profile.vault_verification_data;
        setVaultExists(hasVaultVerificationData);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center overflow-hidden">
        {/* Modern geometric background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-purple-500/10 transform rotate-45 rounded-3xl animate-pulse"></div>
          <div className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-indigo-400/12 to-blue-400/8 transform -rotate-12 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-tr from-blue-300/20 to-transparent transform rotate-45 rounded-lg animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-blue-500/15 transform -rotate-45 rounded-3xl animate-pulse"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-2xl border-t-2 border-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-2xl border-t-2 border-blue-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-4 rounded-2xl border-t-2 border-blue-300 animate-spin" style={{ animationDuration: '2s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-2xl font-light text-gray-900 mb-2">
            {loading ? 'Loading...' : sessionLoading ? 'Checking vault status...' : 'Initializing vault...'}
          </h3>
          <p className="text-gray-600 font-light animate-pulse">Preparing your secure vault...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center overflow-hidden">
        {/* Modern geometric background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/10 to-orange-500/8 transform rotate-45 rounded-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-tr from-red-300/15 to-transparent transform rotate-45 rounded-lg"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-500/8 to-red-500/10 transform -rotate-45 rounded-3xl"></div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-white/20 relative z-10">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-medium text-gray-900">Vault Error</h1>
          </div>
          
          <p className="text-gray-600 mb-6 font-light leading-relaxed">{error}</p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setError(null);
                setIsInitializing(false);
                setProfileInitialized(false);
              }}
              className="flex-1 px-4 py-3 bg-[#219EBC] text-white rounded-xl font-medium hover:bg-[#1a7a93] focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Retry
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      {/* Modern geometric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/8 transform rotate-45 rounded-3xl"></div>
        <div className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-indigo-400/8 to-blue-400/6 transform -rotate-12 rounded-full"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-l-2 border-b-2 border-blue-200/20 transform rotate-45"></div>
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-tr from-blue-300/15 to-transparent transform rotate-45 rounded-lg"></div>
        <div className="absolute bottom-0 right-0 w-96 h-72 bg-gradient-to-tl from-blue-500/5 via-purple-500/3 to-transparent transform skew-x-12 rounded-tl-[100px]"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/8 to-blue-500/10 transform -rotate-45 rounded-3xl"></div>
      </div>

      {/* Header - only show when not changing password or unlocking vault */}
      {vaultAction !== 'change-password' && vaultExists && isUnlocked && (
        <div className="relative z-20 p-6">
          <Link
            href={ROUTES.DASHBOARD}
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#219EBC] transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      )}

      {/* Main Content */}
      <main className={`relative z-10 ${vaultAction === 'change-password' || !vaultExists || (vaultExists && !isUnlocked) ? '' : 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'}`}>
        <div className={`${vaultAction === 'change-password' || !vaultExists || (vaultExists && !isUnlocked) ? '' : 'px-4 py-6 sm:px-0'}`}>
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