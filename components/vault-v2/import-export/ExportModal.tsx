/**
 * Export Modal Component - Stub
 */

import React from 'react';
import { ExportFormat } from '@/lib/vault-v2/core/types';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => Promise<void>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* TODO: Implement export modal */}
      <div className="bg-background p-6 rounded-lg">
        <p className="text-muted-foreground">Export Modal - To be implemented</p>
      </div>
    </div>
  );
};

