'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
  showDemoBadge?: boolean;
  rootHref?: string;
  rootLabel?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  actions,
  className = '',
  rootHref = '/dashboard',
  rootLabel = 'RAABTA Ops',
}: PageHeaderProps) {
  return (
    <div className={`mb-6 sm:mb-7 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B7782] mb-1.5 font-medium">
          <Link href={rootHref} className="hover:text-[#18232D] transition-colors">
            {rootLabel}
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-[#8B959E]" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-[#18232D] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#18232D] font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[#18232D]">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-[#6B7782] max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
