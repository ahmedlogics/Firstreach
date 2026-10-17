'use client';

import React from 'react';
import { SeverityLevel } from '@/lib/types';
import { getSeverityColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'severity' | 'verification' | 'resource' | 'neutral';
  severity?: SeverityLevel;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({
  status,
  variant = 'neutral',
  severity,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  if (variant === 'severity' && severity) {
    const colors = getSeverityColor(severity);
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  // Pre-configured mappings
  const normalized = status.toLowerCase().replace(/_/g, ' ');
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (normalized.includes('critical') || normalized.includes('unserved') || normalized.includes('urgent')) {
    style = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-[#F16D70]';
  } else if (normalized.includes('warning') || normalized.includes('high') || normalized.includes('near capacity') || normalized.includes('overdue')) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-[#F5B544]';
  } else if (normalized.includes('available') || normalized.includes('verified') || normalized.includes('rescued') || normalized.includes('safe') || normalized.includes('success')) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-[#10B981]';
  } else if (normalized.includes('pending') || normalized.includes('en route') || normalized.includes('assigned') || normalized.includes('intermittent')) {
    style = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (normalized.includes('unverified') || normalized.includes('busy') || normalized.includes('unreachable')) {
    style = 'bg-purple-50 text-purple-700 border-purple-200';
    dotColor = 'bg-purple-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{normalized}</span>
    </span>
  );
}
