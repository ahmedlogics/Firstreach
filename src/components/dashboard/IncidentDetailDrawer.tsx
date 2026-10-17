'use client';

import React from 'react';
import { EmergencyIncident } from '@/lib/types';
import { DetailDrawer } from '@/components/shared/DetailDrawer';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatTimeUrgency } from '@/lib/utils';
import {
  MapPin,
  Clock,
  User,
  Phone,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Activity,
  HeartPulse,
  Baby,
  PersonStanding,
  Waves,
} from 'lucide-react';

interface IncidentDetailDrawerProps {
  incident: EmergencyIncident | null;
  isOpen: boolean;
  onClose: () => void;
  onDispatchClick?: (incident: EmergencyIncident) => void;
}

export function IncidentDetailDrawer({
  incident,
  isOpen,
  onClose,
  onDispatchClick,
}: IncidentDetailDrawerProps) {
  if (!incident) return null;

  return (
    <DetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Incident ${incident.id}`}
      subtitle={`${incident.zoneName} • Logged ${incident.createdAt}`}
      badge={<PriorityBadge score={incident.priorityScore} size="sm" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-500 font-medium">
            Status: <strong className="capitalize text-slate-800">{incident.status.replace(/_/g, ' ')}</strong>
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
                Allocate Rescue
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Priority Rationale Section */}
      <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Priority Score Rationale
          </span>
          <span className="font-mono text-sm font-bold text-red-400">
            Score: {incident.priorityScore}/100
          </span>
        </div>
        <p className="text-xs text-slate-300">
          The FirstReach ranking engine weighs time-before-harm, physiological vulnerability, and water ingress:
        </p>
        <ul className="space-y-1.5 pt-1 text-xs text-slate-200">
          {incident.priorityRationale.map((rationale, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-teal-400 font-bold shrink-0">•</span>
              <span>{rationale}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Location Details */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Location & Geography
        </h4>
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <MapPin className="w-4 h-4 text-[#14B8A6]" />
            <span>{incident.zoneName}</span>
          </div>
          <p className="text-slate-600 pl-5.5">{incident.locationDescription}</p>
          <div className="text-[11px] font-mono text-slate-400 pl-5.5 pt-1">
            GPS: [{incident.coordinates[0].toFixed(4)}, {incident.coordinates[1].toFixed(4)}]
          </div>
        </div>
      </div>

      {/* Vulnerability Factors Matrix */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Vulnerability & Urgency Matrix
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            incident.factors.risingWater ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <Waves className="w-4 h-4 shrink-0" />
            <span className="font-medium">Rising Water Surge</span>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            incident.factors.medicalEmergency ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <HeartPulse className="w-4 h-4 shrink-0" />
            <span className="font-medium">Medical Emergency</span>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            incident.factors.peopleTrapped ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-medium">People Trapped</span>
          </div>

          <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            incident.factors.elderlyPresent ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <PersonStanding className="w-4 h-4 shrink-0" />
            <span className="font-medium">Elderly Residents</span>
          </div>
        </div>
      </div>

      {/* Reporter Details */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Reporter & Verification
        </h4>
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Verification State:</span>
            <StatusBadge status={incident.verificationStatus} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Reporter:</span>
            <span className="font-medium text-slate-900">{incident.reporterName || 'Anonymous Intake'}</span>
          </div>
          {incident.reporterPhone && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Contact Number:</span>
              <span className="font-mono text-slate-900">{incident.reporterPhone}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Urgency Window:</span>
            <span className="font-semibold text-red-600 tabular-nums">
              {formatTimeUrgency(incident.timeUrgencyHours)}
            </span>
          </div>
        </div>
      </div>
    </DetailDrawer>
  );
}
