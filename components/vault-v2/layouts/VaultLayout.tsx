/**
 * Vault Layout Component - Stub
 */

import React from 'react';

export interface VaultLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const VaultLayout: React.FC<VaultLayoutProps> = ({
  children,
  sidebar,
}) => {
  return (
    <div className="flex h-screen">
      {sidebar && <aside className="w-64 border-r">{sidebar}</aside>}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

