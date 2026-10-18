'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface TriageCase {
  id: string;
  title: string;
  location: string;
  waterLevel: string;
  score: number;
  urgency: 'CRITICAL' | 'URGENT' | 'MONITORING';
  assignedUnit: string;
  eta: string;
  timeToHarm: string;
  details: string;
  doctrineTag: string;
}

const CASES: TriageCase[] = [
  {
    id: 'case-1',
    title: 'Trapped Family w/ Infant & Elder',
    location: 'Sector 4-B, East Bund Area',
    waterLevel: '1.4m rising fast',
    score: 96,
    urgency: 'CRITICAL',
    assignedUnit: 'Zodiac Rescue Craft Z-03 (Capacity 6)',
    eta: '11 mins',
    timeToHarm: '28 mins',
    details: 'Ground floor submerged. Water reaching first floor landing. Medical supply kit aboard craft.',
    doctrineTag: 'Immediate Life-Threat Rule',
  },
  {
    id: 'case-2',
    title: 'Isolated Dialysis Patient',
    location: 'Sector 2, Green Enclave Block D',
    waterLevel: '0.8m standing',
    score: 91,
    urgency: 'CRITICAL',
    assignedUnit: 'Paramedic Amphibious Unit A-01',
    eta: '16 mins',
    timeToHarm: '45 mins',
    details: 'Power grid collapsed; dialysis machine backup battery below 15%. Direct hospital route cleared.',
    doctrineTag: 'Medical Criticality Window',
  },
  {
    id: 'case-3',
    title: 'Silent Household Cluster (Zero Comms)',
    location: 'Sector 7, Non-Smartphone Village',
    waterLevel: '1.1m inundated',
    score: 84,
    urgency: 'URGENT',
    assignedUnit: 'Field Patrol Squad FP-08',
    eta: '22 mins',
    timeToHarm: '60 mins',
    details: 'Cell tower blackout detected. Dispatched door-to-door physical verification patrol before craft.',
    doctrineTag: 'Equity Outreach Protocol',
  },
];

export function HeroLivePreview() {
  const [selectedCase, setSelectedCase] = useState<TriageCase>(CASES[0]);

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 rounded-2xl bg-white border border-[#E8E6E1] shadow-card-hover overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div className="bg-[#252A30] text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#343B43]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#377D65] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#377D65]"></span>
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
              Live Algorithmic Dispatch Preview
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-mono ml-2">
              &bull; 26 ACTIVE MISSIONS &bull; 100% AUDIT
            </span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="text-xs font-semibold text-[#EDF1F5] hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Launch Full Command Console</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Case Selector Tabs */}
      <div className="bg-[#F7F6F2] border-b border-[#E8E6E1] p-2 flex gap-2 overflow-x-auto no-scrollbar">
        {CASES.map((item, idx) => {
          const isSelected = selectedCase.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedCase(item)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-white text-[#252A30] shadow-sm border border-[#E8E6E1] translate-y-[-1px]'
                  : 'text-[#757B81] hover:text-[#252A30] hover:bg-white/60'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.urgency === 'CRITICAL' ? 'bg-[#B74349]' : 'bg-[#A87426]'
                }`}
              />
              <span>Scenario {idx + 1}: {item.title.split(' ')[0]}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#EDF1F5] text-[#536A82]">
                Score {item.score}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Display */}
      <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-linear-to-b from-white to-[#FDFDFD]">
        {/* Left Column: Case Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#536A82] font-semibold">
                INCIDENT TELEMETRY &bull; {selectedCase.location}
              </span>
              <h3 className="text-lg font-bold text-[#252A30] mt-0.5">
                {selectedCase.title}
              </h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                selectedCase.urgency === 'CRITICAL'
                  ? 'bg-[#FAE8E7] text-[#B74349] border border-[#F5D3D2]'
                  : 'bg-[#FFF2DD] text-[#A87426] border border-[#F9E2BE]'
              }`}
            >
              {selectedCase.urgency} DISPATCH
            </span>
          </div>

          <p className="text-xs text-[#757B81] leading-relaxed">
            {selectedCase.details}
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1]/80">
              <span className="text-[10px] font-mono uppercase text-[#757B81] block">
                Water Depth
              </span>
              <span className="text-sm font-bold text-[#252A30] font-mono mt-0.5 block">
                {selectedCase.waterLevel}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1]/80">
              <span className="text-[10px] font-mono uppercase text-[#757B81] block">
                Rescue ETA
              </span>
              <span className="text-sm font-bold text-[#377D65] font-mono mt-0.5 block">
                {selectedCase.eta}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1]/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-[#757B81] block">
                Harm Window
              </span>
              <span className="text-sm font-bold text-[#B74349] font-mono mt-0.5 block">
                {selectedCase.timeToHarm}
              </span>
            </div>
          </div>

          {/* Allocation Reason */}
          <div className="p-3.5 rounded-xl bg-[#EDF1F5]/60 border border-[#536A82]/15 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#536A82] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-[#252A30]">
                Triage Doctrine Applied: {selectedCase.doctrineTag}
              </span>
              <p className="text-[#757B81] mt-0.5">
                Arrival time ({selectedCase.eta}) is well within safety threshold ({selectedCase.timeToHarm}). Vehicle capability strictly verified.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Priority Gauge & Unit Card */}
        <div className="lg:col-span-1 bg-[#F7F6F2] p-5 rounded-xl border border-[#E8E6E1] flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#757B81]">
              Algorithmic Urgency Index
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold text-[#252A30] font-mono tracking-tight">
                {selectedCase.score}
              </span>
              <span className="text-xs text-[#757B81] font-mono">/ 100 max</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#E8E6E1] overflow-hidden mt-3">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out bg-linear-to-r from-[#A87426] via-[#B74349] to-[#8C1D24]"
                style={{ width: `${selectedCase.score}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-[#E8E6E1] pt-3">
            <span className="text-[10px] font-mono uppercase text-[#757B81] block">
              Auto-Matched Resource
            </span>
            <div className="p-2.5 rounded-lg bg-white border border-[#E8E6E1] shadow-2xs">
              <div className="text-xs font-bold text-[#252A30]">
                {selectedCase.assignedUnit}
              </div>
              <div className="text-[10px] text-[#377D65] font-semibold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>En Route &bull; Verified Suitability</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
