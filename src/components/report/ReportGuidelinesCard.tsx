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
    <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-[#EDF1F5] text-[#536A82] border border-[#E8E6E1]">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-[#252A30]">
          Reporting Protocol & Verification
        </h3>
      </div>

      <div className="space-y-3 pt-1 text-xs">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1]">
          <Clock className="w-4 h-4 text-[#757B81] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#252A30] block">Indicate Time of Last Sighting</strong>
            <span className="text-[#757B81]">
              Flood conditions evolve rapidly. State clearly when you last witnessed the location.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1]">
          <Compass className="w-4 h-4 text-[#757B81] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#252A30] block">Provide Distinct Landmarks</strong>
            <span className="text-[#757B81]">
              Street signs are submerged under water. Reference mosques, bridges, or high-rise water tanks.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFF2DD] border border-[#A87426]/30 text-[#A87426]">
          <AlertCircle className="w-4 h-4 text-[#A87426] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#A87426] block font-semibold">Distinguish Known from Unverified</strong>
            <span className="text-[#A87426]/90">
              Second-hand social media reports must be marked as unverified so volunteers can cross-verify before allocating heavy craft.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1]">
          <HelpCircle className="w-4 h-4 text-[#757B81] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#252A30] block">Unknown Information</strong>
            <span className="text-[#757B81]">
              Leave victim counts or coordinates blank if unsure. The system treats missing fields as explicit unknowns rather than zero danger.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
