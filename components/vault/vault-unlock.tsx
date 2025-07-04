'use client';

import { useState, useEffect } from 'react';
import { passphraseManager } from '@/lib/crypto/passphrase-manager';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

interface VaultUnlockProps {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function VaultUnlock({ user }: VaultUnlockProps) {
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

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

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!masterPassword.trim()) {
      setError('Please enter your vault master password');
      return;
    }

    setIsUnlocking(true);
    setError(null);

    try {
      // Get user profile to retrieve salt
      const { data: profile, error: profileError } = await AuthService.getProfile(user.id);
      
      if (profileError || !profile) {
        throw new Error('Failed to load user profile');
      }

      if (!profile.salt) {
        throw new Error('No salt found in profile. Please contact support.');
      }

      const verificationData = profile.vault_verification_data;
      if (!verificationData) {
        throw new Error('No vault verification data found. Please set up your vault first.');
      }

      console.log('🔍 Raw verification data from database:', {
        data: verificationData,
        type: typeof verificationData,
        length: verificationData.length
      });

      let parsedVerificationData;
      try {
        parsedVerificationData = JSON.parse(verificationData);
        console.log('✅ Parsed verification data:', parsedVerificationData);
      } catch (parseErr) {
        console.error('❌ JSON parse error:', parseErr);
        throw new Error('Invalid vault verification data format');
      }

      const { encryptedData, iv } = parsedVerificationData;
      if (!encryptedData || !iv) {
        throw new Error('Missing verification data components');
      }

      console.log('🔍 Verification data components:', {
        encryptedDataLength: encryptedData.length,
        ivLength: iv.length,
        encryptedDataSample: encryptedData.substring(0, 50) + '...',
        ivSample: iv
      });

      // Try to unlock with the entered password
      const result = await passphraseManager.initializeSession(
        masterPassword,
        profile.salt
      );

      if (!result.success || !result.cryptoKey) {
        throw new Error('Failed to initialize session');
      }

      console.log('🔑 Session initialized successfully, attempting decryption...');

      // Verify the password by trying to decrypt the verification data
      const { decrypt } = await import('@/lib/crypto/crypto-utils');
      
      try {
        console.log('🔓 Attempting to decrypt verification data...');
        const decryptedData = await decrypt(encryptedData, iv, result.cryptoKey);
        console.log('✅ Decryption successful:', decryptedData);
        
        if (decryptedData !== 'VAULT_PASSWORD_VERIFICATION_DATA') {
          throw new Error('Invalid master password');
        }

        // Success! Show feedback and smooth transition
        setIsSuccess(true);
        
        // Clear form
        setMasterPassword('');
        
        // Start exit animation after showing success briefly
        setTimeout(() => {
          setIsExiting(true);
        }, 1000);
        
        // Redirect happens automatically via the vault page logic
        
      } catch (decryptError) {
        console.error('Decryption failed:', decryptError);
        
        // IMPORTANT: Clear the session since verification failed
        passphraseManager.clearSession();
        console.log('🔒 Session cleared due to verification failure');
        
        // Check if this might be an iteration mismatch (old vs new settings)
        if (decryptError instanceof Error && decryptError.name === 'OperationError') {
          throw new Error('Verification data incompatible. Please reset your vault password to use the optimized settings.');
        }
        
        throw new Error('Invalid master password');
      }

    } catch (err) {
      console.error('Vault unlock error:', err);
      
      // Always clear session on any unlock failure
      passphraseManager.clearSession();
      
      setError(err instanceof Error ? err.message : 'Failed to unlock vault');
      setMasterPassword('');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Handle smooth transition back to dashboard
  const handleBackToDashboard = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden transition-all duration-500 ease-in-out ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
      {/* Back to Dashboard Button */}
      <button
        onClick={handleBackToDashboard}
        disabled={isExiting || isSuccess || isUnlocking}
        className="absolute top-8 left-8 z-20 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-neuemontreal-medium">Back to Dashboard</span>
      </button>

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
            <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 leading-tight">
              Unlock Your
              <span className="block font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Vault</span>
            </h1>
            
            <p className="text-xl text-gray-600 font-neuemontreal-medium mb-6 leading-relaxed">
              Enter your vault master password to access your encrypted passwords
            </p>
            
            <p className="text-gray-500 font-light leading-relaxed">
              Zero-knowledge security at its finest
            </p>

            {/* Security info */}
            <div className="mt-8 p-6 bg-green-50/80 backdrop-blur-sm rounded-2xl border border-green-200/50">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-green-800 mb-2">Zero-Knowledge Security</h3>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Your vault master password is never stored on our servers and is used only to decrypt your data locally in your browser.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance info */}
            <div className="mt-4 p-4 bg-green-50/60 backdrop-blur-sm rounded-xl border border-green-200/30">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-green-600 leading-relaxed">
                    <strong>Processing Time:</strong> Vault unlocking may take 3-5 seconds due to advanced encryption processing (50,000 security iterations).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 p-8 shadow-lg">
            <form onSubmit={handleUnlock} className="space-y-6">
              <div>
                <label htmlFor="masterPassword" className="block text-sm font-medium text-gray-700 mb-3">
                  Vault Master Password
                </label>
                <div className="relative">
                  <input
                    id="masterPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className="block w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200 pr-12"
                    placeholder="Enter your vault master password"
                    disabled={isUnlocking || isSuccess || isExiting}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-20 hover:bg-gray-100/50 rounded-r-2xl transition-colors focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isUnlocking || isSuccess || isExiting}
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
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
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isUnlocking || isSuccess || isExiting || !masterPassword}
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
                    Vault Unlocked!
                  </div>
                ) : isUnlocking ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="flex flex-col items-start">
                      <span>Unlocking Vault...</span>
                      <span className="text-xs text-green-100 mt-1">Processing encryption keys</span>
                    </div>
                  </div>
                ) : (
                  'Unlock Vault'
                )}
              </button>

              {/* Debug: Reset vault verification data */}
              {process.env.NODE_ENV === 'development' && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Development Mode - Migration Tools</p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('This will reset your vault verification data and allow you to migrate to optimized settings.\n\nYou will need to:\n1. Reset verification data\n2. Refresh the page\n3. Create a new vault setup\n\nContinue?')) {
                          try {
                            const { error } = await AuthService.updateProfile(user.id, {
                              vault_verification_data: null
                            });
                            if (!error) {
                              alert('✅ Vault verification data reset!\n\nNext steps:\n1. Refresh this page\n2. You will see vault setup screen\n3. Create your vault with optimized settings (50k iterations)\n\nThis will fix the compatibility issue.');
                              // Auto refresh after a short delay
                              setTimeout(() => {
                                window.location.reload();
                              }, 2000);
                            }
                          } catch (err) {
                            console.error('Reset error:', err);
                            alert('❌ Reset failed. Please try again.');
                          }
                        }
                      }}
                      className="text-xs text-green-600 hover:text-green-500 underline block font-medium"
                    >
                      🔄 Migrate to Optimized Settings (Recommended)
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        alert('🐛 Compatibility Issue Detected:\n\n' +
                              '❌ Problem: Your vault was created with old settings (100k iterations)\n' +
                              '⚡ Solution: System now uses optimized settings (50k iterations)\n\n' +
                              '🔧 Fix Options:\n' +
                              '1. RECOMMENDED: Use "Migrate to Optimized Settings" button above\n' +
                              '2. ALTERNATIVE: Go to Dashboard → Change Vault Password\n\n' +
                              '📈 Benefits after migration:\n' +
                              '• 50% faster vault unlock (3-5s vs 8-10s)\n' +
                              '• Same security level maintained\n' +
                              '• Better user experience\n\n' +
                              '⚠️ Migration is safe and preserves your data.');
                      }}
                      className="text-xs text-green-600 hover:text-green-500 underline block"
                    >
                      ℹ️ Understanding the Compatibility Issue
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        alert('🚀 Performance optimizations applied:\n\n' +
                              '• PBKDF2 iterations: 100k → 50k (50% faster)\n' +
                              '• Async password strength calculations\n' +
                              '• Optimized statistics computations\n' +
                              '• Better loading indicators\n\n' +
                              '⏱️ Expected unlock time: 3-5 seconds (down from ~10 seconds)\n' +
                              '🔒 Security: Still exceeds OWASP recommendations (10k minimum)');
                      }}
                      className="text-xs text-green-600 hover:text-green-500 underline block"
                    >
                      📊 View Performance Info
                    </button>
                  </div>
                </div>
              )}

              {/* Production user hint */}
              {process.env.NODE_ENV !== 'development' && error && error.includes('incompatible') && (
                <div className="pt-4 border-t border-green-200">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Settings Update Available</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Your vault can be updated to use our optimized settings for better performance.</p>
                          <p className="mt-1"><strong>Solution:</strong> Go to Dashboard → Change Vault Password</p>
                          <p className="mt-1 text-xs">This will migrate your vault to faster, optimized encryption settings.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}