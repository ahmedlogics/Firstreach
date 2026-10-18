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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#E5EEE8] text-[#377D65] border border-[#377D65]/30">
            <CheckCircle2 className="w-3 h-3 text-[#377D65]" />
            <span>Safe Confirmed</span>
          </span>
        );
      case 'visit_assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/30">
            <UserCheck className="w-3 h-3 text-[#536A82]" />
            <span>Patrol In Progress</span>
          </span>
        );
      case 'needs_help':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAE8E7] text-[#B74349] border border-[#B74349]/30">
            <AlertTriangle className="w-3 h-3 text-[#B74349]" />
            <span>Assistance Needed</span>
          </span>
        );
      case 'planned':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FFF2DD] text-[#A87426] border border-[#A87426]/30">
            <Clock className="w-3 h-3 text-[#A87426]" />
            <span>Pending Claim</span>
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-[#E8E6E1] shadow-xs p-5 sm:p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E6E1]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EDF1F5] text-[#536A82]">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#252A30]">
              Field Verification Tasks (Volunteer Patrol)
            </h3>
            <p className="text-xs text-[#757B81]">
              Door-to-door reconnaissance preventing blind boat deployments.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/20">
          {tasks.filter((t) => t.status !== 'safe_confirmed').length} Active Patrols
        </span>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="p-8 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#536A82] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#757B81]">Loading active volunteer queue...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-8 text-center space-y-2 border border-dashed border-[#E8E6E1] rounded-xl">
          <ShieldCheck className="w-8 h-8 text-[#377D65] mx-auto" />
          <h4 className="text-xs font-semibold text-[#252A30]">All Volunteer Tasks Resolved</h4>
          <p className="text-[11px] text-[#757B81] max-w-xs mx-auto">
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
                className="p-4 rounded-xl border border-[#E8E6E1] bg-[#F7F6F2] hover:bg-[#F7F6F2]/80 transition-colors space-y-2.5 text-xs"
              >
                {/* Top Row: Ref & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#252A30]">
                      {task.household_label || 'Area Patrol'}
                    </span>
                    <span className="text-[#92979D]">•</span>
                    <span className="font-medium text-[#757B81] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#92979D]" />
                      {task.zone_name || 'Designated Sector'}
                    </span>
                  </div>

                  {renderStatusBadge(task.status)}
                </div>

                {/* Task Details / Note */}
                <p className="text-[#757B81] leading-relaxed font-normal text-[11px]">
                  {task.note || 'Physical door-to-door verification check.'}
                </p>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8E6E1] text-[11px]">
                  <div className="text-[#92979D] flex items-center gap-1 font-mono text-[10px]">
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
                        className="px-2.5 py-1 rounded-lg bg-[#EDF1F5] text-[#536A82] hover:bg-[#536A82] hover:text-white border border-[#536A82]/30 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
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
                          className="px-2.5 py-1 rounded-lg bg-[#E5EEE8] text-[#377D65] hover:bg-[#377D65] hover:text-white border border-[#377D65]/30 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3 text-current" />
                          <span>Confirm Safe</span>
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(task.id, 'needs_help')}
                          className="px-2 py-1 rounded-lg bg-[#FAE8E7] text-[#B74349] hover:bg-[#B74349] hover:text-white border border-[#B74349]/30 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Needs Help
                        </button>
                      </>
                    )}

                    {task.status === 'safe_confirmed' && (
                      <span className="text-[10px] text-[#377D65] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#377D65]" />
                        Verified Complete
                      </span>
                    )}

                    {task.status === 'needs_help' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(task.id, 'safe_confirmed')}
                        className="px-2 py-1 rounded-lg bg-[#E5EEE8] text-[#377D65] hover:bg-[#377D65] hover:text-white border border-[#377D65]/30 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
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
