'use client';

import React from 'react';
import { MOCK_VOLUNTEER_TASKS } from '@/lib/mock-data';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Footprints,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface VolunteerTasksListProps {
  onCompleteTask?: (taskId: string) => void;
  className?: string;
}

export function VolunteerTasksList({
  onCompleteTask,
  className = '',
}: VolunteerTasksListProps) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
            Field Verification Tasks (Volunteer Dispatch)
          </h3>
          <p className="text-xs text-[#64748B]">
            Pending door-to-door welfare verification before formal watercraft deployment.
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
          {MOCK_VOLUNTEER_TASKS.length} Active Patrols
        </span>
      </div>

      <div className="space-y-3">
        {MOCK_VOLUNTEER_TASKS.map((task) => (
          <div
            key={task.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">{task.householdReference}</span>
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-slate-700">{task.zoneName}</span>
              </div>
              <StatusBadge status={task.status} size="sm" />
            </div>

            <p className="text-slate-600 leading-relaxed font-normal">
              {task.reason}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
              <div className="flex items-center gap-2 text-slate-500">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {task.assignedVolunteer ? (
                    <>Assigned to: <strong className="text-slate-700">{task.assignedVolunteer}</strong></>
                  ) : (
                    <span className="text-amber-700 font-semibold italic">Awaiting Volunteer Claim</span>
                  )}
                </span>
              </div>

              {onCompleteTask && task.status !== 'completed' && (
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-[#14B8A6] hover:text-white hover:border-transparent text-xs font-semibold transition-colors shadow-2xs"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Mark Verified Safe</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
