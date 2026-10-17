'use client';

import React from 'react';
import { DbIncident } from '@/lib/dashboard/types';
import { DetailDrawer } from '@/components/shared/DetailDrawer';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatFloodSeverity } from '@/lib/dashboard/helpers';
import {
  MapPin,
  Clock,
  User,
  HeartPulse,
  PersonStanding,
  Waves,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface IncidentDetailDrawerProps {
  incident: DbIncident | null;
  isOpen: boolean;
  onClose: () => void;
  onDispatchClick?: (incident: DbIncident) => void;
}

export function IncidentDetailDrawer({
  incident,
  isOpen,
  onClose,
  onDispatchClick,
}: IncidentDetailDrawerProps) {
  if (!incident) return null;

  const severityMeta = formatFloodSeverity(incident.flood_severity);

  return (
    <DetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Incident ${incident.id.slice(0, 8)}...`}
      subtitle={`${incident.zone_name || 'Unassigned Zone'} • Logged ${new Date(incident.created_at).toLocaleTimeString()}`}
      badge={<PriorityBadge score={incident.priority_score} size="sm" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-500 font-medium">
            Status: <strong className="capitalize text-slate-800">{incident.status}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            {onDispatchClick && (
              <button
                onClick={() => {
                  onClose();
                  onDispatchClick(incident);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold transition-colors shadow-subtle"
              >
                Forward to Rescue Allocation
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Priority Reason Banner (From actual database column priority_reason) */}
      <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Stored Priority Rationale
          </span>
          <span className="font-mono text-xs font-bold text-red-400">
            Database Score: {incident.priority_score}/100
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {incident.priority_reason ? (
            `"${incident.priority_reason}"`
          ) : (
            <span className="text-slate-400 italic">Reason not yet available in database</span>
          )}
        </p>
      </div>

      {/* Incident Details / Caller notes */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Caller Observation & Details
        </h4>
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 space-y-1">
          <p className="leading-relaxed">
            {incident.details || 'No additional narrative logged.'}
          </p>
          {incident.lat !== null && incident.lng !== null && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-200/60">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Coordinates: [{incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}]</span>
            </div>
          )}
        </div>
      </div>

      {/* Vulnerability & Urgency Matrix */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Triage Factors (Database Fields)
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            incident.flood_severity >= 2 ? 'bg-red-50 border-red-200 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Waves className="w-4 h-4 shrink-0 text-teal-600" />
            <div>
              <span className="font-semibold block">Flood Severity</span>
              <span className="text-[11px] text-slate-500">{severityMeta.label} ({incident.flood_severity}/3)</span>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            incident.medical_urgent ? 'bg-red-50 border-red-200 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <HeartPulse className={`w-4 h-4 shrink-0 ${incident.medical_urgent ? 'text-red-600' : 'text-slate-400'}`} />
            <div>
              <span className="font-semibold block">Medical Urgency</span>
              <span className="text-[11px]">{incident.medical_urgent ? 'Urgent Need' : 'None indicated'}</span>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            incident.mobility_help ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <PersonStanding className={`w-4 h-4 shrink-0 ${incident.mobility_help ? 'text-amber-600' : 'text-slate-400'}`} />
            <div>
              <span className="font-semibold block">Mobility Assistance</span>
              <span className="text-[11px]">{incident.mobility_help ? 'Assistance Required' : 'Self-mobile'}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="font-semibold block">Affected People</span>
              <span className="text-[11px]">{incident.people_count} individuals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time-To-Harm & Verification Metadata */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Operational Metadata
        </h4>
        <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Estimated Minutes to Harm:</span>
            <span className="font-mono font-bold text-red-600">
              {incident.minutes_to_harm !== null ? `${incident.minutes_to_harm} min` : 'Unknown / Unrecorded'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Verification Status:</span>
            <StatusBadge status={incident.verification_status} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Dispatch State:</span>
            <StatusBadge status={incident.status} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Reported Timestamp:</span>
            <span className="font-mono text-slate-600 text-[11px]">
              {new Date(incident.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </DetailDrawer>
  );
}
