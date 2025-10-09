/**
 * Expiration Warning Component - Stub
 */

import React from 'react';
import { ExpirationStatus } from '@/lib/vault-v2/core/types';

export interface ExpirationWarningProps {
  expiresAt: Date | null;
  status: ExpirationStatus;
  onDismiss?: () => void;
}

export const ExpirationWarning: React.FC<ExpirationWarningProps> = ({
  expiresAt,
  status,
  onDismiss,
}) => {
  return (
    <div className="p-4 border rounded-lg">
      {/* TODO: Implement expiration warning banner */}
      <p className="text-muted-foreground">Expiration Warning - To be implemented</p>
    </div>
  );
};

