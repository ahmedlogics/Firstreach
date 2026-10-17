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
      border: 'border-l-4 border-l-[#F16D70] border-slate-200/80',
      iconBg: 'bg-red-50 text-[#F16D70]',
      valColor: 'text-[#0F172A]',
      accentBg: 'group-hover:bg-red-50/30',
    },
    warning: {
      border: 'border-l-4 border-l-[#F5B544] border-slate-200/80',
      iconBg: 'bg-amber-50 text-[#F5B544]',
      valColor: 'text-[#0F172A]',
      accentBg: 'group-hover:bg-amber-50/30',
    },
    teal: {
      border: 'border-l-4 border-l-[#14B8A6] border-slate-200/80',
      iconBg: 'bg-teal-50 text-[#14B8A6]',
      valColor: 'text-[#0F172A]',
      accentBg: 'group-hover:bg-teal-50/30',
    },
    info: {
      border: 'border-l-4 border-l-blue-500 border-slate-200/80',
      iconBg: 'bg-blue-50 text-blue-600',
      valColor: 'text-[#0F172A]',
      accentBg: 'group-hover:bg-blue-50/30',
    },
    neutral: {
      border: 'border-l-4 border-l-slate-400 border-slate-200/80',
      iconBg: 'bg-slate-100 text-slate-600',
      valColor: 'text-[#0F172A]',
      accentBg: 'group-hover:bg-slate-50/50',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-xl p-4 sm:p-4.5 border shadow-subtle hover:shadow-card transition-all duration-200 ${variantStyles.border} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${variantStyles.valColor}`}>
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#64748B] pt-0.5 font-normal">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${variantStyles.iconBg} transition-transform group-hover:scale-105 duration-200 shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
}
