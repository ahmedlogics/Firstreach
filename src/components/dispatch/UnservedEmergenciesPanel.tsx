'use client';

import React from 'react';
import { MOCK_INCIDENTS } from '@/lib/mock-data';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import {
  AlertOctagon,
  ShieldAlert,
  ArrowUpRight,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';

interface UnservedEmergenciesPanelProps {
  onEscalate?: (incidentId: string) => void;
  className?: string;
}

export function UnservedEmergenciesPanel({
  onEscalate,
  className = '',
}: UnservedEmergenciesPanelProps) {
  const unservedIncidents = MOCK_INCIDENTS.filter((inc) => inc.status === 'unserved');

  if (unservedIncidents.length === 0) return null;

  return (
    <div className={`bg-white rounded-2xl border-2 border-red-200 shadow-subtle p-5 sm:p-6 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-red-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-100 text-[#F16D70] shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-red-950 tracking-tight">
                Unserved Emergency Alerts (Resource Deficit)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">
                Action Required
              </span>
            </div>
            <p className="text-xs text-red-700/80">
              High-priority life safety incidents blocked because designated specialized gear is unavailable.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
          {unservedIncidents.length} Critical Deficit
        </span>
      </div>

      {/* Cards list */}
      <div className="space-y-3">
        {unservedIncidents.map((inc) => (
          <div
            key={inc.id}
            className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-2.5 text-xs text-slate-800"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-red-700">{inc.id}</span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-slate-900">{inc.zoneName}</span>
              </div>
              <PriorityBadge score={inc.priorityScore} size="sm" />
            </div>

            <p className="text-slate-700 leading-relaxed font-medium">
              {inc.locationDescription}
            </p>

            {/* Blocking Reason Warning Box */}
            <div className="p-3 rounded-lg bg-white border border-red-200 space-y-1">
              <div className="flex items-center gap-1.5 text-red-700 font-bold text-[11px] uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Resource Bottleneck Identified</span>
              </div>
              <p className="text-red-900 text-xs">
                {inc.blockingReason}
              </p>
              <div className="text-[11px] text-slate-500 pt-0.5">
                Required Capability: <strong className="capitalize text-slate-800">{inc.requiredResourceType.replace(/_/g, ' ')}</strong>
              </div>
            </div>

            {/* Escalation Recommendation & Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-red-800">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span>Time before harm: <strong>~{inc.timeUrgencyHours} hours</strong></span>
              </div>

              <button
                onClick={() => onEscalate?.(inc.id)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Escalate to Military 5-Corps SAR</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
