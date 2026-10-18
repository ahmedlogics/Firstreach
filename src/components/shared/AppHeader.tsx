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
          title: 'Operations Overview',
          subtitle: 'Real-time flood progression and priority dispatch triage',
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
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E8E6E1] px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-1 text-[#757B81] hover:text-[#252A30] rounded-lg hover:bg-[#EDF1F5] transition-colors"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex flex-col min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#757B81]">
              <span className="text-[#536A82] font-bold">FirstReach HQ</span>
              <span>/</span>
              <span className="text-[#252A30]">{meta.crumb}</span>
            </div>
            <p className="text-sm font-extrabold text-[#252A30] truncate">
              {meta.title}
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#92979D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emergency ID, zone (e.g. Surjani), or assets..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F7F6F2] border border-[#E8E6E1] rounded-lg text-[#252A30] placeholder:text-[#92979D] focus:outline-none focus:ring-1 focus:ring-[#536A82] focus:bg-white transition-all"
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
              className="relative p-2 rounded-xl text-[#757B81] hover:text-[#252A30] hover:bg-[#EDF1F5] transition-colors"
              title="Operational alerts"
            >
              <Bell className="w-5 h-5" />
              {criticalCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#B74349] rounded-full border-2 border-white ring-1 ring-red-400/40" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E8E6E1] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-[#E8E6E1] flex items-center justify-between bg-[#F7F6F2]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#B74349]" />
                    <span className="text-xs font-bold text-[#252A30]">Urgent System Alerts</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-[#92979D] hover:text-[#252A30] rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-[#E8E6E1] max-h-72 overflow-y-auto">
                  {MOCK_INCIDENTS.filter((i) => i.severity === 'critical').map((inc) => (
                    <div key={inc.id} className="p-3 hover:bg-[#F7F6F2] transition-colors text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#B74349]">{inc.id} • {inc.zoneName}</span>
                        <span className="text-[10px] text-[#92979D] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {inc.createdAt}
                        </span>
                      </div>
                      <p className="text-[#757B81] line-clamp-2">{inc.locationDescription}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-[#252A30]">
                          Priority Score: <strong className="text-[#B74349]">{inc.priorityScore}</strong>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAE8E7] text-[#B74349] font-bold border border-[#B74349]/20">
                          Immediate Hazard
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-[#F7F6F2] border-t border-[#E8E6E1] text-center">
                  <span className="text-[11px] text-[#757B81] font-medium">
                    Showing {criticalCount} live high-priority emergency alerts
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#E8E6E1]">
            <div className="w-8 h-8 rounded-full bg-[#252A30] text-[#F7F6F2] font-bold text-xs flex items-center justify-center border border-[#343B43] shadow-xs">
              FR
            </div>
            <div className="hidden lg:flex flex-col text-left text-xs leading-none">
              <span className="font-bold text-[#252A30]">Coord. Desk</span>
              <span className="text-[10px] text-[#92979D]">Sector West</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
