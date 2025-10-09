/**
 * Expiration Badge Component
 * 
 * Displays expiration status with visual indicators.
 */

'use client';

import React from 'react';
import { ExpirationStatus } from '@/lib/vault-v2/core/types';

interface ExpirationBadgeProps {
  status: ExpirationStatus;
  className?: string;
}

export const ExpirationBadge: React.FC<ExpirationBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case ExpirationStatus.ACTIVE:
        return {
          label: 'Active',
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };
      case ExpirationStatus.EXPIRING_SOON:
        return {
          label: 'Expiring Soon',
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
      case ExpirationStatus.EXPIRED:
        return {
          label: 'Expired',
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  );
};

