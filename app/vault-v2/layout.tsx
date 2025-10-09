/**
 * Vault V2 - Layout
 * 
 * Consistent layout for all vault pages.
 * Includes navigation, sidebar, and container structure.
 */

import React from 'react';

export default function VaultV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Vault Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Vault V2
              </h1>
              <div className="hidden md:flex items-center gap-4">
                <a href="/vault-v2" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  All Credentials
                </a>
                <a href="/vault-v2/import" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Import
                </a>
                <a href="/vault-v2/export" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Export
                </a>
                <a href="/vault-v2/settings" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Settings
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                🔒 Lock Vault
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

