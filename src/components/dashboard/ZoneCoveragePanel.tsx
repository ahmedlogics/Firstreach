'use client';

import React, { useState } from 'react';
import { ZoneAnalytics } from '@/lib/dashboard/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BarChart3, Info, ChevronDown } from 'lucide-react';

interface ZoneCoveragePanelProps {
  zones: ZoneAnalytics[];
  className?: string;
  defaultExpanded?: boolean;
}

export function ZoneCoveragePanel({
  zones,
  className = '',
  defaultExpanded = false,
}: ZoneCoveragePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-white rounded-xl border border-[#E4E8EC] shadow-xs p-4 space-y-3 ${className}`}>
      {/* Header: Collapsible Toggle */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E4E8EC]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F0F4F8] text-[#375A6B] shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#18232D] tracking-tight">
                Coverage Gaps &amp; Sector Analytics
              </h3>
              <span className="text-[10px] font-mono text-[#5F6B7A] bg-[#F7F8FA] px-1.5 py-0.5 rounded border border-[#E4E8EC]">
                {zones.length} Sectors
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#375A6B] bg-[#F0F4F8] hover:bg-[#375A6B] hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Collapse' : 'Expand Table'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dataset Origin Notice */}
      <div className="p-2 rounded-lg bg-[#F7F8FA] border border-[#E4E8EC] text-[#5F6B7A] text-[11px] flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-[#375A6B] shrink-0" />
        <span>
          Values derive from the synthetic household dataset for disaster readiness drills and volunteer outreach planning.
        </span>
      </div>

      {/* Collapsible Coverage Table */}
      {isExpanded && (
        <div className="overflow-x-auto animate-in fade-in duration-150">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E4E8EC] bg-[#F7F8FA] text-[#5F6B7A] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2 px-2.5">Sector</th>
                <th className="py-2 px-2.5">Households</th>
                <th className="py-2 px-2.5">Offline Ratio</th>
                <th className="py-2 px-2.5">Unconfirmed</th>
                <th className="py-2 px-2.5">Active Calls</th>
                <th className="py-2 px-2.5 text-right">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8EC]">
              {zones.map((zone) => {
                const noPhoneRatio =
                  zone.householdCount > 0 ? Math.round((zone.noPhoneCount / zone.householdCount) * 100) : 0;

                return (
                  <tr key={zone.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="py-2 px-2.5 font-semibold text-[#18232D]">
                      <div className="flex items-center gap-1.5">
                        {zone.isBlindSpot && <span className="w-2 h-2 rounded-full bg-[#A87528] shrink-0" />}
                        <span>{zone.name}</span>
                      </div>
                    </td>

                    <td className="py-2 px-2.5 font-mono tabular-nums text-[#5F6B7A]">
                      {zone.householdCount}
                    </td>

                    <td className="py-2 px-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-[#E4E8EC] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              noPhoneRatio > 30 ? 'bg-[#BC414A]' : 'bg-[#A87528]'
                            }`}
                            style={{ width: `${noPhoneRatio}%` }}
                          />
                        </div>
                        <span className="font-mono text-[#18232D] font-semibold text-[11px]">{noPhoneRatio}%</span>
                      </div>
                    </td>

                    <td className="py-2 px-2.5 font-mono tabular-nums text-[#5F6B7A]">
                      <span className={zone.uncontactedCount > 5 ? 'text-[#A87528] font-bold' : ''}>
                        {zone.uncontactedCount}
                      </span>
                    </td>

                    <td className="py-2 px-2.5 font-mono tabular-nums text-[#5F6B7A]">
                      <span className={zone.incidentCount === 0 && zone.flood_risk >= 2 ? 'text-[#BC414A] font-bold' : ''}>
                        {zone.incidentCount}
                      </span>
                    </td>

                    <td className="py-2 px-2.5 text-right">
                      <StatusBadge status={zone.reporting_coverage} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
