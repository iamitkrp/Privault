/**
 * Vault Stats Component - Stub
 */

import React from 'react';
import { VaultStats as VaultStatsType } from '@/lib/vault-v2/core/types';

export interface VaultStatsProps {
  stats: VaultStatsType;
  loading?: boolean;
}

export const VaultStats: React.FC<VaultStatsProps> = ({
  stats,
  loading = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* TODO: Implement vault statistics dashboard */}
      <p className="text-muted-foreground">Vault Stats - To be implemented</p>
    </div>
  );
};

