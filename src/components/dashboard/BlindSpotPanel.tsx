'use client';

import React from 'react';
import { ZoneAnalytics } from '@/lib/dashboard/types';
import {
  EyeOff,
  Compass,
  ChevronDown,
} from 'lucide-react';

interface BlindSpotPanelProps {
  zones: ZoneAnalytics[];
  onDispatchVerification?: (zone: ZoneAnalytics) => void;
  className?: string;
}

export function BlindSpotPanel({
  zones,
  onDispatchVerification,
  className = '',
}: BlindSpotPanelProps) {
  const blindSpots = zones.filter((z) => z.isBlindSpot);
  const monitoredZones = zones.filter((z) => !z.isBlindSpot);

  return (
    <div className={`bg-white rounded-xl border border-[#E2E8F0] shadow-subtle p-4 sm:p-5 space-y-3.5 ${className}`}>
      {/* Header: Exact requested heading */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
            Areas Needing Verification
          </h3>
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          Silence ≠ Safety
        </span>
      </div>

      {/* Grid of Flagged Blind Spot Zones */}
      {blindSpots.length === 0 ? (
        <div className="p-4 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No verification deficits detected. All high-risk sectors have active coverage.
        </div>
      ) : (
        <div className="space-y-3">
          {blindSpots.map((zone) => (
            <div
              key={zone.id}
              className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/40 space-y-2.5 transition-all hover:bg-amber-50/60"
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <h4 className="text-sm font-bold text-slate-900">{zone.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                    [{zone.center_lat.toFixed(2)}, {zone.center_lng.toFixed(2)}]
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase font-mono">
                  Tier {zone.flood_risk} Risk
                </span>
              </div>

              {/* Requirement 8: Concise summary + expandable details */}
              <div className="text-xs text-amber-950 space-y-1.5">
                {/* Concise Summary */}
                <p className="text-xs font-medium text-amber-900">
                  Tier {zone.flood_risk} flood surge threat with zero incoming reports and {zone.noPhoneCount} offline households.
                </p>

                {/* Expandable Details for Zone B & other blind spots */}
                <details className="group bg-white/90 rounded-lg p-2 border border-amber-200/90 shadow-2xs">
                  <summary className="flex items-center justify-between text-[11px] font-bold text-amber-900 cursor-pointer select-none">
                    <span>View Verification Rationale & Risk Analysis</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180 text-amber-700" />
                  </summary>
                  <p className="text-[11px] text-slate-700 mt-2 pt-1.5 border-t border-amber-100 leading-relaxed font-normal">
                    {zone.blindSpotReason}
                  </p>
                </details>
              </div>

              {/* Compact Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-center">
                  <span className="text-slate-400 block text-[10px]">Coverage</span>
                  <strong className="capitalize text-slate-800">{zone.reporting_coverage}</strong>
                </div>

                <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-center">
                  <span className="text-slate-400 block text-[10px]">Surge ETA</span>
                  <strong className="font-mono text-amber-700">
                    {zone.minutes_to_impact !== null ? `${zone.minutes_to_impact}m` : 'Unknown'}
                  </strong>
                </div>

                <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-center">
                  <span className="text-slate-400 block text-[10px]">No Phone</span>
                  <strong className="text-red-600 font-mono">{zone.noPhoneCount} homes</strong>
                </div>

                <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-center">
                  <span className="text-slate-400 block text-[10px]">Reports</span>
                  <strong className="text-slate-800 font-mono">{zone.incidentCount} calls</strong>
                </div>
              </div>

              {/* Verification Patrol Action Button */}
              <button
                onClick={() => onDispatchVerification?.(zone)}
                className="w-full py-1.5 px-3 rounded-lg bg-[#0B1423] hover:bg-[#17263D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                <span>Task Volunteer Verification Patrol</span>
              </button>
            </div>
          ))}

          {/* Monitored Zones Compact Strip */}
          {monitoredZones.length > 0 && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
              <span className="font-semibold text-slate-700">Adequate Coverage Sectors:</span>
              <div className="flex flex-wrap gap-1.5">
                {monitoredZones.map((z) => (
                  <span
                    key={z.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold"
                  >
                    <span>{z.name}</span>
                    <span className="font-mono font-normal">({z.householdCount} homes)</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
