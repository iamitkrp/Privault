'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function PrivacyPage() {
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
          
          <h1 className="text-3xl font-light text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              This is a placeholder for the Privacy Policy page. In a production environment, this would contain the actual privacy policy for Privault.
            </p>
            
            <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">1. Data Collection</h2>
            <p className="mb-4">
              Privault collects minimal personal information necessary to provide our services. Your passwords and sensitive data are encrypted on your device before being stored.
            </p>
            
            <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">2. Zero-Knowledge Architecture</h2>
            <p className="mb-4">
              Our zero-knowledge architecture means that we cannot access your encrypted data. Your master password and encryption keys never leave your device.
            </p>
            
            <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">3. Data Security</h2>
            <p className="mb-4">
              We employ industry-standard security measures to protect your data from unauthorized access, alteration, or destruction.
            </p>
            
            <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">4. Third-Party Services</h2>
            <p className="mb-4">
              We may use third-party services for infrastructure and analytics. These services are carefully selected and bound by confidentiality obligations.
            </p>
            
            <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">5. Terms of Service</h2>
            <p className="mb-4">
              This Privacy Policy is part of our <Link href={ROUTES.TERMS} className="text-blue-600 hover:text-blue-800">Terms of Service</Link>.
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