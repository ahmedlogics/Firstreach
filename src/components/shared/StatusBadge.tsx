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
        className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  // Pre-configured mappings
  const normalized = status.toLowerCase().replace(/_/g, ' ');
  let style = 'bg-[#F0F2F5] text-[#667085] border-[#E8E6E1]';
  let dotColor = 'bg-[#667085]';

  if (normalized.includes('critical') || normalized.includes('unserved') || normalized.includes('urgent') || normalized.includes('danger')) {
    style = 'bg-[#FAE8E7] text-[#B74349] border-[#B74349]/30';
    dotColor = 'bg-[#B74349]';
  } else if (normalized.includes('warning') || normalized.includes('high') || normalized.includes('near capacity') || normalized.includes('overdue')) {
    style = 'bg-[#FFF2DD] text-[#A87426] border-[#A87426]/30';
    dotColor = 'bg-[#A87426]';
  } else if (normalized.includes('available') || normalized.includes('verified') || normalized.includes('rescued') || normalized.includes('safe') || normalized.includes('success') || normalized.includes('completed')) {
    style = 'bg-[#E5EEE8] text-[#377D65] border-[#377D65]/30';
    dotColor = 'bg-[#377D65]';
  } else if (normalized.includes('pending') || normalized.includes('en route') || normalized.includes('assigned') || normalized.includes('in progress') || normalized.includes('intermittent')) {
    style = 'bg-[#EDF1F5] text-[#536A82] border-[#536A82]/30';
    dotColor = 'bg-[#536A82]';
  } else if (normalized.includes('unverified') || normalized.includes('busy') || normalized.includes('unreachable')) {
    style = 'bg-[#F0F2F5] text-[#667085] border-[#D0D5DD]';
    dotColor = 'bg-[#667085]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${style} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{normalized}</span>
    </span>
  );
}
