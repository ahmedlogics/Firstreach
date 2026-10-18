'use client';

import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  Footprints,
  Radio,
  Zap,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';

interface SilenceEscalationTimelineProps {
  onTriggerEscalation?: () => Promise<void>;
  isEscalating?: boolean;
  uncontactedCount?: number;
  className?: string;
}

export function SilenceEscalationTimeline({
  onTriggerEscalation,
  isEscalating = false,
  uncontactedCount = 0,
  className = '',
}: SilenceEscalationTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
    },
  ];

  return (
    <div
      className={`bg-white rounded-xl border border-[#E4E8EC] shadow-subtle p-3.5 sm:p-4 space-y-3 ${className}`}
    >
      {/* Collapsed Compact State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-[8px] bg-[#EAF0F4] text-[#375A6B] shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#18232D]">
                Silence Escalation Protocol
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#FFF4E3] text-[#A87528] border border-[#A87426]/20">
                Tier 2 Outreach Priority
              </span>
            </div>
            <p className="text-xs text-[#6B7782] mt-0.5">
              Current stage: 6–18h silence &bull; {uncontactedCount} households awaiting verification &bull; <strong className="text-[#18232D]">Silence &ne; Disaster Emergency</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {onTriggerEscalation && (
            <button
              type="button"
              disabled={isEscalating}
              onClick={onTriggerEscalation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-white bg-[#375A6B] hover:bg-[#294858] disabled:bg-[#E4E8EC] disabled:text-[#8B959E] shadow-subtle transition-colors cursor-pointer"
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

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-xs font-medium text-[#6B7782] hover:text-[#18232D] hover:bg-[#F7F8FA] border border-[#E4E8EC] transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Protocol' : 'View Protocol'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Workflow Detail */}
      {isExpanded && (
        <div className="pt-3 border-t border-[#E4E8EC] space-y-3 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {escalationSteps.map((s) => {
              const isSelected = activeStep === s.step;
              const Icon = s.icon;

              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveStep(s.step)}
                  className={`p-3 rounded-[10px] border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#375A6B] bg-[#F7F8FA] ring-1 ring-[#375A6B]/30'
                      : 'border-[#E4E8EC] bg-white hover:bg-[#F7F8FA]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-semibold uppercase text-[#8B959E]">
                      Stage 0{s.step}
                    </span>
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-[#375A6B]' : 'text-[#8B959E]'
                      }`}
                    />
                  </div>
                  <h4
                    className={`text-xs font-semibold leading-tight ${
                      isSelected ? 'text-[#18232D]' : 'text-[#6B7782]'
                    }`}
                  >
                    {s.title}
                  </h4>
                  <p className="text-[10px] text-[#8B959E] mt-1 truncate">
                    {s.timeframe}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Stage Deep Dive */}
          {(() => {
            const step = escalationSteps.find((s) => s.step === activeStep)!;
            const StepIcon = step.icon;

            return (
              <div className="p-3.5 rounded-[10px] bg-[#F7F8FA] border border-[#E4E8EC] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StepIcon className="w-4 h-4 text-[#375A6B]" />
                    <span className="font-semibold text-[#18232D]">
                      {step.title} ({step.timeframe})
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-white border border-[#E4E8EC] text-[#18232D]">
                    {step.riskTier}
                  </span>
                </div>
                <p className="text-[#6B7782] leading-relaxed">
                  {step.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1 border-t border-[#E4E8EC]">
                  <span>
                    <strong className="text-[#18232D]">Triggered Action: </strong>
                    <span className="text-[#6B7782]">{step.action}</span>
                  </span>
                  <span>
                    <strong className="text-[#18232D]">Operational Outcome: </strong>
                    <span className="text-[#6B7782]">{step.outcome}</span>
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
