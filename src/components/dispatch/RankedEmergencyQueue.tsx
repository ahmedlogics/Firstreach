'use client';

import React, { useState } from 'react';
import { EmergencyIncident } from '@/lib/types';
import { MOCK_INCIDENTS } from '@/lib/mock-data';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatTimeUrgency } from '@/lib/utils';
import {
  Flame,
  Users,
  Clock,
  HeartPulse,
  AlertOctagon,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface RankedEmergencyQueueProps {
  selectedIncident: EmergencyIncident | null;
  onSelectIncident: (incident: EmergencyIncident) => void;
  className?: string;
}

export function RankedEmergencyQueue({
  selectedIncident,
  onSelectIncident,
  className = '',
}: RankedEmergencyQueueProps) {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium'>('all');

  const filteredIncidents = MOCK_INCIDENTS.filter((inc) => {
    if (filterSeverity === 'all') return true;
    return inc.severity === filterSeverity;
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4 ${className}`}>
      {/* Header with filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
            Ranked Emergency Queue
          </h3>
          <p className="text-xs text-[#64748B]">
            Prioritized by medical criticality and time-to-harm.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['all', 'critical', 'high', 'medium'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                filterSeverity === sev
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
        {filteredIncidents.map((incident) => {
          const isSelected = selectedIncident?.id === incident.id;
          const isUnserved = incident.status === 'unserved';
          const hasMedical = incident.factors.medicalEmergency;

          return (
            <div
              key={incident.id}
              onClick={() => onSelectIncident(incident)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#14B8A6] bg-teal-50/40 ring-2 ring-[#14B8A6]/30 shadow-card'
                  : isUnserved
                  ? 'border-red-300 bg-red-50/30 hover:bg-red-50/60'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {incident.id}
                  </span>
                  <PriorityBadge score={incident.priorityScore} size="sm" />
                  {isUnserved && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                      <AlertOctagon className="w-3 h-3 text-red-600" />
                      Resource Deficit
                    </span>
                  )}
                </div>

                <StatusBadge status={incident.verificationStatus} size="sm" />
              </div>

              {/* Location & Details */}
              <h4 className="text-xs font-bold text-[#0F172A] truncate">
                {incident.zoneName}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                {incident.locationDescription}
              </p>

              {/* Tags & Urgency Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2 border-t border-slate-100/80 text-[11px]">
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {incident.affectedPeople} trapped
                  </span>

                  {hasMedical && (
                    <span className="flex items-center gap-1 font-bold text-red-600">
                      <HeartPulse className="w-3.5 h-3.5" />
                      Medical Alert
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 font-mono tabular-nums">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className={incident.timeUrgencyHours <= 1.5 ? 'text-red-600 font-bold' : 'text-slate-600'}>
                    {formatTimeUrgency(incident.timeUrgencyHours)}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ml-1 transition-transform ${isSelected ? 'translate-x-1 text-[#14B8A6]' : 'text-slate-400'}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
