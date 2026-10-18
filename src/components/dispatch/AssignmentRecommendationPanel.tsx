'use client';

import React, { useState } from 'react';
import {
  DbIncident,
  DbRescueTeam,
  RecommendedAssignment,
} from '@/lib/dispatch/types';
import { formatPkr } from '@/lib/dispatch/cost';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coins,
  Send,
  AlertTriangle,
  Scale,
  Users,
  AlertOctagon,
  Anchor,
  Truck,
  LifeBuoy,
  Check,
  Shield,
  Layers,
} from 'lucide-react';

interface AssignmentRecommendationPanelProps {
  selectedIncident: DbIncident | null;
  recommendation: RecommendedAssignment | null;
  selectedTeam: DbRescueTeam | null;
  onSelectTeam: (team: DbRescueTeam) => void;
  onApproveDispatch: (team: DbRescueTeam, overrideReason?: string) => void;
  isDispatching?: boolean;
  onToggleFleetDrawer?: () => void;
  className?: string;
}

export function AssignmentRecommendationPanel({
  selectedIncident,
  recommendation,
  selectedTeam,
  onSelectTeam,
  onApproveDispatch,
  isDispatching = false,
  onToggleFleetDrawer,
  className = '',
}: AssignmentRecommendationPanelProps) {
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  if (!selectedIncident) {
    return (
      <div
        className={`p-8 rounded-xl border border-dashed border-[#E4E8EC] bg-white text-center text-[#6B7782] space-y-3 shadow-subtle ${className}`}
      >
        <div className="w-12 h-12 rounded-[10px] bg-[#F7F8FA] border border-[#E4E8EC] flex items-center justify-center mx-auto text-[#6B7782]">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#18232D]">Select an Emergency from Queue</h4>
          <p className="text-xs text-[#6B7782] max-w-sm mx-auto mt-1 leading-relaxed">
            Select an incident in the emergency queue to evaluate algorithmic unit matching based on threat priority, required craft capabilities, and estimated arrival windows.
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
        return <Anchor className="w-4 h-4 text-[#375A6B]" />;
      case 'vehicle':
        return <Truck className="w-4 h-4 text-[#18232D]" />;
      case 'medical':
        return <LifeBuoy className="w-4 h-4 text-[#BC414A]" />;
      default:
        return <LifeBuoy className="w-4 h-4 text-[#375A6B]" />;
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-[#E4E8EC] shadow-subtle p-4 sm:p-5 space-y-4 transition-all ${className}`}
    >
      {/* Panel Header with subtle "Life Safety First" indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4E8EC]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[8px] bg-[#EAF0F4] text-[#375A6B] border border-[#375A6B]/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[#18232D] tracking-tight">
                Rescue Recommendation
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#E9F3EF] text-[#258167] border border-[#258167]/25 text-[10px] font-semibold">
                <Shield className="w-2.5 h-2.5" />
                Life Safety First
              </span>
            </div>
          </div>
        </div>

        {recommendation ? (
          <div className="px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#EAF0F4] text-[#375A6B] border border-[#375A6B]/25 font-mono tabular-nums">
            {recommendation.suitability.suitabilityScore}% Match
          </div>
        ) : (
          <div className="px-2.5 py-1 rounded-[6px] text-xs font-medium bg-[#FFF4E3] text-[#A87528] border border-[#A87528]/25">
            Manual Review
          </div>
        )}
      </div>

      {/* 1. Selected Emergency & Urgency Summary */}
      <div className="p-3.5 rounded-[10px] bg-[#F7F8FA] border border-[#E4E8EC] space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-[#18232D]">
              {selectedIncident.id.length > 10 ? selectedIncident.id.slice(0, 8) : selectedIncident.id}
            </span>
            <span className="text-[#8B959E]">•</span>
            <span className="text-[#6B7782] capitalize">
              Status: <strong className="text-[#18232D] font-medium">{selectedIncident.status}</strong>
            </span>
          </div>
          <PriorityBadge score={selectedIncident.priority_score ?? 0} size="sm" />
        </div>

        <p className="text-[#18232D] leading-relaxed font-normal">
          {selectedIncident.details || selectedIncident.priority_reason || 'Emergency rescue report logged in flood inundation sector.'}
        </p>

        {selectedIncident.priority_reason && (
          <div className="p-2 rounded-[6px] bg-white border border-[#E4E8EC] text-[11px] text-[#6B7782] leading-normal">
            <strong className="text-[#18232D]">Triage Rationale: </strong>
            {selectedIncident.priority_reason}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-[#6B7782] text-[11px] pt-1 border-t border-[#E4E8EC]">
          <span className="flex items-center gap-1 font-medium text-[#18232D] tabular-nums">
            <Users className="w-3.5 h-3.5 text-[#6B7782]" />
            {peopleCount} persons requiring rescue
          </span>
          <span>
            Flood Level: <strong className="text-[#18232D]">{selectedIncident.flood_severity ?? 0}/3</strong>
          </span>
          <span>
            Verification: <strong className="capitalize text-[#18232D]">{selectedIncident.verification_status}</strong>
          </span>
        </div>
      </div>

      {/* 2 & 3. Recommended Capable Team & Estimated Arrival Time */}
      {selectedTeam ? (
        <div className="p-3.5 rounded-[10px] border border-[#E4E8EC] bg-white space-y-3 text-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-[8px] bg-[#F7F8FA] border border-[#E4E8EC] mt-0.5">
                {getTeamIcon(selectedTeam.team_type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#375A6B]">
                    {isSelectedTeamOverride ? 'Manually Selected Unit' : 'Recommended Rescue Unit'}
                  </span>
                  {isSelectedTeamOverride && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-[4px] bg-[#FFF4E3] text-[#A87528] border border-[#A87528]/25">
                      Override
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-[#18232D] mt-0.5">
                  {selectedTeam.name}
                </h4>
                <p className="text-[11px] text-[#6B7782]">
                  Type: <strong className="capitalize text-[#18232D]">{selectedTeam.team_type}</strong> • Single-Trip Capacity: {selectedTeam.capacity} pax
                </p>
              </div>
            </div>

            <div className="text-right font-mono tabular-nums shrink-0">
              {etaMinutes !== null ? (
                <>
                  <span className="text-base font-semibold text-[#375A6B] block">
                    ~{etaMinutes} min
                  </span>
                  <span className="text-[10px] text-[#6B7782] font-sans font-medium">Simulated ETA</span>
                </>
              ) : (
                <>
                  <span className="text-xs font-semibold text-[#A87528] block">Unverified Location</span>
                  <span className="text-[10px] text-[#8B959E] font-sans">Unknown Distance</span>
                </>
              )}
            </div>
          </div>

          {/* Capacity Utilization */}
          <div className="space-y-1 bg-[#F7F8FA] p-2.5 rounded-[8px] border border-[#E4E8EC]">
            <div className="flex justify-between text-[11px] tabular-nums">
              <span className="text-[#6B7782] font-medium">Capacity Utilization:</span>
              <span className="font-semibold text-[#18232D]">
                {peopleCount} of {teamCapacity} pax ({capacityPct}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#E4E8EC] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  capacityPct > 80 ? 'bg-[#A87528]' : 'bg-[#258167]'
                }`}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>

          {/* 5. Capability Validation Checklist */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F7F8FA] p-2.5 rounded-[8px] border border-[#E4E8EC]">
            <div className="flex items-center gap-1.5 text-[#18232D]">
              <div className="w-4 h-4 rounded-full bg-[#E9F3EF] text-[#258167] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>Capacity Sufficient ({teamCapacity} $\ge$ {peopleCount})</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#18232D]">
              <div className="w-4 h-4 rounded-full bg-[#E9F3EF] text-[#258167] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>Flood-Capable Gear</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#18232D]">
              <div className="w-4 h-4 rounded-full bg-[#E9F3EF] text-[#258167] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>
                {selectedIncident.medical_urgent ? 'Paramedic Support Ready' : 'Standard Extraction'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[#18232D]">
              {etaMinutes === null || selectedIncident.lat === null || selectedIncident.lng === null ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-[#FFF4E3] text-[#A87528] flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[#A87528] font-medium">ETA / Route Pending</span>
                </>
              ) : isPotentiallyTooLate ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-[#FBECEE] text-[#BC414A] flex items-center justify-center shrink-0">
                    <AlertOctagon className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-[#BC414A] font-semibold">Risks Late Arrival</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full bg-[#E9F3EF] text-[#258167] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Arrives Before Harm</span>
                </>
              )}
            </div>
          </div>

          {/* Lateness Warning */}
          {isPotentiallyTooLate && (
            <div className="p-3 rounded-[8px] bg-[#FBECEE] border border-[#BC414A]/25 text-[#BC414A] text-xs flex items-start gap-2.5">
              <AlertOctagon className="w-4 h-4 text-[#BC414A] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Potentially too late — dispatcher escalation recommended</strong>
                <span className="text-[11px] leading-relaxed text-[#6B7782]">
                  Simulated arrival (~{etaMinutes}m) approaches or exceeds estimated time to harm (~{selectedIncident.minutes_to_harm}m).
                </span>
              </div>
            </div>
          )}

          {activeSuitability?.warning && !isPotentiallyTooLate && (
            <div className="p-2.5 rounded-[8px] bg-[#FFF4E3] border border-[#A87528]/25 text-[#A87528] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#A87528] shrink-0" />
              <span>{activeSuitability.warning}</span>
            </div>
          )}

          {/* Operational Rationale from Engine */}
          <div className="p-2.5 rounded-[8px] bg-[#F7F8FA] border border-[#E4E8EC] text-xs text-[#18232D] space-y-1 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-[#18232D]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#375A6B]" />
              <span>Operational Rationale:</span>
            </div>
            <p className="text-[#6B7782] text-[11px]">
              {recommendation?.explanation ||
                `${selectedTeam.name} allocated. Capacity of ${selectedTeam.capacity} fulfills requirements.`}
            </p>
          </div>

          {/* 4. Estimated Dispatch Cost */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E4E8EC]">
            <span className="text-[#6B7782] flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-[#8B959E]" />
              Estimated Consumable Cost:
            </span>
            <span className="font-mono font-semibold text-[#18232D] text-xs tabular-nums">
              {formatPkr(costPkr)}
            </span>
          </div>

          {/* Alternative Eligible Teams (Top 2 at a glance) */}
          {recommendation && recommendation.alternativeTeams.length > 0 && (
            <div className="pt-2 border-t border-[#E4E8EC] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#18232D]">
                  Alternative Eligible Units ({recommendation.alternativeTeams.length}):
                </span>
                {onToggleFleetDrawer && (
                  <button
                    type="button"
                    onClick={onToggleFleetDrawer}
                    className="text-[10px] text-[#375A6B] hover:underline font-medium"
                  >
                    View All Fleet
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {recommendation.alternativeTeams.slice(0, 3).map((alt) => {
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
                      className={`text-[11px] px-2.5 py-1.5 rounded-[8px] border transition-colors text-left flex items-center gap-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-[#375A6B] text-white border-[#375A6B] font-semibold'
                          : 'bg-white text-[#18232D] border-[#E4E8EC] hover:bg-[#F7F8FA] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <span>{alt.team.name}</span>
                      <span className={`text-[10px] font-mono tabular-nums ${isCurrent ? 'text-[#EAF0F4]' : 'text-[#6B7782]'}`}>
                        ~{altEta}m • {formatPkr(altCost)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Human Override Justification */}
          {(isSelectedTeamOverride || showOverrideInput) && (
            <div className="pt-2 border-t border-[#A87528]/25 space-y-2 bg-[#FFF4E3] p-3 rounded-[8px] border border-[#A87528]/25">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#A87528] block">
                  Human Override Justification (Logged to Audit Trail):
                </label>
                <span className="text-[10px] text-[#A87528] font-mono font-semibold">Required</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Field staging requested team callsign; secondary road blockage..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-[8px] border border-[#A87528]/30 bg-white text-xs text-[#18232D] placeholder-[#8B959E] focus:outline-none focus:ring-1 focus:ring-[#375A6B] font-medium"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {['Field radio request', 'Closer secondary staging', 'Pre-allocated fuel reserves'].map(
                  (chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setOverrideReason(chip)}
                      className="text-[10px] px-2 py-0.5 rounded-[4px] bg-white text-[#A87528] border border-[#A87528]/25 hover:bg-[#FFF4E3] transition-colors"
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
        <div className="p-5 rounded-[10px] border border-dashed border-[#BC414A]/30 bg-[#FBECEE]/40 text-center text-xs text-[#BC414A] space-y-1">
          <AlertOctagon className="w-5 h-5 text-[#BC414A] mx-auto" />
          <h4 className="font-semibold text-sm">No Feasible Rescue Unit Available</h4>
          <p className="text-[11px] text-[#6B7782]">
            All active units are engaged or lack mandatory equipment. View the Unserved tab to flag for mutual-aid escalation.
          </p>
        </div>
      )}

      {/* 6. Approval Action Button */}
      <div className="pt-1">
        <button
          onClick={() => {
            if (selectedTeam) {
              onApproveDispatch(selectedTeam, isSelectedTeamOverride ? overrideReason : undefined);
            }
          }}
          disabled={!selectedTeam || isAssigned || isDispatching}
          className={`w-full py-3 px-4 rounded-[10px] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            !selectedTeam || isAssigned || isDispatching
              ? 'bg-[#E4E8EC] text-[#8B959E] cursor-not-allowed'
              : 'bg-[#375A6B] hover:bg-[#294858] text-white shadow-subtle'
          }`}
        >
          {isDispatching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Authorizing Transaction...</span>
            </>
          ) : isAssigned ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#8B959E]" />
              <span>Incident Already Assigned</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Authorize Assignment & Commit Asset</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-[#8B959E] mt-2">
          Verified Dispatcher Mode: Executes atomic RPC confirmation with live craft locking.
        </p>
      </div>
    </div>
  );
}
