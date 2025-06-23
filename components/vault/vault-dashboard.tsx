'use client';

import { useState, useEffect } from 'react';
// import { CryptoService } from '@/services/crypto.service';
// import { supabase } from '@/lib/supabase/client';
import PasswordFormModal from './password-form-modal';

// Types
interface VaultItem {
  id: string;
  name: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface VaultDashboardProps {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function VaultDashboard({}: VaultDashboardProps) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Load vault items
  useEffect(() => {
    loadVaultItems();
  }, []);

  const loadVaultItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, we'll create some demo data since we haven't built the database integration yet
      // In a real implementation, this would fetch encrypted data from Supabase and decrypt it
      const demoItems: VaultItem[] = [
        {
          id: '1',
          name: 'GitHub',
          username: 'john.doe@example.com',
          password: 'SecurePass123!',
          website: 'https://github.com',
          notes: 'My main GitHub account',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Gmail',
          username: 'john.doe@gmail.com',
          password: 'MyGmail2024!',
          website: 'https://gmail.com',
          notes: 'Personal email account',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      setItems(demoItems);
    } catch (err) {
      console.error('Failed to load vault items:', err);
      setError('Failed to load your passwords');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.website && item.website.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Show toast notification
      console.log(`${type} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Handle adding new password (demo)
  const handleAddPassword = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const newItem = {
      id: Date.now().toString(),
      name: data.name,
      username: data.username,
      password: data.password,
      website: data.website,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
  };

  // Handle updating password (demo)
  const handleUpdatePassword = (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!selectedItem) return;
    
    setItems(prev => prev.map(item => 
      item.id === selectedItem.id 
        ? {
            ...item,
            name: data.name,
            username: data.username,
            password: data.password,
            website: data.website,
            notes: data.notes,
            updated_at: new Date().toISOString(),
          }
        : item
    ));
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
    <div className="max-w-6xl mx-auto">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Vault</h1>
          <p className="mt-1 text-sm text-gray-600">
            {items.length} {items.length === 1 ? 'password' : 'passwords'} stored securely
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>
          
          {/* Add button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Password
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No passwords yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first password to the vault.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Password
          </button>
        </div>
      )}

      {/* Search results empty state */}
      {filteredItems.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No passwords found</h3>
          <p className="text-gray-600">Try adjusting your search term or add a new password.</p>
        </div>
      )}

      {/* Password list */}
      {filteredItems.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <li key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Favicon placeholder */}
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {item.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Item details */}
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                        {item.website && (
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{item.username}</p>
                      {item.notes && (
                        <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Copy username */}
                    <button
                      onClick={() => copyToClipboard(item.username, 'Username')}
                      className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      title="Copy username"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>

                    {/* Copy password */}
                    <button
                      onClick={() => copyToClipboard(item.password, 'Password')}
                      className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      title="Copy password"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowEditForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Phase 5 Development Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          🚧 Phase 5: Core Vault Functionality - IN PROGRESS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-2">✅ Completed:</p>
            <ul className="space-y-1">
              <li>✅ Vault unlock interface</li>
              <li>✅ Dashboard layout</li>
              <li>✅ Search functionality</li>
              <li>✅ Demo data display</li>
            </ul>
          </div>
          
          <div>
            <p className="font-medium mb-2">🚧 Next Steps:</p>
            <ul className="space-y-1">
              <li>🔨 Add/edit password forms</li>
              <li>🔨 Database integration</li>
              <li>🔨 Password generator</li>
              <li>🔨 Copy notifications</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 text-sm text-blue-700">
          <strong>Current Status:</strong> Demo interface working with mock data. Ready to integrate with encrypted database storage.
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <PasswordFormModal
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSave={(data) => {
            handleAddPassword(data);
            setShowAddForm(false);
          }}
          title="Add New Password"
        />
      )}

      {/* Edit Form Modal */}
      {showEditForm && selectedItem && (
        <PasswordFormModal
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setSelectedItem(null);
          }}
          onSave={(data) => {
            handleUpdatePassword(data);
            setShowEditForm(false);
            setSelectedItem(null);
          }}
          title="Edit Password"
          initialData={selectedItem}
        />
      )}
    </div>
  );
} 