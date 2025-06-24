'use client';

import type { Credential } from '@/types';
import { PASSWORD_CATEGORIES } from '@/types';

interface PasswordListProps {
  items: Credential[];
  viewMode: 'list' | 'grid';
  onCopyToClipboard: (text: string, type: string) => void;
  onEditItem: (item: Credential) => void;
  onDeleteItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function PasswordList({
  items,
  viewMode,
  onCopyToClipboard,
  onEditItem,
  onDeleteItem,
  onToggleFavorite,
}: PasswordListProps) {
  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthText = (strength: number) => {
    switch (strength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return 'Unknown';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'SOCIAL': return '🌐';
      case 'WORK': return '💼';
      case 'SHOPPING': return '🛒';
      case 'ENTERTAINMENT': return '🎬';
      case 'UTILITIES': return '⚡';
      case 'DEVELOPMENT': return '💻';
      case 'PERSONAL': return '👤';
      case 'OTHER': return '📝';
      default: return '📂';
    }
  };

  if (viewMode === 'grid') {
    return (
      <div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        role="grid"
        aria-label="Password vault grid view"
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            role="gridcell"
            aria-labelledby={`password-${item.id}-title`}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium text-sm">
                      {item.site.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate" id={`password-${item.id}-title`}>
                      {item.site}
                    </h4>
                    <div className="flex items-center mt-1">
                      <span className="text-sm mr-2" aria-hidden="true">{getCategoryIcon(item.category)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {PASSWORD_CATEGORIES[item.category as keyof typeof PASSWORD_CATEGORIES] || item.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Favorite Button */}
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className={`p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                    item.isFavorite 
                      ? 'text-yellow-500 hover:text-yellow-600' 
                      : 'text-gray-300 hover:text-yellow-500'
                  }`}
                  aria-label={item.isFavorite ? `Remove ${item.site} from favorites` : `Add ${item.site} to favorites`}
                  title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="mb-4">
                <div className="mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 block">Username</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block">{item.username}</span>
                </div>
                
                {item.url && (
                  <div className="mt-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate flex items-center"
                      aria-label={`Visit ${item.site} website`}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Visit
                    </a>
                  </div>
                )}

                {/* Password Strength */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Password Strength</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {getStrengthText(item.passwordStrength || 0)}
                    </span>
                  </div>
                  <div 
                    className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1"
                    role="progressbar" 
                    aria-valuenow={item.passwordStrength || 0} 
                    aria-valuemin={0} 
                    aria-valuemax={4}
                    aria-label={`Password strength: ${getStrengthText(item.passwordStrength || 0)}`}
                  >
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${getStrengthColor(item.passwordStrength || 0)}`}
                      style={{ width: `${((item.passwordStrength || 0) / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  {/* Copy username */}
                  <button
                    onClick={() => onCopyToClipboard(item.username, 'Username')}
                    className="p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                    aria-label={`Copy username for ${item.site}`}
                    title="Copy username"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>

                  {/* Copy password */}
                  <button
                    onClick={() => onCopyToClipboard(item.password, 'Password')}
                    className="p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                    aria-label={`Copy password for ${item.site}`}
                    title="Copy password"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  {/* Edit */}
                  <button
                    onClick={() => onEditItem(item)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                    aria-label={`Edit ${item.site} password`}
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded"
                    aria-label={`Delete ${item.site} password`}
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul 
        className="divide-y divide-gray-200 dark:divide-gray-700"
        role="list"
        aria-label="Password vault list view"
      >
        {items.map((item) => (
          <li 
            key={item.id} 
            className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
            role="listitem"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {item.site.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* Content */}
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate" id={`password-${item.id}-title`}>
                      {item.site}
                    </h4>
                    {item.isFavorite && (
                      <svg className="w-4 h-4 text-yellow-500 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.username}</p>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm mr-2">{getCategoryIcon(item.category)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {PASSWORD_CATEGORIES[item.category as keyof typeof PASSWORD_CATEGORIES] || item.category}
                    </span>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Strength:</span>
                    <div className="flex items-center space-x-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < (item.passwordStrength || 0) 
                              ? getStrengthColor(item.passwordStrength || 0)
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {getStrengthText(item.passwordStrength || 0)}
                      </span>
                    </div>
                  </div>
                  
                  {item.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{item.notes}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {/* Favorite Toggle */}
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className={`p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    item.isFavorite 
                      ? 'text-yellow-500 hover:text-yellow-600' 
                      : 'text-gray-300 hover:text-yellow-500'
                  }`}
                  title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>

                {/* Copy username */}
                <button
                  onClick={() => onCopyToClipboard(item.username, 'Username')}
                  className="p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                  aria-label={`Copy username for ${item.site}`}
                  title="Copy username"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {/* Copy password */}
                <button
                  onClick={() => onCopyToClipboard(item.password, 'Password')}
                  className="p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                  aria-label={`Copy password for ${item.site}`}
                  title="Copy password"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                {/* Edit */}
                <button
                  onClick={() => onEditItem(item)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                  aria-label={`Edit ${item.site} password`}
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded"
                  aria-label={`Delete ${item.site} password`}
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 