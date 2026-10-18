'use client';

import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  Footprints,
  Radio,
  Zap,
} from 'lucide-react';

interface SilenceEscalationTimelineProps {
  onTriggerEscalation?: () => Promise<void>;
  isEscalating?: boolean;
}

export function SilenceEscalationTimeline({
  onTriggerEscalation,
  isEscalating = false,
}: SilenceEscalationTimelineProps) {
  const [activeStep, setActiveStep] = useState(2);

  const escalationSteps = [
    {
      step: 1,
      title: 'Routine Digital Check-In',
      timeframe: '0 to 6 Hours Silence',
      riskTier: 'Tier 1: Normal Monitoring',
      action: 'Automated 2G SMS / App status ping sent',
      description:
        'Household is sent an automated welfare ping. Silence is safely treated as battery-saving, mobile network lag, or power conservation.',
      outcome: 'No emergency declared. Re-poll scheduled.',
      icon: Clock,
      color: 'border-[#E8E6E1] text-[#252A30] bg-[#F7F6F2]',
    },
    {
      step: 2,
      title: 'Overdue Warning & Neighbor Relay',
      timeframe: '6 to 18 Hours Silence',
      riskTier: 'Tier 2: Outreach Priority',
      action: 'Voice IVR + Local neighbor proxy alert',
      description:
        'If water level is projected to rise within 6 hours, system attempts voice call and notifies registered verified neighbors in same sector.',
      outcome: 'Flagged for outreach. Not counted as confirmed disaster victim.',
      icon: Radio,
      color: 'border-[#A87426]/30 text-[#A87426] bg-[#FFF2DD]',
    },
    {
      step: 3,
      title: 'Physical Ground Verification Task',
      timeframe: '18+ Hours Silence & Flood Approaching',
      riskTier: 'Tier 3: Volunteer Task Generated',
      action: 'Door-to-door volunteer patrol tasked',
      description:
        'System automatically generates a door-to-door welfare check for mobile field scouts. Avoids deploying precious swiftwater craft blindly.',
      outcome: 'Field scout visits location to ascertain physical condition.',
      icon: Footprints,
      color: 'border-[#536A82]/30 text-[#536A82] bg-[#EDF1F5]',
    },
    {
      step: 4,
      title: 'Verified Incident Escalation',
      timeframe: 'Upon Volunteer Confirmation Only',
      riskTier: 'Tier 4: Formal Rescue Queue',
      action: 'Emergency Incident Created (P90+)',
      description:
        'Only once field scout physically confirms individuals are trapped or in medical distress does it enter the boat/vehicle dispatch pipeline.',
      outcome: 'Assigned to nearest qualified rescue team with target ETA.',
      icon: ShieldCheck,
      color: 'border-[#B74349]/30 text-[#B74349] bg-[#FAE8E7]',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-xs p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E6E1]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#252A30]">
              Silence Escalation Protocol
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/20">
              Proactive Outreach Logic
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-xs text-[#757B81] bg-[#F7F6F2] px-3 py-1.5 rounded-lg border border-[#E8E6E1] font-medium">
            Core Rule: <strong className="text-[#252A30]">Silence &ne; Automatic Emergency</strong>
          </div>

          {onTriggerEscalation && (
            <button
              type="button"
              disabled={isEscalating}
              onClick={onTriggerEscalation}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#536A82] hover:bg-[#40566D] disabled:bg-slate-300 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isEscalating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning Sectors...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>Run Escalation Scan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        {escalationSteps.map((s) => {
          const isSelected = activeStep === s.step;
          const Icon = s.icon;

          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setActiveStep(s.step)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-[#536A82] bg-[#EDF1F5] ring-1 ring-[#536A82] shadow-xs'
                  : 'border-[#E8E6E1] bg-[#F7F6F2] hover:bg-[#EDF1F5]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#92979D]">
                  Step 0{s.step}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-[#536A82]' : 'text-[#92979D]'
                  }`}
                />
              </div>
              <h4
                className={`text-xs font-semibold leading-tight ${
                  isSelected ? 'text-[#252A30]' : 'text-[#757B81]'
                }`}
              >
                {s.title}
              </h4>
              <p className="text-[10px] text-[#92979D] mt-1 truncate">
                {s.timeframe}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Step Deep Dive Card */}
      {(() => {
        const current = escalationSteps.find((s) => s.step === activeStep)!;
        const Icon = current.icon;

        return (
          <div
            className={`p-4 rounded-xl border ${current.color} space-y-2.5 text-xs animate-in fade-in duration-150`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-bold text-sm">{current.title}</span>
              </div>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/90 border border-current/20">
                {current.timeframe}
              </span>
            </div>

            <p className="leading-relaxed">{current.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-current/15">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                  Automated Outreach Action:
                </span>
                <span className="font-semibold">{current.action}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                  Triage Pipeline Result:
                </span>
                <span className="font-semibold">{current.outcome}</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
