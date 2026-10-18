'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface SearchAndFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: FilterGroup[];
  totalResults?: number;
  onReset?: () => void;
  className?: string;
}

export function SearchAndFilterBar({
  searchValue,
  onSearchChange,
  placeholder = 'Search records, zones, or incident IDs...',
  filters = [],
  totalResults,
  onReset,
  className = '',
}: SearchAndFilterBarProps) {
  const hasActiveFilters = searchValue.length > 0 || filters.some((f) => f.value !== 'all');

  return (
    <div className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#E8E6E1] shadow-subtle w-full min-w-0 max-w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#92979D]" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-sm bg-[#F7F6F2] border border-[#E8E6E1] rounded-lg text-[#252A30] placeholder:text-[#92979D] focus:outline-none focus:ring-1 focus:ring-[#536A82] focus:bg-white transition-all"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#92979D] hover:text-[#252A30]"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <div key={filter.id} className="relative">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-[#F7F6F2] border border-[#E8E6E1] rounded-lg text-[#252A30] hover:bg-[#EDF1F5] focus:outline-none focus:ring-1 focus:ring-[#536A82] cursor-pointer transition-colors"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {filter.label}: {opt.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#92979D] pointer-events-none" />
          </div>
        ))}

        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="px-2.5 py-2 text-xs font-medium text-[#757B81] hover:text-[#B74349] hover:bg-[#FAE8E7] rounded-lg transition-colors border border-transparent hover:border-[#B74349]/30"
          >
            Reset Filters
          </button>
        )}

        {totalResults !== undefined && (
          <span className="text-xs text-[#536A82] font-medium px-2 py-1 bg-[#EDF1F5] rounded-md tabular-nums ml-auto md:ml-0">
            {totalResults} {totalResults === 1 ? 'match' : 'matches'}
          </span>
        )}
      </div>
    </div>
  );
}
