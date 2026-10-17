'use client';

import React from 'react';
import {
  Clock,
  RotateCcw,
  Waves,
  AlertTriangle,
  Play,
  Pause,
  ChevronRight,
} from 'lucide-react';

interface FloodProgressionTimelineProps {
  currentHour: number;
  onHourChange: (hour: number) => void;
  onReset: () => void;
}

export function FloodProgressionTimeline({
  currentHour,
  onHourChange,
  onReset,
}: FloodProgressionTimelineProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Auto-simulation interval
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        onHourChange(currentHour >= 4 ? 0 : currentHour + 1);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentHour, onHourChange]);

  const milestones = [
    { hour: 0, label: 'T+0h', title: 'Breach Detected', desc: 'Malir & Lyari alert trigger', water: '0.4m avg' },
    { hour: 1, label: 'T+1h', title: 'Spillway Influx', desc: 'Surjani lowlands submerge', water: '1.2m avg' },
    { hour: 2, label: 'T+2h', title: 'Crest Warning', desc: 'Alleyway vehicle cutoff', water: '2.1m avg' },
    { hour: 3, label: 'T+3h', title: 'Peak Inundation', desc: 'Ground floors inundated', water: '2.8m avg' },
    { hour: 4, label: 'T+4h', title: 'Critical Stagnation', desc: 'Structural failure risk', water: '3.4m peak' },
  ];

  const currentMilestone = milestones[currentHour] || milestones[0];

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4">
      {/* Top Header with simulation badge and reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-[#14B8A6] border border-teal-100">
            <Waves className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Flood Progression Simulation
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                Interactive Model
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Simulate dynamic river surge impact across Karachi drainage basins to forecast time-to-harm.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isPlaying
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Sim</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onReset();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
            title="Reset simulation to initial breach state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (T+0h)</span>
          </button>
        </div>
      </div>

      {/* Interactive Slider Input */}
      <div className="pt-2 pb-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={currentHour}
            onChange={(e) => {
              setIsPlaying(false);
              onHourChange(parseInt(e.target.value, 10));
            }}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        {/* Milestone Steps Markers */}
        <div className="grid grid-cols-5 gap-1 mt-3">
          {milestones.map((m) => {
            const isSelected = m.hour === currentHour;
            const isPast = m.hour < currentHour;

            return (
              <button
                key={m.hour}
                onClick={() => {
                  setIsPlaying(false);
                  onHourChange(m.hour);
                }}
                className={`text-left p-2 rounded-xl transition-all border ${
                  isSelected
                    ? 'bg-teal-50/80 border-[#14B8A6] ring-1 ring-[#14B8A6]'
                    : isPast
                    ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-[#0D9488]' : 'text-slate-700'}`}>
                    {m.label}
                  </span>
                  <span className="text-[10px] tabular-nums text-slate-400 hidden sm:inline">
                    {m.water}
                  </span>
                </div>
                <div className={`text-[11px] font-semibold truncate ${isSelected ? 'text-[#0F172A]' : 'text-slate-600'}`}>
                  {m.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Hour Status Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-[#14B8A6] flex items-center justify-center font-mono font-bold text-sm shrink-0">
            +{currentHour}h
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{currentMilestone.title}</span>
              <span className="text-[11px] text-teal-300 font-mono">
                Avg depth: {currentMilestone.water}
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5">
              {currentMilestone.desc} • Estimated crest time: <span className="text-amber-300 font-semibold">{Math.max(0, 3.5 - currentHour * 0.8).toFixed(1)} hours remaining</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4 text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Fictional simulation timeline</span>
        </div>
      </div>
    </div>
  );
}
