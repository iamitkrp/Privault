/**
 * Loading State Component
 * 
 * Displays loading indicators with optional skeleton screens.
 */

'use client';

import React from 'react';
import { Spinner } from '@/components/ui';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'dots';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  message = 'Loading...',
  size = 'md',
}) => {
  if (type === 'skeleton') {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Spinner size={size} />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
};

