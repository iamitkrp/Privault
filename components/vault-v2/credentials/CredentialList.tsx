/**
 * Credential List Component - Stub
 */

import React from 'react';
import { DecryptedCredential } from '@/lib/vault-v2/core/types';

export interface CredentialListProps {
  credentials: DecryptedCredential[];
  onSelect?: (credential: DecryptedCredential) => void;
  onEdit?: (credential: DecryptedCredential) => void;
  onDelete?: (credentialId: string) => void;
  loading?: boolean;
}

export const CredentialList: React.FC<CredentialListProps> = ({
  credentials,
  onSelect,
  onEdit,
  onDelete,
  loading = false,
}) => {
  return (
    <div className="space-y-2">
      {/* TODO: Implement list view */}
      <p className="text-muted-foreground">Credential List - To be implemented</p>
    </div>
  );
};

