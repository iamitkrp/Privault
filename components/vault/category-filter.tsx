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
    <div className={`bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-white/20 ${className}`}>
      <div className="p-6 border-b border-white/20">
        <h3 className="text-lg font-medium text-gray-900">Categories</h3>
      </div>
      
      <div className="p-3">
        <nav role="navigation" aria-label="Password categories">
          {categories.map((category) => {
            const count = category.key === 'ALL' ? getTotalCount() : (categoryCounts[category.key] || 0);
            const isSelected = selectedCategory === category.key;
            
            return (
              <button
                key={category.key}
                onClick={() => onCategoryChange(category.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#219EBC] focus:ring-opacity-50 mb-2 ${
                  isSelected
                    ? 'bg-[#219EBC] text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 hover:bg-white/50 border border-transparent hover:border-gray-200/50'
                }`}
                aria-pressed={isSelected}
                aria-label={`${category.label} category, ${count} passwords`}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg" aria-hidden="true">{category.icon}</span>
                  <span className="font-medium">{category.label}</span>
                </div>
                {count > 0 && (
                  <span 
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200/80 text-gray-600'
                    }`}
                    aria-hidden="true"
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 