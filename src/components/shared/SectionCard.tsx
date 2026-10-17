'use client';

import React from 'react';

interface SectionCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
}

export function SectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
  bodyClassName = 'p-6',
  headerClassName = 'px-6 py-4.5 border-b border-[#E2E8F0]',
}: SectionCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle hover:shadow-card transition-shadow duration-200 overflow-hidden ${className}`}>
      {(title || action) && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#64748B] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && (
            <div className="flex items-center gap-2 shrink-0">
              {action}
            </div>
          )}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  );
}
