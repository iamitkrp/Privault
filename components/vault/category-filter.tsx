'use client';

import { PASSWORD_CATEGORIES } from '@/types';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts: Record<string, number>;
  className?: string;
}

export default function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  categoryCounts,
  className = '' 
}: CategoryFilterProps) {
  const categories = [
    { key: 'ALL', label: 'All Categories', icon: '📂' },
    ...Object.entries(PASSWORD_CATEGORIES).map(([key, label]) => ({
      key,
      label,
      icon: getCategoryIcon(key)
    }))
  ];

  function getCategoryIcon(category: string): string {
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
  }

  const getTotalCount = () => {
    return Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
      </div>
      
      <div className="p-2">
        {categories.map((category) => {
          const count = category.key === 'ALL' ? getTotalCount() : (categoryCounts[category.key] || 0);
          const isSelected = selectedCategory === category.key;
          
          return (
            <button
              key={category.key}
              onClick={() => onCategoryChange(category.key)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                isSelected
                  ? 'bg-blue-100 text-blue-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3 text-lg">{category.icon}</span>
                <span>{category.label}</span>
              </div>
              {count > 0 && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isSelected
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 