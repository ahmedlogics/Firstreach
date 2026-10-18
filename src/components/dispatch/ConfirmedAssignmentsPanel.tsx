'use client';

import React, { useState } from 'react';
import {
  DbAssignment,
  DbIncident,
  DbRescueTeam,
  DbShelter,
} from '@/lib/dispatch/types';
import { formatPkr } from '@/lib/dispatch/cost';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Navigation,
  Info,
  Radio,
  Play,
  Check,
  Building,
  Users,
  AlertTriangle,
  X,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ConfirmedAssignmentsPanelProps {
  assignments: DbAssignment[];
  incidentsMap: Record<string, DbIncident>;
  teamsMap: Record<string, DbRescueTeam>;
  shelters?: DbShelter[];
  onOperationUpdated?: () => Promise<void> | void;
  className?: string;
}

export function ConfirmedAssignmentsPanel({
  assignments,
  incidentsMap,
  teamsMap,
  shelters = [],
  onOperationUpdated,
  className = '',
}: ConfirmedAssignmentsPanelProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [startingId, setStartingId] = useState<string | null>(null);
  const [completingAssignment, setCompletingAssignment] = useState<DbAssignment | null>(null);

  // Completion Dialog form state
  const [leaderConfirmed, setLeaderConfirmed] = useState(false);
  const [assistedCount, setAssistedCount] = useState<number>(1);
  const [teamReady, setTeamReady] = useState(true);
  const [selectedShelterId, setSelectedShelterId] = useState<string>('');
  const [shelterArrivalCount, setShelterArrivalCount] = useState<number>(0);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Partition assignments
  const activeAssignments = assignments.filter(
    (a) => a.status === 'assigned' || a.status === 'en_route'
  );
  const completedAssignments = assignments.filter(
    (a) => a.status === 'completed'
  );

  const totalCommittedCost = assignments.reduce(
    (acc, a) => acc + (Number(a.estimated_cost) || 0),
    0
  );

  // Open completion modal
  const handleOpenCompletionModal = (assignment: DbAssignment) => {
    const inc = incidentsMap[assignment.incident_id];
    const defaultPeople = inc?.people_count ?? 1;

    setCompletingAssignment(assignment);
    setLeaderConfirmed(false);
    setAssistedCount(defaultPeople);
    setTeamReady(true);
    setSelectedShelterId(assignment.shelter_id || '');
    setShelterArrivalCount(defaultPeople);
    setResolutionNotes('');
    setDialogError(null);
  };

  // Start operation (assigned -> en_route)
  const handleStartOperation = async (assignmentId: string) => {
    try {
      setStartingId(assignmentId);
      const res = await fetch(`/api/assignments/${assignmentId}/start`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-coordinator': 'true',
          'x-dispatcher-role': 'coordinator',
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start operation');
      }

      if (onOperationUpdated) {
        await onOperationUpdated();
      }
    } catch (err: any) {
      alert(`Could not start mission: ${err.message}`);
    } finally {
      setStartingId(null);
    }
  };

  // Submit mission completion
  const handleConfirmCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingAssignment) return;

    if (!leaderConfirmed) {
      setDialogError('Team Leader on-scene confirmation is required to resolve this mission.');
      return;
    }

    // Check shelter capacity
    if (selectedShelterId && shelterArrivalCount > 0) {
      const shelter = shelters.find((s) => s.id === selectedShelterId);
      if (shelter) {
        const remainingSpots = shelter.capacity - shelter.occupied;
        if (shelterArrivalCount > remainingSpots) {
          setDialogError(
            `Shelter capacity exceeded: '${shelter.name}' only has ${Math.max(0, remainingSpots)} spots remaining, but ${shelterArrivalCount} evacuees reported.`
          );
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      setDialogError(null);

      const res = await fetch(`/api/assignments/${completingAssignment.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-coordinator': 'true',
          'x-dispatcher-role': 'coordinator',
        },
        body: JSON.stringify({
          leaderConfirmed: true,
          assistedPeopleCount: assistedCount,
          teamReady,
          shelterId: selectedShelterId || null,
          evacueesArrivedCount: selectedShelterId ? shelterArrivalCount : 0,
          resolutionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete mission');
      }

      setCompletingAssignment(null);
      if (onOperationUpdated) {
        await onOperationUpdated();
      }
    } catch (err: any) {
      setDialogError(err.message || 'Error completing rescue mission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate target shelter for modal
  const targetIncident = completingAssignment ? incidentsMap[completingAssignment.incident_id] : null;
  const targetTeam = completingAssignment ? teamsMap[completingAssignment.team_id] : null;
  const totalIncidentPeople = targetIncident?.people_count ?? 1;
  const isPartialRescue = assistedCount < totalIncidentPeople;

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E8E6E1] shadow-sm p-5 sm:p-6 space-y-4 ${className}`}
    >
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E6E1]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EDF1F5] text-[#536A82] border border-[#E8E6E1] shadow-2xs">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#252A30] tracking-tight">
                Rescue Operations & Deployment Lifecycle
              </h3>
            </div>
            <p className="text-xs text-[#757B81]">
              Track operational dispatch status, transition craft en route, and release units upon verified extraction.
            </p>
          </div>
        </div>

        {/* Tab Switcher & Total Committed Metric */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <div className="flex items-center p-0.5 bg-[#F7F6F2] rounded-lg border border-[#E8E6E1] text-xs">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'active'
                  ? 'bg-white text-[#252A30] shadow-2xs'
                  : 'text-[#757B81] hover:text-[#252A30]'
              }`}
            >
              <span>Active Operations</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'active'
                    ? 'bg-[#EDF1F5] text-[#536A82] font-bold'
                    : 'bg-[#E8E6E1] text-[#757B81]'
                }`}
              >
                {activeAssignments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'completed'
                  ? 'bg-white text-[#252A30] shadow-2xs'
                  : 'text-[#757B81] hover:text-[#252A30]'
              }`}
            >
              <span>Completed</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'completed'
                    ? 'bg-[#E5EEE8] text-[#377D65] font-bold'
                    : 'bg-[#E8E6E1] text-[#757B81]'
                }`}
              >
                {completedAssignments.length}
              </span>
            </button>
          </div>

          <div className="hidden lg:block bg-[#F7F6F2] border border-[#E8E6E1] px-2.5 py-1.5 rounded-lg font-mono text-[11px] text-[#757B81]">
            Committed: <strong className="text-[#252A30]">{formatPkr(totalCommittedCost)}</strong>
          </div>
        </div>
      </div>

      {/* ACTIVE OPERATIONS VIEW */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          {activeAssignments.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[#F7F6F2]/70 border border-dashed border-[#E8E6E1]">
              <ShieldCheck className="w-8 h-8 text-[#92979D] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#252A30]">No active rescue missions currently in the field.</p>
              <p className="text-xs text-[#757B81] max-w-md mx-auto mt-1">
                Select an emergency from the Ranked Emergency Queue above and authorize a capable craft to deploy.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
              {activeAssignments.map((assignment) => {
                const incident = incidentsMap[assignment.incident_id];
                const team = teamsMap[assignment.team_id];
                const isEnRoute = assignment.status === 'en_route';
                const isStarting = startingId === assignment.id;

                return (
                  <div
                    key={assignment.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 text-xs ${
                      isEnRoute
                        ? 'border-[#536A82]/30 bg-[#EDF1F5]/30 shadow-2xs'
                        : 'border-[#E8E6E1] bg-white hover:border-[#D5D2CA]'
                    }`}
                  >
                    {/* Header: ID, Unit, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#536A82] bg-[#EDF1F5] px-2 py-0.5 rounded-md border border-[#536A82]/20">
                          MISSION-{assignment.id.slice(0, 8)}
                        </span>
                        <span className="text-[#92979D]">•</span>
                        <span className="font-bold text-[#252A30]">
                          {team ? team.name : `Unit ${assignment.team_id.slice(0, 8)}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={assignment.status} size="sm" />
                      </div>
                    </div>

                    {/* Target Incident & Location Details */}
                    <div className="flex items-center gap-1.5 text-[#757B81] bg-[#F7F6F2] p-2 rounded-lg border border-[#E8E6E1]">
                      <Radio className="w-3.5 h-3.5 text-[#536A82] shrink-0" />
                      <span className="truncate">
                        Target Emergency: <strong className="text-[#252A30] font-mono">{assignment.incident_id.slice(0, 8)}</strong>
                        {incident ? ` (${incident.people_count} pax requiring extraction)` : ''}
                      </span>
                    </div>

                    {/* Mission Telemetry: ETA, Cost, Approved At */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[#757B81] text-[11px] border-t border-[#E8E6E1]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#92979D]" />
                        <span>
                          ETA: <strong className="text-[#252A30] font-mono">~{assignment.estimated_eta_minutes ?? 30}m</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-[#92979D]" />
                        <span>
                          Cost: <strong className="text-[#252A30] font-mono">{formatPkr(Number(assignment.estimated_cost) || 0)}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[#757B81]">
                        <FileText className="w-3 h-3 text-[#92979D]" />
                        <span className="font-mono">
                          {new Date(assignment.approved_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Note if logged */}
                    {assignment.note && (
                      <div className="p-2 rounded bg-[#FFF2DD]/70 border border-[#A87426]/30 text-[11px] text-[#A87426] font-medium">
                        {assignment.note}
                      </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="pt-2 border-t border-[#E8E6E1] flex items-center justify-between gap-2">
                      <div className="text-[11px] text-[#757B81] font-medium">
                        {isEnRoute ? (
                          <span className="flex items-center gap-1.5 text-[#536A82]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#536A82] inline-block" />
                            Craft En Route (Live Mission)
                          </span>
                        ) : (
                          <span className="text-[#757B81]">Awaiting craft departure</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isEnRoute ? (
                          <button
                            onClick={() => handleStartOperation(assignment.id)}
                            disabled={isStarting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#536A82] hover:bg-[#40566D] text-white transition-all shadow-2xs disabled:opacity-50"
                            title="Signal craft departure: changes assignment to en_route and incident to in_progress"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isStarting ? 'Starting...' : 'Start Operation'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenCompletionModal(assignment)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#377D65] hover:bg-[#2F6B56] text-white transition-all shadow-2xs"
                            title="Open verified completion dialog to mark evacuees assisted and release rescue team"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Completed</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED OPERATIONS VIEW */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completedAssignments.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[#F7F6F2]/70 border border-dashed border-[#E8E6E1]">
              <Clock className="w-8 h-8 text-[#92979D] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#252A30]">No completed missions recorded yet.</p>
              <p className="text-xs text-[#757B81] max-w-md mx-auto mt-1">
                Completed rescue operations with timestamps and evacuee delivery receipts will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
              {completedAssignments.map((assignment) => {
                const incident = incidentsMap[assignment.incident_id];
                const team = teamsMap[assignment.team_id];
                const shelter = shelters.find((s) => s.id === assignment.shelter_id);

                return (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-xl border border-[#E8E6E1] bg-[#F7F6F2]/40 hover:bg-white hover:border-[#D5D2CA] transition-all space-y-2.5 text-xs shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#377D65] bg-[#E5EEE8] px-2 py-0.5 rounded-md border border-[#377D65]/20">
                          MISSION-{assignment.id.slice(0, 8)}
                        </span>
                        <span className="text-[#92979D]">•</span>
                        <span className="font-bold text-[#252A30]">
                          {team ? team.name : `Unit ${assignment.team_id.slice(0, 8)}`}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#E5EEE8] text-[#377D65] border border-[#377D65]/20">
                        <Check className="w-3 h-3" />
                        Completed
                      </span>
                    </div>

                    {/* Target & Resolution details */}
                    <div className="text-[#757B81] text-[11px] space-y-1">
                      <div>
                        Target Emergency: <strong className="text-[#252A30] font-mono">{assignment.incident_id.slice(0, 8)}</strong>
                      </div>
                      {shelter && (
                        <div className="flex items-center gap-1.5 text-[#536A82] font-medium">
                          <Building className="w-3 h-3 text-[#536A82]" />
                          <span>Delivered to Shelter: <strong className="text-[#252A30]">{shelter.name}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Completion Timestamps and Cost */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E6E1] text-[11px] text-[#757B81]">
                      <div>
                        Completed:{' '}
                        <strong className="text-[#252A30] font-mono">
                          {assignment.completed_at
                            ? new Date(assignment.completed_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Logged'}
                        </strong>
                      </div>
                      <div className="text-right">
                        Final Cost: <strong className="text-[#252A30] font-mono">{formatPkr(Number(assignment.estimated_cost) || 0)}</strong>
                      </div>
                    </div>

                    {/* Note */}
                    {assignment.note && (
                      <div className="p-2 rounded bg-white border border-[#E8E6E1] text-[11px] text-[#252A30]">
                        {assignment.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MISSION COMPLETION MODAL */}
      {completingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E8E6E1] shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E8E6E1] flex items-center justify-between bg-[#F7F6F2]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#E5EEE8] text-[#377D65] border border-[#377D65]/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#252A30] tracking-tight">
                    Authorize Mission Completion
                  </h4>
                  <p className="text-xs text-[#757B81] font-mono">
                    MISSION-{completingAssignment.id.slice(0, 8)} • {targetTeam?.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCompletingAssignment(null)}
                className="p-1.5 rounded-lg text-[#92979D] hover:text-[#252A30] hover:bg-[#E8E6E1] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleConfirmCompletion} className="p-5 space-y-4 text-xs">
              {dialogError && (
                <div className="p-3 rounded-xl bg-[#FAE8E7] border border-[#B74349]/30 text-[#B74349] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B74349] shrink-0 mt-0.5" />
                  <span>{dialogError}</span>
                </div>
              )}

              {/* Requirement 1: Team Leader Confirmation Checkbox */}
              <div className="p-3.5 rounded-xl bg-[#EDF1F5]/60 border border-[#536A82]/30 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={leaderConfirmed}
                    onChange={(e) => setLeaderConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#536A82] rounded border-[#E8E6E1] focus:ring-[#536A82]"
                  />
                  <div>
                    <span className="font-bold text-[#252A30] block">
                      Rescue Team Leader Confirmation Received
                    </span>
                    <span className="text-[11px] text-[#757B81]">
                      On-scene leader confirmed via radio / satellite relay that search and extraction is completed.
                    </span>
                  </div>
                </label>
              </div>

              {/* Requirement 2: People Assisted / Partial Rescue Handling */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#252A30] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#536A82]" />
                    <span>Evacuees Safely Assisted in Mission:</span>
                  </label>
                  <span className="font-mono text-[#757B81]">
                    Incident Total: <strong>{totalIncidentPeople} pax</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={assistedCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const safeVal = isNaN(val) ? 1 : Math.max(1, val);
                      setAssistedCount(safeVal);
                      if (selectedShelterId) {
                        setShelterArrivalCount(safeVal);
                      }
                    }}
                    className="w-24 px-3 py-1.5 border border-[#E8E6E1] rounded-lg text-[#252A30] font-bold focus:ring-1 focus:ring-[#536A82] focus:outline-none"
                  />
                  <div className="flex-1">
                    {!isPartialRescue ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#377D65] bg-[#E5EEE8] px-2 py-1 rounded-md border border-[#377D65]/20">
                        <Check className="w-3 h-3" />
                        Full Rescue: Incident will be marked RESOLVED.
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A87426] bg-[#FFF2DD] px-2 py-1 rounded-md border border-[#A87426]/20">
                        <AlertTriangle className="w-3 h-3 text-[#A87426]" />
                        Partial Rescue: {totalIncidentPeople - assistedCount} evacuees remain. Incident stays OPEN.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirement 3: Destination Shelter Selection */}
              <div className="space-y-1.5 pt-2 border-t border-[#E8E6E1]">
                <label className="font-bold text-[#252A30] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#536A82]" />
                  <span>Destination Shelter (Optional):</span>
                </label>
                <select
                  value={selectedShelterId}
                  onChange={(e) => {
                    setSelectedShelterId(e.target.value);
                    if (e.target.value) {
                      setShelterArrivalCount(assistedCount);
                    } else {
                      setShelterArrivalCount(0);
                    }
                  }}
                  className="w-full px-3 py-1.5 border border-[#E8E6E1] rounded-lg text-[#252A30] bg-white focus:ring-1 focus:ring-[#536A82] focus:outline-none text-xs"
                >
                  <option value="">No Shelter (Field triage / dry-ground extraction)</option>
                  {shelters.map((s) => {
                    const remaining = s.capacity - s.occupied;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.occupied}/{s.capacity} occupied ({remaining} spots available)
                      </option>
                    );
                  })}
                </select>

                {/* If shelter selected, ask for confirmation of arrived evacuees */}
                {selectedShelterId && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[#F7F6F2] border border-[#E8E6E1] flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#757B81]">Evacuees delivered to shelter:</span>
                    <input
                      type="number"
                      min={0}
                      max={assistedCount}
                      value={shelterArrivalCount}
                      onChange={(e) => setShelterArrivalCount(parseInt(e.target.value, 10) || 0)}
                      className="w-20 px-2 py-1 border border-[#E8E6E1] rounded-md text-xs font-bold text-[#252A30] text-center"
                    />
                  </div>
                )}
              </div>

              {/* Requirement 4: Team Ready for Next Assignment */}
              <div className="pt-2 border-t border-[#E8E6E1]">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={teamReady}
                    onChange={(e) => setTeamReady(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#536A82] rounded border-[#E8E6E1] focus:ring-[#536A82]"
                  />
                  <div>
                    <span className="font-bold text-[#252A30] block">
                      Team ready for next assignment
                    </span>
                    <span className="text-[11px] text-[#757B81]">
                      {teamReady
                        ? 'Unit will immediately return to AVAILABLE pool for subsequent dispatches.'
                        : 'Unit will remain BUSY for crew rest, equipment restocking, or decontamination.'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Requirement 5: Resolution Notes */}
              <div className="space-y-1 pt-1">
                <label className="font-bold text-[#757B81]">Dispatcher Resolution Log / Notes (Optional):</label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. All evacuees in stable condition; transferred to rescue ambulancier."
                  className="w-full px-3 py-1.5 border border-[#E8E6E1] rounded-lg text-[#252A30] text-xs focus:ring-1 focus:ring-[#536A82] focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#E8E6E1] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCompletingAssignment(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#757B81] hover:bg-[#F7F6F2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !leaderConfirmed}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#377D65] hover:bg-[#2F6B56] text-white transition-all shadow-2xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Recording Resolution...' : 'Finalize & Release'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
