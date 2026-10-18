'use client';

import React, { useEffect, useState } from 'react';
import { ZoneAnalytics } from '@/lib/dashboard/types';
import { getSimulatedMinutesToImpact } from '@/lib/dashboard/helpers';
import {
  Waves,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface FloodTimelineSliderProps {
  zones: ZoneAnalytics[];
  simulationMinutes: number;
  onSimulationChange: (minutes: number) => void;
  onReset: () => void;
  className?: string;
}

export function FloodTimelineSlider({
  zones,
  simulationMinutes,
  onSimulationChange,
  onReset,
  className = '',
}: FloodTimelineSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdviceDetails, setShowAdviceDetails] = useState(false);

  // Auto-progression when "Auto Advance" is engaged
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        onSimulationChange(simulationMinutes >= 180 ? 0 : simulationMinutes + 15);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simulationMinutes, onSimulationChange]);

  // Derived zone impacts at current simulation offset
  const zoneImpacts = zones.map((z) => {
    const remaining = getSimulatedMinutesToImpact(z.minutes_to_impact, simulationMinutes);
    return {
      ...z,
      remainingMinutes: remaining,
      isImpacted: remaining !== null && remaining <= 0,
    };
  });

  const nextImpactZone = [...zoneImpacts]
    .filter((z) => z.remainingMinutes !== null && z.remainingMinutes > 0)
    .sort((a, b) => (a.remainingMinutes! - b.remainingMinutes!))[0];

  const impactedZones = zoneImpacts.filter((z) => z.isImpacted);

  const presetSteps = [
    { minutes: 0, label: 'T+0m', desc: 'Baseline' },
    { minutes: 30, label: 'T+30m', desc: 'Zone B Crest' },
    { minutes: 45, label: 'T+45m', desc: 'Zone A Inflow' },
    { minutes: 90, label: 'T+90m', desc: 'Corridor Cut' },
    { minutes: 180, label: 'T+180m', desc: 'Zone C Influx' },
  ];

  return (
    <div className={`bg-white rounded-xl border border-[#E4E8EC] shadow-xs p-3.5 space-y-2.5 ${className}`}>
      {/* Header bar: Title + Simulation Flag + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F0F4F8] text-[#375A6B] border border-[#E4E8EC] shrink-0">
            <Waves className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-[#18232D] tracking-tight">
              Flood Simulation
            </h3>
            <span className="font-mono text-[11px] font-bold text-[#375A6B] bg-[#F0F4F8] px-2 py-0.5 rounded-md border border-[#375A6B]/20">
              +{simulationMinutes}m
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#FFF5E6] text-[#A87528] border border-[#A87528]/25 font-bold hidden sm:inline">
              Forecast Model
            </span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[#FFF5E6] text-[#A87528] border-[#A87528]/40 shadow-xs'
                : 'bg-[#F7F8FA] text-[#18232D] border-[#E4E8EC] hover:bg-[#F0F4F8]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Auto Advance</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              onReset();
            }}
            disabled={simulationMinutes === 0}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-white border border-[#E4E8EC] text-[#5F6B7A] hover:text-[#BC414A] hover:border-[#BC414A]/30 hover:bg-[#FBECEE] transition-colors disabled:opacity-40 disabled:hover:text-[#5F6B7A] disabled:hover:bg-white cursor-pointer"
            title="Reset simulation to baseline T+0m"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Slider Input & Step Presets */}
      <div className="space-y-1.5">
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="180"
            step="5"
            value={simulationMinutes}
            onChange={(e) => {
              setIsPlaying(false);
              onSimulationChange(parseInt(e.target.value, 10));
            }}
            className="w-full h-1.5 bg-[#E4E8EC] rounded-lg appearance-none cursor-pointer accent-[#375A6B] focus:outline-none focus:ring-1 focus:ring-[#375A6B]"
          />
        </div>

        {/* Compact preset step buttons */}
        <div className="grid grid-cols-5 gap-1">
          {presetSteps.map((step) => {
            const isCurrent = Math.abs(simulationMinutes - step.minutes) < 15;
            return (
              <button
                key={step.minutes}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  onSimulationChange(step.minutes);
                }}
                className={`py-1 px-1 rounded-md text-center border transition-all text-[10px] cursor-pointer ${
                  isCurrent
                    ? 'border-[#375A6B] bg-[#F0F4F8] text-[#18232D] font-bold shadow-xs'
                    : 'border-[#E4E8EC] bg-[#F7F8FA] hover:bg-[#F0F4F8] text-[#5F6B7A] font-medium'
                }`}
              >
                <span className="font-mono block">{step.label}</span>
                <span className="text-[9px] text-[#5F6B7A] block truncate hidden sm:block">{step.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Zone Countdown Chips & Inline Recommendation */}
      <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-t border-[#E4E8EC] text-xs">
        {/* Zone countdown chips */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-semibold text-[#5F6B7A]">Surge ETA:</span>
          {zoneImpacts.map((zone) => {
            const isImpacted = zone.isImpacted;
            const isUrgent = zone.remainingMinutes !== null && zone.remainingMinutes <= 30;

            return (
              <span
                key={zone.id}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                  isImpacted
                    ? 'bg-[#FBECEE] text-[#BC414A] border-[#BC414A]/30'
                    : isUrgent
                    ? 'bg-[#FFF5E6] text-[#A87528] border-[#A87528]/30'
                    : 'bg-[#F7F8FA] text-[#18232D] border-[#E4E8EC]'
                }`}
                title={`Zone ${zone.name}: Risk Tier ${zone.flood_risk}`}
              >
                <span className="font-sans font-medium">{zone.name.replace('Zone ', '')}:</span>
                <span>
                  {zone.remainingMinutes === null
                    ? '—'
                    : isImpacted
                    ? 'Impacted'
                    : `${zone.remainingMinutes}m`}
                </span>
              </span>
            );
          })}
        </div>

        {/* Compact operational advisory trigger */}
        <button
          type="button"
          onClick={() => setShowAdviceDetails(!showAdviceDetails)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5F6B7A] hover:text-[#18232D] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-[#375A6B]" />
          <span>Operational Advisory</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdviceDetails ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expandable Advisory Drawer */}
      {showAdviceDetails && (
        <div className="p-2.5 rounded-lg bg-[#18232D] text-white text-xs space-y-1 animate-in fade-in duration-150 border border-[#273642]">
          <div className="flex items-center justify-between font-semibold text-[#F0F4F8]">
            <span className="text-[11px]">Intervention Advisory (T+{simulationMinutes}m)</span>
            <span className="text-[9px] text-[#5F6B7A] font-mono uppercase">Simulation Drill Only</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {impactedZones.length > 0 ? (
              <>
                <strong className="text-[#BC414A]">{impactedZones.map((z) => z.name).join(', ')}</strong> has reached surge inundation. Ensure all land craft redirect to high-ground evacuation points.
              </>
            ) : nextImpactZone ? (
              <>
                Water surge projected to reach <strong className="text-white">{nextImpactZone.name}</strong> in <strong className="text-[#A87528] font-mono">{nextImpactZone.remainingMinutes} min</strong>. Prioritize door-to-door welfare checks for offline homes.
              </>
            ) : (
              'All monitored sectors are operating within baseline threshold limits.'
            )}
          </p>
        </div>
      )}
    </div>
  );
}
