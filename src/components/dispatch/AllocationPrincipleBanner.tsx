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
    <div className="bg-[#252A30] text-[#F7F6F2] rounded-2xl p-4 sm:p-5 border border-[#343B43] shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side: Icon & Title */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#343B43] text-[#F7F6F2] border border-[#404852] shrink-0 shadow-2xs">
            <Scale className="w-5 h-5 text-[#EDF1F5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#92979D]">
                Core Allocation Doctrine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#343B43] text-[#F7F6F2] font-mono font-bold border border-[#536A82]/50">
                Life Safety First
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#F7F6F2] mt-0.5">
              &ldquo;Life safety, medical criticality, and timely intervention dictate rescue order. Financial cost serves solely as a secondary tie-breaker.&rdquo;
            </p>
          </div>
        </div>

        {/* Right side: Action badge & expand toggle */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <div className="text-[11px] text-[#F7F6F2] bg-[#343B43] px-3 py-1.5 rounded-lg border border-[#404852] flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#377D65]" />
            <span>Deterministic Triage Active</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[#92979D] hover:text-[#F7F6F2] hover:bg-[#343B43] transition-colors"
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
        <div className="mt-4 pt-4 border-t border-[#343B43] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 rounded-xl bg-[#1E2227] border border-[#343B43] space-y-1">
            <div className="flex items-center gap-1.5 text-[#F7F6F2] font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-[#343B43] flex items-center justify-center text-[10px] font-mono">1</span>
              <span>Life-Threat Assessment</span>
            </div>
            <p className="text-[11px] text-[#92979D]">
              Categorize by flood depth (0–3), medical urgency, and elderly/children trapped.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#1E2227] border border-[#343B43] space-y-1">
            <div className="flex items-center gap-1.5 text-[#A87426] font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-[#A87426]/20 flex items-center justify-center text-[10px] font-mono">2</span>
              <span>Harm Threshold (ETA)</span>
            </div>
            <p className="text-[11px] text-[#92979D]">
              Simulated arrival must precede estimated time to harm. Flag cases risking late arrival.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#1E2227] border border-[#343B43] space-y-1">
            <div className="flex items-center gap-1.5 text-[#536A82] font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-[#536A82]/20 flex items-center justify-center text-[10px] font-mono">3</span>
              <span>Mandatory Capability</span>
            </div>
            <p className="text-[11px] text-[#92979D]">
              Verify single-team capacity $\ge$ victim count, plus flood & paramedic readiness.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#1E2227] border border-[#343B43] space-y-1">
            <div className="flex items-center gap-1.5 text-[#377D65] font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-[#377D65]/20 flex items-center justify-center text-[10px] font-mono">4</span>
              <span>Secondary Cost Tie-Break</span>
            </div>
            <p className="text-[11px] text-[#92979D]">
              Compare fuel & consumable rate only between teams of equivalent timeliness.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
