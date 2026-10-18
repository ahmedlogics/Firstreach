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
          <span className="text-xs text-[#757B81] font-medium">
            Status: <strong className="capitalize text-[#252A30]">{incident.status}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#E8E6E1] text-xs font-semibold text-[#757B81] hover:bg-[#EDF1F5] transition-colors"
            >
              Close
            </button>
            {onDispatchClick && (
              <button
                onClick={() => {
                  onClose();
                  onDispatchClick(incident);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#536A82] hover:bg-[#40566D] text-white text-xs font-bold transition-colors shadow-subtle"
              >
                Forward to Rescue Allocation
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Priority Reason Banner */}
      <div className="p-4 rounded-xl bg-[#252A30] text-white space-y-2 border border-[#343B43]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#EDF1F5]">
            Stored Priority Rationale
          </span>
          <span className="font-mono text-xs font-bold text-[#FAE8E7]">
            Database Score: {incident.priority_score}/100
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {incident.priority_reason ? (
            `"${incident.priority_reason}"`
          ) : (
            <span className="text-[#92979D] italic">Reason not yet available in database</span>
          )}
        </p>
      </div>

      {/* Incident Details / Caller notes */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#757B81]">
          Caller Observation & Details
        </h4>
        <div className="p-3.5 rounded-xl border border-[#E8E6E1] bg-[#F7F6F2] text-xs text-[#252A30] space-y-1">
          <p className="leading-relaxed">
            {incident.details || 'No additional narrative logged.'}
          </p>
          {incident.lat !== null && incident.lng !== null && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#757B81] pt-1 border-t border-[#E8E6E1]">
              <MapPin className="w-3.5 h-3.5 text-[#536A82]" />
              <span>Coordinates: [{incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}]</span>
            </div>
          )}
        </div>
      </div>

      {/* Vulnerability & Urgency Matrix */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#757B81]">
          Triage Factors (Database Fields)
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            incident.flood_severity >= 2 ? 'bg-[#FAE8E7] border-[#B74349]/30 text-[#B74349]' : 'bg-[#F7F6F2] border-[#E8E6E1] text-[#252A30]'
          }`}>
            <Waves className="w-4 h-4 shrink-0 text-[#536A82]" />
            <div>
              <span className="font-semibold block">Flood Severity</span>
              <span className="text-[11px] text-[#757B81]">{severityMeta.label} ({incident.flood_severity}/3)</span>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            incident.medical_urgent ? 'bg-[#FAE8E7] border-[#B74349]/30 text-[#B74349]' : 'bg-[#F7F6F2] border-[#E8E6E1] text-[#757B81]'
          }`}>
            <HeartPulse className={`w-4 h-4 shrink-0 ${incident.medical_urgent ? 'text-[#B74349]' : 'text-[#92979D]'}`} />
            <div>
              <span className="font-semibold block">Medical Urgency</span>
              <span className="text-[11px]">{incident.medical_urgent ? 'Urgent Need' : 'None indicated'}</span>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            incident.mobility_help ? 'bg-[#FFF2DD] border-[#A87426]/30 text-[#A87426]' : 'bg-[#F7F6F2] border-[#E8E6E1] text-[#757B81]'
          }`}>
            <PersonStanding className={`w-4 h-4 shrink-0 ${incident.mobility_help ? 'text-[#A87426]' : 'text-[#92979D]'}`} />
            <div>
              <span className="font-semibold block">Mobility Assistance</span>
              <span className="text-[11px]">{incident.mobility_help ? 'Assistance Required' : 'Self-mobile'}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-[#E8E6E1] bg-[#F7F6F2] text-[#252A30] flex items-center gap-2">
            <User className="w-4 h-4 text-[#92979D] shrink-0" />
            <div>
              <span className="font-semibold block">Affected People</span>
              <span className="text-[11px] text-[#757B81]">{incident.people_count} individuals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time-To-Harm & Verification Metadata */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#757B81]">
          Operational Metadata
        </h4>
        <div className="p-3 rounded-xl border border-[#E8E6E1] bg-white space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#757B81]">Estimated Minutes to Harm:</span>
            <span className="font-mono font-bold text-[#B74349]">
              {incident.minutes_to_harm !== null ? `${incident.minutes_to_harm} min` : 'Unknown / Unrecorded'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#757B81]">Verification Status:</span>
            <StatusBadge status={incident.verification_status} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#757B81]">Dispatch State:</span>
            <StatusBadge status={incident.status} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#757B81]">Reported Timestamp:</span>
            <span className="font-mono text-[#757B81] text-[11px]">
              {new Date(incident.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </DetailDrawer>
  );
}
