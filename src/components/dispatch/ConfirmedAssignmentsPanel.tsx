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
      className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5 sm:p-6 space-y-4 ${className}`}
    >
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-[#14B8A6] border border-teal-200/60 shadow-2xs">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Rescue Operations & Deployment Lifecycle
              </h3>
            </div>
            <p className="text-xs text-[#64748B]">
              Track operational dispatch status, transition craft en route, and release units upon verified extraction.
            </p>
          </div>
        </div>

        {/* Tab Switcher & Total Committed Metric */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'active'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Active Operations</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'active'
                    ? 'bg-teal-100 text-teal-800 font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {activeAssignments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'completed'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Completed</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {completedAssignments.length}
              </span>
            </button>
          </div>

          <div className="hidden lg:block bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl font-mono text-[11px] text-slate-700">
            Committed: <strong className="text-slate-900">{formatPkr(totalCommittedCost)}</strong>
          </div>
        </div>
      </div>

      {/* ACTIVE OPERATIONS VIEW */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          {activeAssignments.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
              <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No active rescue missions currently in the field.</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
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
                        ? 'border-teal-200 bg-gradient-to-br from-teal-50/40 to-white shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Header: ID, Unit, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          MISSION-{assignment.id.slice(0, 8)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-slate-900">
                          {team ? team.name : `Unit ${assignment.team_id.slice(0, 8)}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={assignment.status} size="sm" />
                      </div>
                    </div>

                    {/* Target Incident & Location Details */}
                    <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <Radio className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">
                        Target Emergency: <strong className="text-slate-800 font-mono">{assignment.incident_id.slice(0, 8)}</strong>
                        {incident ? ` (${incident.people_count} pax requiring extraction)` : ''}
                      </span>
                    </div>

                    {/* Mission Telemetry: ETA, Cost, Approved At */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-slate-600 text-[11px] border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          ETA: <strong className="text-slate-900 font-mono">~{assignment.estimated_eta_minutes ?? 30}m</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-slate-400" />
                        <span>
                          Cost: <strong className="text-slate-900 font-mono">{formatPkr(Number(assignment.estimated_cost) || 0)}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-500">
                        <FileText className="w-3 h-3 text-slate-400" />
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
                      <div className="p-2 rounded bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 font-medium">
                        {assignment.note}
                      </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500 font-medium">
                        {isEnRoute ? (
                          <span className="flex items-center gap-1.5 text-teal-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            Craft En Route (Live Mission)
                          </span>
                        ) : (
                          <span className="text-slate-500">Awaiting craft departure</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isEnRoute ? (
                          <button
                            onClick={() => handleStartOperation(assignment.id)}
                            disabled={isStarting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#14B8A6] hover:bg-[#0D9488] text-white transition-all shadow-subtle disabled:opacity-50"
                            title="Signal craft departure: changes assignment to en_route and incident to in_progress"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isStarting ? 'Starting...' : 'Start Operation'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenCompletionModal(assignment)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-subtle"
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
            <div className="p-8 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No completed missions recorded yet.</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
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
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all space-y-2.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          MISSION-{assignment.id.slice(0, 8)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-slate-900">
                          {team ? team.name : `Unit ${assignment.team_id.slice(0, 8)}`}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <Check className="w-3 h-3" />
                        Completed
                      </span>
                    </div>

                    {/* Target & Resolution details */}
                    <div className="text-slate-600 text-[11px] space-y-1">
                      <div>
                        Target Emergency: <strong className="text-slate-800 font-mono">{assignment.incident_id.slice(0, 8)}</strong>
                      </div>
                      {shelter && (
                        <div className="flex items-center gap-1.5 text-teal-700 font-medium">
                          <Building className="w-3 h-3 text-teal-600" />
                          <span>Delivered to Shelter: <strong>{shelter.name}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Completion Timestamps and Cost */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                      <div>
                        Completed:{' '}
                        <strong className="text-slate-800 font-mono">
                          {assignment.completed_at
                            ? new Date(assignment.completed_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Logged'}
                        </strong>
                      </div>
                      <div className="text-right">
                        Final Cost: <strong className="text-slate-800 font-mono">{formatPkr(Number(assignment.estimated_cost) || 0)}</strong>
                      </div>
                    </div>

                    {/* Note */}
                    {assignment.note && (
                      <div className="p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-700">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                    Authorize Mission Completion
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    MISSION-{completingAssignment.id.slice(0, 8)} • {targetTeam?.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCompletingAssignment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleConfirmCompletion} className="p-5 space-y-4 text-xs">
              {dialogError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{dialogError}</span>
                </div>
              )}

              {/* Requirement 1: Team Leader Confirmation Checkbox */}
              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={leaderConfirmed}
                    onChange={(e) => setLeaderConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <div>
                    <span className="font-bold text-teal-950 block">
                      Rescue Team Leader Confirmation Received
                    </span>
                    <span className="text-[11px] text-teal-800">
                      On-scene leader confirmed via radio / satellite relay that search and extraction is completed.
                    </span>
                  </div>
                </label>
              </div>

              {/* Requirement 2: People Assisted / Partial Rescue Handling */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    <span>Evacuees Safely Assisted in Mission:</span>
                  </label>
                  <span className="font-mono text-slate-500">
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
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <div className="flex-1">
                    {!isPartialRescue ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                        <Check className="w-3 h-3" />
                        Full Rescue: Incident will be marked RESOLVED.
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Partial Rescue: {totalIncidentPeople - assistedCount} evacuees remain. Incident stays OPEN.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirement 3: Destination Shelter Selection */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-teal-600" />
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
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs"
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
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-700">Evacuees delivered to shelter:</span>
                    <input
                      type="number"
                      min={0}
                      max={assistedCount}
                      value={shelterArrivalCount}
                      onChange={(e) => setShelterArrivalCount(parseInt(e.target.value, 10) || 0)}
                      className="w-20 px-2 py-1 border border-slate-300 rounded-md text-xs font-bold text-slate-900 text-center"
                    />
                  </div>
                )}
              </div>

              {/* Requirement 4: Team Ready for Next Assignment */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={teamReady}
                    onChange={(e) => setTeamReady(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Team ready for next assignment
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {teamReady
                        ? 'Unit will immediately return to AVAILABLE pool for subsequent dispatches.'
                        : 'Unit will remain BUSY for crew rest, equipment restocking, or decontamination.'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Requirement 5: Resolution Notes */}
              <div className="space-y-1 pt-1">
                <label className="font-bold text-slate-700">Dispatcher Resolution Log / Notes (Optional):</label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. All evacuees in stable condition; transferred to rescue ambulancier."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCompletingAssignment(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !leaderConfirmed}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-subtle disabled:opacity-50"
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
