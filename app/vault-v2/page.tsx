/**
 * Vault V2 - Main Page
 * 
 * Fully functional vault system with unlock flow, stats, search, and CRUD operations.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useVaultSession } from '@/lib/vault-v2/hooks/use-vault-session';
import { useCredentials } from '@/lib/vault-v2/hooks/use-credentials';
import { passphraseManager } from '@/lib/crypto/passphrase-manager';
import { VaultService } from '@/lib/vault-v2/services/vault.service';
import { createVaultRepository } from '@/lib/vault-v2/storage/repository';
import { createEncryptionService } from '@/lib/vault-v2/encryption/encryption.service';
import { createHistoryService } from '@/lib/vault-v2/services/history.service';
import { createExpirationService } from '@/lib/vault-v2/services/expiration.service';
import { 
  VaultStats,
  CredentialList,
  SearchBar,
  LoadingState,
  ErrorState,
  CredentialForm,
  EmptyState,
  ConfirmDialog
} from '@/components/vault-v2';
import { CreateCredentialDTO, UpdateCredentialDTO, DecryptedCredential } from '@/lib/vault-v2/core/types';
import zxcvbn from 'zxcvbn';

export default function VaultV2Page() {
  const { user } = useAuth();
  const { isLocked, isUnlocking, unlock, lock } = useVaultSession();
  
  // Unlock form state
  const [passphrase, setPassphrase] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  
  // Credential form state
  const [showCredentialForm, setShowCredentialForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState<DecryptedCredential | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; site: string } | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Get master key and initialize VaultService
  const masterKey = passphraseManager.getDerivedKey();
  
  const vaultService = useMemo(() => {
    if (!user?.id || !masterKey) return null;

    const repository = createVaultRepository();
    const encryption = createEncryptionService();
    const history = createHistoryService(user.id, masterKey);
    const expiration = createExpirationService(user.id);
    const passwordStrength = { analyze: (pwd: string) => zxcvbn(pwd) };

    return new VaultService(
      repository,
      encryption,
      history,
      expiration,
      passwordStrength,
      user.id,
      masterKey
    );
  }, [user?.id, masterKey]);

  // Use credentials hook
  const {
    credentials,
    decryptedCredentials,
    stats,
    loading,
    error,
    searchResults,
    loadCredentials,
    loadStats,
    createCredential,
    updateCredential,
    deleteCredential,
    searchCredentials,
    clearSearch,
  } = useCredentials(vaultService);

  // Load credentials and stats when vault unlocks
  useEffect(() => {
    if (!isLocked && vaultService) {
      loadCredentials();
      loadStats();
    }
  }, [isLocked, vaultService, loadCredentials, loadStats]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      searchCredentials(debouncedQuery);
    } else {
      clearSearch();
    }
  }, [debouncedQuery, searchCredentials, clearSearch]);

  // Handle unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);

    if (!passphrase) {
      setUnlockError('Please enter your passphrase');
      return;
    }

    // TODO: Get salt and test data from user's profile/vault setup
    // For now, we'll use a placeholder - in production, this should come from the database
    const salt = user?.id || 'user-salt';
    
    const success = await unlock(passphrase, salt);
    
    if (!success) {
      setUnlockError('Invalid passphrase. Please try again.');
      setPassphrase('');
    } else {
      setPassphrase('');
    }
  };

  // Handle credential creation
  const handleCreateCredential = async (data: CreateCredentialDTO) => {
    const result = await createCredential(data);
    if (result) {
      setShowCredentialForm(false);
    }
  };

  // Handle credential update
  const handleUpdateCredential = async (data: UpdateCredentialDTO) => {
    if (!editingCredential) return;
    
    const result = await updateCredential(editingCredential.credential_id, data);
    if (result) {
      setEditingCredential(null);
      setShowCredentialForm(false);
    }
  };

  // Handle credential delete
  const handleDeleteCredential = async () => {
    if (!deleteConfirm) return;
    
    const success = await deleteCredential(deleteConfirm.id);
    if (success) {
      setDeleteConfirm(null);
    }
  };

  // Handle credential edit
  const handleEditCredential = (credential: DecryptedCredential) => {
    setEditingCredential(credential);
    setShowCredentialForm(true);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowCredentialForm(false);
    setEditingCredential(null);
  };

  // Locked state - show unlock screen
  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Vault Locked
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your master password to unlock your vault
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label htmlFor="passphrase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Master Password
              </label>
              <input
                id="passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your master password"
                disabled={isUnlocking}
              />
            </div>

            {unlockError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{unlockError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUnlocking}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUnlocking ? 'Unlocking...' : 'Unlock Vault'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="container mx-auto">
          <ErrorState
            title="Vault Error"
            message={error}
            onRetry={() => {
              loadCredentials();
              loadStats();
            }}
          />
        </div>
      </div>
    );
  }

  // Display credentials
  // For search results, use searchResults. For full list, use decrypted credentials from cache
  const displayedCredentials = searchResults || Array.from(decryptedCredentials.values());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Vault
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your passwords securely with end-to-end encryption
            </p>
          </div>
          <button
            onClick={lock}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            🔒 Lock Vault
          </button>
        </div>

        {/* Vault Stats */}
        {stats && (
          <div className="mb-8">
            <VaultStats stats={stats} loading={loading} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/vault-v2/import"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
          >
            <div className="text-2xl mb-2">📥</div>
            <div className="font-semibold text-gray-900 dark:text-white">Import</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Import from other password managers</div>
          </Link>
          
          <Link 
            href="/vault-v2/export"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
          >
            <div className="text-2xl mb-2">📤</div>
            <div className="font-semibold text-gray-900 dark:text-white">Export</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Export your vault securely</div>
          </Link>
          
          <Link 
            href="/vault-v2/settings"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-semibold text-gray-900 dark:text-white">Settings</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Configure vault preferences</div>
          </Link>
        </div>

        {/* Search and Add Button */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={searchCredentials}
                loading={loading}
                placeholder="Search credentials..."
              />
            </div>
            <button
              onClick={() => setShowCredentialForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Credential
            </button>
          </div>
        </div>

        {/* Credentials List */}
        {loading && !credentials.length ? (
          <LoadingState message="Loading credentials..." />
        ) : credentials.length === 0 ? (
          <EmptyState
            title="No credentials yet"
            message="Get started by adding your first credential"
            action={{
              label: 'Add Your First Credential',
              onClick: () => setShowCredentialForm(true),
            }}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchResults 
                  ? `Found ${displayedCredentials.length} result${displayedCredentials.length !== 1 ? 's' : ''} for "${searchQuery}"`
                  : `${displayedCredentials.length} credential${displayedCredentials.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <CredentialList
              credentials={displayedCredentials}
              onEdit={handleEditCredential}
              onDelete={(id, site) => setDeleteConfirm({ id, site })}
              loading={loading}
            />
          </div>
        )}

        {/* Credential Form Modal */}
        {showCredentialForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {editingCredential ? 'Edit Credential' : 'Add Credential'}
                </h2>
                <CredentialForm
                  mode={editingCredential ? 'edit' : 'create'}
                  credential={editingCredential || undefined}
                  onSubmit={editingCredential ? handleUpdateCredential : handleCreateCredential}
                  onCancel={handleFormCancel}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <ConfirmDialog
            title="Delete Credential"
            message={`Are you sure you want to delete "${deleteConfirm.site}"? This action cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={handleDeleteCredential}
            onCancel={() => setDeleteConfirm(null)}
            variant="danger"
          />
        )}
      </div>
    </div>
  );
}
