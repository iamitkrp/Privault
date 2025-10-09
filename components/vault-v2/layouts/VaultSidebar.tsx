/**
 * Vault Sidebar Component - Stub
 */

import React from 'react';

export interface VaultSidebarProps {
  onNavigate?: (route: string) => void;
}

export const VaultSidebar: React.FC<VaultSidebarProps> = ({
  onNavigate,
}) => {
  return (
    <div className="p-4">
      {/* TODO: Implement vault sidebar navigation */}
      <p className="text-muted-foreground">Vault Sidebar - To be implemented</p>
    </div>
  );
};

