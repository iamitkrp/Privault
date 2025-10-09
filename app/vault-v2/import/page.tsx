'use client';

/**
 * Vault V2 - Import Page
 * Placeholder for credential import functionality
 */

import React from 'react';

export default function ImportPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Import Credentials</h1>
        <p className="text-muted-foreground">
          Import your passwords from other password managers or files.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-8">
        <div className="text-center space-y-4">
          <div className="text-5xl mb-4">📥</div>
          <h2 className="text-xl font-semibold">Import Feature Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're building a comprehensive import tool that will support multiple formats including
            1Password, LastPass, Bitwarden, Chrome, CSV, and JSON.
          </p>
          
          <div className="pt-6">
            <h3 className="font-medium mb-3">Supported Formats (Planned)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="border rounded-lg p-3 text-sm">1Password</div>
              <div className="border rounded-lg p-3 text-sm">LastPass</div>
              <div className="border rounded-lg p-3 text-sm">Bitwarden</div>
              <div className="border rounded-lg p-3 text-sm">Chrome</div>
              <div className="border rounded-lg p-3 text-sm">CSV</div>
              <div className="border rounded-lg p-3 text-sm">JSON</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

