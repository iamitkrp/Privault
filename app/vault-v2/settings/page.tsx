'use client';

/**
 * Vault V2 - Settings Page
 * Placeholder for vault settings and preferences
 */

import React from 'react';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Vault Settings</h1>
        <p className="text-muted-foreground">
          Configure your vault preferences and security options.
        </p>
      </div>

      <div className="space-y-6">
        {/* Security Settings */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Auto-lock Timeout</div>
                <div className="text-sm text-muted-foreground">Lock vault after inactivity</div>
              </div>
              <div className="text-sm text-muted-foreground">Coming Soon</div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Require Re-authentication</div>
                <div className="text-sm text-muted-foreground">Ask for password on sensitive actions</div>
              </div>
              <div className="text-sm text-muted-foreground">Coming Soon</div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Password History</div>
                <div className="text-sm text-muted-foreground">Number of previous passwords to keep</div>
              </div>
              <div className="text-sm text-muted-foreground">Coming Soon</div>
            </div>
          </div>
        </div>

        {/* Expiration Settings */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Password Expiration</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Default Expiration</div>
                <div className="text-sm text-muted-foreground">Set default password expiration period</div>
              </div>
              <div className="text-sm text-muted-foreground">Coming Soon</div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Expiration Notifications</div>
                <div className="text-sm text-muted-foreground">Get notified before passwords expire</div>
              </div>
              <div className="text-sm text-muted-foreground">Coming Soon</div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Display Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Default View</div>
                <div className="text-sm text-muted-foreground">Choose grid or list view</div>
              </div>
              <div className="text-sm text-muted-foreground">Coming Soon</div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Sort By</div>
                <div className="text-sm text-muted-foreground">Default sorting preference</div>
              </div>
              <div className="text-sm text-muted-foreground">Coming Soon</div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Data Management</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Clear Deleted Items</div>
                <div className="text-sm text-muted-foreground">Permanently remove soft-deleted credentials</div>
              </div>
              <div className="text-sm text-muted-foreground">Coming Soon</div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Backup Vault</div>
                <div className="text-sm text-muted-foreground">Create encrypted backup of your vault</div>
              </div>
              <div className="text-sm text-muted-foreground">Coming Soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

