'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Navigation,
  Users2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  ShieldCheck,
  User,
} from 'lucide-react';
import { RaabtaLogo } from './RaabtaLogo';
import { useAuth } from '@/lib/auth/AuthContext';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AppSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Clean coordinator navigation items
  const navItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Dispatch',
      href: '/dispatch',
      icon: Navigation,
      badge: 'Active',
    },
    {
      name: 'Outreach & Shelters',
      href: '/outreach',
      icon: Users2,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#18232D] text-slate-100 select-none border-r border-[#273642]">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#273642] min-h-[64px]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 overflow-hidden group focus:outline-none"
        >
          <RaabtaLogo size="sm" isMarkOnly={isCollapsed} variant="glass" showSubtitle={false} />
          {!isCollapsed && (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-bold tracking-tight text-white truncate">
                RAABTA
              </span>
              <span className="text-[10px] text-[#8B959E] truncate">
                Response &amp; Coordination
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-[#8B959E] hover:text-white hover:bg-[#273642] transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2.5 space-y-1.5 overflow-y-auto">
        <div className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8B959E]">
          {!isCollapsed ? 'Coordination' : '•'}
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={isCollapsed ? item.name : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-[#273642] text-white shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#375A6B] before:rounded-r'
                  : 'text-[#8B959E] hover:text-white hover:bg-[#273642]/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-[#8B959E] group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-[#212E3B] text-[#D9E1E6] border border-[#344655] shrink-0 ml-1">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip on collapsed hover */}
              {isCollapsed && (
                <div className="fixed left-20 ml-2 hidden group-hover:flex z-50 px-2.5 py-1.5 rounded-lg bg-[#18232D] text-white text-xs font-medium whitespace-nowrap shadow-lg border border-[#273642]">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Single Compact Telemetry / Connection Strip */}
      <div className="px-3 py-2.5 border-t border-[#273642] bg-[#18232D]">
        <div
          className={`p-2 rounded-xl bg-[#212E3B]/80 border border-[#273642] flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#258167] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#258167]" />
            </span>
            {!isCollapsed && (
              <span className="text-[11px] font-semibold text-white">
                Live Telemetry Active
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-mono text-[#8B959E]">
              12s interval
            </span>
          )}
        </div>
      </div>

      {/* Account Profile & Session Control */}
      <div className="p-3 border-t border-[#273642] bg-[#18232D] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#273642] text-white flex items-center justify-center shrink-0 border border-[#344655]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#258167]" />
            </div>
            {!isCollapsed && (
              <div className="truncate leading-tight text-left">
                <span className="font-semibold text-xs text-white block truncate">
                  {user?.displayName || 'Coordinator Desk'}
                </span>
                <span className="text-[10px] text-[#8B959E] block truncate capitalize">
                  {user?.role || 'Staff Coordinator'}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-[#8B959E] hover:text-[#BC414A] hover:bg-[#273642] transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Visit Public Site link placed safely in account area */}
        {!isCollapsed && (
          <div className="pt-1 border-t border-[#273642]/60 flex items-center justify-between text-[11px] text-[#8B959E]">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Visit Public Site</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 ease-in-out h-screen sticky top-0 z-30 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#18232D]/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-68 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
