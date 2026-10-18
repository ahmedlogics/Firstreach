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
        className={`inline-flex items-center gap-1.5 font-medium rounded-[6px] border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  // Pre-configured mappings
  const normalized = status.toLowerCase().replace(/_/g, ' ');
  let style = 'bg-[#F7F8FA] text-[#6B7782] border-[#E4E8EC]';
  let dotColor = 'bg-[#8B959E]';

  if (normalized.includes('critical') || normalized.includes('unserved') || normalized.includes('urgent') || normalized.includes('danger')) {
    style = 'bg-[#FBECEE] text-[#BC414A] border-[#BC414A]/25';
    dotColor = 'bg-[#BC414A]';
  } else if (normalized.includes('warning') || normalized.includes('high') || normalized.includes('near capacity') || normalized.includes('overdue')) {
    style = 'bg-[#FFF4E3] text-[#A87528] border-[#A87528]/25';
    dotColor = 'bg-[#A87528]';
  } else if (normalized.includes('available') || normalized.includes('verified') || normalized.includes('rescued') || normalized.includes('safe') || normalized.includes('success') || normalized.includes('completed')) {
    style = 'bg-[#E9F3EF] text-[#258167] border-[#258167]/25';
    dotColor = 'bg-[#258167]';
  } else if (normalized.includes('pending') || normalized.includes('en route') || normalized.includes('assigned') || normalized.includes('in progress') || normalized.includes('intermittent')) {
    style = 'bg-[#EAF0F4] text-[#375A6B] border-[#375A6B]/25';
    dotColor = 'bg-[#375A6B]';
  } else if (normalized.includes('unverified') || normalized.includes('busy') || normalized.includes('unreachable')) {
    style = 'bg-[#F7F8FA] text-[#6B7782] border-[#E4E8EC]';
    dotColor = 'bg-[#8B959E]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-[6px] border ${style} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{normalized}</span>
    </span>
  );
}
