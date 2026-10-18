'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/shared/AppShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { RankedEmergencyQueue } from '@/components/dispatch/RankedEmergencyQueue';
import { RescueTeamList } from '@/components/dispatch/RescueTeamList';
import { AssignmentRecommendationPanel } from '@/components/dispatch/AssignmentRecommendationPanel';
import { UnservedEmergenciesPanel } from '@/components/dispatch/UnservedEmergenciesPanel';
import { ConfirmedAssignmentsPanel } from '@/components/dispatch/ConfirmedAssignmentsPanel';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { DetailDrawer } from '@/components/shared/DetailDrawer';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import {
  DbAssignment,
  DbIncident,
  DbRescueTeam,
  DbShelter,
  RecommendedAssignment,
  UnservedIncident,
} from '@/lib/dispatch/types';
import { formatPkr } from '@/lib/dispatch/cost';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  Sliders,
  Navigation,
  AlertOctagon,
  Users,
  Flame,
  LifeBuoy,
} from 'lucide-react';

type DispatchTab = 'allocate' | 'active' | 'unserved';

function DispatchWorkspace() {
  const searchParams = useSearchParams();
  const initialIncidentId = searchParams.get('incidentId');

  // Active Presentation Tab State
  const [activeTab, setActiveTab] = useState<DispatchTab>('allocate');
  const [isFleetDrawerOpen, setIsFleetDrawerOpen] = useState(false);

  // Live Database & Engine State
  const [incidents, setIncidents] = useState<DbIncident[]>([]);
  const [teams, setTeams] = useState<DbRescueTeam[]>([]);
  const [assignments, setAssignments] = useState<DbAssignment[]>([]);
  const [shelters, setShelters] = useState<DbShelter[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedAssignment[]>([]);
  const [unserved, setUnserved] = useState<UnservedIncident[]>([]);

  // Selection & UI State
  const [selectedIncident, setSelectedIncident] = useState<DbIncident | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<DbRescueTeam | null>(null);
  const [pendingOverrideReason, setPendingOverrideReason] = useState<string | undefined>();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [escalatedIncidentId, setEscalatedIncidentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string, durationMs = 5000) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), durationMs);
  };

  // Fetch recommendations and authoritative database state
  const fetchEngineData = useCallback(async (selectFirst = false) => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/assignments/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Engine returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const fetchedIncidents: DbIncident[] = data.allIncidents || [];
      const fetchedTeams: DbRescueTeam[] = data.allTeams || [];
      const fetchedRecommendations: RecommendedAssignment[] = data.recommendations || [];
      const fetchedUnserved: UnservedIncident[] = data.unserved || [];
      const fetchedAssignments: DbAssignment[] = data.activeAssignments || [];
      const fetchedShelters: DbShelter[] = data.shelters || [];

      setIncidents(fetchedIncidents);
      setTeams(fetchedTeams);
      setRecommendations(fetchedRecommendations);
      setUnserved(fetchedUnserved);
      setAssignments(fetchedAssignments);
      setShelters(fetchedShelters);

      // Determine initial selected incident
      setSelectedIncident((current) => {
        if (current) {
          const updated = fetchedIncidents.find((i) => i.id === current.id);
          if (updated) return updated;
        }

        if (initialIncidentId) {
          const match = fetchedIncidents.find((i) => i.id === initialIncidentId);
          if (match) return match;
        }

        if (selectFirst || !current) {
          const open = fetchedIncidents.filter((i) => i.status === 'open');
          return open.length > 0 ? open[0] : fetchedIncidents[0] || null;
        }

        return current;
      });
    } catch (err: any) {
      console.error('[DispatchWorkspace] Failed to fetch engine data:', err);
      showToast('error', `Failed to synchronize engine telemetry: ${err.message}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [initialIncidentId]);

  // Initial load
  useEffect(() => {
    fetchEngineData(true);
  }, [fetchEngineData]);

  // When selected incident changes, automatically select the recommended team if available
  useEffect(() => {
    if (!selectedIncident) {
      setSelectedTeam(null);
      return;
    }

    const rec = recommendations.find((r) => r.incident.id === selectedIncident.id);
    if (rec && rec.recommendedTeam) {
      setSelectedTeam(rec.recommendedTeam);
    } else {
      const available = teams.filter((t) => t.status === 'available');
      setSelectedTeam(available.length > 0 ? available[0] : null);
    }
  }, [selectedIncident, recommendations, teams]);

  // Lookups for quick rendering
  const unservedIncidentIds = useMemo(() => {
    return new Set(unserved.map((u) => u.incident.id));
  }, [unserved]);

  const currentRecommendation = useMemo(() => {
    if (!selectedIncident) return null;
    return recommendations.find((r) => r.incident.id === selectedIncident.id) || null;
  }, [selectedIncident, recommendations]);

  const incidentsMap = useMemo(() => {
    const map: Record<string, DbIncident> = {};
    for (const inc of incidents) map[inc.id] = inc;
    return map;
  }, [incidents]);

  const teamsMap = useMemo(() => {
    const map: Record<string, DbRescueTeam> = {};
    for (const t of teams) map[t.id] = t;
    return map;
  }, [teams]);

  // Operational HUD Metrics
  const hudStats = useMemo(() => {
    const criticalCount = incidents.filter(
      (i) => (i.priority_score ?? 0) >= 80 && i.status === 'open'
    ).length;

    const availableTeams = teams.filter((t) => t.status === 'available');
    const availableCapacity = availableTeams.reduce((acc, t) => acc + (t.capacity || 0), 0);

    const openCount = incidents.filter((i) => i.status === 'open').length;
    const missionCount = assignments.length;
    const activeMissionCount = assignments.filter((a) => a.status !== 'completed').length;

    return {
      criticalCount,
      availableTeamsCount: availableTeams.length,
      availableCapacity,
      openCount,
      missionCount,
      activeMissionCount,
    };
  }, [incidents, teams, assignments]);

  // Handle open dispatch modal
  const handleInitiateDispatch = (team: DbRescueTeam, overrideReason?: string) => {
    setSelectedTeam(team);
    setPendingOverrideReason(overrideReason);
    setIsDispatchModalOpen(true);
  };

  // Authorize and commit dispatch via secure backend API
  const handleConfirmDispatch = async () => {
    if (!selectedIncident || !selectedTeam) return;

    try {
      setIsDispatching(true);
      const res = await fetch('/api/assignments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-coordinator': 'true',
          'x-dispatcher-role': 'coordinator',
        },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          teamId: selectedTeam.id,
          overrideReason: pendingOverrideReason,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || `Dispatch authorization failed with status ${res.status}`);
      }

      setIsDispatchModalOpen(false);
      showToast(
        'success',
        `Dispatch authorized: Unit ${selectedTeam.name} committed to ${selectedIncident.id.slice(0, 8)}.`
      );

      await fetchEngineData();
    } catch (err: any) {
      console.error('[DispatchWorkspace] Confirm dispatch error:', err);
      showToast('error', err.message || 'Failed to authorize dispatch');
    } finally {
      setIsDispatching(false);
    }
  };

  const handleEscalateIncident = (incidentId: string) => {
    setEscalatedIncidentId(incidentId);
  };

  const handleConfirmEscalation = () => {
    showToast(
      'success',
      `Emergency ${escalatedIncidentId?.slice(0, 8)} logged for Mutual-Aid Escalation to Sindh Rangers & 5-Corps SAR.`
    );
    setEscalatedIncidentId(null);
  };

  const handleResetScenario = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/assignments/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset scenario');
      showToast('success', 'Scenario reset: All craft restored to available and incidents open.');
      await fetchEngineData(true);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to reset scenario');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-18 right-6 z-50 px-4 py-2.5 rounded-[10px] shadow-lg border flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2 duration-150 ${
            toast.type === 'success'
              ? 'bg-[#18232D] text-white border-[#273642]'
              : 'bg-[#FBECEE] text-[#BC414A] border-[#BC414A]/25'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#258167] shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#BC414A] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header (No repetitive title in breadcrumbs) */}
      <PageHeader
        title="Rescue Dispatch"
        description="Coordinate emergency triage, evaluate simulation-backed craft assignments, and track active extraction missions."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetScenario}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-white border border-[#E4E8EC] text-[#18232D] hover:bg-[#F7F8FA] transition-colors shadow-subtle cursor-pointer disabled:opacity-50"
              title="Reset scenario state for demonstration"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6B7782]" />
              <span>Reset Scenario</span>
            </button>
            <button
              onClick={() => fetchEngineData()}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-semibold bg-[#375A6B] hover:bg-[#294858] text-white transition-colors shadow-subtle cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Fleet'}</span>
            </button>
          </div>
        }
      />

      <div className="space-y-4">
        {/* Compact Operational Metrics Strip (Replaces 4 oversized cards) */}
        <div className="bg-white rounded-xl border border-[#E4E8EC] shadow-subtle p-3 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E4E8EC]">
          {/* 1. Critical Emergencies */}
          <div className="p-2 sm:px-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#6B7782] block">
                Critical Life Threats
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-semibold text-[#18232D] tabular-nums">
                  {hudStats.criticalCount}
                </span>
                <span className="text-[11px] text-[#BC414A] font-medium">Score ≥ 80</span>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#BC414A] ring-4 ring-[#BC414A]/15 shrink-0" />
          </div>

          {/* 2. Available Teams */}
          <div className="p-2 sm:px-4 flex items-center justify-between pt-3 md:pt-2">
            <div>
              <span className="text-xs font-medium text-[#6B7782] block">
                Available Teams
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-semibold text-[#18232D] tabular-nums">
                  {hudStats.availableTeamsCount}
                </span>
                <span className="text-[11px] text-[#258167] font-medium tabular-nums">
                  {hudStats.availableCapacity} pax capacity
                </span>
              </div>
            </div>
            <div className="p-2 rounded-[8px] bg-[#E9F3EF] text-[#258167] shrink-0">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>

          {/* 3. Awaiting Allocation */}
          <div className="p-2 sm:px-4 flex items-center justify-between pt-3 md:pt-2">
            <div>
              <span className="text-xs font-medium text-[#6B7782] block">
                Awaiting Allocation
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-semibold text-[#18232D] tabular-nums">
                  {hudStats.openCount}
                </span>
                <span className="text-[11px] text-[#6B7782]">open in queue</span>
              </div>
            </div>
            <div className="p-2 rounded-[8px] bg-[#EAF0F4] text-[#375A6B] shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>

          {/* 4. Active Missions */}
          <div className="p-2 sm:px-4 flex items-center justify-between pt-3 md:pt-2">
            <div>
              <span className="text-xs font-medium text-[#6B7782] block">
                Active Missions
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-semibold text-[#18232D] tabular-nums">
                  {hudStats.activeMissionCount}
                </span>
                <span className="text-[11px] text-[#6B7782] tabular-nums">
                  {hudStats.missionCount} total dispatches
                </span>
              </div>
            </div>
            <div className="p-2 rounded-[8px] bg-[#F7F8FA] text-[#18232D] shrink-0 border border-[#E4E8EC]">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Main Tab Navigation (Accessible, presentation-only state) */}
        <div className="flex items-center justify-between gap-2 border-b border-[#E4E8EC] pb-1">
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Tab 1: Allocate */}
            <button
              onClick={() => setActiveTab('allocate')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'allocate'
                  ? 'bg-white text-[#18232D] border border-[#E4E8EC] shadow-subtle'
                  : 'text-[#6B7782] hover:text-[#18232D] hover:bg-[#F7F8FA]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#375A6B]" />
              <span>Allocate</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-[#EAF0F4] text-[#375A6B] tabular-nums">
                {hudStats.openCount}
              </span>
            </button>

            {/* Tab 2: Active Operations */}
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-white text-[#18232D] border border-[#E4E8EC] shadow-subtle'
                  : 'text-[#6B7782] hover:text-[#18232D] hover:bg-[#F7F8FA]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-[#375A6B]" />
              <span>Active Operations</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-[#EAF0F4] text-[#375A6B] tabular-nums">
                {hudStats.activeMissionCount}
              </span>
            </button>

            {/* Tab 3: Unserved (Critical Deficit count remains visible across all tabs) */}
            <button
              onClick={() => setActiveTab('unserved')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'unserved'
                  ? 'bg-white text-[#18232D] border border-[#E4E8EC] shadow-subtle'
                  : 'text-[#6B7782] hover:text-[#18232D] hover:bg-[#F7F8FA]'
              }`}
            >
              <AlertOctagon className={`w-3.5 h-3.5 ${unserved.length > 0 ? 'text-[#BC414A]' : 'text-[#6B7782]'}`} />
              <span>Unserved</span>
              {unserved.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25 font-bold tabular-nums">
                  {unserved.length}
                </span>
              )}
            </button>
          </nav>

          {/* Quick fleet drawer toggle */}
          {activeTab === 'allocate' && (
            <button
              onClick={() => setIsFleetDrawerOpen(true)}
              className="text-xs font-medium text-[#375A6B] hover:text-[#294858] hover:bg-[#EAF0F4] px-2.5 py-1.5 rounded-[8px] transition-colors cursor-pointer hidden sm:inline-flex items-center gap-1.5"
            >
              <span>Fleet Inventory</span>
              <span className="font-mono text-[10px] tabular-nums">({teams.length})</span>
            </button>
          )}
        </div>

        {/* TAB 1: ALLOCATE WORKSPACE */}
        {activeTab === 'allocate' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Emergency Queue (~42% width) */}
            <div className="lg:col-span-5 space-y-4">
              <RankedEmergencyQueue
                incidents={incidents}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                unservedIncidentIds={unservedIncidentIds}
                isLoading={isLoading}
              />
            </div>

            {/* Right: Selected Incident & Recommendation Panel (~58% width) */}
            <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-18">
              <AssignmentRecommendationPanel
                selectedIncident={selectedIncident}
                recommendation={currentRecommendation}
                selectedTeam={selectedTeam}
                onSelectTeam={(team) => setSelectedTeam(team)}
                onApproveDispatch={handleInitiateDispatch}
                isDispatching={isDispatching}
                onToggleFleetDrawer={() => setIsFleetDrawerOpen(true)}
              />
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE OPERATIONS WORKSPACE */}
        {activeTab === 'active' && (
          <div>
            <ConfirmedAssignmentsPanel
              assignments={assignments}
              incidentsMap={incidentsMap}
              teamsMap={teamsMap}
              shelters={shelters}
              onOperationUpdated={fetchEngineData}
            />
          </div>
        )}

        {/* TAB 3: UNSERVED (RESOURCE DEFICIT) WORKSPACE */}
        {activeTab === 'unserved' && (
          <div>
            <UnservedEmergenciesPanel
              unservedIncidents={unserved}
              onEscalate={handleEscalateIncident}
            />
          </div>
        )}
      </div>

      {/* Fleet Inventory Detail Drawer (accessible without cluttering allocation split view) */}
      <DetailDrawer
        isOpen={isFleetDrawerOpen}
        onClose={() => setIsFleetDrawerOpen(false)}
        title="Rescue Fleet & Resource Assets"
        subtitle="Full operational craft roster with capability parameters and staging locations."
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#E9F3EF] text-[#258167] border border-[#258167]/20">
            {hudStats.availableTeamsCount} Units Ready
          </span>
        }
        width="lg"
      >
        <RescueTeamList
          teams={teams}
          selectedTeamId={selectedTeam?.id}
          selectedIncident={selectedIncident}
          onSelectTeam={(team) => {
            setSelectedTeam(team);
            setIsFleetDrawerOpen(false);
          }}
          isLoading={isLoading}
        />
      </DetailDrawer>

      {/* Dispatch Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onConfirm={handleConfirmDispatch}
        title="Authorize Rescue Unit Dispatch"
        description={`Authorize deployment of ${selectedTeam?.name} to emergency ${selectedIncident?.id.slice(0, 8)}. This will execute a transactional database lock, marking the team busy and the incident assigned.`}
        confirmLabel={isDispatching ? 'Committing Asset...' : 'Authorize Transaction'}
        variant="teal"
        isDemoAction={false}
        details={
          selectedIncident &&
          selectedTeam && (
            <div className="space-y-1.5 text-xs text-[#18232D]">
              <div className="flex justify-between border-b border-[#E4E8EC] pb-1">
                <span className="text-[#6B7782]">Target Emergency:</span>
                <strong className="font-mono text-[#18232D]">{selectedIncident.id.slice(0, 8)}</strong>
              </div>
              <div className="flex justify-between border-b border-[#E4E8EC] pb-1">
                <span className="text-[#6B7782]">People Requiring Rescue:</span>
                <strong className="text-[#BC414A] font-semibold tabular-nums">
                  {selectedIncident.people_count ?? 1} pax
                </strong>
              </div>
              <div className="flex justify-between border-b border-[#E4E8EC] pb-1">
                <span className="text-[#6B7782]">Assigned Craft:</span>
                <strong className="text-[#18232D]">{selectedTeam.name}</strong>
              </div>
              <div className="flex justify-between border-b border-[#E4E8EC] pb-1">
                <span className="text-[#6B7782]">Craft Capacity:</span>
                <strong className="text-[#18232D] tabular-nums">{selectedTeam.capacity} pax</strong>
              </div>
              <div className="flex justify-between border-b border-[#E4E8EC] pb-1">
                <span className="text-[#6B7782]">Estimated Base Cost:</span>
                <strong className="text-[#18232D] font-mono tabular-nums">
                  {formatPkr(Number(selectedTeam.fixed_cost))}
                </strong>
              </div>
              {pendingOverrideReason && (
                <div className="p-2 rounded-[6px] bg-[#FFF4E3] text-[#A87528] border border-[#A87528]/25 text-[11px]">
                  <strong>Human Override Reason: </strong>
                  {pendingOverrideReason}
                </div>
              )}
            </div>
          )
        }
      />

      {/* Escalation Confirmation Modal */}
      <ConfirmationDialog
        isOpen={Boolean(escalatedIncidentId)}
        onClose={() => setEscalatedIncidentId(null)}
        onConfirm={handleConfirmEscalation}
        title="Mutual-Aid Escalation Request"
        description={`Emergency ${escalatedIncidentId?.slice(0, 8)} requires heavy specialized amphibious cutting or air-evacuation equipment not present in the civilian fleet. Log official mutual-aid escalation to Sindh Rangers & 5-Corps Engineering.`}
        confirmLabel="Log Mutual-Aid Escalation"
        variant="danger"
        isDemoAction={true}
      />
    </>
  );
}

export default function DispatchPage() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingSkeleton variant="card" lines={4} />}>
        <DispatchWorkspace />
      </Suspense>
    </AppShell>
  );
}
