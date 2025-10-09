'use client';

/**
 * Vault V2 - Export Page
 * Placeholder for credential export functionality
 */

import React from 'react';

export default function ExportPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Export Credentials</h1>
        <p className="text-muted-foreground">
          Export your passwords securely for backup or migration.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-8">
        <div className="text-center space-y-4">
          <div className="text-5xl mb-4">📤</div>
          <h2 className="text-xl font-semibold">Export Feature Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Export your vault data in multiple formats with optional encryption for secure backup
            and portability.
          </p>
          
          <div className="pt-6">
            <h3 className="font-medium mb-3">Export Options (Planned)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="border rounded-lg p-3 text-sm">
                <div className="font-medium">JSON</div>
                <div className="text-xs text-muted-foreground">Standard format</div>
              </div>
              <div className="border rounded-lg p-3 text-sm">
                <div className="font-medium">Encrypted JSON</div>
                <div className="text-xs text-muted-foreground">Password protected</div>
              </div>
              <div className="border rounded-lg p-3 text-sm">
                <div className="font-medium">CSV</div>
                <div className="text-xs text-muted-foreground">Spreadsheet format</div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t mt-6">
            <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">Security Warning</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Exported files contain sensitive data. Always store them securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

