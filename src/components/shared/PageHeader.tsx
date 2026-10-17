'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { DemoModeBadge } from './DemoModeBadge';

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
}

export function PageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  actions,
  className = '',
  showDemoBadge = true,
}: PageHeaderProps) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B] mb-2 font-medium">
          <Link href="/dashboard" className="hover:text-[#0F172A] transition-colors">
            FirstReach Ops
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-[#0F172A] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#0F172A] font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
              {title}
            </h1>
            {badge}
            {showDemoBadge && <DemoModeBadge />}
          </div>
          {description && (
            <p className="text-sm text-[#64748B] max-w-3xl leading-relaxed">
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
