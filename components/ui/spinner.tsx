/**
 * Spinner Component
 * 
 * A reusable loading spinner component with size variants.
 * Used throughout the application for consistent loading animations.
 * 
 * @example
 * ```tsx
 * // Small spinner for buttons
 * <Spinner size="sm" />
 * 
 * // Large spinner for page-level loading
 * <Spinner size="lg" />
 * 
 * // Custom styling
 * <Spinner size="md" className="my-4" />
 * ```
 */

'use client';

import React from 'react';

export interface SpinnerProps {
  /** Size of the spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Color variant (currently uses blue by default) */
  color?: string;
}

/**
 * Spinner component for loading states
 */
export function Spinner({ 
  size = 'md', 
  className = '',
}: SpinnerProps) {
  // Size mappings for width/height
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Border width mappings
  const borderWidthClasses = {
    xs: 'border-2',
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4',
    xl: 'border-4',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${borderWidthClasses[size]}
        rounded-full
        animate-spin
        border-gray-200 dark:border-gray-700
        border-t-blue-600 dark:border-t-blue-500
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Spinner;


