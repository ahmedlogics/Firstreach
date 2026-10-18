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
  Radio,
  Play,
  Check,
  Building,
  Users,
  AlertTriangle,
  X,
  ShieldCheck,
  RotateCcw,
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

  const targetIncident = completingAssignment ? incidentsMap[completingAssignment.incident_id] : null;
  const targetTeam = completingAssignment ? teamsMap[completingAssignment.team_id] : null;
  const totalIncidentPeople = targetIncident?.people_count ?? 1;
  const isPartialRescue = assistedCount < totalIncidentPeople;

  return (
    <div
      className={`bg-white rounded-xl border border-[#E4E8EC] shadow-subtle p-4 sm:p-5 space-y-4 ${className}`}
    >
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E8EC]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[8px] bg-[#EAF0F4] text-[#375A6B] border border-[#375A6B]/20">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#18232D] tracking-tight">
              Active Rescue Operations
            </h3>
            <p className="text-xs text-[#6B7782] mt-0.5">
              Live craft execution lifecycle, route tracking, and verified mission debriefing.
            </p>
          </div>
        </div>

        {/* View Switcher & Committed Resource Metric */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-[#F7F8FA] rounded-[10px] border border-[#E4E8EC] text-xs font-medium">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] transition-colors cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-white text-[#18232D] font-semibold shadow-subtle'
                  : 'text-[#6B7782] hover:text-[#18232D]'
              }`}
            >
              <span>Active</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                  activeTab === 'active'
                    ? 'bg-[#EAF0F4] text-[#375A6B] font-bold'
                    : 'bg-[#E4E8EC] text-[#6B7782]'
                }`}
              >
                {activeAssignments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] transition-colors cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-white text-[#18232D] font-semibold shadow-subtle'
                  : 'text-[#6B7782] hover:text-[#18232D]'
              }`}
            >
              <span>Completed</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                  activeTab === 'completed'
                    ? 'bg-[#E9F3EF] text-[#258167] font-bold'
                    : 'bg-[#E4E8EC] text-[#6B7782]'
                }`}
              >
                {completedAssignments.length}
              </span>
            </button>
          </div>

          <div className="hidden lg:block bg-[#F7F8FA] border border-[#E4E8EC] px-3 py-1.5 rounded-[10px] font-mono text-[11px] text-[#6B7782] tabular-nums">
            Committed: <strong className="text-[#18232D]">{formatPkr(totalCommittedCost)}</strong>
          </div>
        </div>
      </div>

      {/* ACTIVE OPERATIONS VIEW */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          {activeAssignments.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[#F7F8FA] border border-dashed border-[#E4E8EC]">
              <ShieldCheck className="w-8 h-8 text-[#8B959E] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#18232D]">No active rescue missions currently in the field.</p>
              <p className="text-xs text-[#6B7782] max-w-md mx-auto mt-1 leading-relaxed">
                Switch to the Allocate tab to select an emergency and authorize a capable craft to deploy.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeAssignments.map((assignment) => {
                const incident = incidentsMap[assignment.incident_id];
                const team = teamsMap[assignment.team_id];
                const isEnRoute = assignment.status === 'en_route';
                const isStarting = startingId === assignment.id;

                return (
                  <div
                    key={assignment.id}
                    className={`p-4 rounded-xl border transition-colors space-y-3 text-xs bg-white ${
                      isEnRoute
                        ? 'border-[#375A6B]/30 shadow-subtle ring-1 ring-[#375A6B]/20'
                        : 'border-[#E4E8EC] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {/* Header: ID, Unit, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#375A6B] bg-[#EAF0F4] px-2 py-0.5 rounded-[6px] border border-[#375A6B]/20">
                          MISSION-{assignment.id.slice(0, 8)}
                        </span>
                        <span className="text-[#8B959E]">•</span>
                        <span className="font-semibold text-[#18232D]">
                          {team ? team.name : `Unit ${assignment.team_id.slice(0, 8)}`}
                        </span>
                      </div>

                      <StatusBadge status={assignment.status} size="sm" />
                    </div>

                    {/* Target Incident & Location Details */}
                    <div className="flex items-center gap-1.5 text-[#6B7782] bg-[#F7F8FA] p-2.5 rounded-[8px] border border-[#E4E8EC]">
                      <Radio className="w-3.5 h-3.5 text-[#375A6B] shrink-0" />
                      <span className="truncate">
                        Target Emergency: <strong className="text-[#18232D] font-mono">{assignment.incident_id.slice(0, 8)}</strong>
                        {incident ? ` (${incident.people_count ?? 1} pax requiring rescue)` : ''}
                      </span>
                    </div>

                    {/* Mission Lifecycle Stage Indicator */}
                    <div className="flex items-center justify-between p-2 rounded-[8px] bg-[#F7F8FA] border border-[#E4E8EC] text-[11px]">
                      <span className="text-[#6B7782] font-medium">Lifecycle:</span>
                      <div className="flex items-center gap-1 font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded-[4px] font-semibold ${
                            assignment.status === 'assigned'
                              ? 'bg-[#EAF0F4] text-[#375A6B]'
                              : 'text-[#8B959E]'
                          }`}
                        >
                          Assigned
                        </span>
                        <span className="text-[#8B959E]">→</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-[4px] font-semibold ${
                            assignment.status === 'en_route'
                              ? 'bg-[#FFF4E3] text-[#A87528]'
                              : 'text-[#8B959E]'
                          }`}
                        >
                          En Route
                        </span>
                        <span className="text-[#8B959E]">→</span>
                        <span className="px-1.5 py-0.5 rounded-[4px] text-[#8B959E]">
                          Completed
                        </span>
                      </div>
                    </div>

                    {/* Mission Telemetry: ETA, Cost, Approved At */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[#6B7782] text-[11px] border-t border-[#E4E8EC] tabular-nums">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8B959E]" />
                        <span>
                          ETA: <strong className="text-[#18232D] font-mono">~{assignment.estimated_eta_minutes ?? 30}m</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-[#8B959E]" />
                        <span>
                          Cost: <strong className="text-[#18232D] font-mono">{formatPkr(Number(assignment.estimated_cost) || 0)}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#8B959E]" />
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
                      <div className="p-2 rounded-[6px] bg-[#FFF4E3] border border-[#A87528]/25 text-[11px] text-[#A87528] font-medium">
                        {assignment.note}
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="pt-2 border-t border-[#E4E8EC] flex items-center justify-between gap-2">
                      <div className="text-[11px] text-[#6B7782]">
                        {isEnRoute ? (
                          <span className="flex items-center gap-1.5 text-[#375A6B] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#375A6B] inline-block animate-pulse" />
                            Craft En Route (In Progress)
                          </span>
                        ) : (
                          <span className="text-[#6B7782]">Awaiting craft departure</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isEnRoute ? (
                          <button
                            onClick={() => handleStartOperation(assignment.id)}
                            disabled={isStarting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-[#375A6B] hover:bg-[#294858] text-white transition-colors cursor-pointer disabled:opacity-50"
                            title="Signal craft departure: marks assignment en_route"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isStarting ? 'Starting...' : 'Start Operation'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenCompletionModal(assignment)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-[#258167] hover:bg-[#1f6b55] text-white transition-colors cursor-pointer"
                            title="Open completion modal to record evacuees and release team"
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
            <div className="p-8 text-center rounded-xl bg-[#F7F8FA] border border-dashed border-[#E4E8EC]">
              <Clock className="w-8 h-8 text-[#8B959E] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#18232D]">No completed missions recorded yet.</p>
              <p className="text-xs text-[#6B7782] max-w-md mx-auto mt-1 leading-relaxed">
                Completed rescue operations with arrival timestamps and shelter delivery records will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[600px] overflow-y-auto pr-1">
              {completedAssignments.map((assignment) => {
                const team = teamsMap[assignment.team_id];
                const shelter = shelters.find((s) => s.id === assignment.shelter_id);

                return (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-xl border border-[#E4E8EC] bg-[#F7F8FA] space-y-2.5 text-xs shadow-subtle"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#258167] bg-[#E9F3EF] px-2 py-0.5 rounded-[6px] border border-[#258167]/20">
                          MISSION-{assignment.id.slice(0, 8)}
                        </span>
                        <span className="text-[#8B959E]">•</span>
                        <span className="font-semibold text-[#18232D]">
                          {team ? team.name : `Unit ${assignment.team_id.slice(0, 8)}`}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-semibold bg-[#E9F3EF] text-[#258167] border border-[#258167]/20">
                        <Check className="w-3 h-3" />
                        Completed
                      </span>
                    </div>

                    <div className="text-[#6B7782] text-[11px] space-y-1">
                      <div>
                        Target Emergency: <strong className="text-[#18232D] font-mono">{assignment.incident_id.slice(0, 8)}</strong>
                      </div>
                      {shelter && (
                        <div className="flex items-center gap-1.5 text-[#375A6B] font-medium">
                          <Building className="w-3 h-3 text-[#375A6B]" />
                          <span>Delivered to Shelter: <strong className="text-[#18232D]">{shelter.name}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4E8EC] text-[11px] text-[#6B7782] tabular-nums">
                      <div>
                        Completed:{' '}
                        <strong className="text-[#18232D] font-mono">
                          {assignment.completed_at
                            ? new Date(assignment.completed_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Logged'}
                        </strong>
                      </div>
                      <div className="text-right">
                        Cost:{' '}
                        <strong className="text-[#18232D] font-mono">
                          {formatPkr(Number(assignment.estimated_cost) || 0)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mission Completion Modal */}
      {completingAssignment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-[#E4E8EC] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E4E8EC] bg-[#F7F8FA]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[8px] bg-[#E9F3EF] text-[#258167]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#18232D]">Verified Mission Completion</h3>
                  <p className="text-xs text-[#6B7782]">Debrief extraction and release unit</p>
                </div>
              </div>
              <button
                onClick={() => setCompletingAssignment(null)}
                className="p-1 rounded-[6px] text-[#8B959E] hover:text-[#18232D] hover:bg-[#E4E8EC] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmCompletion} className="p-5 space-y-4 text-xs">
              {dialogError && (
                <div className="p-3 rounded-[8px] bg-[#FBECEE] border border-[#BC414A]/25 text-[#BC414A] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{dialogError}</span>
                </div>
              )}

              {/* Target Details */}
              <div className="p-3 rounded-[8px] bg-[#F7F8FA] border border-[#E4E8EC] space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#6B7782]">Emergency Target:</span>
                  <strong className="font-mono text-[#18232D]">{completingAssignment.incident_id.slice(0, 8)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7782]">Rescue Unit:</span>
                  <strong className="text-[#18232D]">{targetTeam?.name || 'Unit'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7782]">Reported Victims:</span>
                  <strong className="text-[#18232D] font-mono">{totalIncidentPeople} persons</strong>
                </div>
              </div>

              {/* Leader Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-[8px] border border-[#E4E8EC] bg-white cursor-pointer hover:bg-[#F7F8FA] transition-colors">
                <input
                  type="checkbox"
                  checked={leaderConfirmed}
                  onChange={(e) => setLeaderConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-[#375A6B] focus:ring-[#375A6B]"
                />
                <div>
                  <strong className="block font-semibold text-[#18232D]">Team Leader On-Scene Confirmation</strong>
                  <span className="text-[#6B7782] text-[11px] leading-relaxed">
                    Confirm that field craft has made contact and extracted evacuees.
                  </span>
                </div>
              </label>

              {/* Assisted People Count */}
              <div className="space-y-1">
                <label className="font-semibold text-[#18232D] block">
                  Evacuees Successfully Assisted (Pax):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={assistedCount}
                  onChange={(e) => setAssistedCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-[10px] border border-[#E4E8EC] bg-[#F7F8FA] text-[#18232D] text-xs focus:outline-none focus:ring-1 focus:ring-[#375A6B] font-mono"
                />
                {isPartialRescue && (
                  <p className="text-[11px] text-[#A87528]">
                    Notice: Reported count is less than incident total ({totalIncidentPeople} pax).
                  </p>
                )}
              </div>

              {/* Destination Shelter Selection */}
              <div className="space-y-1">
                <label className="font-semibold text-[#18232D] block">
                  Delivery Shelter Facility (Optional):
                </label>
                <select
                  value={selectedShelterId}
                  onChange={(e) => setSelectedShelterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] border border-[#E4E8EC] bg-[#F7F8FA] text-[#18232D] text-xs focus:outline-none focus:ring-1 focus:ring-[#375A6B]"
                >
                  <option value="">No shelter drop-off (On-site staging/field care)</option>
                  {shelters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.occupied}/{s.capacity} occupied • {s.capacity - s.occupied} available)
                    </option>
                  ))}
                </select>
              </div>

              {/* Release Team to Available Status */}
              <label className="flex items-center gap-2 p-2.5 rounded-[8px] bg-[#F7F8FA] border border-[#E4E8EC] cursor-pointer">
                <input
                  type="checkbox"
                  checked={teamReady}
                  onChange={(e) => setTeamReady(e.target.checked)}
                  className="rounded text-[#375A6B] focus:ring-[#375A6B]"
                />
                <span className="text-[11px] text-[#18232D] font-medium">
                  Release craft & team back to <strong>Available</strong> fleet status immediately
                </span>
              </label>

              {/* Resolution Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-[#18232D] block">
                  Mission Debrief Notes (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Evacuated 4 victims via shallow-draft zodiac to designated shelter..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-[10px] border border-[#E4E8EC] bg-[#F7F8FA] text-[#18232D] text-xs focus:outline-none focus:ring-1 focus:ring-[#375A6B]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E4E8EC]">
                <button
                  type="button"
                  onClick={() => setCompletingAssignment(null)}
                  className="px-4 py-2 rounded-[10px] text-xs font-semibold text-[#6B7782] hover:bg-[#F7F8FA] border border-[#E4E8EC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !leaderConfirmed}
                  className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition-colors ${
                    isSubmitting || !leaderConfirmed
                      ? 'bg-[#E4E8EC] text-[#8B959E] cursor-not-allowed'
                      : 'bg-[#258167] hover:bg-[#1f6b55] text-white shadow-subtle'
                  }`}
                >
                  {isSubmitting ? 'Recording Completion...' : 'Complete & Close Mission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
