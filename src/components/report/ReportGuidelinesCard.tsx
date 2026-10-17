'use client';

import React from 'react';
import {
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Clock,
  Compass,
} from 'lucide-react';

export function ReportGuidelinesCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-teal-50 text-[#14B8A6] border border-teal-100">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">
          Reporting Protocol & Verification
        </h3>
      </div>

      <p className="text-xs text-[#64748B] leading-relaxed">
        FirstReach uses algorithmic triage to prioritize calls based on immediate danger to life. Accurate reports ensure limited boats and paramedics reach the most critical cases first.
      </p>

      <div className="space-y-3 pt-1 text-xs">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800 block">Indicate Time of Last Sighting</strong>
            <span className="text-slate-500">
              Flood conditions evolve rapidly. State clearly when you last witnessed the location.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <Compass className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800 block">Provide Distinct Landmarks</strong>
            <span className="text-slate-500">
              Street signs are submerged under water. Reference mosques, bridges, or high-rise water tanks.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-900 block font-semibold">Distinguish Known from Unverified</strong>
            <span className="text-amber-800/90">
              Second-hand social media reports must be marked as unverified so volunteers can cross-verify before allocating heavy craft.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
