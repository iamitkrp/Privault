'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">🔒 Privault</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent you a verification link
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Success message */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Account created successfully!
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              We've sent a verification email to your inbox. Please click the verification link in the email to activate your account and complete the signup process.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Important:</strong> Check your spam folder if you don't see the email within a few minutes. The verification link will expire in 24 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                After verifying your email, you'll be automatically redirected to your secure vault.
              </p>

              <div className="pt-4">
                <Link 
                  href={ROUTES.LOGIN}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional help */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive an email? Check your spam folder or try signing up again.
          </p>
        </div>
      </div>
    </div>
  );
} 