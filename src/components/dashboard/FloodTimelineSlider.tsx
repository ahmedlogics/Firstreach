'use client';

import React, { useEffect, useState } from 'react';
import { ZoneAnalytics } from '@/lib/dashboard/types';
import { getSimulatedMinutesToImpact } from '@/lib/dashboard/helpers';
import {
  Waves,
  RotateCcw,
  Play,
  Pause,
  AlertTriangle,
  Sparkles,
  Info,
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

  // Derived zone impacts at current simulation offset (preserves calculation logic)
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
    <div className={`bg-white rounded-xl border border-[#E8E6E1] shadow-subtle p-3.5 sm:p-4 space-y-3 ${className}`}>
      {/* Header bar: Title + Time Badge + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EDF1F5] text-[#536A82] border border-[#E8E6E1] shrink-0">
            <Waves className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#252A30] tracking-tight">
              Flood Simulation
            </h3>
            <span className="font-mono text-xs font-bold text-[#536A82] bg-[#EDF1F5] px-2 py-0.5 rounded-md border border-[#536A82]/30">
              +{simulationMinutes}m
            </span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isPlaying
                ? 'bg-[#FFF2DD] text-[#A87426] border-[#A87426]/40'
                : 'bg-[#F7F6F2] text-[#252A30] border-[#E8E6E1] hover:bg-[#EDF1F5]'
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
            onClick={() => {
              setIsPlaying(false);
              onReset();
            }}
            disabled={simulationMinutes === 0}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-white border border-[#E8E6E1] text-[#757B81] hover:text-[#B74349] hover:border-[#B74349]/30 hover:bg-[#FAE8E7] transition-colors disabled:opacity-40 disabled:hover:text-[#757B81] disabled:hover:bg-white"
            title="Reset simulation to T+0m"
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
            className="w-full h-2 bg-[#E8E6E1] rounded-lg appearance-none cursor-pointer accent-[#536A82] focus:outline-none focus:ring-1 focus:ring-[#536A82]"
          />
        </div>

        {/* Compact preset step buttons */}
        <div className="grid grid-cols-5 gap-1 pt-0.5">
          {presetSteps.map((step) => {
            const isCurrent = Math.abs(simulationMinutes - step.minutes) < 15;
            return (
              <button
                key={step.minutes}
                onClick={() => {
                  setIsPlaying(false);
                  onSimulationChange(step.minutes);
                }}
                className={`py-1 px-1.5 rounded-lg text-center border transition-all text-[11px] ${
                  isCurrent
                    ? 'border-[#536A82] bg-[#EDF1F5] text-[#252A30] font-bold ring-1 ring-[#536A82]'
                    : 'border-[#E8E6E1] bg-[#F7F6F2] hover:bg-[#EDF1F5] text-[#757B81] font-medium'
                }`}
              >
                <span className="font-mono block">{step.label}</span>
                <span className="text-[9px] text-[#92979D] block truncate">{step.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Zone Countdown Chips & Inline Recommendation */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#E8E6E1] text-xs">
        {/* Zone countdown chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#757B81]">Zone ETA:</span>
          {zoneImpacts.map((zone) => {
            const isImpacted = zone.isImpacted;
            const isUrgent = zone.remainingMinutes !== null && zone.remainingMinutes <= 30;

            return (
              <span
                key={zone.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold border ${
                  isImpacted
                    ? 'bg-[#FAE8E7] text-[#B74349] border-[#B74349]/30'
                    : isUrgent
                    ? 'bg-[#FFF2DD] text-[#A87426] border-[#A87426]/30'
                    : 'bg-[#F7F6F2] text-[#252A30] border-[#E8E6E1]'
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

        {/* Compact early intervention trigger */}
        <button
          onClick={() => setShowAdviceDetails(!showAdviceDetails)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#757B81] hover:text-[#252A30] transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-3 h-3 text-[#536A82]" />
          <span>Operational Advisory</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdviceDetails ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expandable Advisory Drawer / Notice */}
      {showAdviceDetails && (
        <div className="p-3 rounded-lg bg-[#252A30] text-white text-xs space-y-1 animate-in fade-in duration-150 border border-[#343B43]">
          <div className="flex items-center justify-between font-semibold text-[#EDF1F5]">
            <span>Intervention Advisory (T+{simulationMinutes}m)</span>
            <span className="text-[10px] text-[#92979D] font-normal">Forecast Only</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {impactedZones.length > 0 ? (
              <>
                <strong className="text-[#B74349]">{impactedZones.map((z) => z.name).join(', ')}</strong> has reached surge inundation. Ensure all deployed land vehicles reroute to high ground.
              </>
            ) : nextImpactZone ? (
              <>
                Water surge projected to reach <strong className="text-[#EDF1F5]">{nextImpactZone.name}</strong> in <strong className="text-[#A87426] font-mono">{nextImpactZone.remainingMinutes} min</strong>. Prioritize preventive evacuation for elderly and mobility-impaired residents.
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
