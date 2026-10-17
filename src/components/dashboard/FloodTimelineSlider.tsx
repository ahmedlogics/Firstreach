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
    <div className={`bg-white rounded-xl border border-[#E2E8F0] shadow-subtle p-3.5 sm:p-4 space-y-3 ${className}`}>
      {/* Header bar: Title + Time Badge + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-[#14B8A6] border border-teal-100 shrink-0">
            <Waves className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
              Flood Simulation
            </h3>
            <span className="font-mono text-xs font-bold text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
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
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:hover:text-slate-600 disabled:hover:bg-white"
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
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#14B8A6] focus:outline-none focus:ring-1 focus:ring-[#14B8A6]"
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
                    ? 'border-[#14B8A6] bg-teal-50 text-teal-900 font-bold ring-1 ring-[#14B8A6]'
                    : 'border-slate-100 bg-slate-50/70 hover:bg-slate-100 text-slate-600 font-medium'
                }`}
              >
                <span className="font-mono block">{step.label}</span>
                <span className="text-[9px] text-slate-400 block truncate">{step.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Zone Countdown Chips & Inline Recommendation */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 text-xs">
        {/* Zone countdown chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500">Zone ETA:</span>
          {zoneImpacts.map((zone) => {
            const isImpacted = zone.isImpacted;
            const isUrgent = zone.remainingMinutes !== null && zone.remainingMinutes <= 30;

            return (
              <span
                key={zone.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold border ${
                  isImpacted
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : isUrgent
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
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
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-3 h-3 text-teal-500" />
          <span>Operational Advisory</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdviceDetails ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expandable Advisory Drawer / Notice */}
      {showAdviceDetails && (
        <div className="p-3 rounded-lg bg-slate-900 text-white text-xs space-y-1 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-semibold text-teal-300">
            <span>Intervention Advisory (T+{simulationMinutes}m)</span>
            <span className="text-[10px] text-slate-400 font-normal">Forecast Only</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {impactedZones.length > 0 ? (
              <>
                <strong className="text-red-400">{impactedZones.map((z) => z.name).join(', ')}</strong> has reached surge inundation. Ensure all deployed land vehicles reroute to high ground.
              </>
            ) : nextImpactZone ? (
              <>
                Water surge projected to reach <strong className="text-teal-300">{nextImpactZone.name}</strong> in <strong className="text-amber-300 font-mono">{nextImpactZone.remainingMinutes} min</strong>. Prioritize preventive evacuation for elderly and mobility-impaired residents.
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
