'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { vaultService } from '@/services/vault.service';
import { useAuth } from '@/lib/auth/auth-context';
import PasswordFormModal from './password-form-modal';
import VaultStatsCard from './vault-stats-card';
import CategoryFilter from './category-filter';
import PasswordList from './password-list';
import ThemeToggle from '@/components/ui/theme-toggle';
import ImportExportModal from './import-export-modal';
import type { Credential, VaultStats } from '@/types';
import { PASSWORD_CATEGORIES } from '@/types';
import { calculatePasswordStrength } from '@/lib/crypto/crypto-utils';
import type { ImportResult } from '@/services/import-export.service';

interface VaultDashboardProps {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function VaultDashboard({}: VaultDashboardProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category' | 'strength'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Credential | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Import/Export state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Calculate vault statistics
  const vaultStats = useMemo((): VaultStats => {
    const totalPasswords = items.length;
    const weakPasswords = items.filter(item => (item.passwordStrength || 0) < 2).length;
    const oldPasswords = items.filter(item => {
      if (!item.lastPasswordChange) return true; // No change date = potentially old
      const changeDate = new Date(item.lastPasswordChange);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return changeDate < ninetyDaysAgo;
    }).length;

    // Count reused passwords
    const passwordCounts = items.reduce((acc, item) => {
      acc[item.password] = (acc[item.password] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const reusedPasswords = Object.values(passwordCounts).filter(count => count > 1).reduce((sum, count) => sum + count, 0);

    // Average password strength
    const totalStrength = items.reduce((sum, item) => sum + (item.passwordStrength || 0), 0);
    const averagePasswordStrength = totalPasswords > 0 ? totalStrength / totalPasswords : 0;

    // Category counts
    const categoryCounts = items.reduce((acc, item) => {
      const category = item.category || 'OTHER';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recently added (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyAdded = items.filter(item => new Date(item.created_at) > sevenDaysAgo).length;

    return {
      totalPasswords,
      weakPasswords,
      reusedPasswords,
      oldPasswords,
      averagePasswordStrength,
      categoryCounts,
      recentlyAdded
    };
  }, [items]);

  const loadVaultItems = useCallback(async () => {
    try {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Load encrypted vault from backend
      const result = await vaultService.loadVault(user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load vault');
      }

      // Enhance items with password strength if not already calculated
      const enhancedItems = (result.credentials || []).map(item => ({
        ...item,
        passwordStrength: item.passwordStrength ?? calculatePasswordStrength(item.password).score,
        lastPasswordChange: item.lastPasswordChange ?? item.updated_at,
        accessCount: item.accessCount ?? 0,
        isFavorite: item.isFavorite ?? false,
        tags: item.tags ?? [],
        category: item.category ?? 'OTHER'
      }));

      setItems(enhancedItems);
    } catch (err) {
      console.error('Failed to load vault items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load your passwords');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load vault items
  useEffect(() => {
    loadVaultItems();
  }, [loadVaultItems]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.url && item.url.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(item => item.isFavorite);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (sortBy) {
        case 'name':
          aValue = a.site.toLowerCase();
          bValue = b.site.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        case 'category':
          aValue = a.category || 'OTHER';
          bValue = b.category || 'OTHER';
          break;
        case 'strength':
          aValue = a.passwordStrength || 0;
          bValue = b.passwordStrength || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, searchTerm, selectedCategory, showFavoritesOnly, sortBy, sortOrder]);

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ message: `${type} copied to clipboard`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setToast({ message: 'Failed to copy to clipboard', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Handle adding new password
  const handleAddPassword = async (data: {
    name: string;
    username: string;
    password: string;
    website?: string;
    notes?: string;
    category?: string;
    isFavorite?: boolean;
  }) => {
    try {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const newCredential = {
        site: data.name,
        username: data.username,
        password: data.password,
        url: data.website || '',
        notes: data.notes || '',
        category: data.category || 'OTHER',
        isFavorite: data.isFavorite || false,
      };

      const result = await vaultService.addCredential(user.id, newCredential);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add credential');
      }

      if (result.credential) {
        setItems(prev => [...prev, result.credential!]);
      }
      
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add password:', err);
      setError(err instanceof Error ? err.message : 'Failed to add password');
    }
  };

  // Handle updating password
  const handleUpdatePassword = async (data: {
    name: string;
    username: string;
    password: string;
    website?: string;
    notes?: string;
    category?: string;
    isFavorite?: boolean;
  }) => {
    try {
      if (!selectedItem || !user) {
        setError('Invalid operation');
        return;
      }

      const updates = {
        site: data.name,
        username: data.username,
        password: data.password,
        url: data.website || '',
        notes: data.notes || '',
        category: data.category || 'OTHER',
        isFavorite: data.isFavorite || false,
      };

      // Add to password history if password changed
      if (data.password !== selectedItem.password) {
        await vaultService.addPasswordHistory(user.id, selectedItem.id, selectedItem.password);
      }

      const result = await vaultService.updateCredential(user.id, selectedItem.id, updates);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update credential');
      }

      if (result.credential) {
        setItems(prev => prev.map(item => 
          item.id === selectedItem.id ? result.credential! : item
        ));
      }
      
      setShowEditForm(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Failed to update password:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
    }
  };

  // Handle deleting password
  const handleDeletePassword = async (credentialId: string) => {
    try {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this password? This action cannot be undone.')) {
        return;
      }

      const result = await vaultService.deleteCredential(user.id, credentialId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete credential');
      }

      setItems(prev => prev.filter(item => item.id !== credentialId));
    } catch (err) {
      console.error('Failed to delete password:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete password');
    }
  };

  // Toggle favorite status
  async function handleToggleFavorite(credentialId: string) {
    try {
      if (!user) return;

      const item = items.find(i => i.id === credentialId);
      if (!item) return;

      const result = await vaultService.updateCredential(user.id, credentialId, {
        isFavorite: !item.isFavorite
      });
      
      if (result.success && result.credential) {
        setItems(prev => prev.map(i => 
          i.id === credentialId ? result.credential! : i
        ));
        setToast({ 
          message: `${result.credential.isFavorite ? 'Added to' : 'Removed from'} favorites`, 
          type: 'success' 
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      setToast({ message: 'Failed to update favorite status', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  }

  // Handle import completion
  const handleImportComplete = (result: ImportResult) => {
    if (result.success) {
      setToast({ 
        message: `Successfully imported ${result.imported} passwords`, 
        type: 'success' 
      });
      setTimeout(() => setToast(null), 5000);
      // Reload vault items to show imported passwords
      loadVaultItems();
    } else {
      setToast({ 
        message: `Import failed: ${result.errors[0] || 'Unknown error'}`, 
        type: 'error' 
      });
      setTimeout(() => setToast(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-md p-6 max-w-2xl mx-auto">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={loadVaultItems}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Vault Statistics */}
      <VaultStatsCard stats={vaultStats} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with filters */}
        <div className="lg:col-span-1 space-y-4">
          {/* Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categoryCounts={vaultStats.categoryCounts}
          />

          {/* Quick Filters */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Filters</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                  showFavoritesOnly
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">⭐</span>
                  <span>Favorites Only</span>
                </div>
                {showFavoritesOnly && (
                  <span className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 text-xs rounded-full">
                    Active
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Import/Export */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Backup & Import</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="mr-2">💾</span>
                <span>Export Vault</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="mr-2">📥</span>
                <span>Import Passwords</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header with search and controls */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Vault</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {filteredAndSortedItems.length} of {items.length} passwords
                  {selectedCategory !== 'ALL' && ` in ${PASSWORD_CATEGORIES[selectedCategory as keyof typeof PASSWORD_CATEGORIES] || selectedCategory}`}
                  {showFavoritesOnly && ' (favorites)'}
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Grid
                  </button>
                </div>
                
                {/* Add button */}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Password
                </button>
              </div>
            </div>

            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search passwords, usernames, notes, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                  aria-label="Search passwords"
                  aria-describedby="search-help"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                    aria-label="Clear search"
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div id="search-help" className="sr-only">
                Search through your saved passwords by site name, username, notes, or tags
              </div>

              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <label htmlFor="sort-select" className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'category' | 'strength')}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  aria-label="Sort passwords by"
                >
                  <option value="name">Name</option>
                  <option value="date">Date Added</option>
                  <option value="category">Category</option>
                  <option value="strength">Password Strength</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                  aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                  title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    {sortOrder === 'asc' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading your vault...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-300 rounded-md p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <button
                    onClick={loadVaultItems}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedCategory !== 'ALL' || showFavoritesOnly
                  ? 'No passwords found'
                  : 'No passwords yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'ALL' || showFavoritesOnly
                  ? 'Try adjusting your search term or filters.'
                  : 'Get started by adding your first password to the vault.'}
              </p>
              {!searchTerm && selectedCategory === 'ALL' && !showFavoritesOnly && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Password
                </button>
              )}
            </div>
          ) : (
            <PasswordList
              items={filteredAndSortedItems}
              viewMode={viewMode}
              onCopyToClipboard={copyToClipboard}
              onEditItem={(item) => {
                setSelectedItem(item);
                setShowEditForm(true);
              }}
              onDeleteItem={handleDeletePassword}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddForm && (
        <PasswordFormModal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSave={handleAddPassword}
          title="Add New Password"
        />
      )}

      {showEditForm && selectedItem && (
        <PasswordFormModal
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setSelectedItem(null);
          }}
          onSave={handleUpdatePassword}
          title="Edit Password"
          initialData={{
            name: selectedItem.site,
            username: selectedItem.username,
            password: selectedItem.password,
            website: selectedItem.url || '',
            notes: selectedItem.notes || '',
            category: selectedItem.category || 'OTHER',
            isFavorite: selectedItem.isFavorite || false,
          }}
        />
      )}

      {/* Import/Export Modals */}
      <ImportExportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
        mode="import"
      />

      <ImportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        mode="export"
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 