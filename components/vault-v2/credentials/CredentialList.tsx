/**
 * Credential List Component - Stub
 */

import React from 'react';
import { DecryptedCredential } from '@/lib/vault-v2/core/types';

export interface CredentialListProps {
  credentials: DecryptedCredential[];
  onSelect?: (credential: DecryptedCredential) => void;
  onEdit?: (credential: DecryptedCredential) => void;
  onDelete?: (credentialId: string, site: string) => void;
  loading?: boolean;
}

export const CredentialList: React.FC<CredentialListProps> = ({
  credentials,
  onSelect,
  onEdit,
  onDelete,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No credentials found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {credentials.map((credential) => (
        <div
          key={credential.credential_id}
          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div 
              className="flex-1 cursor-pointer" 
              onClick={() => onSelect?.(credential)}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {credential.decrypted_data.site}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {credential.decrypted_data.username}
              </p>
              {credential.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {credential.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(credential)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Edit"
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(credential.credential_id, credential.decrypted_data.site)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

