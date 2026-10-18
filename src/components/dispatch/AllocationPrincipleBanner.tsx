'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function AllocationPrincipleBanner() {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-[#E8E6E1] text-xs shadow-2xs">
      <div className="flex items-center gap-2.5">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/20 uppercase tracking-wide">
          Life Safety First
        </span>
        <span className="text-[#757B81] hidden sm:inline">
          Life safety, medical criticality, and timely intervention dictate rescue order. Financial cost serves solely as a secondary factor.
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#377D65] shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>Deterministic Triage Active</span>
      </div>
    </div>
  );
}
