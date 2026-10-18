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
      color: 'border-slate-300 text-slate-800 bg-slate-50',
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
      color: 'border-amber-300 text-amber-950 bg-amber-50',
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
      color: 'border-teal-400 text-teal-950 bg-teal-50',
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
      color: 'border-red-400 text-red-950 bg-red-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Silence Escalation Protocol
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200">
              Proactive Outreach Logic
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            How unresponsive households are escalated safely without false emergency declarations.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
            Core Rule: <strong>Silence &ne; Automatic Emergency</strong>
          </div>

          {onTriggerEscalation && (
            <button
              type="button"
              disabled={isEscalating}
              onClick={onTriggerEscalation}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-slate-300 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              {isEscalating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning Sectors...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
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
                  ? 'border-[#0D9488] bg-teal-50/50 ring-2 ring-[#0D9488]/30 shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Step 0{s.step}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-[#0D9488]' : 'text-slate-400'
                  }`}
                />
              </div>
              <h4
                className={`text-xs font-bold leading-tight ${
                  isSelected ? 'text-slate-900' : 'text-slate-700'
                }`}
              >
                {s.title}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 truncate">
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
