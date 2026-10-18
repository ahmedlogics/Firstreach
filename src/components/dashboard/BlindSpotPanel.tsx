'use client';

import React from 'react';
import { ZoneAnalytics } from '@/lib/dashboard/types';
import {
  EyeOff,
  Compass,
  ChevronDown,
  Info,
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
    <div className={`bg-white rounded-xl border border-[#E4E8EC] shadow-xs p-4 space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E4E8EC]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FFF5E6] text-[#A87528] border border-[#A87528]/30 shrink-0">
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#18232D] tracking-tight">
              Areas Needing Verification
            </h3>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF5E6] text-[#A87528] border border-[#A87528]/30">
          Verification Deficit
        </span>
      </div>

      {/* Grid of Flagged Blind Spot Zones */}
      {blindSpots.length === 0 ? (
        <div className="p-4 text-center text-[#5F6B7A] text-xs bg-[#F7F8FA] rounded-xl border border-dashed border-[#E4E8EC]">
          No verification deficits detected. All high-risk sectors have active reporting coverage.
        </div>
      ) : (
        <div className="space-y-2.5">
          {blindSpots.map((zone) => (
            <div
              key={zone.id}
              className="p-3 rounded-lg border border-[#A87528]/30 bg-[#FFF5E6]/25 space-y-2 transition-all"
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A87528]" />
                  <h4 className="text-xs font-bold text-[#18232D]">{zone.name}</h4>
                  <span className="text-[10px] font-mono text-[#5F6B7A]">
                    [{zone.center_lat.toFixed(2)}, {zone.center_lng.toFixed(2)}]
                  </span>
                </div>

                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FBECEE] text-[#BC414A] uppercase font-mono border border-[#BC414A]/30">
                  Tier {zone.flood_risk} Risk
                </span>
              </div>

              {/* Concise Actionable Summary */}
              <p className="text-xs font-medium text-[#18232D]">
                {zone.name} — High flood exposure, low reporting coverage, residents not yet contacted.
              </p>

              {/* Expandable Rationale Details */}
              <details className="group bg-white rounded-lg p-2 border border-[#E4E8EC] shadow-2xs">
                <summary className="flex items-center justify-between text-[11px] font-semibold text-[#18232D] cursor-pointer select-none">
                  <span>View Verification Rationale & Risk Analysis</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180 text-[#A87528]" />
                </summary>
                <div className="text-[11px] text-[#5F6B7A] mt-2 pt-1.5 border-t border-[#E4E8EC] space-y-1">
                  <p>{zone.blindSpotReason}</p>
                  <p className="text-[10px] text-[#A87528] italic">
                    Note: Uncontacted households are queued for physical welfare checks, not automatically classified as extraction emergencies.
                  </p>
                </div>
              </details>

              {/* Compact Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                <div className="p-1 rounded bg-white border border-[#E4E8EC] text-center">
                  <span className="text-[#5F6B7A] block text-[9px] uppercase font-semibold">Coverage</span>
                  <strong className="capitalize text-[#18232D] text-[11px]">{zone.reporting_coverage}</strong>
                </div>

                <div className="p-1 rounded bg-white border border-[#E4E8EC] text-center">
                  <span className="text-[#5F6B7A] block text-[9px] uppercase font-semibold">Surge ETA</span>
                  <strong className="font-mono text-[#A87528] text-[11px]">
                    {zone.minutes_to_impact !== null ? `${zone.minutes_to_impact}m` : 'Unknown'}
                  </strong>
                </div>

                <div className="p-1 rounded bg-white border border-[#E4E8EC] text-center">
                  <span className="text-[#5F6B7A] block text-[9px] uppercase font-semibold">Offline</span>
                  <strong className="text-[#BC414A] font-mono text-[11px]">{zone.noPhoneCount} homes</strong>
                </div>

                <div className="p-1 rounded bg-white border border-[#E4E8EC] text-center">
                  <span className="text-[#5F6B7A] block text-[9px] uppercase font-semibold">Reports</span>
                  <strong className="text-[#18232D] font-mono text-[11px]">{zone.incidentCount} calls</strong>
                </div>
              </div>

              {/* Verification Patrol Action Button */}
              <button
                type="button"
                onClick={() => onDispatchVerification?.(zone)}
                className="w-full py-1.5 px-3 rounded-lg bg-[#18232D] hover:bg-[#2C3E50] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#E4E8EC]" />
                <span>Task Volunteer Verification Patrol</span>
              </button>
            </div>
          ))}

          {/* Monitored Zones Compact Strip */}
          {monitoredZones.length > 0 && (
            <div className="p-2 rounded-lg bg-[#F7F8FA] border border-[#E4E8EC] text-xs flex flex-wrap items-center justify-between gap-1.5 text-[#5F6B7A]">
              <span className="font-semibold text-[#18232D] text-[11px]">Adequate Coverage:</span>
              <div className="flex flex-wrap gap-1">
                {monitoredZones.map((z) => (
                  <span
                    key={z.id}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#EBF7F2] text-[#258167] border border-[#258167]/25 text-[10px] font-semibold"
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
