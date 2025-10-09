/**
 * Search Bar Component - Stub
 */

import React from 'react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search credentials...',
  loading = false,
}) => {
  return (
    <div className="relative">
      {/* TODO: Implement search bar with autocomplete */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>
  );
};

