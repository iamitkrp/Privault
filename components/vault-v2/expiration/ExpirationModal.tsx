/**
 * Expiration Modal Component - Stub
 */

import React from 'react';
import { ExpirationConfig } from '@/lib/vault-v2/core/types';

export interface ExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: ExpirationConfig;
  onSave: (config: ExpirationConfig) => void;
}

export const ExpirationModal: React.FC<ExpirationModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* TODO: Implement expiration configuration modal */}
      <div className="bg-background p-6 rounded-lg">
        <p className="text-muted-foreground">Expiration Modal - To be implemented</p>
      </div>
    </div>
  );
};

