'use client';

import React from 'react';
import { LucideIcon, HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = HelpCircle,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl bg-[#F7F6F2]/50 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-white border border-[#E8E6E1] shadow-subtle flex items-center justify-center text-[#757B81] mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#252A30] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#757B81] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
