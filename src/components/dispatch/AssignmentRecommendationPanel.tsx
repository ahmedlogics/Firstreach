'use client';

import React, { useState } from 'react';
import {
  DbIncident,
  DbRescueTeam,
  RecommendedAssignment,
  TeamSuitability,
} from '@/lib/dispatch/types';
import { formatPkr } from '@/lib/dispatch/cost';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
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
  Users,
  Compass,
  AlertOctagon,
  ChevronDown,
} from 'lucide-react';

interface AssignmentRecommendationPanelProps {
  selectedIncident: DbIncident | null;
  recommendation: RecommendedAssignment | null;
  selectedTeam: DbRescueTeam | null;
  onSelectTeam: (team: DbRescueTeam) => void;
  onApproveDispatch: (team: DbRescueTeam, overrideReason?: string) => void;
  isDispatching?: boolean;
  className?: string;
}

export function AssignmentRecommendationPanel({
  selectedIncident,
  recommendation,
  selectedTeam,
  onSelectTeam,
  onApproveDispatch,
  isDispatching = false,
  className = '',
}: AssignmentRecommendationPanelProps) {
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  if (!selectedIncident) {
    return (
      <div
        className={`p-8 rounded-2xl border border-dashed border-slate-300 bg-white text-center text-slate-500 space-y-2 ${className}`}
      >
        <Scale className="w-8 h-8 text-slate-400 mx-auto" />
        <h4 className="text-sm font-bold text-slate-700">Select an Emergency from Queue</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Choose an emergency to evaluate algorithmic asset matching based on life-threat urgency,
          mandatory capabilities, and simulated arrival.
        </p>
      </div>
    );
  }

  const isAssigned = selectedIncident.status === 'assigned';
  const recommendedTeam = recommendation?.recommendedTeam;
  const isSelectedTeamOverride =
    selectedTeam && recommendedTeam && selectedTeam.id !== recommendedTeam.id;

  // Active suitability info
  const activeSuitability =
    selectedTeam && recommendation?.suitability?.team?.id === selectedTeam.id
      ? recommendation.suitability
      : recommendation?.alternativeTeams.find((a) => a.team.id === selectedTeam?.id);

  const etaMinutes = activeSuitability?.simulatedEtaMinutes ?? null;
  const costPkr = activeSuitability?.estimatedCostPkr ?? (selectedTeam ? Number(selectedTeam.fixed_cost) : 0);
  const isPotentiallyTooLate = activeSuitability?.isPotentiallyTooLate ?? false;

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-[#14B8A6] border border-teal-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Intelligent Allocation Engine
            </h3>
            <p className="text-xs text-[#64748B]">Algorithmic life-first match recommendation</p>
          </div>
        </div>

        {recommendation ? (
          <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#14B8A6] border border-teal-200">
            {recommendation.suitability.suitabilityScore}% Suitability
          </div>
        ) : (
          <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            No Automated Match
          </div>
        )}
      </div>

      {/* Selected Incident Summary Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900">
              {selectedIncident.id}
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-slate-700">
              Status: <strong className="capitalize">{selectedIncident.status}</strong>
            </span>
          </div>
          <PriorityBadge score={selectedIncident.priority_score ?? 0} size="sm" />
        </div>

        <p className="text-slate-700 font-medium">
          {selectedIncident.details || selectedIncident.priority_reason || 'No description provided.'}
        </p>

        {/* Priority Explanation */}
        {selectedIncident.priority_reason && (
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800">Triage Rationale: </span>
            {selectedIncident.priority_reason}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px] pt-1">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {selectedIncident.people_count ?? 1} persons needing rescue
          </span>
          <span>
            Flood Level: <strong className="text-slate-800">{selectedIncident.flood_severity ?? 0}/3</strong>
          </span>
          <span>
            Verification:{' '}
            <strong className="capitalize text-slate-800">
              {selectedIncident.verification_status}
            </strong>
          </span>
        </div>
      </div>

      {/* Matched Rescue Team Card */}
      {selectedTeam ? (
        <div className="p-4 rounded-xl border-2 border-[#14B8A6]/60 bg-teal-50/20 space-y-3.5 text-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D9488]">
                  {isSelectedTeamOverride ? 'Manually Selected Unit' : 'Recommended Rescue Unit'}
                </span>
                {isSelectedTeamOverride && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                    Dispatcher Override
                  </span>
                )}
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                {selectedTeam.name}
              </h4>
              <p className="text-[11px] text-slate-500">
                Type: <strong className="capitalize">{selectedTeam.team_type}</strong> • Capacity: {selectedTeam.capacity} pax
              </p>
            </div>

            <div className="text-right font-mono tabular-nums shrink-0">
              {etaMinutes !== null ? (
                <>
                  <span className="text-base font-extrabold text-teal-700 block">
                    ~{etaMinutes} min
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans">Simulated ETA</span>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold text-amber-700 block">Location Unverified</span>
                  <span className="text-[10px] text-slate-400 font-sans">Unknown Distance</span>
                </>
              )}
            </div>
          </div>

          {/* Warnings (ETA exceeds time-to-harm, unverified coords) */}
          {isPotentiallyTooLate && (
            <div className="p-2.5 rounded-lg bg-red-100/80 border border-red-300 text-red-900 text-xs flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Potentially too late — requires dispatcher escalation!</strong>
                <span>
                  Simulated arrival (~{etaMinutes}m) exceeds estimated time to harm (~{selectedIncident.minutes_to_harm}m).
                </span>
              </div>
            </div>
          )}

          {activeSuitability?.warning && !isPotentiallyTooLate && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{activeSuitability.warning}</span>
            </div>
          )}

          {/* Operational Rationale from Engine */}
          <div className="p-3 rounded-lg bg-white border border-teal-100 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
              <span>Operational Rationale:</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              {recommendation?.explanation ||
                `${selectedTeam.name} selected. Capacity of ${selectedTeam.capacity} meets incident requirement.`}
            </p>
          </div>

          {/* Safety First Principle */}
          <div className="text-[11px] text-slate-500 italic bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
            <strong>Safety First Principle: </strong>
            {recommendation?.safetyFirstPrinciple ||
              'Life safety and medical urgency took precedence over financial cost.'}
          </div>

          {/* Estimated Cost vs Life Priority */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-teal-100">
            <span className="text-slate-500 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              Estimated Consumable Cost:
            </span>
            <span className="font-mono font-bold text-slate-800">
              {formatPkr(costPkr)}
            </span>
          </div>

          {/* Alternative Eligible Teams (if available) */}
          {recommendation && recommendation.alternativeTeams.length > 0 && (
            <div className="pt-2 border-t border-teal-100 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block">
                Alternative Eligible Units ({recommendation.alternativeTeams.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recommendation.alternativeTeams.map((alt) => (
                  <button
                    key={alt.team.id}
                    onClick={() => {
                      onSelectTeam(alt.team);
                      setShowOverrideInput(true);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      selectedTeam.id === alt.team.id
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    {alt.team.name} ({formatPkr(alt.estimatedCostPkr ?? 0)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Human Override Reason Input (when choosing alternative) */}
          {(isSelectedTeamOverride || showOverrideInput) && (
            <div className="pt-2 border-t border-amber-200 space-y-1.5 bg-amber-50/60 p-3 rounded-lg">
              <label className="text-[11px] font-bold text-amber-900 block">
                Human Override Justification (Logged to Audit Trail):
              </label>
              <input
                type="text"
                placeholder="e.g. Field coordinator requested specific team callsign..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-dashed border-red-200 bg-red-50/30 text-center text-xs text-red-800 space-y-1">
          <AlertOctagon className="w-6 h-6 text-red-500 mx-auto" />
          <h4 className="font-bold text-sm">No Feasible Rescue Team Available</h4>
          <p className="text-[11px] text-slate-600">
            All active units are either committed or lack the mandatory capabilities. Refer to the Unserved Emergencies panel below for escalation.
          </p>
        </div>
      )}

      {/* Dispatch Action Button */}
      <div>
        <button
          onClick={() => {
            if (selectedTeam) {
              onApproveDispatch(selectedTeam, isSelectedTeamOverride ? overrideReason : undefined);
            }
          }}
          disabled={!selectedTeam || isAssigned || isDispatching}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-subtle transition-all ${
            !selectedTeam || isAssigned || isDispatching
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#14B8A6] hover:bg-[#0D9488] text-white hover:shadow-card'
          }`}
        >
          {isDispatching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying & Executing Database Transaction...</span>
            </>
          ) : isAssigned ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
              <span>Incident Already Assigned</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Authorize Assignment & Commit Asset</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-slate-400 mt-2">
          Verified Dispatcher Mode: Calls transactional RPC confirm_assignment on Supabase with server-side validation.
        </p>
      </div>
    </div>
  );
}
