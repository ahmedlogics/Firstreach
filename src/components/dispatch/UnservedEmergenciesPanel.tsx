'use client';

import React from 'react';
import { UnservedIncident } from '@/lib/dispatch/types';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import {
  AlertOctagon,
  ShieldAlert,
  ArrowUpRight,
  Radio,
  Clock,
  Compass,
  Users,
} from 'lucide-react';

interface UnservedEmergenciesPanelProps {
  unservedIncidents: UnservedIncident[];
  onEscalate?: (incidentId: string) => void;
  className?: string;
}

export function UnservedEmergenciesPanel({
  unservedIncidents,
  onEscalate,
  className = '',
}: UnservedEmergenciesPanelProps) {
  if (unservedIncidents.length === 0) return null;

  return (
    <div
      className={`bg-white rounded-2xl border border-[#B74349]/30 shadow-sm p-5 sm:p-6 space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E6E1]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FAE8E7] text-[#B74349] shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#252A30] tracking-tight">
                Unserved Emergency Alerts (Resource Deficit)
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#B74349] text-white">
                Action Required
              </span>
            </div>
            <p className="text-xs text-[#757B81]">
              High-priority life safety incidents blocked because designated specialized gear or capacity is unavailable in current fleet.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-semibold text-[#B74349] bg-[#FAE8E7] px-3 py-1.5 rounded-md border border-[#B74349]/20">
          {unservedIncidents.length} Critical Deficit
        </span>
      </div>

      {/* Cards list */}
      <div className="space-y-3">
        {unservedIncidents.map(({ incident, blockingReasons, missingCapabilities, suggestedEscalation }) => (
          <div
            key={incident.id}
            className="p-4 rounded-xl border border-[#E8E6E1] bg-[#FAE8E7]/20 space-y-2.5 text-xs text-[#252A30]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#B74349]">
                  {incident.id.length > 12 ? `${incident.id.slice(0, 8)}...` : incident.id}
                </span>
                <span className="text-[#92979D]">•</span>
                <span className="font-semibold text-[#252A30]">
                  {incident.people_count ?? 1} persons needing rescue
                </span>
              </div>
              <PriorityBadge score={incident.priority_score ?? 0} size="sm" />
            </div>

            <p className="text-[#252A30] leading-relaxed font-normal">
              {incident.details || incident.priority_reason || 'Incident unassigned.'}
            </p>

            {/* Blocking Reason Warning Box */}
            <div className="p-3 rounded-lg bg-white border border-[#B74349]/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#B74349] font-bold text-[11px] uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Resource Bottleneck Identified</span>
              </div>

              <ul className="text-[#252A30] text-xs list-disc list-inside space-y-0.5">
                {blockingReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>

              {missingCapabilities.length > 0 && (
                <div className="text-[11px] text-[#757B81] pt-1 border-t border-[#E8E6E1]">
                  Deficit Capabilities: <strong className="text-[#B74349]">{missingCapabilities.join(', ')}</strong>
                </div>
              )}
            </div>

            {/* Escalation Recommendation & Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-[#B74349] font-medium">
                <Clock className="w-3.5 h-3.5 text-[#B74349]" />
                <span>
                  Time before harm:{' '}
                  <strong>
                    {incident.minutes_to_harm !== null ? `~${incident.minutes_to_harm} minutes` : 'Unconfirmed'}
                  </strong>
                </span>
              </div>

              <button
                onClick={() => onEscalate?.(incident.id)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#B74349] hover:bg-[#9E353B] text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Request Military Mutual Aid</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[10px] text-[#757B81] italic">
              <strong className="text-[#252A30]">Escalation Protocol: </strong>{suggestedEscalation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
