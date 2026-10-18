'use client';

import React, { useState } from 'react';
import {
  OutreachActionWithDetails,
  OutreachStatusType,
} from '@/lib/outreach/types';
import {
  Footprints,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

interface VolunteerTasksListProps {
  tasks: OutreachActionWithDetails[];
  isLoading?: boolean;
  onUpdateTaskStatus: (
    taskId: string,
    status: OutreachStatusType,
    note?: string
  ) => Promise<void>;
  className?: string;
}

export function VolunteerTasksList({
  tasks,
  isLoading = false,
  onUpdateTaskStatus,
  className = '',
}: VolunteerTasksListProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleStatusChange = async (
    taskId: string,
    newStatus: OutreachStatusType
  ) => {
    setUpdatingTaskId(taskId);
    try {
      await onUpdateTaskStatus(taskId, newStatus);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const renderStatusBadge = (status: OutreachStatusType) => {
    switch (status) {
      case 'safe_confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Safe Confirmed</span>
          </span>
        );
      case 'visit_assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
            <UserCheck className="w-3 h-3 text-blue-600" />
            <span>Patrol In Progress</span>
          </span>
        );
      case 'needs_help':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>Assistance Needed</span>
          </span>
        );
      case 'planned':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Claim</span>
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-[#0D9488]">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Field Verification Tasks (Volunteer Patrol)
            </h3>
            <p className="text-xs text-slate-500">
              Door-to-door reconnaissance preventing blind boat deployments.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
          {tasks.filter((t) => t.status !== 'safe_confirmed').length} Active Patrols
        </span>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="p-8 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading active volunteer queue...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-8 text-center space-y-2 border border-dashed border-slate-200 rounded-xl">
          <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700">All Volunteer Tasks Resolved</h4>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            No unassigned welfare verification patrols currently pending in this sector.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {tasks.map((task) => {
            const isUpdating = updatingTaskId === task.id;

            return (
              <div
                key={task.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5 text-xs"
              >
                {/* Top Row: Ref & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-slate-900">
                      {task.household_label || 'Area Patrol'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {task.zone_name || 'Designated Sector'}
                    </span>
                  </div>

                  {renderStatusBadge(task.status)}
                </div>

                {/* Task Details / Note */}
                <p className="text-slate-600 leading-relaxed font-normal text-[11px]">
                  {task.note || 'Physical door-to-door verification check.'}
                </p>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-[11px]">
                  <div className="text-slate-400 flex items-center gap-1 font-mono text-[10px]">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(task.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Action Buttons based on Status */}
                  <div className="flex items-center gap-1.5">
                    {task.status === 'planned' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(task.id, 'visit_assigned')}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold transition-colors disabled:opacity-50"
                      >
                        Claim Patrol
                      </button>
                    )}

                    {task.status === 'visit_assigned' && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(task.id, 'safe_confirmed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Confirm Safe</span>
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(task.id, 'needs_help')}
                          className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold transition-colors disabled:opacity-50"
                        >
                          Needs Help
                        </button>
                      </>
                    )}

                    {task.status === 'safe_confirmed' && (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Complete
                      </span>
                    )}

                    {task.status === 'needs_help' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(task.id, 'safe_confirmed')}
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold transition-colors disabled:opacity-50"
                      >
                        Mark Resolved Safe
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
