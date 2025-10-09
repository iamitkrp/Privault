/**
 * Credential Card Component
 * 
 * Displays a credential in card format with all metadata.
 * Features: password reveal, copy actions, expiration indicators, favorite toggle.
 */

'use client';

import React, { useState } from 'react';
import { DecryptedCredential } from '@/lib/vault-v2/core/types';
import { ExpirationBadge } from '../expiration/ExpirationBadge';

interface CredentialCardProps {
  credential: DecryptedCredential;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onCopyPassword?: (password: string) => void;
  onCopyUsername?: (username: string) => void;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopyPassword,
  onCopyUsername,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleCopyPassword = async () => {
    if (onCopyPassword) {
      onCopyPassword(credential.decrypted_data.password);
    } else {
      await navigator.clipboard.writeText(credential.decrypted_data.password);
    }
  };

  const handleCopyUsername = async () => {
    if (onCopyUsername) {
      onCopyUsername(credential.decrypted_data.username);
    } else {
      await navigator.clipboard.writeText(credential.decrypted_data.username);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {credential.decrypted_data.site}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {credential.decrypted_data.username}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {credential.is_favorite && (
            <span className="text-yellow-500">★</span>
          )}
          <ExpirationBadge status={credential.expiration_status} />
        </div>
      </div>

      {/* Password */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
          Password
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 font-mono text-sm bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded">
            {showPassword ? credential.decrypted_data.password : '••••••••'}
          </div>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
          <button
            onClick={handleCopyPassword}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="Copy password"
          >
            📋
          </button>
        </div>
      </div>

      {/* URL */}
      {credential.decrypted_data.url && (
        <div className="mb-3">
          <a
            href={credential.decrypted_data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {credential.decrypted_data.url}
          </a>
        </div>
      )}

      {/* Tags */}
      {credential.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {credential.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(credential.credential_id)}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(credential.credential_id)}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Delete
            </button>
          )}
        </div>
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(credential.credential_id)}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            aria-label={credential.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {credential.is_favorite ? '★ Favorite' : '☆ Favorite'}
          </button>
        )}
      </div>
    </div>
  );
};

