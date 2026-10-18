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
    <div className={`w-full overflow-hidden rounded-xl border border-[#E4E8EC] bg-white shadow-subtle ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] sm:text-sm text-[#18232D] border-collapse">
          {children}
        </table>
      </div>
      {footer && (
        <div className="border-t border-[#E4E8EC] bg-[#F7F8FA] px-4 py-3 text-xs text-[#6B7782]">
          {footer}
        </div>
      )}
    </div>
  );
}
