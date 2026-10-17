'use client';

import React from 'react';
import { ZoneAnalytics } from '@/lib/dashboard/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  EyeOff,
  AlertTriangle,
  Compass,
  Clock,
  PhoneOff,
  Users,
  CheckCircle2,
  HelpCircle,
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
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Areas Requiring Verification (Blind-Spot Intelligence)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Silence ≠ Safety
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Identifies sectors where high physical flood exposure coincides with reporting deficits or silent households.
            </p>
          </div>
        </div>

        <div className="text-xs text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 self-start sm:self-auto font-medium">
          Zero reports indicates missing data, not safety
        </div>
      </div>

      {/* Grid of Flagged Blind Spot Zones */}
      {blindSpots.length === 0 ? (
        <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No active blind spots detected. All high-risk sectors have adequate telemetry coverage.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blindSpots.map((zone) => (
            <div
              key={zone.id}
              className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/30 space-y-3 shadow-2xs transition-all hover:bg-amber-50/50"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <h4 className="text-sm font-bold text-slate-900">{zone.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    GPS: [{zone.center_lat.toFixed(3)}, {zone.center_lng.toFixed(3)}]
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase font-mono">
                  Risk Tier {zone.flood_risk}/3
                </span>
              </div>

              {/* Explainable Rationale */}
              <div className="p-2.5 rounded-lg bg-white border border-amber-200/80 text-xs text-amber-950 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  Why this sector is flagged:
                </span>
                <p className="text-[11px] leading-relaxed">
                  {zone.blindSpotReason}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                  <span className="text-slate-400 block text-[10px]">Reporting Coverage</span>
                  <strong className="capitalize text-slate-800">{zone.reporting_coverage}</strong>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                  <span className="text-slate-400 block text-[10px]">Time to Surge Impact</span>
                  <strong className="font-mono text-amber-700">
                    {zone.minutes_to_impact !== null ? `${zone.minutes_to_impact} min` : 'Unknown'}
                  </strong>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                  <span className="text-slate-400 block text-[10px]">No-Phone Households</span>
                  <strong className="text-red-600 font-mono">{zone.noPhoneCount} homes</strong>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200/70">
                  <span className="text-slate-400 block text-[10px]">Incoming Reports</span>
                  <strong className="text-slate-800 font-mono">{zone.incidentCount} callers</strong>
                </div>
              </div>

              {/* Recommended Action Button */}
              <button
                onClick={() => onDispatchVerification?.(zone)}
                className="w-full py-2 px-3 rounded-lg bg-[#0B1423] hover:bg-[#17263D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                <span>Task Volunteer Verification Patrol</span>
              </button>
            </div>
          ))}

          {/* Monitored Zones Mini Summary */}
          {monitoredZones.map((zone) => (
            <div
              key={zone.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800">{zone.name}</h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  Coverage Adequate
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Active telemetry confirmed. {zone.incidentCount} calls logged, {zone.householdCount} monitored homes.
              </p>
              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200 text-slate-600">
                <span>Baseline Impact: {zone.minutes_to_impact}m</span>
                <span className="font-mono text-slate-800">Risk {zone.flood_risk}/3</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
