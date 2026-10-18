'use client';

import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { RequireAuth } from '@/lib/auth/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <RequireAuth allowedRoles={['coordinator']}>
      <div className="min-h-screen bg-[#F7F8FA] flex text-[#18232D] antialiased">
        {/* Sidebar (Desktop sticky + Mobile drawer) */}
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <AppHeader
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Clean Operational Footer */}
          <footer className="border-t border-[#E4E8EC] bg-white py-3 px-6 text-xs text-[#6B7782]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="font-semibold text-[#18232D]">
                RAABTA Operations Command
              </span>
              <span className="text-[11px] text-[#8B959E]">
                Disaster Response &amp; Coordination
              </span>
            </div>
          </footer>
        </div>
      </div>
    </RequireAuth>
  );
}
