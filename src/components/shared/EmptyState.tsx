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
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-[#E4E8EC] rounded-xl bg-white shadow-subtle ${className}`}>
      <div className="w-12 h-12 rounded-[10px] bg-[#F7F8FA] border border-[#E4E8EC] flex items-center justify-center text-[#6B7782] mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#18232D] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#6B7782] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
