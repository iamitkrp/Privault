'use client';

import { useState, useEffect } from 'react';
import { generateSecurePassword } from '@/lib/crypto/crypto-utils';

interface PasswordFormData {
  name: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
}

interface PasswordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PasswordFormData) => void;
  title: string;
  initialData?: {
    name: string;
    username: string;
    password: string;
    website?: string;
    notes?: string;
  };
}

export default function PasswordFormModal({
  isOpen,
  onClose,
  onSave,
  title,
  initialData,
}: PasswordFormModalProps) {
  const [formData, setFormData] = useState<PasswordFormData>({
    name: '',
    username: '',
    password: '',
    website: '',
    notes: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        username: initialData.username || '',
        password: initialData.password || '',
        website: initialData.website || '',
        notes: initialData.notes || '',
      });
    } else {
      // Reset form for new entries
      setFormData({
        name: '',
        username: '',
        password: '',
        website: '',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onSave(formData);
  };

  const generatePassword = async () => {
    setIsGeneratingPassword(true);
    try {
      const newPassword = generateSecurePassword(16, true);
      setFormData(prev => ({ ...prev, password: newPassword }));
    } catch (error) {
      console.error('Failed to generate password:', error);
      alert('Failed to generate password');
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
                         <input
               type="text"
               id="name"
               value={formData.name}
               onChange={(e) => handleInputChange('name', e.target.value)}
               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
               placeholder="e.g., GitHub, Gmail, Facebook"
               required
             />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
                         <input
               type="url"
               id="website"
               value={formData.website}
               onChange={(e) => handleInputChange('website', e.target.value)}
               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
               placeholder="https://example.com"
             />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username/Email <span className="text-red-500">*</span>
            </label>
                         <input
               type="text"
               id="username"
               value={formData.username}
               onChange={(e) => handleInputChange('username', e.target.value)}
               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
               placeholder="username or email@example.com"
               required
             />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                             <input
                 type={showPassword ? 'text' : 'password'}
                 id="password"
                 value={formData.password}
                 onChange={(e) => handleInputChange('password', e.target.value)}
                 className="block w-full px-3 py-2 pr-20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                 placeholder="Enter password"
                 required
               />
              <div className="absolute inset-y-0 right-0 flex items-center">
                {/* Generate Password Button */}
                <button
                  type="button"
                  onClick={generatePassword}
                  disabled={isGeneratingPassword}
                  className="px-2 py-1 text-xs text-blue-600 hover:text-blue-500 focus:outline-none disabled:opacity-50"
                  title="Generate secure password"
                >
                  {isGeneratingPassword ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
                
                {/* Show/Hide Password Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-2 py-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
                         <textarea
               id="notes"
               value={formData.notes}
               onChange={(e) => handleInputChange('notes', e.target.value)}
               rows={3}
               className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
               placeholder="Additional notes or information..."
             />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {initialData ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 