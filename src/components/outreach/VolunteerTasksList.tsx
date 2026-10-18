'use client';

import React, { useState, useMemo } from 'react';
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
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
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

type TaskFilterType = 'all' | 'pending' | 'in_progress' | 'completed';

export function VolunteerTasksList({
  tasks,
  isLoading = false,
  onUpdateTaskStatus,
  className = '',
}: VolunteerTasksListProps) {
  const [filter, setFilter] = useState<TaskFilterType>('all');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Filter tasks based on actual system statuses mapped to UI filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === 'pending') return t.status === 'planned';
      if (filter === 'in_progress') return t.status === 'visit_assigned';
      if (filter === 'completed') return t.status === 'safe_confirmed' || t.status === 'needs_help';
      return true;
    });
  }, [tasks, filter]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: tasks.length,
      pending: tasks.filter((t) => t.status === 'planned').length,
      in_progress: tasks.filter((t) => t.status === 'visit_assigned').length,
      completed: tasks.filter((t) => t.status === 'safe_confirmed' || t.status === 'needs_help').length,
    };
  }, [tasks]);

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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-semibold bg-[#E9F3EF] text-[#258167] border border-[#258167]/25">
            <CheckCircle2 className="w-3 h-3 text-[#258167]" />
            <span>Safe Confirmed</span>
          </span>
        );
      case 'visit_assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-semibold bg-[#EAF0F4] text-[#375A6B] border border-[#375A6B]/25">
            <UserCheck className="w-3 h-3 text-[#375A6B]" />
            <span>Patrol In Progress</span>
          </span>
        );
      case 'needs_help':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-semibold bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25">
            <AlertTriangle className="w-3 h-3 text-[#BC414A]" />
            <span>Assistance Needed</span>
          </span>
        );
      case 'planned':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#FFF4E3] text-[#A87528] border border-[#A87528]/25">
            <Clock className="w-3 h-3 text-[#A87528]" />
            <span>Pending Claim</span>
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-[#E4E8EC] shadow-subtle p-4 sm:p-5 space-y-4 ${className}`}>
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E8EC]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#18232D] tracking-tight">
              Volunteer Verification Tasks
            </h3>
            <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-[6px] bg-[#F7F8FA] text-[#18232D] border border-[#E4E8EC] tabular-nums">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          <p className="text-xs text-[#6B7782] mt-0.5">
            Door-to-door welfare checks preventing unnecessary boat deployments.
          </p>
        </div>

        {/* Filter Tab Buttons */}
        <div className="flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-[10px] text-xs font-medium border border-[#E4E8EC] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-[8px] transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#18232D] font-semibold shadow-subtle'
                : 'text-[#6B7782] hover:text-[#18232D]'
            }`}
          >
            <span>All</span>
            <span className="ml-1 text-[10px] font-mono tabular-nums text-[#8B959E]">({counts.all})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded-[8px] transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-white text-[#18232D] font-semibold shadow-subtle'
                : 'text-[#6B7782] hover:text-[#18232D]'
            }`}
          >
            <span>Pending</span>
            <span className="ml-1 text-[10px] font-mono tabular-nums text-[#A87528]">({counts.pending})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('in_progress')}
            className={`px-2.5 py-1 rounded-[8px] transition-colors cursor-pointer ${
              filter === 'in_progress'
                ? 'bg-white text-[#18232D] font-semibold shadow-subtle'
                : 'text-[#6B7782] hover:text-[#18232D]'
            }`}
          >
            <span>In Progress</span>
            <span className="ml-1 text-[10px] font-mono tabular-nums text-[#375A6B]">({counts.in_progress})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded-[8px] transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-white text-[#18232D] font-semibold shadow-subtle'
                : 'text-[#6B7782] hover:text-[#18232D]'
            }`}
          >
            <span>Completed</span>
            <span className="ml-1 text-[10px] font-mono tabular-nums text-[#258167]">({counts.completed})</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="py-12 text-center text-[#6B7782] space-y-2">
          <div className="w-5 h-5 border-2 border-[#375A6B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Loading volunteer task registry...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-[#E4E8EC] rounded-xl p-6 text-[#6B7782] space-y-1.5">
          <ShieldCheck className="w-7 h-7 text-[#258167] mx-auto mb-1" />
          <h4 className="text-xs font-semibold text-[#18232D]">No tasks matching filter</h4>
          <p className="text-[11px] text-[#6B7782] max-w-sm mx-auto">
            {filter === 'all'
              ? 'No field verification patrols currently registered. Run an Escalation Scan from the Households tab to generate verification tasks.'
              : `No tasks currently in "${filter.replace('_', ' ')}" status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isUpdating = updatingTaskId === task.id;
            const isExpanded = expandedTaskId === task.id;

            return (
              <div
                key={task.id}
                className="p-3.5 rounded-[10px] border border-[#E4E8EC] bg-white hover:border-[#CBD5E1] transition-colors space-y-2.5 text-xs shadow-subtle"
              >
                {/* Top Row: Ref, Zone, Status, and Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-semibold text-xs text-[#18232D] bg-[#F7F8FA] px-2 py-0.5 rounded-[4px] border border-[#E4E8EC]">
                      {task.household_label || 'Area Patrol'}
                    </span>
                    <span className="text-[#8B959E]">•</span>
                    <span className="text-[#6B7782] flex items-center gap-1 font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#8B959E] shrink-0" />
                      <span className="truncate">{task.zone_name || 'Designated Sector'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {renderStatusBadge(task.status)}

                    {/* Action Buttons based on actual stored status */}
                    <div className="flex items-center gap-1.5">
                      {task.status === 'planned' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(task.id, 'visit_assigned')}
                          className="px-2.5 py-1 rounded-[8px] bg-[#375A6B] hover:bg-[#294858] text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {isUpdating ? 'Claiming...' : 'Claim Task'}
                        </button>
                      )}

                      {task.status === 'visit_assigned' && (
                        <>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(task.id, 'safe_confirmed')}
                            className="px-2.5 py-1 rounded-[8px] bg-[#258167] hover:bg-[#1f6b55] text-white font-semibold text-xs flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>Confirm Safe</span>
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(task.id, 'needs_help')}
                            className="px-2.5 py-1 rounded-[8px] bg-[#FBECEE] text-[#BC414A] hover:bg-[#BC414A] hover:text-white border border-[#BC414A]/25 font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Needs Help
                          </button>
                        </>
                      )}

                      {task.status === 'needs_help' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(task.id, 'safe_confirmed')}
                          className="px-2.5 py-1 rounded-[8px] bg-[#258167] hover:bg-[#1f6b55] text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Reason / Notes */}
                <div className="flex items-start justify-between gap-2 text-[11px] text-[#6B7782] pt-1 border-t border-[#E4E8EC]">
                  <p className={`leading-relaxed text-[#18232D] ${isExpanded ? '' : 'truncate max-w-xl'}`}>
                    {task.note || 'Physical door-to-door welfare check assigned to ground scout patrol.'}
                  </p>

                  {task.note && task.note.length > 70 && (
                    <button
                      type="button"
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      className="text-[#375A6B] hover:underline font-medium shrink-0 ml-1 cursor-pointer flex items-center gap-0.5"
                    >
                      <span>{isExpanded ? 'Less' : 'More'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {/* Timestamps */}
                <div className="flex items-center justify-between text-[10px] text-[#8B959E] font-mono tabular-nums pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#8B959E]" />
                    <span>
                      Task created: {new Date(task.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {task.attempted_at && (
                    <span>Last attempted: {new Date(task.attempted_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
