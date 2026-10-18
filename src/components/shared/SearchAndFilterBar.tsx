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
    <div className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#E4E8EC] shadow-subtle w-full min-w-0 max-w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B959E]" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-sm bg-[#F7F8FA] border border-[#E4E8EC] rounded-[10px] text-[#18232D] placeholder:text-[#8B959E] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:border-[#375A6B] focus:bg-white transition-colors"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B959E] hover:text-[#18232D]"
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
              className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-[#F7F8FA] border border-[#E4E8EC] rounded-[10px] text-[#18232D] hover:bg-[#EAF0F4] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:border-[#375A6B] cursor-pointer transition-colors"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {filter.label}: {opt.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8B959E] pointer-events-none" />
          </div>
        ))}

        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="px-2.5 py-2 text-xs font-medium text-[#6B7782] hover:text-[#BC414A] hover:bg-[#FBECEE] rounded-[10px] transition-colors border border-transparent hover:border-[#BC414A]/25"
          >
            Reset Filters
          </button>
        )}

        {totalResults !== undefined && (
          <span className="text-xs text-[#375A6B] font-medium px-2.5 py-1 bg-[#EAF0F4] rounded-[6px] tabular-nums ml-auto md:ml-0">
            {totalResults} {totalResults === 1 ? 'match' : 'matches'}
          </span>
        )}
      </div>
    </div>
  );
}
