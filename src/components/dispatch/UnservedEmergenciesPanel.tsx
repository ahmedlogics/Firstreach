'use client';

import React, { useMemo } from 'react';
import { UnservedIncident } from '@/lib/dispatch/types';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import {
  AlertOctagon,
  ShieldAlert,
  ArrowUpRight,
  Radio,
  Clock,
  Users,
  CheckCircle2,
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
  // Sort by priority score descending so highest life-threats appear first
  const sortedIncidents = useMemo(() => {
    return [...unservedIncidents].sort(
      (a, b) => (b.incident.priority_score ?? 0) - (a.incident.priority_score ?? 0)
    );
  }, [unservedIncidents]);

  return (
    <div
      className={`bg-white rounded-xl border border-[#E4E8EC] shadow-subtle p-4 sm:p-5 space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E8EC]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[8px] bg-[#FBECEE] text-[#BC414A] shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[#18232D] tracking-tight">
                Resource Deficit Cases
              </h3>
              <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25">
                Action Required
              </span>
            </div>
            <p className="text-xs text-[#6B7782] mt-0.5">
              High-priority emergencies blocked because required craft capabilities or capacity are unavailable in the civilian fleet.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-semibold text-[#BC414A] bg-[#FBECEE] px-3 py-1 rounded-[6px] border border-[#BC414A]/25 tabular-nums self-start sm:self-auto">
          {sortedIncidents.length} Critical {sortedIncidents.length === 1 ? 'Deficit' : 'Deficits'}
        </span>
      </div>

      {/* Incidents List */}
      {sortedIncidents.length === 0 ? (
        <div className="py-12 text-center rounded-xl bg-[#F7F8FA] border border-dashed border-[#E4E8EC] p-6 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#258167] mx-auto" />
          <h4 className="text-sm font-semibold text-[#18232D]">Zero Fleet Resource Deficits</h4>
          <p className="text-xs text-[#6B7782] max-w-md mx-auto leading-relaxed">
            All active open emergency reports in the queue have at least one feasible craft matching their mandatory capability criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedIncidents.map(({ incident, blockingReasons, missingCapabilities, suggestedEscalation }) => {
            const shortId = incident.id.length > 10 ? incident.id.slice(0, 8) : incident.id;

            return (
              <div
                key={incident.id}
                className="p-4 rounded-xl border border-[#E4E8EC] bg-white hover:border-[#CBD5E1] transition-colors space-y-3 text-xs text-[#18232D] shadow-subtle"
              >
                {/* Header: ID, Victims, Urgency */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[#BC414A] bg-[#FBECEE] px-2 py-0.5 rounded-[4px] border border-[#BC414A]/25">
                      {shortId}
                    </span>
                    <span className="text-[#8B959E]">•</span>
                    <span className="font-medium text-[#18232D] tabular-nums">
                      {incident.people_count ?? 1} persons needing rescue
                    </span>
                  </div>

                  <PriorityBadge score={incident.priority_score ?? 0} size="sm" />
                </div>

                <p className="text-[#18232D] leading-relaxed font-normal">
                  {incident.details || incident.priority_reason || 'Emergency rescue report logged in flood hazard sector.'}
                </p>

                {/* Structured Blocking Reasons Box */}
                <div className="p-3 rounded-[8px] bg-[#F7F8FA] border border-[#E4E8EC] space-y-2">
                  <div className="flex items-center gap-1.5 text-[#BC414A] font-semibold text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Bottleneck Identified:</span>
                  </div>

                  <ul className="text-[#6B7782] text-xs list-disc list-inside space-y-1">
                    {blockingReasons.map((reason, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span className="text-[#18232D]">{reason}</span>
                      </li>
                    ))}
                  </ul>

                  {missingCapabilities.length > 0 && (
                    <div className="text-[11px] text-[#6B7782] pt-1.5 border-t border-[#E4E8EC] flex items-center gap-1.5">
                      <span>Deficit Capabilities:</span>
                      <strong className="text-[#BC414A] font-mono">
                        {missingCapabilities.join(', ')}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Escalation Recommendation & Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-[#E4E8EC]">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6B7782] tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-[#BC414A]" />
                    <span>Time window:</span>
                    <strong className="text-[#BC414A]">
                      {incident.minutes_to_harm !== null ? `~${incident.minutes_to_harm} min remaining` : 'Unconfirmed'}
                    </strong>
                  </div>

                  <button
                    onClick={() => onEscalate?.(incident.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#BC414A] hover:bg-[#96373c] text-white font-semibold text-xs transition-colors shadow-subtle cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Flag for Mutual-Aid Escalation</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-[#8B959E] italic">
                  <strong className="text-[#6B7782]">Protocol Guidance: </strong>
                  {suggestedEscalation}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
