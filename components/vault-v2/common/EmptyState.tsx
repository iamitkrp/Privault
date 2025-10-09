/**
 * Empty State Component - Stub
 */

import React from 'react';

export interface EmptyStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

