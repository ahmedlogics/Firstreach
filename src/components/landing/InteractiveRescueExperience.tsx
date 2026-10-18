'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Navigation,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  HeartPulse,
  Users,
  Anchor,
  Sparkles,
  ArrowRight,
  Check,
  RefreshCw,
} from 'lucide-react';

type SimStage = 1 | 2 | 3 | 4;

interface StageMetadata {
  id: SimStage;
  number: string;
  tabLabel: string;
  badge: string;
  title: string;
  summary: string;
}

const STAGES: StageMetadata[] = [
  {
    id: 1,
    number: '01',
    tabLabel: 'Incident Intake',
    badge: 'Stage 1 — Distress Intake',
    title: 'Emergency report received via proxy neighbor',
    summary: 'A neighbor reports an elderly resident and young family trapped as street water enters the residence.',
  },
  {
    id: 2,
    number: '02',
    tabLabel: 'Triage Scoring',
    badge: 'Stage 2 — Algorithmic Assessment',
    title: 'Life-safety prioritization evaluates acute danger',
    summary: 'Triage engine assesses flood depth, trapped status, and insulin dependency to assign urgent priority.',
  },
  {
    id: 3,
    number: '03',
    tabLabel: 'Resource Matching',
    badge: 'Stage 3 — Recommendation',
    title: 'Optimal rescue craft and medical capability paired',
    summary: 'System identifies nearest inflatable motorized raft with paramedic equipment and adequate capacity.',
  },
  {
    id: 4,
    number: '04',
    tabLabel: 'Mission Tracking',
    badge: 'Stage 4 — Operational Tracking',
    title: 'Mission lifecycle tracked through shelter arrival',
    summary: 'Responders navigate flooded streets, evacuate all 4 residents, and confirm safe arrival at shelter.',
  },
];

