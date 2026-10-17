'use client';

import React from 'react';
import { ShieldCheck, Scale, AlertCircle } from 'lucide-react';

export function AllocationPrincipleBanner() {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-[#17263D] text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/30 shrink-0">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Core Allocation Doctrine
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
              Life Safety First
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-0.5">
            "Life safety and timely response come first. Cost is evaluated only when comparing similarly effective rescue options."
          </p>
        </div>
      </div>

      <div className="text-[11px] text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 shrink-0 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
        <span>Strict Triage Priority</span>
      </div>
    </div>
  );
}
