'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/shared/AppShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { AllocationPrincipleBanner } from '@/components/dispatch/AllocationPrincipleBanner';
import { RankedEmergencyQueue } from '@/components/dispatch/RankedEmergencyQueue';
import { RescueTeamList } from '@/components/dispatch/RescueTeamList';
import { AssignmentRecommendationPanel } from '@/components/dispatch/AssignmentRecommendationPanel';
import { UnservedEmergenciesPanel } from '@/components/dispatch/UnservedEmergenciesPanel';
import { ConfirmedAssignmentsPanel } from '@/components/dispatch/ConfirmedAssignmentsPanel';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import {
  DbAssignment,
  DbIncident,
  DbRescueTeam,
  RecommendedAssignment,
  UnservedIncident,
} from '@/lib/dispatch/types';
import { formatPkr } from '@/lib/dispatch/cost';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Radio,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

function DispatchWorkspace() {
  const searchParams = useSearchParams();
  const initialIncidentId = searchParams.get('incidentId');

  // Live Database & Engine State
  const [incidents, setIncidents] = useState<DbIncident[]>([]);
  const [teams, setTeams] = useState<DbRescueTeam[]>([]);
  const [assignments, setAssignments] = useState<DbAssignment[]>([]);
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

      setIncidents(fetchedIncidents);
      setTeams(fetchedTeams);
      setRecommendations(fetchedRecommendations);
      setUnserved(fetchedUnserved);
      setAssignments(fetchedAssignments);

      // Determine initial selected incident
      setSelectedIncident((current) => {
        if (current) {
          // Re-sync with updated incident record
          const updated = fetchedIncidents.find((i) => i.id === current.id);
          if (updated) return updated;
        }

        if (initialIncidentId) {
          const match = fetchedIncidents.find((i) => i.id === initialIncidentId);
          if (match) return match;
        }

        if (selectFirst || !current) {
          // Select highest priority open incident
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
      // If no recommendation or already assigned, find first available capable team or fallback
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
        `Dispatch authorized! Unit ${selectedTeam.name} committed to ${selectedIncident.id}. Mission ID: ${result.assignmentId.slice(0, 8)}.`
      );

      // Refresh database records to update incident to 'assigned' and team to 'busy'
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
      `Incident ${escalatedIncidentId?.slice(0, 8)} escalated to Sindh Rangers / Military 5-Corps for amphibious extraction.`
    );
    setEscalatedIncidentId(null);
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs animate-in slide-in-from-top-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-red-900 text-white border-red-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Rescue Resource Allocation"
        description="Life-First Triage Engine: Prioritize urgent life threats, evaluate capable rescue craft, and authorize verified deployments."
        breadcrumbs={[{ label: 'Rescue Allocation' }]}
        actions={
          <button
            onClick={() => fetchEngineData()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`}
            />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Fleet Telemetry'}</span>
          </button>
        }
      />

      <div className="space-y-6">
        {/* Core Allocation Principle Banner */}
        <AllocationPrincipleBanner />

        {/* Two-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Ranked Queue & Unserved Alerts */}
          <div className="lg:col-span-7 space-y-6">
            <RankedEmergencyQueue
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              unservedIncidentIds={unservedIncidentIds}
              isLoading={isLoading}
            />

            <UnservedEmergenciesPanel
              unservedIncidents={unserved}
              onEscalate={handleEscalateIncident}
            />
          </div>

          {/* Right Column (5 cols): Assignment Recommendation & Fleet Readiness */}
          <div className="lg:col-span-5 space-y-6">
            <AssignmentRecommendationPanel
              selectedIncident={selectedIncident}
              recommendation={currentRecommendation}
              selectedTeam={selectedTeam}
              onSelectTeam={(team) => setSelectedTeam(team)}
              onApproveDispatch={handleInitiateDispatch}
              isDispatching={isDispatching}
            />

            <RescueTeamList
              teams={teams}
              selectedTeamId={selectedTeam?.id}
              selectedIncident={selectedIncident}
              onSelectTeam={(team) => setSelectedTeam(team)}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Section E: Confirmed Missions Table */}
        <ConfirmedAssignmentsPanel
          assignments={assignments}
          incidentsMap={incidentsMap}
          teamsMap={teamsMap}
        />
      </div>

      {/* Dispatch Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onConfirm={handleConfirmDispatch}
        title="Authorize Rescue Unit Dispatch"
        description={`Authorize deployment of ${selectedTeam?.name} to emergency ${selectedIncident?.id}. This will execute a transactional database lock, marking the team busy and the incident assigned.`}
        confirmLabel={isDispatching ? 'Committing Asset...' : 'Authorize Transaction'}
        variant="teal"
        isDemoAction={false}
        details={
          selectedIncident &&
          selectedTeam && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Target Emergency:</span>
                <strong className="font-mono text-slate-900">{selectedIncident.id}</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">People Requiring Rescue:</span>
                <strong className="text-red-600 font-bold">
                  {selectedIncident.people_count ?? 1} pax
                </strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Assigned Craft:</span>
                <strong className="text-slate-900">{selectedTeam.name}</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Craft Capacity:</span>
                <strong className="text-slate-900">{selectedTeam.capacity} pax</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Estimated Consumable Rate:</span>
                <strong className="text-slate-900 font-mono">
                  {formatPkr(Number(selectedTeam.fixed_cost))} base
                </strong>
              </div>
              {pendingOverrideReason && (
                <div className="p-2 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  <span className="font-bold">Human Override Reason: </span>
                  {pendingOverrideReason}
                </div>
              )}
            </div>
          )
        }
      />

      {/* Escalation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(escalatedIncidentId)}
        onClose={() => setEscalatedIncidentId(null)}
        onConfirm={handleConfirmEscalation}
        title="Escalate Resource Deficit to Military SAR"
        description={`Incident ${escalatedIncidentId} requires heavy amphibious cutting equipment not present in civilian fleet. Trigger formal mutual-aid request to Corps Engineering.`}
        confirmLabel="Confirm Military Mutual-Aid Request"
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
