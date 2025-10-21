/**
 * LoadingOverlay Component
 * 
 * A full-page loading overlay component with spinner and optional messages.
 * Used for page-level loading states throughout the application.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <LoadingOverlay />
 * 
 * // With message
 * <LoadingOverlay message="Loading your data..." />
 * 
 * // With message and submessage
 * <LoadingOverlay 
 *   message="Loading Your Space" 
 *   submessage="Preparing your secure dashboard..."
 *   size="xl"
 * />
 * ```
 */

'use client';

import React from 'react';
import { Spinner } from './spinner';

export interface LoadingOverlayProps {
  /** Main loading message */
  message?: string;
  /** Secondary loading message */
  submessage?: string;
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Full-page loading overlay component
 */
export function LoadingOverlay({ 
  message, 
  submessage, 
  size = 'lg' 
}: LoadingOverlayProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Spinner size={size} className="mx-auto" />
        
        {message && (
          <h3 className="mt-4 text-lg text-gray-900 dark:text-white">
            {message}
          </h3>
        )}
        
        {submessage && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {submessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default LoadingOverlay;


