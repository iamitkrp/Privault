/**
 * Credential Grid Component - Stub
 */

import React from 'react';
import { DecryptedCredential } from '@/lib/vault-v2/core/types';

export interface CredentialGridProps {
  credentials: DecryptedCredential[];
  onSelect?: (credential: DecryptedCredential) => void;
  onEdit?: (credential: DecryptedCredential) => void;
  onDelete?: (credentialId: string) => void;
  loading?: boolean;
}

export const CredentialGrid: React.FC<CredentialGridProps> = ({
  credentials,
  onSelect,
  onEdit,
  onDelete,
  loading = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* TODO: Implement grid view */}
      <p className="text-muted-foreground">Credential Grid - To be implemented</p>
    </div>
  );
};

