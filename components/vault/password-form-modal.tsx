'use client';

import { useState, useEffect } from 'react';
import { generateSecurePassword } from '@/lib/crypto/crypto-utils';
import { PASSWORD_CATEGORIES } from '@/types';

interface PasswordFormData {
  name: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
  category?: string;
  isFavorite?: boolean;
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
    category?: string;
    isFavorite?: boolean;
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
    category: 'OTHER',
    isFavorite: false,
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
        category: initialData.category || 'OTHER',
        isFavorite: initialData.isFavorite || false,
      });
    } else {
      // Reset form for new entries
      setFormData({
        name: '',
        username: '',
        password: '',
        website: '',
        notes: '',
        category: 'OTHER',
        isFavorite: false,
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

  const handleInputChange = (field: keyof PasswordFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-md border border-white/50 shadow-2xl rounded-3xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-neuemontreal-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-neuemontreal-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:border-[#219EBC] text-gray-900 bg-white/70 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400"
              placeholder="e.g., GitHub, Gmail, Facebook"
              required
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-neuemontreal-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:border-[#219EBC] text-gray-900 bg-white/70 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400"
              placeholder="https://example.com"
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-neuemontreal-medium text-gray-700 mb-2">
              Username/Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:border-[#219EBC] text-gray-900 bg-white/70 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400"
              placeholder="username or email@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-neuemontreal-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="block w-full px-4 py-3 pr-24 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:border-[#219EBC] text-gray-900 bg-white/70 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400"
                placeholder="Enter password"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                {/* Generate Password Button */}
                <button
                  type="button"
                  onClick={generatePassword}
                  disabled={isGeneratingPassword}
                  className="px-3 py-1 text-xs text-[#219EBC] hover:text-[#1a7a94] focus:outline-none focus:bg-gray-100/50 rounded-xl transition-colors disabled:opacity-50 z-20"
                  title="Generate secure password"
                >
                  {isGeneratingPassword ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#219EBC]"></div>
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
                  className="px-3 py-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:bg-gray-100/50 rounded-xl transition-colors z-20"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-neuemontreal-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:border-[#219EBC] text-gray-900 bg-white/70 backdrop-blur-sm transition-all duration-200"
            >
              {Object.entries(PASSWORD_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-neuemontreal-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="block w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:border-[#219EBC] text-gray-900 bg-white/70 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400 resize-none"
              placeholder="Additional notes or information..."
            />
          </div>

          {/* Favorite */}
          <div className="flex items-center">
            <input
              id="isFavorite"
              type="checkbox"
              checked={formData.isFavorite}
              onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
              className="h-4 w-4 text-[#219EBC] focus:ring-[#219EBC] border-gray-300 rounded transition-colors"
            />
            <label htmlFor="isFavorite" className="ml-3 block text-sm font-neuemontreal-medium text-gray-700">
              Add to favorites
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-neuemontreal-medium text-gray-700 bg-gray-100/80 backdrop-blur-sm border border-gray-200 rounded-2xl hover:bg-gray-200/80 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-neuemontreal-medium text-white bg-[#219EBC] border border-transparent rounded-2xl hover:bg-[#1a7a94] focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:ring-offset-2 transition-all duration-200 shadow-lg"
            >
              {initialData ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 