/**
 * Sort Controls Component - Stub
 */

import React from 'react';
import { SortField, SortOrder } from '@/lib/vault-v2/core/types';

export interface SortControlsProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

export const SortControls: React.FC<SortControlsProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* TODO: Implement sort controls */}
      <p className="text-muted-foreground">Sort Controls - To be implemented</p>
    </div>
  );
};

