'use client';

import React from 'react';
import { ZoneAnalytics } from '@/lib/dashboard/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BarChart3, Info } from 'lucide-react';

interface ZoneCoveragePanelProps {
  zones: ZoneAnalytics[];
  className?: string;
}

export function ZoneCoveragePanel({ zones, className = '' }: ZoneCoveragePanelProps) {
  return (
    <div className={`bg-white rounded-xl border border-[#E8E6E1] shadow-subtle p-4 sm:p-5 space-y-3 ${className}`}>
      {/* Header: Exact requested heading */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E8E6E1]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EDF1F5] text-[#536A82] shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#252A30] tracking-tight">
            Coverage Gaps
          </h3>
        </div>

        <span className="text-[11px] font-mono text-[#757B81] bg-[#F7F6F2] px-2 py-0.5 rounded border border-[#E8E6E1]">
          {zones.length} Sectors Monitored
        </span>
      </div>

      {/* Coverage Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E8E6E1] bg-[#F7F6F2] text-[#757B81] font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2 px-2.5">Sector</th>
              <th className="py-2 px-2.5">Households</th>
              <th className="py-2 px-2.5">Offline Ratio</th>
              <th className="py-2 px-2.5">Unconfirmed</th>
              <th className="py-2 px-2.5">Active Calls</th>
              <th className="py-2 px-2.5 text-right">Coverage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E6E1]">
            {zones.map((zone) => {
              const noPhoneRatio =
                zone.householdCount > 0 ? Math.round((zone.noPhoneCount / zone.householdCount) * 100) : 0;

              return (
                <tr key={zone.id} className="hover:bg-[#F7F6F2] transition-colors">
                  <td className="py-2 px-2.5 font-semibold text-[#252A30]">
                    <div className="flex items-center gap-1.5">
                      {zone.isBlindSpot && <span className="w-2 h-2 rounded-full bg-[#A87426] shrink-0" />}
                      <span>{zone.name}</span>
                    </div>
                  </td>

                  <td className="py-2 px-2.5 font-mono tabular-nums text-[#757B81]">
                    {zone.householdCount}
                  </td>

                  <td className="py-2 px-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-[#E8E6E1] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            noPhoneRatio > 30 ? 'bg-[#B74349]' : 'bg-[#A87426]'
                          }`}
                          style={{ width: `${noPhoneRatio}%` }}
                        />
                      </div>
                      <span className="font-mono text-[#252A30] font-semibold text-[11px]">{noPhoneRatio}%</span>
                    </div>
                  </td>

                  <td className="py-2 px-2.5 font-mono tabular-nums text-[#757B81]">
                    <span className={zone.uncontactedCount > 5 ? 'text-[#A87426] font-bold' : ''}>
                      {zone.uncontactedCount}
                    </span>
                  </td>

                  <td className="py-2 px-2.5 font-mono tabular-nums text-[#757B81]">
                    <span className={zone.incidentCount === 0 && zone.flood_risk >= 2 ? 'text-[#B74349] font-bold' : ''}>
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

      <div className="p-2 rounded-lg bg-[#F7F6F2] border border-[#E8E6E1] text-[#757B81] text-[11px] flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-[#92979D] shrink-0" />
        <span>
          High offline ratios indicate neighborhoods requiring physical checks prior to road inundation.
        </span>
      </div>
    </div>
  );
}
