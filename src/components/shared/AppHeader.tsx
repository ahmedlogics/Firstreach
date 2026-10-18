'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  AlertTriangle,
  Clock,
  Layers,
  X,
} from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import { MOCK_INCIDENTS } from '@/lib/mock-data';

interface AppHeaderProps {
  onToggleMobileMenu: () => void;
}

export function AppHeader({ onToggleMobileMenu }: AppHeaderProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getPageMeta = () => {
    switch (pathname) {
      case '/dashboard':
        return {
          title: 'Emergency Operations Overview',
          subtitle: 'Real-time flood progression, zone priority ranking, and coordination command',
          crumb: 'Dashboard',
        };
      case '/report':
        return {
          title: 'Submit Emergency Report',
          subtitle: 'Public & volunteer incident intake with automated vulnerability triage',
          crumb: 'Intake / Report',
        };
      case '/dispatch':
        return {
          title: 'Rescue Resource Allocation',
          subtitle: 'Safety-first dispatch optimization matching available assets with urgent calls',
          crumb: 'Rescue Dispatch',
        };
      case '/outreach':
        return {
          title: 'Community Outreach & Shelter Coordination',
          subtitle: 'Proactive silence escalation for unreachable households & shelter capacity tracking',
          crumb: 'Outreach & Shelters',
        };
      default:
        return {
          title: 'FirstReach Intelligence',
          subtitle: 'Disaster response coordination command center',
          crumb: 'Overview',
        };
    }
  };

  const meta = getPageMeta();
  const criticalCount = MOCK_INCIDENTS.filter((i) => i.severity === 'critical').length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex flex-col min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="text-[#14B8A6] font-bold">FirstReach HQ</span>
              <span>/</span>
              <span className="text-[#0F172A]">{meta.crumb}</span>
            </div>
            <p className="text-sm font-extrabold text-[#0F172A] truncate">
              {meta.title}
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emergency ID, zone (e.g. Surjani), or assets..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right: Status Indicators, Notifications, Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <div className="hidden xl:block">
            <ConnectionStatus status="connected" showDetails={false} />
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Operational alerts"
            >
              <Bell className="w-5 h-5" />
              {criticalCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F16D70] rounded-full border-2 border-white ring-1 ring-red-400/40 animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#F16D70]" />
                    <span className="text-xs font-bold text-[#0F172A]">Urgent System Alerts</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {MOCK_INCIDENTS.filter((i) => i.severity === 'critical').map((inc) => (
                    <div key={inc.id} className="p-3 hover:bg-slate-50 transition-colors text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-700">{inc.id} • {inc.zoneName}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {inc.createdAt}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2">{inc.locationDescription}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-slate-800">
                          Priority Score: <strong className="text-red-600">{inc.priorityScore}</strong>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                          Immediate Hazard
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Showing {criticalCount} live high-priority emergency alerts
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar (Fictional Dispatcher Role) */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#17263D] text-[#14B8A6] font-bold text-xs flex items-center justify-center border border-slate-300 shadow-xs">
              FR
            </div>
            <div className="hidden lg:flex flex-col text-left text-xs leading-none">
              <span className="font-bold text-slate-900">Coord. Desk</span>
              <span className="text-[10px] text-slate-400">Sector West</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
