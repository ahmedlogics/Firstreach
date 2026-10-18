'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'critical' | 'warning' | 'teal' | 'neutral' | 'info';
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'neutral',
  subtitle,
  trend,
  className = '',
  onClick,
}: StatCardProps) {
  const variantStyles = {
    critical: {
      border: 'border-[#E4E8EC]',
      iconBg: 'bg-[#FBECEE] text-[#BC414A]',
      valColor: 'text-[#18232D]',
      accentBg: 'hover:border-[#BC414A]/40',
    },
    warning: {
      border: 'border-[#E4E8EC]',
      iconBg: 'bg-[#FFF4E3] text-[#A87528]',
      valColor: 'text-[#18232D]',
      accentBg: 'hover:border-[#A87528]/40',
    },
    teal: {
      border: 'border-[#E4E8EC]',
      iconBg: 'bg-[#EAF0F4] text-[#375A6B]',
      valColor: 'text-[#18232D]',
      accentBg: 'hover:border-[#375A6B]/40',
    },
    info: {
      border: 'border-[#E4E8EC]',
      iconBg: 'bg-[#EAF0F4] text-[#375A6B]',
      valColor: 'text-[#18232D]',
      accentBg: 'hover:border-[#375A6B]/40',
    },
    neutral: {
      border: 'border-[#E4E8EC]',
      iconBg: 'bg-[#F7F8FA] text-[#6B7782]',
      valColor: 'text-[#18232D]',
      accentBg: 'hover:border-[#CBD5E1]',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-xl p-4.5 border border-[#E4E8EC] shadow-subtle transition-colors duration-150 ${variantStyles.accentBg} ${
        onClick ? 'cursor-pointer hover:bg-[#FAFBFD]' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#6B7782]">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-[28px] font-semibold tracking-tight tabular-nums ${variantStyles.valColor}`}>
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-[#258167]' : 'text-[#BC414A]'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#8B959E] font-normal">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-[10px] ${variantStyles.iconBg} transition-colors duration-150 shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
