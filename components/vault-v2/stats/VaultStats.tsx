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
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.total_credentials}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Credentials</div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {stats.expiring_soon}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
          {stats.weak_passwords}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Weak Passwords</div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {stats.health_score}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Health Score</div>
      </div>
    </div>
  );
};

