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
    <div className={`w-full overflow-hidden rounded-xl border border-[#E8E6E1] bg-white shadow-subtle ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#252A30] border-collapse">
          {children}
        </table>
      </div>
      {footer && (
        <div className="border-t border-[#E8E6E1] bg-[#F7F6F2] px-4 py-3 text-xs text-[#757B81]">
          {footer}
        </div>
      )}
    </div>
  );
}
