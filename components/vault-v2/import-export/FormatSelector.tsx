/**
 * Format Selector Component - Stub
 */

import React from 'react';
import { ImportFormat, ExportFormat } from '@/lib/vault-v2/core/types';

export interface FormatSelectorProps {
  mode: 'import' | 'export';
  selected: ImportFormat | ExportFormat;
  onChange: (format: ImportFormat | ExportFormat) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  mode,
  selected,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      {/* TODO: Implement format selector */}
      <p className="text-muted-foreground">Format Selector - To be implemented</p>
    </div>
  );
};

