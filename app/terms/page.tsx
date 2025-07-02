'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <Link 
              href={ROUTES.HOME}
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
          
          <h1 className="text-3xl font-light text-gray-900 mb-6">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <p className="mb-4 font-suisse-regular" style={{ color: '#333333' }}>
              This is a placeholder for the Terms of Service page. In a production environment, this would contain the actual terms and conditions for using Privault.
            </p>
            
            <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">1. Acceptance of Terms</h2>
            <p className="mb-4 font-suisse-regular" style={{ color: '#333333' }}>
              By accessing or using Privault, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>
            
            <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">2. Privacy Policy</h2>
            <p className="mb-4 font-suisse-regular" style={{ color: '#333333' }}>
              Your use of Privault is also governed by our <Link href={ROUTES.PRIVACY} className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>.
            </p>
            
            <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">3. Security</h2>
            <p className="mb-4 font-suisse-regular" style={{ color: '#333333' }}>
              Privault uses zero-knowledge encryption to secure your data. This means that we cannot access your encrypted data without your master password.
            </p>
            
            <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">4. Data Storage</h2>
            <p className="mb-4 font-suisse-regular" style={{ color: '#333333' }}>
              Your encrypted data is stored securely and can only be decrypted with your master password, which is never sent to our servers.
            </p>
            
            <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">5. Contact</h2>
            <p className="mb-4 font-suisse-regular" style={{ color: '#333333' }}>
              If you have any questions about these Terms, please contact us.
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 