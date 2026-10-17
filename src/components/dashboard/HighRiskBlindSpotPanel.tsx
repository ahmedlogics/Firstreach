'use client';

import React from 'react';
import { MOCK_ZONES } from '@/lib/mock-data';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  EyeOff,
  AlertTriangle,
  Radio,
  Clock,
  Send,
  Users,
  Compass,
} from 'lucide-react';

interface HighRiskBlindSpotPanelProps {
  onDispatchVerification?: (zoneName: string) => void;
  className?: string;
}

export function HighRiskBlindSpotPanel({
  onDispatchVerification,
  className = '',
}: HighRiskBlindSpotPanelProps) {
  // Sort zones by lowest coverage + highest exposure
  const blindSpotZones = [...MOCK_ZONES].sort((a, b) => a.reportingCoverage - b.reportingCoverage);

  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4 ${className}`}>
      {/* Header with operational doctrine notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Areas Requiring Verification (Potential Blind Spots)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                Silence ≠ Safety
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Zones with high physical flood exposure but zero-to-low incoming call volume. Prioritized for rapid volunteer reconnaissance.
            </p>
          </div>
        </div>

        <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 self-start sm:self-auto font-medium">
          Do not assume quiet areas are safe
        </div>
      </div>

      {/* Grid of Blind Spot Neighborhood Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
        {blindSpotZones.slice(0, 3).map((zone) => {
          const isCriticalExposure = zone.floodExposureLevel === 'critical';
          const isSevereBlindSpot = zone.reportingCoverage < 25;

          return (
            <div
              key={zone.id}
              className={`p-4 rounded-xl border transition-all ${
                isSevereBlindSpot
                  ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/40'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {zone.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">{zone.area}</p>
                </div>
                <StatusBadge
                  status={zone.suggestedVerificationStatus}
                  size="sm"
                />
              </div>

              {/* Coverage & Exposure Metrics */}
              <div className="space-y-2 py-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Reporting Coverage:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          zone.reportingCoverage < 20 ? 'bg-red-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${zone.reportingCoverage}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      {zone.reportingCoverage}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Unreachable Households:</span>
                  <span className="font-mono font-bold text-amber-700">
                    ~{zone.unreachableHouseholds} homes
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Last Telemetry Check:</span>
                  <span className="text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {zone.lastContactTime}
                  </span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onDispatchVerification?.(zone.name)}
                className="w-full mt-2 py-1.5 px-3 rounded-lg bg-white hover:bg-amber-100/70 border border-slate-200 hover:border-amber-300 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                <span>Assign Ground Verification</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
