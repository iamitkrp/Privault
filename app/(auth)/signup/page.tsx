'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { ROUTES, ERROR_MESSAGES, VALIDATION_RULES, SECURITY_CONFIG } from '@/constants';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { signUp, user, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [user, loading, router]);

  // Clear errors when form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
    setFormErrors({});
  }, [formData, error, clearError]);

  // Check password strength
  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [formData.password]);

  // Simple password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push('Include special characters');

    return { score, feedback };
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!VALIDATION_RULES.EMAIL.test(formData.email)) {
      errors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    // Password validation
    if (!formData.password) {
      errors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password.length < SECURITY_CONFIG.MASTER_PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${SECURITY_CONFIG.MASTER_PASSWORD_MIN_LENGTH} characters`;
    } else if (passwordStrength.score < SECURITY_CONFIG.MASTER_PASSWORD_STRENGTH_REQUIREMENT) {
      errors.password = ERROR_MESSAGES.PASSWORD_TOO_WEAK;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = ERROR_MESSAGES.PASSWORD_MISMATCH;
    }

    // Terms acceptance
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signUp(formData.email, formData.password);
      
      if (error) {
        setFormErrors({ general: error || 'Failed to create account' });
      } else {
        // Success - redirect to email verification page
        router.push(ROUTES.VERIFY_EMAIL);
      }
    } catch (err) {
      setFormErrors({ 
        general: err instanceof Error ? err.message : ERROR_MESSAGES.NETWORK_ERROR 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Password strength color
  const getStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4:
      case 5: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  // Password strength text
  const getStrengthText = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4:
      case 5: return 'Strong';
      default: return '';
    }
  };

  // Show loading state if checking authentication
  if (loading || (user && !loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            {/* Elegant loading animation */}
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-t-2 border-blue-400 animate-spin" style={{ animationDuration: '1.2s' }}></div>
            <div className="absolute inset-4 rounded-full border-t-2 border-blue-300 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-600 font-light animate-pulse">
            {user ? 'Redirecting to your vault...' : 'Authenticating...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Create your account
        </h2>
        <p className="text-gray-600">
          Start securing your passwords with zero-knowledge encryption
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Email field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-50">
              <svg className="h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.email}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Master Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-50">
              <svg className="h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-all duration-200"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-gray-600 transition-colors z-10"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          {formErrors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.password}
            </p>
          )}

          {/* Password strength indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium text-gray-700">Password strength: 
                  <span className={`ml-1 ${
                    passwordStrength.score <= 1 ? 'text-red-500' : 
                    passwordStrength.score === 2 ? 'text-yellow-500' : 
                    passwordStrength.score === 3 ? 'text-blue-500' : 
                    'text-green-500'
                  }`}>
                    {getStrengthText()}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStrengthColor()} transition-all duration-300 ease-in-out`} 
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                ></div>
              </div>
              {passwordStrength.feedback.length > 0 && (
                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                  {passwordStrength.feedback.map((tip, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-3 w-3 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-50">
              <svg className="h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-all duration-200"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-gray-600 transition-colors z-10"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms and conditions */}
        <div className="space-y-2">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                I agree to the{' '}
                <Link href={ROUTES.TERMS} className="text-blue-600 hover:text-blue-500 transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href={ROUTES.PRIVACY} className="text-blue-600 hover:text-blue-500 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
          {formErrors.agreeToTerms && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {formErrors.agreeToTerms}
            </p>
          )}
        </div>

        {/* General error message */}
        {(formErrors.general || error) && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 animate-fade-in">
            <div className="flex">
              <div>
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {formErrors.general || error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="relative w-5 h-5 mr-3">
                  <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                  <div className="absolute inset-0 rounded-full border-t-2 border-white animate-spin"></div>
                </div>
                <span>Creating account...</span>
              </>
            ) : (
              'Create account'
            )}
          </button>
        </div>

        {/* Sign in link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </form>

      {/* Security note */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p>Your master password is never stored on our servers</p>
        </div>
      </div>
    </div>
  );
} 