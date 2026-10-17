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
  Clock,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Info,
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

  // Auto-progression when "Auto Play" is engaged
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        onSimulationChange(simulationMinutes >= 180 ? 0 : simulationMinutes + 15);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simulationMinutes, onSimulationChange]);

  // Find the most critical imminent zone at current simulation offset
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
    { minutes: 0, label: 'T+0m', sub: 'Breach Origin' },
    { minutes: 30, label: 'T+30m', sub: 'Zone B Crest' },
    { minutes: 45, label: 'T+45m', sub: 'Zone A Inundation' },
    { minutes: 90, label: 'T+90m', sub: 'Corridor Cutoff' },
    { minutes: 180, label: 'T+180m', sub: 'Zone C Influx' },
  ];

  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-5 ${className}`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-[#14B8A6] border border-teal-100 shrink-0">
            <Waves className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Flood Progression Simulation
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                Simulated Forecasting
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Simulate water surge advance (0 to 180 min) to evaluate evacuation windows before spillways crest.
            </p>
          </div>
        </div>

        {/* Player Controls & Reset */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isPlaying
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto Advance</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onReset();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shadow-2xs"
            title="Reset simulation to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (T+0m)</span>
          </button>
        </div>
      </div>

      {/* Main Slider Input */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">
            Timeline Advance Offset:
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-extrabold text-[#0D9488] bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
              +{simulationMinutes} minutes ({Math.floor(simulationMinutes / 60)}h {simulationMinutes % 60}m)
            </span>
          </div>
        </div>

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
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        {/* Step markers */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {presetSteps.map((step) => {
            const isCurrent = Math.abs(simulationMinutes - step.minutes) < 15;
            return (
              <button
                key={step.minutes}
                onClick={() => {
                  setIsPlaying(false);
                  onSimulationChange(step.minutes);
                }}
                className={`p-2 rounded-xl text-left border transition-all ${
                  isCurrent
                    ? 'border-[#14B8A6] bg-teal-50/60 ring-1 ring-[#14B8A6]'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-500'
                }`}
              >
                <span className="font-mono font-bold text-xs block text-slate-800">
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">
                  {step.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Zone Countdown Cards at Current Simulation Offset */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Estimated Zone Impact Countdowns:</span>
          <span className="text-[11px] text-slate-400 font-normal">
            Derived from database <code className="bg-slate-100 px-1 py-0.5 rounded">minutes_to_impact</code>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {zoneImpacts.map((zone) => {
            const isImpacted = zone.isImpacted;

            return (
              <div
                key={zone.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isImpacted
                    ? 'bg-red-50/70 border-red-300 ring-1 ring-red-300'
                    : zone.remainingMinutes !== null && zone.remainingMinutes <= 30
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-xs font-bold text-slate-900">{zone.name}</strong>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                    zone.flood_risk === 3 ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    Risk Tier {zone.flood_risk}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-slate-500">Remaining to Influx:</span>
                  <span className={`font-mono text-sm font-bold tabular-nums ${
                    isImpacted
                      ? 'text-red-700 animate-pulse'
                      : zone.remainingMinutes !== null && zone.remainingMinutes <= 30
                      ? 'text-amber-700'
                      : 'text-slate-700'
                  }`}>
                    {zone.remainingMinutes === null
                      ? 'Unknown'
                      : isImpacted
                      ? 'CRITICAL IMPACT'
                      : `${zone.remainingMinutes} min`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Early-Intervention Intelligence Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-[#14B8A6] flex items-center justify-center font-bold text-sm shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Early Intervention Recommendation</span>
              <span className="text-[10px] font-mono text-teal-400">T+{simulationMinutes}m</span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
              {impactedZones.length > 0 ? (
                <>
                  <strong className="text-red-400 font-semibold">{impactedZones.map((z) => z.name).join(', ')}</strong> has reached flood crest impact in this simulation. Ensure all non-boat dispatches are rerouted.
                </>
              ) : nextImpactZone ? (
                <>
                  Water surge projected to reach <strong className="text-teal-300 font-semibold">{nextImpactZone.name}</strong> in <strong className="text-amber-300 font-mono font-bold">{nextImpactZone.remainingMinutes} minutes</strong>. Prioritize high-clearance truck and preventive elder evacuation before roads become impassable.
                </>
              ) : (
                'All monitored sectors operating within baseline threshold.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Local simulation only; database fields remain unchanged.</span>
        </div>
      </div>
    </div>
  );
}
