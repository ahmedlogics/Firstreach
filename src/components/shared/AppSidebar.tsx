'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus2,
  Navigation,
  Users2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Settings,
  User,
  Radio,
  ExternalLink,
} from 'lucide-react';

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

  const navItems = [
    {
      name: 'Operations Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      name: 'Report Emergency',
      href: '/report',
      icon: FilePlus2,
      badge: 'Form',
    },
    {
      name: 'Rescue Allocation',
      href: '/dispatch',
      icon: Navigation,
      badge: '4 Urgent',
    },
    {
      name: 'Outreach & Shelters',
      href: '/outreach',
      icon: Users2,
      badge: '278 Silent',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1423] text-slate-300 select-none border-r border-[#17263D]">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4.5 border-b border-[#17263D] min-h-[69px]">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-[#14B8A6] flex items-center justify-center text-[#0B1423] font-black shrink-0 shadow-sm group-hover:bg-[#0D9488] transition-colors">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-tight min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white font-sans">
                  FirstReach
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-[#14B8A6] border border-[#14B8A6]/30">
                  v1.0
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium truncate">
                Disaster Response Intelligence
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#17263D] transition-colors"
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
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {!isCollapsed ? 'Command Center' : '•'}
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
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all group ${
                isActive
                  ? 'bg-[#14B8A6] text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-[#17263D]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.name}</span>
                  {item.badge && !isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#17263D] text-slate-300 border border-slate-700/60 font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip on collapsed hover */}
              {isCollapsed && (
                <div className="fixed left-20 ml-2 hidden group-hover:flex z-50 px-2.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg border border-slate-700">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Status & Utility Section */}
      <div className="p-3 border-t border-[#17263D] bg-[#0B1423]/90 space-y-3">
        {/* Telemetry Status Indicator */}
        <div className={`p-2.5 rounded-xl bg-[#17263D] border border-slate-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14B8A6] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14B8A6]" />
            </span>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                  Telemetry Engine <Radio className="w-3 h-3 text-[#14B8A6]" />
                </span>
                <span className="text-[10px] text-teal-400 font-mono">
                  Karachi Basin Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Live System Operational Status */}
        {!isCollapsed && (
          <div className="px-2.5 py-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-300">
            <div className="font-bold flex items-center justify-between">
              <span>LIVE OPERATIONS</span>
              <span className="text-[9px] uppercase tracking-wider bg-teal-400/20 px-1 rounded text-teal-200">Database Active</span>
            </div>
            <p className="text-[10px] text-teal-200/80 mt-0.5 leading-tight">
              Live emergency telemetry & active transactional dispatch.
            </p>
          </div>
        )}

        {/* Profile / Account Placeholder (No fake auth) */}
        <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 text-xs font-bold shrink-0">
              CC
            </div>
            {!isCollapsed && (
              <div className="truncate text-left leading-tight">
                <p className="text-xs font-semibold text-slate-200 truncate">Dispatcher Desk 01</p>
                <p className="text-[10px] text-slate-400 truncate">HQ Operations Room</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#17263D] transition-colors"
              title="System Preferences"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 ease-in-out h-screen sticky top-0 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
