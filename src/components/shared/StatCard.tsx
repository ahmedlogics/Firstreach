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
      border: 'border-[#E8E6E1]',
      iconBg: 'bg-[#FAE8E7] text-[#B74349]',
      valColor: 'text-[#252A30]',
      accentBg: 'hover:border-[#B74349]/40',
    },
    warning: {
      border: 'border-[#E8E6E1]',
      iconBg: 'bg-[#FFF2DD] text-[#A87426]',
      valColor: 'text-[#252A30]',
      accentBg: 'hover:border-[#A87426]/40',
    },
    teal: {
      border: 'border-[#E8E6E1]',
      iconBg: 'bg-[#EDF1F5] text-[#536A82]',
      valColor: 'text-[#252A30]',
      accentBg: 'hover:border-[#536A82]/40',
    },
    info: {
      border: 'border-[#E8E6E1]',
      iconBg: 'bg-[#EDF1F5] text-[#536A82]',
      valColor: 'text-[#252A30]',
      accentBg: 'hover:border-[#536A82]/40',
    },
    neutral: {
      border: 'border-[#E8E6E1]',
      iconBg: 'bg-[#F0F2F5] text-[#667085]',
      valColor: 'text-[#252A30]',
      accentBg: 'hover:border-slate-300',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-xl p-4 sm:p-4.5 border border-[#E8E6E1] shadow-subtle hover:shadow-card transition-all duration-150 ${variantStyles.accentBg} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#757B81]">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${variantStyles.valColor}`}>
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-[#377D65]' : 'text-[#B74349]'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#757B81] pt-0.5 font-normal">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${variantStyles.iconBg} transition-transform group-hover:scale-105 duration-150 shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
}
