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

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-[#14B8A6]">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Confirmed Rescue Assignments
            </h3>
            <p className="text-xs text-[#64748B]">
              Active mission deployments persisted in database (Read-Only Operational Status).
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
          {assignments.length} Committed
        </span>
      </div>

      {/* Operational Disclaimer regarding completion/cancellation */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong>Operational Protocol: </strong> Assignments are initiated transactionally via{' '}
          <code className="text-teal-700 bg-white px-1 py-0.5 rounded border border-slate-200">
            confirm_assignment
          </code>
          . Status transitions (en_route → completed / cancelled) are managed in field radios. Direct client-side mutation is disabled for audit integrity.
        </p>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {assignments.map((assignment) => {
          const incident = incidentsMap[assignment.incident_id];
          const team = teamsMap[assignment.team_id];

          return (
            <div
              key={assignment.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    MISSION-{assignment.id.slice(0, 8)}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-900">
                    {team ? team.name : `Team ${assignment.team_id.slice(0, 8)}`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-700">
                    INC-{assignment.incident_id.slice(0, 8)}
                  </span>
                </div>

                <StatusBadge status={assignment.status} size="sm" />
              </div>

              {/* Mission details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-600 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Simulated ETA:{' '}
                    <strong className="text-slate-900 font-mono">
                      ~{assignment.estimated_eta_minutes ?? 30}m
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Est. Cost:{' '}
                    <strong className="text-slate-900 font-mono">
                      {formatPkr(Number(assignment.estimated_cost) || 0)}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Approved:{' '}
                    <span className="font-mono">
                      {new Date(assignment.approved_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </span>
                </div>
              </div>

              {/* Note / Override Reason if logged */}
              {assignment.note && (
                <div className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-mono">
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
