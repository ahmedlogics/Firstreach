'use client';

import React from 'react';
import { DbAssignment, DbIncident, DbRescueTeam } from '@/lib/dispatch/types';
import { formatPkr } from '@/lib/dispatch/cost';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Navigation,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';

interface ConfirmedAssignmentsPanelProps {
  assignments: DbAssignment[];
  incidentsMap: Record<string, DbIncident>;
  teamsMap: Record<string, DbRescueTeam>;
  className?: string;
}

export function ConfirmedAssignmentsPanel({
  assignments,
  incidentsMap,
  teamsMap,
  className = '',
}: ConfirmedAssignmentsPanelProps) {
  if (assignments.length === 0) {
    return null;
  }

  const totalCommittedCost = assignments.reduce(
    (acc, a) => acc + (Number(a.estimated_cost) || 0),
    0
  );

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5 sm:p-6 space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-[#14B8A6] border border-teal-200/60 shadow-2xs">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Confirmed Rescue Assignments
              </h3>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                {assignments.length} Active Missions
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Committed deployments locked in Supabase database (Read-Only Audit Trail).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0 self-end sm:self-center">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono text-slate-700">
            Committed Burn: <strong className="text-slate-900">{formatPkr(totalCommittedCost)}</strong>
          </div>
        </div>
      </div>

      {/* Operational Disclaimer regarding completion/cancellation */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2.5 leading-relaxed">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong>Operational Field Rule: </strong> Missions are authorized via database RPC{' '}
          <code className="text-teal-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono font-bold">
            confirm_assignment
          </code>
          . Mission completions and cancellations are managed directly through authorized field radio relays.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
        {assignments.map((assignment) => {
          const incident = incidentsMap[assignment.incident_id];
          const team = teamsMap[assignment.team_id];

          return (
            <div
              key={assignment.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-subtle transition-all space-y-2.5 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    MISSION-{assignment.id.slice(0, 8)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-slate-900">
                    {team ? team.name : `Unit ${assignment.team_id.slice(0, 8)}`}
                  </span>
                </div>

                <StatusBadge status={assignment.status} size="sm" />
              </div>

              {/* Target Incident & Location */}
              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <Radio className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate">
                  Target: <strong className="text-slate-800 font-mono">{assignment.incident_id.slice(0, 8)}</strong>
                  {incident?.details ? ` — ${incident.details}` : ''}
                </span>
              </div>

              {/* Mission telemetry details */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-slate-600 text-[11px] border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>
                    ETA: <strong className="text-slate-900 font-mono">~{assignment.estimated_eta_minutes ?? 30}m</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Coins className="w-3 h-3 text-slate-400" />
                  <span>
                    Cost: <strong className="text-slate-900 font-mono">{formatPkr(Number(assignment.estimated_cost) || 0)}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-500">
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span className="font-mono">
                    {new Date(assignment.approved_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Note / Override Reason if logged */}
              {assignment.note && (
                <div className="p-2 rounded bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 font-medium">
                  {assignment.note}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
