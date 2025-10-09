/**
 * Import Modal Component - Stub
 */

import React from 'react';
import { ImportFormat } from '@/lib/vault-v2/core/types';

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, format: ImportFormat) => Promise<void>;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* TODO: Implement import modal */}
      <div className="bg-background p-6 rounded-lg">
        <p className="text-muted-foreground">Import Modal - To be implemented</p>
      </div>
    </div>
  );
};

