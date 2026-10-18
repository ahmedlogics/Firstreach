'use client';

import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Clock,
  Coins,
  ShieldAlert,
} from 'lucide-react';

export function AllocationPrincipleBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#111C2E] to-[#17263D] text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-card transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side: Icon & Title */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/30 shrink-0 shadow-xs">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                Core Allocation Doctrine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono font-bold border border-teal-500/30">
                Life Safety First
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-200 mt-0.5">
              &ldquo;Life safety, medical criticality, and timely intervention dictate rescue order. Financial cost serves solely as a secondary tie-breaker.&rdquo;
            </p>
          </div>
        </div>

        {/* Right side: Action badge & expand toggle */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <div className="text-[11px] text-slate-300 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>Deterministic Triage Active</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Collapse doctrine hierarchy' : 'View triage hierarchy'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Hierarchical Decision Framework */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-teal-400 font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px] font-mono">1</span>
              <span>Life-Threat Assessment</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Categorize by flood depth (0–3), medical urgency, and elderly/children trapped.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-mono">2</span>
              <span>Harm Threshold (ETA)</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Simulated arrival must precede estimated time to harm. Flag cases risking late arrival.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-mono">3</span>
              <span>Mandatory Capability</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Verify single-team capacity $\ge$ victim count, plus flood & paramedic readiness.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-mono">4</span>
              <span>Secondary Cost Tie-Break</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Compare fuel & consumable rate only between teams of equivalent timeliness.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
