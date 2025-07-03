'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { vaultService } from '@/services/vault.service';
import { useAuth } from '@/lib/auth/auth-context';
import PasswordFormModal from './password-form-modal';
import VaultStatsCard from './vault-stats-card';
import CategoryFilter from './category-filter';
import PasswordList from './password-list';
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
    if (items.length === 0) {
      return {
        totalPasswords: 0,
        weakPasswords: 0,
        reusedPasswords: 0,
        oldPasswords: 0,
        averagePasswordStrength: 0,
        categoryCounts: {},
        recentlyAdded: 0
      };
    }

    const totalPasswords = items.length;
    const weakPasswords = items.filter(item => (item.passwordStrength || 0) < 2).length;
    const oldPasswords = items.filter(item => {
      if (!item.lastPasswordChange) return true; // No change date = potentially old
      const changeDate = new Date(item.lastPasswordChange);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return changeDate < ninetyDaysAgo;
    }).length;

    // Count reused passwords (optimized)
    const passwordCounts = new Map<string, number>();
    let reusedPasswords = 0;
    
    for (const item of items) {
      const count = passwordCounts.get(item.password) || 0;
      passwordCounts.set(item.password, count + 1);
      if (count === 1) reusedPasswords += 2; // First reuse
      else if (count > 1) reusedPasswords += 1; // Additional reuse
    }

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

      // Set items without password strength calculations initially for faster loading
      const basicItems = (result.credentials || []).map(item => ({
        ...item,
        passwordStrength: item.passwordStrength ?? null, // Don't calculate yet
        lastPasswordChange: item.lastPasswordChange ?? item.updated_at,
        accessCount: item.accessCount ?? 0,
        isFavorite: item.isFavorite ?? false,
        tags: item.tags ?? [],
        category: item.category ?? 'OTHER'
      }));

      setItems(basicItems);
      setIsLoading(false);

      // Calculate password strengths asynchronously in batches to avoid blocking
      setTimeout(async () => {
        const batchSize = 10;
        const enhancedItems = [...basicItems];
        
        for (let i = 0; i < basicItems.length; i += batchSize) {
          const batch = basicItems.slice(i, i + batchSize);
          
          batch.forEach((item, index) => {
            if (item.passwordStrength === null) {
              enhancedItems[i + index] = {
                ...item,
                passwordStrength: calculatePasswordStrength(item.password).score
              };
            }
          });
          
          // Update state with this batch and yield control
          setItems([...enhancedItems]);
          
          // Small delay to keep UI responsive
          if (i + batchSize < basicItems.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      }, 100);

    } catch (err) {
      console.error('Failed to load vault items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load your passwords');
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
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl border-t-2 border-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-2xl border-t-2 border-blue-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-light text-gray-900 mb-2">Loading your vault...</h3>
          <p className="text-gray-600 font-light">Decrypting your passwords</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-lg border border-red-200/50 rounded-2xl p-8 max-w-2xl mx-auto">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Vault Error</h3>
            <p className="text-gray-600 font-light mb-4 leading-relaxed">{error}</p>
            <button
              onClick={loadVaultItems}
              className="px-4 py-2 bg-[#219EBC] text-white rounded-xl font-medium hover:bg-[#1a7a93] focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Vault Statistics */}
      <VaultStatsCard stats={vaultStats} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar with filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categoryCounts={vaultStats.categoryCounts}
          />

          {/* Quick Filters */}
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-white/20 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Filters</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  showFavoritesOnly
                    ? 'bg-[#219EBC] text-white border border-[#219EBC] font-medium'
                    : 'text-gray-700 hover:bg-white/70 border border-transparent'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">⭐</span>
                  <span>Favorites Only</span>
                </div>
                {showFavoritesOnly && (
                  <span className="bg-white/20 text-white px-2 py-1 text-xs rounded-full font-medium">
                    Active
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Import/Export */}
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-white/20 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Backup & Import</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full flex items-center px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-[#219EBC] hover:text-white transition-all duration-200 border border-transparent hover:border-[#219EBC]"
              >
                <span className="mr-3 text-lg">💾</span>
                <span>Export Vault</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="w-full flex items-center px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-[#219EBC] hover:text-white transition-all duration-200 border border-transparent hover:border-[#219EBC]"
              >
                <span className="mr-3 text-lg">📥</span>
                <span>Import Passwords</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header with search and controls */}
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-white/20 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-light text-gray-900">Your <span className="font-medium">Vault</span></h1>
                <p className="mt-2 text-sm text-gray-600 font-light">
                  {filteredAndSortedItems.length} of {items.length} passwords
                  {selectedCategory !== 'ALL' && ` in ${PASSWORD_CATEGORIES[selectedCategory as keyof typeof PASSWORD_CATEGORIES] || selectedCategory}`}
                  {showFavoritesOnly && ' (favorites)'}
                </p>
              </div>
              
              <div className="mt-6 sm:mt-0 flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white/80 backdrop-blur-lg rounded-xl p-1 border border-white/30">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-[#219EBC] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-[#219EBC] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    Grid
                  </button>
                </div>
                
                {/* Add button */}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#219EBC] hover:bg-[#1a7a93] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#219EBC] transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Password
                </button>
              </div>
            </div>

            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Search */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search passwords, usernames, notes, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-200/50 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white/80 backdrop-blur-lg transition-all duration-200"
                  aria-label="Search passwords"
                  aria-describedby="search-help"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                    aria-label="Clear search"
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div id="search-help" className="sr-only">
                Search through your saved passwords by site name, username, notes, or tags
              </div>

              {/* Sort Controls */}
              <div className="flex items-center space-x-3">
                <label htmlFor="sort-select" className="text-sm text-gray-700 whitespace-nowrap font-medium">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'category' | 'strength')}
                  className="px-4 py-2 border border-gray-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-lg text-gray-900 transition-all duration-200"
                  aria-label="Sort passwords by"
                >
                  <option value="name">Name</option>
                  <option value="date">Date Added</option>
                  <option value="category">Category</option>
                  <option value="strength">Password Strength</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-xl hover:bg-white/50 transition-all duration-200"
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
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-2xl border-t-2 border-blue-500 animate-spin"></div>
                  <div className="absolute inset-2 rounded-2xl border-t-2 border-blue-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-2">Loading your vault...</h3>
                <p className="text-gray-600 font-light">Decrypting your passwords</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white/60 backdrop-blur-lg border border-red-200/50 rounded-2xl p-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Vault Error</h3>
                  <p className="text-gray-600 font-light mb-4 leading-relaxed">{error}</p>
                  <button
                    onClick={loadVaultItems}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-3">
                {searchTerm || selectedCategory !== 'ALL' || showFavoritesOnly
                  ? 'No passwords found'
                  : 'No passwords yet'}
              </h3>
              <p className="text-gray-600 font-light mb-8 max-w-md mx-auto leading-relaxed">
                {searchTerm || selectedCategory !== 'ALL' || showFavoritesOnly
                  ? 'Try adjusting your search term or filters to find what you\'re looking for.'
                  : 'Get started by adding your first password to the vault. Your data will be encrypted and stored securely.'}
              </p>
              {!searchTerm && selectedCategory === 'ALL' && !showFavoritesOnly && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#219EBC] hover:bg-[#1a7a93] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#219EBC] transition-all duration-200 transform hover:scale-[1.02]"
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
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-lg border z-50 transition-all duration-300 transform translate-x-0 ${
          toast.type === 'success' 
            ? 'bg-green-500/90 text-white border-green-400/50' 
            : 'bg-red-500/90 text-white border-red-400/50'
        }`}>
          <div className="flex items-center">
            <div className="mr-3">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-4 text-white/80 hover:text-white transition-colors"
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