export function InteractiveRescueExperience() {
  const [activeStage, setActiveStage] = useState<SimStage>(1);

  const currentStageMeta = STAGES.find((s) => s.id === activeStage) || STAGES[0];

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-[#EAF0F4]/80 border border-[#375A6B]/20 text-[#375A6B]">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#375A6B] animate-pulse" />
          <span>SCENARIO PREVIEW: Family Trapped in Rapidly Inundating Ground Floor</span>
        </div>
        <span className="text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-white/80 border border-[#375A6B]/20 text-[#18232D]">
          Fictional Simulation &bull; Zero Operational Writes
        </span>
      </div>

      {/* Stage Progress Stepper Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {STAGES.map((stage) => {
          const isActive = activeStage === stage.id;
          const isPassed = activeStage > stage.id;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveStage(stage.id)}
              className={`p-3.5 sm:p-4 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-[#18232D] text-white border-[#18232D] shadow-sm'
                  : 'bg-white text-[#18232D] border-[#E4E8EC] hover:border-[#375A6B]/40 hover:bg-[#F7F8FA]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[11px] font-mono font-bold tracking-wider ${
                    isActive ? 'text-[#D9E1E6]' : isPassed ? 'text-[#258167]' : 'text-[#6B7782]'
                  }`}
                >
                  {isPassed ? (
                    <span className="inline-flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{stage.number}</span>
                    </span>
                  ) : (
                    stage.number
                  )}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'bg-[#F7F8FA] text-[#6B7782] border border-[#E4E8EC]'
                  }`}
                >
                  {stage.tabLabel}
                </span>
              </div>
              <p
                className={`text-xs font-semibold line-clamp-1 ${
                  isActive ? 'text-white' : 'text-[#18232D]'
                }`}
              >
                {stage.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Display Card */}
      <div className="bg-white rounded-2xl border border-[#E4E8EC] shadow-xs overflow-hidden transition-all duration-300">
        {/* Stage Header Strip */}
        <div className="p-5 sm:p-6 border-b border-[#E4E8EC] bg-[#F7F8FA]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#375A6B] mb-1">
              <span className="font-mono">{currentStageMeta.badge}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#18232D] tracking-tight">
              {currentStageMeta.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7782] mt-1 leading-relaxed">
              {currentStageMeta.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeStage > 1 && (
              <button
                type="button"
                onClick={() => setActiveStage((prev) => (prev - 1) as SimStage)}
                className="px-3 py-1.5 rounded-lg border border-[#E4E8EC] bg-white text-xs font-semibold text-[#18232D] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
              >
                Previous Stage
              </button>
            )}
            {activeStage < 4 ? (
              <button
                type="button"
                onClick={() => setActiveStage((prev) => (prev + 1) as SimStage)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#18232D] hover:bg-[#25323F] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <span>Next Stage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveStage(1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E8EC] bg-white text-xs font-semibold text-[#18232D] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restart Walkthrough</span>
              </button>
            )}
          </div>
        </div>

        {/* Stage Content Panel */}
        <div className="p-5 sm:p-8">
          {/* ===================== STAGE 1: INCIDENT RECEIVED ===================== */}
          {activeStage === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EC] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E8EC] pb-2.5">
                    <span className="font-mono text-xs font-bold text-[#18232D]">
                      INCIDENT #INC-4029
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF0F4] text-[#375A6B] border border-[#375A6B]/20">
                      Report Source: Neighbor (Proxy)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#6B7782] block text-[11px]">Location / Sector</span>
                      <span className="font-semibold text-[#18232D] block mt-0.5">
                        Sector B &bull; 14-B Ground Floor, North Nazimabad
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6B7782] block text-[11px]">Reported Danger</span>
                      <span className="font-semibold text-[#BC414A] block mt-0.5">
                        Water at chest level (1.4m and rising)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-[#E4E8EC] text-xs text-[#18232D]">
                    <span className="font-semibold text-[#6B7782] block text-[11px] mb-1">
                      Submitted Notes:
                    </span>
                    &ldquo;Elderly resident (diabetic, requires insulin) is unable to wade through moving water. Family of 4 has moved onto furniture as ground floor breaches window sills.&rdquo;
                  </div>
                </div>

                {/* Key Status Indicators */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-[#BC414A]/30 bg-[#BC414A]/5 text-center">
                    <span className="text-[11px] text-[#6B7782] block">Trapped Status</span>
                    <span className="text-sm font-bold text-[#BC414A] mt-0.5 block">
                      YES &bull; Trapped
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-[#BC414A]/30 bg-[#BC414A]/5 text-center">
                    <span className="text-[11px] text-[#6B7782] block">Medical Urgency</span>
                    <span className="text-sm font-bold text-[#BC414A] mt-0.5 block">
                      YES &bull; Acute
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-[#A87528]/30 bg-[#A87528]/5 text-center">
                    <span className="text-[11px] text-[#6B7782] block">Mobility Support</span>
                    <span className="text-sm font-bold text-[#A87528] mt-0.5 block">
                      YES &bull; Assistance
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-[#E4E8EC] lg:pl-6 pt-4 lg:pt-0">
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-[#375A6B] uppercase tracking-wider">
                    Intake Evaluation
                  </span>
                  <h4 className="text-sm font-bold text-[#18232D]">
                    Incomplete Data Handled
                  </h4>
                  <p className="text-xs text-[#6B7782] leading-relaxed">
                    The report was filed by a neighbor without exact GPS coordinates. FirstReach automatically assigns sector geocoding and tags the case as a proxy intake, protecting response speed.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EC] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7782]">People in danger:</span>
                    <span className="font-bold text-[#18232D]">4 residents</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7782]">Observation Freshness:</span>
                    <span className="font-bold text-[#258167]">Just now (&lt; 5m)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7782]">Geographic Zone:</span>
                    <span className="font-bold text-[#18232D]">Zone 2 (Active Flood)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STAGE 2: EMERGENCY ASSESSED ===================== */}
          {activeStage === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              <div className="lg:col-span-2 space-y-4">
                {/* Score Banner */}
                <div className="p-5 rounded-xl bg-[#18232D] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-semibold text-[#D9E1E6] uppercase tracking-wider block">
                      Algorithmic Triage Score
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-extrabold text-white">88</span>
                      <span className="text-sm text-[#D9E1E6]">/ 100</span>
                      <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#BC414A] text-white">
                        CRITICAL PRIORITY
                      </span>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs text-[#D9E1E6] block">Est. Time to Submersion</span>
                    <span className="text-lg font-mono font-bold text-white block mt-0.5">
                      &lt; 40 minutes
                    </span>
                  </div>
                </div>

                {/* Score Factor Breakdown */}
                <div className="p-4 rounded-xl border border-[#E4E8EC] bg-[#F7F8FA] space-y-3">
                  <h4 className="text-xs font-bold text-[#18232D] uppercase tracking-wider">
                    Score Contribution Factors
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-[#E4E8EC]">
                      <span className="text-[#18232D] font-medium">
                        Active trapped status (exit submerged)
                      </span>
                      <span className="font-mono font-bold text-[#BC414A]">+28 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-[#E4E8EC]">
                      <span className="text-[#18232D] font-medium">
                        Acute medical dependency (insulin refrigeration lost)
                      </span>
                      <span className="font-mono font-bold text-[#BC414A]">+25 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-[#E4E8EC]">
                      <span className="text-[#18232D] font-medium">
                        Chest-height water level with positive surge velocity
                      </span>
                      <span className="font-mono font-bold text-[#A87528]">+20 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white border border-[#E4E8EC]">
                      <span className="text-[#18232D] font-medium">
                        Vulnerability multiplier (infant + mobility-impaired elder)
                      </span>
                      <span className="font-mono font-bold text-[#375A6B]">+15 pts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-[#E4E8EC] lg:pl-6 pt-4 lg:pt-0">
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-[#375A6B] uppercase tracking-wider">
                    Life-First Doctrine
                  </span>
                  <h4 className="text-sm font-bold text-[#18232D]">
                    Why Priority Escalated
                  </h4>
                  <p className="text-xs text-[#6B7782] leading-relaxed">
                    FirstReach weights immediate danger over economic property loss. Because water is rising rapidly and household members cannot self-evacuate, this incident is elevated to the top of the dispatch queue.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#258167]/10 border border-[#258167]/30 text-xs text-[#258167] space-y-1">
                  <span className="font-bold block">Automated Dispatch Alert</span>
                  <p className="text-[11px] text-[#18232D]">
                    Case placed in Top 3% of active citywide emergencies for immediate rescue resource pairing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STAGE 3: RESCUE RECOMMENDED ===================== */}
          {activeStage === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              <div className="lg:col-span-2 space-y-4">
                <div className="p-5 rounded-xl border border-[#258167]/40 bg-[#EBF7F2] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#258167]/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#258167] text-white flex items-center justify-center font-bold text-xs">
                        RT-02
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#18232D]">
                          Rescue Team 02 &bull; Delta Squad
                        </h4>
                        <span className="text-[11px] text-[#6B7782]">
                          Inflatable Motorized Craft (Draft: 0.25m)
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#258167] text-white">
                      Recommended Unit
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-white border border-[#258167]/20">
                      <span className="text-[11px] text-[#6B7782] block">Simulated ETA</span>
                      <span className="text-base font-bold text-[#258167] block mt-0.5">
                        11 minutes
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-[#258167]/20">
                      <span className="text-[11px] text-[#6B7782] block">Capacity</span>
                      <span className="text-base font-bold text-[#18232D] block mt-0.5">
                        6 Persons
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-[#258167]/20">
                      <span className="text-[11px] text-[#6B7782] block">Medical Kit</span>
                      <span className="text-base font-bold text-[#258167] block mt-0.5">
                        Paramedic Onboard
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-[#258167]/20 text-xs text-[#18232D] space-y-1">
                    <span className="font-semibold text-[#258167] block">
                      Recommendation Rationale:
                    </span>
                    <p className="text-xs text-[#6B7782]">
                      RT-02 is the only available unit within 2.5km capable of clearing narrow street alleyways in Sector B with onboard cold-storage medical gear for insulin support.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E4E8EC] bg-[#F7F8FA] text-xs">
                  <span className="text-[#6B7782]">Human Coordinator Approval:</span>
                  <span className="font-bold text-[#258167] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#258167]" />
                    <span>Assignment Confirmed &bull; Launching Team</span>
                  </span>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-[#E4E8EC] lg:pl-6 pt-4 lg:pt-0">
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-[#375A6B] uppercase tracking-wider">
                    Transparent Matching
                  </span>
                  <h4 className="text-sm font-bold text-[#18232D]">
                    Explainable AI Decisions
                  </h4>
                  <p className="text-xs text-[#6B7782] leading-relaxed">
                    FirstReach explains why each craft is selected rather than functioning as a black box. Dispatchers review transit time, hull draft, and medical capability before confirming the mission.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EC] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7782]">Waterway Distance:</span>
                    <span className="font-bold text-[#18232D]">1.8 km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7782]">Navigation Obstacles:</span>
                    <span className="font-bold text-[#A87528]">Submerged vehicles</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7782]">Target Shelter:</span>
                    <span className="font-bold text-[#18232D]">Safe Haven Shelter A</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STAGE 4: OPERATION TRACKED ===================== */}
          {activeStage === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
              <div className="lg:col-span-2 space-y-4">
                {/* Mission Status Header */}
                <div className="p-4 rounded-xl border border-[#258167]/30 bg-[#EBF7F2] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#258167] text-white flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#18232D]">
                        Mission Successfully Completed
                      </h4>
                      <span className="text-xs text-[#258167] font-medium">
                        4 Residents safely evacuated &bull; Zero casualties
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-[#258167]/30 text-xs font-mono font-bold text-[#258167]">
                    RESOLVED
                  </span>
                </div>

                {/* Mission Timeline Track */}
                <div className="p-4 rounded-xl border border-[#E4E8EC] bg-[#F7F8FA] space-y-3.5">
                  <h4 className="text-xs font-bold text-[#18232D] uppercase tracking-wider">
                    Operational Timeline Progression
                  </h4>
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4E8EC] pl-6 text-xs">
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#258167] ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#18232D]">19:42 &bull; Craft Dispatched</span>
                        <span className="text-[11px] text-[#6B7782]">Staging Point North</span>
                      </div>
                      <p className="text-[#6B7782] text-[11px] mt-0.5">
                        RT-02 underway with 2 operators and 1 medical paramedic.
                      </p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#258167] ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#18232D]">19:53 &bull; On-Scene Extraction</span>
                        <span className="text-[11px] text-[#6B7782]">14-B Ground Floor</span>
                      </div>
                      <p className="text-[#6B7782] text-[11px] mt-0.5">
                        Family of 4 safely embarked into inflatable raft; resident received glucose stabilization.
                      </p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#258167] ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#18232D]">20:08 &bull; Shelter Intake Complete</span>
                        <span className="text-[11px] text-[#6B7782]">Safe Haven Shelter A</span>
                      </div>
                      <p className="text-[#6B7782] text-[11px] mt-0.5">
                        Residents checked into shelter; capacity updated; craft refueled for next mission.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-[#E4E8EC] lg:pl-6 pt-4 lg:pt-0">
                <div className="space-y-1.5">
                  <span className="text-xs font-mono font-bold text-[#375A6B] uppercase tracking-wider">
                    Closed-Loop Coordination
                  </span>
                  <h4 className="text-sm font-bold text-[#18232D]">
                    No Lost Handoffs
                  </h4>
                  <p className="text-xs text-[#6B7782] leading-relaxed">
                    Unlike fragmented phone-tree systems, RAABTA tracks the complete mission until victims are safe in registered shelters with reserved bed space and medical continuity.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E4E8EC] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7782]">Total Response Time:</span>
                    <span className="font-bold text-[#18232D]">26 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7782]">Shelter Bed Assigned:</span>
                    <span className="font-bold text-[#258167]">Beds #104-107</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7782]">Vessel State:</span>
                    <span className="font-bold text-[#375A6B]">Available for Redispatch</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
