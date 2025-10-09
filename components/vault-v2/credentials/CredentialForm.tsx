/**
 * Credential Form Component - Stub
 */

import React from 'react';
import { CreateCredentialDTO, UpdateCredentialDTO, DecryptedCredential } from '@/lib/vault-v2/core/types';

export interface CredentialFormProps {
  mode: 'create' | 'edit';
  credential?: DecryptedCredential;
  onSubmit: (data: CreateCredentialDTO | UpdateCredentialDTO) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const CredentialForm: React.FC<CredentialFormProps> = ({
  mode,
  credential,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  return (
    <div className="space-y-4">
      {/* TODO: Implement credential form */}
      <p className="text-muted-foreground">Credential Form - To be implemented</p>
    </div>
  );
};

