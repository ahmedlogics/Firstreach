'use client';

import React from 'react';
import {
  PhoneOff,
  UserCheck,
  Footprints,
  Bed,
} from 'lucide-react';
import { ReachabilityOverviewMetrics } from '@/lib/outreach/types';

interface ReachabilityStatsProps {
  metrics: ReachabilityOverviewMetrics;
  isLoading?: boolean;
}

export function ReachabilityStats({
  metrics,
  isLoading = false,
}: ReachabilityStatsProps) {
  const needsContact = metrics.uncontactedCount + metrics.needsVisitCount;

  return (
    <div className="bg-white rounded-xl border border-[#E4E8EC] shadow-xs overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E4E8EC]">
        {/* Metric 1: Needs Contact */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-semibold text-[#5F6B7A] uppercase tracking-wider block truncate">
              Needs Contact
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#18232D] tabular-nums">
                {isLoading ? '...' : needsContact}
              </span>
              <span className="text-[11px] text-[#A87528] font-medium hidden sm:inline">
                priority
              </span>
            </div>
            <p className="text-[11px] text-[#5F6B7A] truncate">
              Silence ≠ emergency classification
            </p>
          </div>
          <div className="p-2 rounded-lg bg-[#FFF5E6] text-[#A87528] shrink-0 border border-[#A87528]/25">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2: Volunteer Tasks */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-semibold text-[#5F6B7A] uppercase tracking-wider block truncate">
              Volunteer Tasks
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#18232D] tabular-nums">
                {isLoading ? '...' : metrics.activeVolunteerTasks}
              </span>
              <span className="text-[11px] text-[#375A6B] font-medium hidden sm:inline">
                active
              </span>
            </div>
            <p className="text-[11px] text-[#5F6B7A] truncate">
              Door-to-door welfare verification
            </p>
          </div>
          <div className="p-2 rounded-lg bg-[#F0F4F8] text-[#375A6B] shrink-0 border border-[#375A6B]/25">
            <Footprints className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3: Households Without Phone */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-semibold text-[#5F6B7A] uppercase tracking-wider block truncate">
              Households Without Phone
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#BC414A] tabular-nums">
                {isLoading ? '...' : metrics.noPhoneCount}
              </span>
              <span className="text-[11px] text-[#BC414A] font-medium hidden sm:inline">
                blackout
              </span>
            </div>
            <p className="text-[11px] text-[#5F6B7A] truncate">
              Physical ground scout visit required
            </p>
          </div>
          <div className="p-2 rounded-lg bg-[#FBECEE] text-[#BC414A] shrink-0 border border-[#BC414A]/25">
            <PhoneOff className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 4: Beds Available */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-semibold text-[#5F6B7A] uppercase tracking-wider block truncate">
              Beds Available
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#258167] tabular-nums">
                {isLoading ? '...' : metrics.totalFreeBeds}
              </span>
              <span className="text-[11px] text-[#5F6B7A] font-normal">
                / {metrics.totalShelterCapacity}
              </span>
            </div>
            <p className="text-[11px] text-[#5F6B7A] truncate">
              {metrics.sheltersNearCapacityCount > 0
                ? `${metrics.sheltersNearCapacityCount} shelter(s) near limit`
                : 'Fleet capacity stable'}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-[#EBF7F2] text-[#258167] shrink-0 border border-[#258167]/25">
            <Bed className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
