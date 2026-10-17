'use client';

import React from 'react';
import { EmergencyIncident, RescueTeam } from '@/lib/types';
import { MOCK_DISPATCH_RECOMMENDATION } from '@/lib/mock-data';
import { formatCurrencyPkr } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coins,
  Send,
  AlertTriangle,
  HelpCircle,
  Scale,
} from 'lucide-react';

interface AssignmentRecommendationPanelProps {
  selectedIncident: EmergencyIncident | null;
  selectedTeam: RescueTeam | null;
  onApproveDispatch: () => void;
  className?: string;
}

export function AssignmentRecommendationPanel({
  selectedIncident,
  selectedTeam,
  onApproveDispatch,
  className = '',
}: AssignmentRecommendationPanelProps) {
  if (!selectedIncident) {
    return (
      <div className={`p-6 rounded-2xl border border-dashed border-slate-300 bg-white text-center text-slate-500 space-y-2 ${className}`}>
        <Scale className="w-8 h-8 text-slate-400 mx-auto" />
        <h4 className="text-sm font-bold text-slate-700">Select an Incident from Queue</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Choose an emergency to evaluate algorithmic asset matching based on ETA, specialized medical capabilities, and transit safety.
        </p>
      </div>
    );
  }

  const recommendation = MOCK_DISPATCH_RECOMMENDATION;
  const isEmergencyUnserved = selectedIncident.status === 'unserved';

  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-[#14B8A6] border border-teal-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Recommended Rescue Match
            </h3>
            <p className="text-xs text-[#64748B]">Algorithmic triage & optimal unit pairing</p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#14B8A6] border border-teal-200">
          98% Match Confidence
        </div>
      </div>

      {/* Selected Incident Summary Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900">{selectedIncident.id}</span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-slate-800">{selectedIncident.zoneName}</span>
          </div>
          <PriorityBadge score={selectedIncident.priorityScore} size="sm" />
        </div>
        <p className="text-slate-600 line-clamp-2">{selectedIncident.locationDescription}</p>
        <div className="flex items-center gap-4 text-slate-500 text-[11px] pt-1">
          <span>{selectedIncident.affectedPeople} persons needing extraction</span>
          <span>Verification: <strong className="capitalize text-slate-700">{selectedIncident.verificationStatus}</strong></span>
        </div>
      </div>

      {/* Matched Rescue Team Card */}
      <div className="p-4 rounded-xl border-2 border-[#14B8A6]/60 bg-teal-50/20 space-y-3 text-xs">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D9488]">
              Assigned Asset
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
              {selectedTeam ? selectedTeam.name : 'Edhi Foundation Swiftwater Unit 3'}
            </h4>
            <p className="text-[11px] text-slate-500">
              Type: {selectedTeam?.type || 'medical_boat'} • Callsign: {selectedTeam?.contactCallsign || 'EDHI-BOAT-03'}
            </p>
          </div>

          <div className="text-right font-mono tabular-nums">
            <span className="text-base font-extrabold text-teal-700 block">
              ~{selectedTeam?.etaMinutes || recommendation.etaMinutes} min
            </span>
            <span className="text-[10px] text-slate-400">Estimated Arrival</span>
          </div>
        </div>

        {/* Suitability & Selection Explanation */}
        <div className="p-3 rounded-lg bg-white border border-teal-100 text-xs text-slate-700 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
            <span>Operational Rationale:</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            {recommendation.reasoning}
          </p>
        </div>

        {/* Estimated Cost vs Life Priority */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-teal-100">
          <span className="text-slate-500 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-slate-400" />
            Consumable Fuel Burn:
          </span>
          <span className="font-mono font-semibold text-slate-800">
            {formatCurrencyPkr(selectedTeam?.estimatedCostPkr || recommendation.estimatedCostPkr)}
          </span>
        </div>
      </div>

      {/* Dispatch Action Button */}
      <div>
        <button
          onClick={onApproveDispatch}
          disabled={isEmergencyUnserved}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-subtle transition-all ${
            isEmergencyUnserved
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#14B8A6] hover:bg-[#0D9488] text-white hover:shadow-card'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>
            {isEmergencyUnserved ? 'Resource Deficit (Cannot Assign Directly)' : 'Authorize Rescue Team Dispatch'}
          </span>
        </button>

        <p className="text-[10px] text-center text-slate-400 mt-2">
          Demo Mode: Dispatches trigger simulated radio assignment and update local state without persisting.
        </p>
      </div>
    </div>
  );
}
