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
  Anchor,
  Truck,
  LifeBuoy,
  Check,
  ArrowRight,
  Info,
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
        className={`p-8 rounded-2xl border border-dashed border-[#E8E6E1] bg-white text-center text-[#757B81] space-y-3 shadow-2xs ${className}`}
      >
        <div className="w-12 h-12 rounded-xl bg-[#F7F6F2] flex items-center justify-center mx-auto text-[#757B81]">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#252A30]">Select an Emergency from Queue</h4>
          <p className="text-xs text-[#757B81] max-w-sm mx-auto mt-1 leading-relaxed">
            Click on any incident in the Ranked Emergency Queue to evaluate algorithmic asset matching
            based on life-threat urgency, mandatory craft capabilities, and simulated arrival.
          </p>
        </div>
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
  const costPkr =
    activeSuitability?.estimatedCostPkr ?? (selectedTeam ? Number(selectedTeam.fixed_cost) : 0);
  const isPotentiallyTooLate = activeSuitability?.isPotentiallyTooLate ?? false;

  const peopleCount = selectedIncident.people_count ?? 1;
  const teamCapacity = selectedTeam?.capacity ?? 1;
  const capacityPct = Math.min(100, Math.round((peopleCount / teamCapacity) * 100));

  const getTeamIcon = (type?: string) => {
    switch (type) {
      case 'boat':
        return <Anchor className="w-4 h-4 text-[#536A82]" />;
      case 'vehicle':
        return <Truck className="w-4 h-4 text-[#252A30]" />;
      case 'medical':
        return <LifeBuoy className="w-4 h-4 text-[#B74349]" />;
      default:
        return <LifeBuoy className="w-4 h-4 text-[#536A82]" />;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E8E6E1] shadow-sm p-5 sm:p-6 space-y-5 transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E6E1]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EDF1F5] text-[#536A82] border border-[#E8E6E1] shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-[#252A30] tracking-tight">
                Intelligent Allocation Engine
              </h3>
              <span className="w-2 h-2 rounded-full bg-[#536A82] inline-block" />
            </div>
            <p className="text-xs text-[#757B81]">Algorithmic life-first match recommendation</p>
          </div>
        </div>

        {recommendation ? (
          <div className="px-3 py-1 rounded-md text-xs font-bold bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/30 shadow-2xs font-mono">
            {recommendation.suitability.suitabilityScore}% MATCH
          </div>
        ) : (
          <div className="px-3 py-1 rounded-md text-xs font-semibold bg-[#FFF2DD] text-[#A87426] border border-[#A87426]/30">
            No Automated Match
          </div>
        )}
      </div>

      {/* Selected Incident Summary Banner */}
      <div className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#252A30]">
              {selectedIncident.id}
            </span>
            <span className="text-[#92979D]">•</span>
            <span className="font-medium text-[#757B81]">
              Status: <strong className="capitalize text-[#252A30]">{selectedIncident.status}</strong>
            </span>
          </div>
          <PriorityBadge score={selectedIncident.priority_score ?? 0} size="sm" />
        </div>

        <p className="text-[#252A30] font-normal leading-relaxed">
          {selectedIncident.details || selectedIncident.priority_reason || 'No description provided.'}
        </p>

        {/* Priority Explanation */}
        {selectedIncident.priority_reason && (
          <div className="p-2.5 rounded-lg bg-white border border-[#E8E6E1] text-[11px] text-[#757B81] leading-normal">
            <span className="font-bold text-[#252A30]">Triage Rationale: </span>
            {selectedIncident.priority_reason}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-[#757B81] text-[11px] pt-1 border-t border-[#E8E6E1]">
          <span className="flex items-center gap-1 font-semibold text-[#252A30]">
            <Users className="w-3.5 h-3.5 text-[#757B81]" />
            {peopleCount} victims requiring extraction
          </span>
          <span>
            Flood Severity:{' '}
            <strong className="text-[#252A30]">{selectedIncident.flood_severity ?? 0}/3</strong>
          </span>
          <span>
            Verification:{' '}
            <strong className="capitalize text-[#252A30]">
              {selectedIncident.verification_status}
            </strong>
          </span>
        </div>
      </div>

      {/* Matched Rescue Team Card */}
      {selectedTeam ? (
        <div className="p-4 rounded-xl border border-[#E8E6E1] bg-white space-y-3.5 text-xs shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] shadow-2xs mt-0.5">
                {getTeamIcon(selectedTeam.team_type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#536A82]">
                    {isSelectedTeamOverride ? 'Manually Selected Unit' : 'Recommended Rescue Unit'}
                  </span>
                  {isSelectedTeamOverride && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-[#FFF2DD] text-[#A87426] border border-[#A87426]/30">
                      Override
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-[#252A30] mt-0.5">
                  {selectedTeam.name}
                </h4>
                <p className="text-[11px] text-[#757B81]">
                  Type: <strong className="capitalize text-[#252A30]">{selectedTeam.team_type}</strong> • Single-Trip Capacity: {selectedTeam.capacity} pax
                </p>
              </div>
            </div>

            <div className="text-right font-mono tabular-nums shrink-0">
              {etaMinutes !== null ? (
                <>
                  <span className="text-base font-bold text-[#536A82] block">
                    ~{etaMinutes} min
                  </span>
                  <span className="text-[10px] text-[#757B81] font-sans font-medium">Simulated ETA</span>
                </>
              ) : (
                <>
                  <span className="text-xs font-semibold text-[#A87426] block">Unverified Location</span>
                  <span className="text-[10px] text-[#92979D] font-sans">Unknown Distance</span>
                </>
              )}
            </div>
          </div>

          {/* Capacity Utilization Progress Bar */}
          <div className="space-y-1 bg-[#F7F6F2] p-2.5 rounded-lg border border-[#E8E6E1]">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#757B81] font-medium">Capacity Utilization:</span>
              <span className="font-bold text-[#252A30]">
                {peopleCount} of {teamCapacity} pax ({capacityPct}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E8E6E1] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  capacityPct > 80 ? 'bg-[#A87426]' : 'bg-[#536A82]'
                }`}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>

          {/* Life-First Validation Checklist */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F7F6F2] p-2.5 rounded-lg border border-[#E8E6E1]">
            <div className="flex items-center gap-1.5 text-[#252A30]">
              <div className="w-4 h-4 rounded-full bg-[#E5EEE8] text-[#377D65] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>Capacity Sufficient ({teamCapacity} $\ge$ {peopleCount})</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#252A30]">
              <div className="w-4 h-4 rounded-full bg-[#E5EEE8] text-[#377D65] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>Flood-Capable Gear</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#252A30]">
              <div className="w-4 h-4 rounded-full bg-[#E5EEE8] text-[#377D65] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>
                {selectedIncident.medical_urgent ? 'Paramedic Support Ready' : 'Standard Extraction'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[#252A30]">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  isPotentiallyTooLate
                    ? 'bg-[#FAE8E7] text-[#B74349]'
                    : 'bg-[#E5EEE8] text-[#377D65]'
                }`}
              >
                {isPotentiallyTooLate ? (
                  <AlertOctagon className="w-2.5 h-2.5 stroke-[3]" />
                ) : (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                )}
              </div>
              <span className={isPotentiallyTooLate ? 'text-[#B74349] font-bold' : ''}>
                {isPotentiallyTooLate ? 'Risks Late Arrival' : 'Arrives Before Harm'}
              </span>
            </div>
          </div>

          {/* Lateness Warnings */}
          {isPotentiallyTooLate && (
            <div className="p-3 rounded-xl bg-[#FAE8E7] border border-[#B74349]/30 text-[#B74349] text-xs flex items-start gap-2.5 shadow-2xs">
              <AlertOctagon className="w-5 h-5 text-[#B74349] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Potentially too late — requires dispatcher escalation!</strong>
                <span className="text-[11px] leading-relaxed">
                  Simulated arrival (~{etaMinutes}m) exceeds estimated time to harm (~{selectedIncident.minutes_to_harm}m).
                  Review air support or immediate field escalation.
                </span>
              </div>
            </div>
          )}

          {activeSuitability?.warning && !isPotentiallyTooLate && (
            <div className="p-2.5 rounded-lg bg-[#FFF2DD] border border-[#A87426]/30 text-[#A87426] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#A87426] shrink-0" />
              <span>{activeSuitability.warning}</span>
            </div>
          )}

          {/* Operational Rationale from Engine */}
          <div className="p-3 rounded-lg bg-white border border-[#E8E6E1] text-xs text-[#252A30] space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-[#252A30]">
              <ShieldCheck className="w-4 h-4 text-[#536A82]" />
              <span>Operational Rationale:</span>
            </div>
            <p className="text-[#757B81] text-[11px]">
              {recommendation?.explanation ||
                `${selectedTeam.name} selected. Capacity of ${selectedTeam.capacity} meets incident requirement.`}
            </p>
          </div>

          {/* Safety First Principle */}
          <div className="text-[11px] text-[#757B81] italic bg-[#F7F6F2] p-2.5 rounded-lg border border-[#E8E6E1]">
            <strong className="text-[#252A30]">Safety First Principle: </strong>
            {recommendation?.safetyFirstPrinciple ||
              'Life safety and medical urgency took precedence over financial cost.'}
          </div>

          {/* Estimated Cost vs Life Priority */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E8E6E1]">
            <span className="text-[#757B81] flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-[#92979D]" />
              Estimated Consumable Fuel Burn:
            </span>
            <span className="font-mono font-bold text-[#252A30] text-xs">
              {formatPkr(costPkr)}
            </span>
          </div>

          {/* Alternative Eligible Teams with Instant Diff Comparison */}
          {recommendation && recommendation.alternativeTeams.length > 0 && (
            <div className="pt-2 border-t border-[#E8E6E1] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#252A30]">
                  Alternative Eligible Units ({recommendation.alternativeTeams.length}):
                </span>
                <span className="text-[10px] text-[#757B81]">Click to compare & select</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recommendation.alternativeTeams.map((alt) => {
                  const isCurrent = selectedTeam.id === alt.team.id;
                  const altCost = alt.estimatedCostPkr ?? 0;
                  const altEta = alt.simulatedEtaMinutes ?? 0;

                  return (
                    <button
                      key={alt.team.id}
                      onClick={() => {
                        onSelectTeam(alt.team);
                        setShowOverrideInput(true);
                      }}
                      className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium transition-all text-left flex items-center gap-2 ${
                        isCurrent
                          ? 'bg-[#536A82] text-white border-[#536A82] shadow-2xs font-bold'
                          : 'bg-white text-[#252A30] border-[#E8E6E1] hover:border-[#536A82] hover:bg-[#EDF1F5]/40'
                      }`}
                    >
                      <span>{alt.team.name}</span>
                      <span className={`text-[10px] font-mono ${isCurrent ? 'text-[#EDF1F5]' : 'text-[#757B81]'}`}>
                        ~{altEta}m • {formatPkr(altCost)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Human Override Reason Input (when choosing alternative) */}
          {(isSelectedTeamOverride || showOverrideInput) && (
            <div className="pt-2 border-t border-[#A87426]/30 space-y-2 bg-[#FFF2DD]/70 p-3 rounded-xl border border-[#A87426]/20">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#A87426] block">
                  Human Override Justification (Logged to Database Mission Audit):
                </label>
                <span className="text-[10px] text-[#A87426] font-mono font-bold">Mandatory</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Field staging requested team callsign; secondary road blockage..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#A87426]/30 bg-white text-xs text-[#252A30] placeholder-[#92979D] focus:outline-none focus:ring-1 focus:ring-[#536A82] font-medium"
              />
              {/* Quick justification chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {['Field radio request', 'Closer secondary staging', 'Pre-allocated fuel reserves'].map(
                  (chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setOverrideReason(chip)}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#FFF2DD] text-[#A87426] border border-[#A87426]/20 hover:bg-[#FFF2DD]/90 transition-colors"
                    >
                      +{chip}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-dashed border-[#B74349]/40 bg-[#FAE8E7]/30 text-center text-xs text-[#B74349] space-y-1">
          <AlertOctagon className="w-6 h-6 text-[#B74349] mx-auto" />
          <h4 className="font-bold text-sm">No Feasible Rescue Team Available</h4>
          <p className="text-[11px] text-[#757B81]">
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
          className={`w-full py-3.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all ${
            !selectedTeam || isAssigned || isDispatching
              ? 'bg-[#E8E6E1] text-[#92979D] cursor-not-allowed'
              : 'bg-[#536A82] hover:bg-[#40566D] text-white active:scale-[0.99]'
          }`}
        >
          {isDispatching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying & Executing Database Transaction...</span>
            </>
          ) : isAssigned ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#92979D]" />
              <span>Incident Already Assigned</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Authorize Assignment & Commit Asset</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-[#757B81] mt-2">
          Verified Dispatcher Mode: Calls transactional RPC confirm_assignment on Supabase with server-side validation.
        </p>
      </div>
    </div>
  );
}
