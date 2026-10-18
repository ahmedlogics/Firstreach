'use client';

import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'table-row' | 'stat' | 'map' | 'text';
  lines?: number;
}

export function LoadingSkeleton({
  className = '',
  variant = 'text',
  lines = 3,
}: LoadingSkeletonProps) {
  if (variant === 'stat') {
    return (
      <div className={`p-5 rounded-xl border border-[#E8E6E1] bg-white animate-pulse space-y-3 ${className}`}>
        <div className="h-3.5 w-24 bg-[#E8E6E1] rounded" />
        <div className="h-8 w-16 bg-[#E8E6E1] rounded" />
        <div className="h-3 w-32 bg-[#F7F6F2] rounded" />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 rounded-2xl border border-[#E8E6E1] bg-white animate-pulse space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <div className="h-4 w-36 bg-[#E8E6E1] rounded" />
          <div className="h-4 w-12 bg-[#E8E6E1] rounded" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-3.5 w-full bg-[#F7F6F2] rounded" />
          <div className="h-3.5 w-5/6 bg-[#F7F6F2] rounded" />
          <div className="h-3.5 w-3/4 bg-[#F7F6F2] rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'map') {
    return (
      <div className={`w-full h-80 rounded-2xl border border-[#E8E6E1] bg-[#F7F6F2] animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-2 border-[#CBD5E1] border-t-[#536A82] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#757B81] font-medium">Loading geospatial layers & Karachi flood zones...</p>
        </div>
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border border-[#E8E6E1] rounded-xl bg-white animate-pulse">
            <div className="h-4 w-16 bg-[#E8E6E1] rounded" />
            <div className="h-4 w-36 bg-[#E8E6E1] rounded" />
            <div className="h-4 w-24 bg-[#F7F6F2] rounded" />
            <div className="h-4 w-16 bg-[#E8E6E1] rounded ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-slate-200 rounded"
          style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
        />
      ))}
    </div>
  );
}
