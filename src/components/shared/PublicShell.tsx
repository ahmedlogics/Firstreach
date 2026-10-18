'use client';

import React from 'react';
import { PublicNav } from './PublicNav';
import { PublicFooter } from './PublicFooter';

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col text-[#252A30] antialiased">
      <PublicNav />
      <main className="flex-1 w-full">{children}</main>
      <PublicFooter />
    </div>
  );
}
