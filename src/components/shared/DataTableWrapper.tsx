'use client';

import React from 'react';

interface DataTableWrapperProps {
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export function DataTableWrapper({
  children,
  className = '',
  footer,
}: DataTableWrapperProps) {
  return (
    <div className={`w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-subtle ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#0F172A] border-collapse">
          {children}
        </table>
      </div>
      {footer && (
        <div className="border-t border-[#E2E8F0] bg-slate-50/70 px-4 py-3 text-xs text-[#64748B]">
          {footer}
        </div>
      )}
    </div>
  );
}
