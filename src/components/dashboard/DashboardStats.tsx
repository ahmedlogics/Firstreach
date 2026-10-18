'use client';

import React, { useState } from 'react';
import { DashboardStatistics } from '@/lib/dashboard/types';
import {
  Flame,
  LifeBuoy,
  PhoneOff,
  AlertOctagon,
  ChevronDown,
  Activity,
  Home,
  Users,
} from 'lucide-react';

interface DashboardStatsProps {
  stats: DashboardStatistics;
  simulationMinutes?: number;
  onFilterClick?: (filterType: string) => void;
  className?: string;
}

export function DashboardStats({
  stats,
  simulationMinutes = 0,
  onFilterClick,
  className = '',
}: DashboardStatsProps) {
  const [showSecondaryStats, setShowSecondaryStats] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Primary Compact Metrics Strip */}
      <div className="bg-white rounded-xl border border-[#E4E8EC] shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E4E8EC]">
          {/* 1. Critical Emergencies */}
          <button
            type="button"
            onClick={() => onFilterClick?.('critical')}
            className="p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-[#F7F8FA] transition-colors cursor-pointer group"
          >
            <div className="space-y-0.5 min-w-0">
              <span className="text-[11px] font-semibold text-[#5F6B7A] uppercase tracking-wider block truncate">
                Critical Emergencies
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#BC414A] tabular-nums">
                  {stats.criticalEmergencies}
                </span>
                <span className="text-[10px] text-[#BC414A] font-semibold hidden sm:inline">
                  Score ≥ 80
                </span>
              </div>
              <p className="text-[11px] text-[#5F6B7A] truncate">
                Life-threat priority
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#FBECEE] text-[#BC414A] shrink-0 border border-[#BC414A]/25 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </button>

          {/* 2. Awaiting Assignment */}
          <button
            type="button"
            onClick={() => onFilterClick?.('unserved')}
            className="p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-[#F7F8FA] transition-colors cursor-pointer group"
          >
            <div className="space-y-0.5 min-w-0">
              <span className="text-[11px] font-semibold text-[#5F6B7A] uppercase tracking-wider block truncate">
                Awaiting Assignment
              </span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${
                    typeof stats.unservedEmergencies === 'number' && stats.unservedEmergencies > 0
                      ? 'text-[#BC414A]'
                      : 'text-[#18232D]'
                  }`}
                >
                  {stats.unservedEmergencies}
                </span>
                <span className="text-[10px] text-[#5F6B7A] hidden sm:inline">
                  in queue
                </span>
              </div>
              <p className="text-[11px] text-[#5F6B7A] truncate">
                Pending craft dispatch
              </p>
            </div>
            <div
              className={`p-2 rounded-lg shrink-0 border group-hover:scale-105 transition-transform ${
                typeof stats.unservedEmergencies === 'number' && stats.unservedEmergencies > 0
                  ? 'bg-[#FBECEE] text-[#BC414A] border-[#BC414A]/25'
                  : 'bg-[#F0F4F8] text-[#375A6B] border-[#375A6B]/25'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
            </div>
          </button>

          {/* 3. Available Rescue Teams */}
          <button
            type="button"
            onClick={() => onFilterClick?.('teams')}
            className="p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-[#F7F8FA] transition-colors cursor-pointer group"
          >
            <div className="space-y-0.5 min-w-0">
              <span className="text-[11px] font-semibold text-[#5F6B7A] uppercase tracking-wider block truncate">
                Available Teams
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#258167] tabular-nums">
                  {stats.availableRescueTeams}
                </span>
                <span className="text-[10px] text-[#258167] font-semibold hidden sm:inline">
                  deployable
                </span>
              </div>
              <p className="text-[11px] text-[#5F6B7A] truncate">
                Boats & field units
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#EBF7F2] text-[#258167] shrink-0 border border-[#258167]/25 group-hover:scale-105 transition-transform">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </button>

          {/* 4. Unreachable Households */}
          <button
            type="button"
            onClick={() => onFilterClick?.('unreachable')}
            className="p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-[#F7F8FA] transition-colors cursor-pointer group"
          >
            <div className="space-y-0.5 min-w-0">
              <span className="text-[11px] font-semibold text-[#5F6B7A] uppercase tracking-wider block truncate">
                Unreachable Homes
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#A87528] tabular-nums">
                  {stats.unreachableHouseholds}
                </span>
                <span className="text-[10px] text-[#A87528] font-semibold hidden sm:inline">
                  no phone
                </span>
              </div>
              <p className="text-[11px] text-[#5F6B7A] truncate">
                Scout check needed
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#FFF5E6] text-[#A87528] shrink-0 border border-[#A87528]/25 group-hover:scale-105 transition-transform">
              <PhoneOff className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Small Expandable Summary Bar */}
        <div className="px-3.5 py-1.5 bg-[#F7F8FA] border-t border-[#E4E8EC] flex items-center justify-between text-[11px] text-[#5F6B7A]">
          <div className="flex items-center gap-3">
            <span>
              Total Active Emergencies: <strong className="text-[#18232D] font-mono">{stats.activeEmergencies}</strong>
            </span>
            <span className="hidden sm:inline text-[#E4E8EC]">•</span>
            <span className="hidden sm:inline">
              Shelter Fleet: <strong className="text-[#18232D] font-mono">{stats.totalShelterOccupied}</strong> / {stats.totalShelterCapacity}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSecondaryStats(!showSecondaryStats)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#375A6B] hover:text-[#18232D] transition-colors cursor-pointer"
          >
            <span>{showSecondaryStats ? 'Hide' : 'More'} Telemetry</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSecondaryStats ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Secondary Metrics */}
        {showSecondaryStats && (
          <div className="p-3 bg-[#F0F4F8]/40 border-t border-[#E4E8EC] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs animate-in fade-in duration-150">
            <div className="p-2 rounded-lg bg-white border border-[#E4E8EC]">
              <span className="text-[10px] uppercase font-semibold text-[#5F6B7A] block">Active Incidents</span>
              <span className="font-mono text-sm font-bold text-[#18232D]">{stats.activeEmergencies}</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#E4E8EC]">
              <span className="text-[10px] uppercase font-semibold text-[#5F6B7A] block">Uncontacted Homes</span>
              <span className="font-mono text-sm font-bold text-[#A87528]">{stats.uncontactedHouseholds}</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#E4E8EC]">
              <span className="text-[10px] uppercase font-semibold text-[#5F6B7A] block">Shelter Intake</span>
              <span className="font-mono text-sm font-bold text-[#18232D]">
                {stats.totalShelterOccupied} <span className="text-[10px] text-[#5F6B7A] font-normal">/ {stats.totalShelterCapacity}</span>
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#E4E8EC]">
              <span className="text-[10px] uppercase font-semibold text-[#5F6B7A] block">Monitored Families</span>
              <span className="font-mono text-sm font-bold text-[#18232D]">{stats.totalHouseholds}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
