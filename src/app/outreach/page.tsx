'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { ReachabilityStats } from '@/components/outreach/ReachabilityStats';
import { SilenceEscalationTimeline } from '@/components/outreach/SilenceEscalationTimeline';
import { HouseholdOutreachList } from '@/components/outreach/HouseholdOutreachList';
import { ShelterManagementGrid } from '@/components/outreach/ShelterManagementGrid';
import { VolunteerTasksList } from '@/components/outreach/VolunteerTasksList';
import { AlertPlannerModal } from '@/components/outreach/AlertPlannerModal';
import {
  ContactStatusType,
  HouseholdWithZone,
  OutreachActionWithDetails,
  OutreachStatusType,
  ReachabilityOverviewMetrics,
  ShelterWithZone,
} from '@/lib/outreach/types';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Users,
  Footprints,
  Home,
} from 'lucide-react';

type OutreachTab = 'households' | 'tasks' | 'shelters';

export default function OutreachPage() {
  // Navigation & Presentation State
  const [activeTab, setActiveTab] = useState<OutreachTab>('households');

  // Master Data State
  const [households, setHouseholds] = useState<HouseholdWithZone[]>([]);
  const [shelters, setShelters] = useState<ShelterWithZone[]>([]);
  const [volunteerTasks, setVolunteerTasks] = useState<OutreachActionWithDetails[]>([]);
  const [metrics, setMetrics] = useState<ReachabilityOverviewMetrics>({
    totalHouseholds: 0,
    noPhoneCount: 0,
    basicPhoneCount: 0,
    smartphoneCount: 0,
    unknownReachabilityCount: 0,
    uncontactedCount: 0,
    needsVisitCount: 0,
    reachedCount: 0,
    activeVolunteerTasks: 0,
    totalShelterCapacity: 0,
    totalShelterOccupied: 0,
    totalFreeBeds: 0,
    sheltersNearCapacityCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Modal State for Simulated Alert Planner
  const [selectedHouseholdForAlert, setSelectedHouseholdForAlert] =
    useState<HouseholdWithZone | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  // Master Data Synchronizer
  const loadAllData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const [hRes, sRes, tRes, mRes] = await Promise.all([
        fetch('/api/households'),
        fetch('/api/shelters'),
        fetch('/api/outreach-actions?channel=volunteer_visit'),
        fetch('/api/outreach-metrics'),
      ]);

      const [hData, sData, tData, mData] = await Promise.all([
        hRes.json(),
        sRes.json(),
        tRes.json(),
        mRes.json(),
      ]);

      if (hData.success) setHouseholds(hData.data);
      if (sData.success) setShelters(sData.data);
      if (tData.success) setVolunteerTasks(tData.data);
      if (mData.success) setMetrics(mData.data);

      if (isManualRefresh) {
        showToast('Outreach telemetry successfully synchronized with live database.', 'success');
      }
    } catch (err: unknown) {
      console.error('[OutreachPage] Fetch error:', err);
      showToast('Failed to synchronize with server. Using cached data.', 'error');
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    let ignore = false;
    async function startFetch() {
      if (!ignore) {
        await loadAllData();
      }
    }
    startFetch();
    return () => {
      ignore = true;
    };
  }, [loadAllData]);

  // Handler 1: Update Household Contact Status
  const handleUpdateHouseholdStatus = async (
    householdId: string,
    newStatus: ContactStatusType
  ) => {
    const prevHouseholds = [...households];

    // Optimistic Update
    setHouseholds((prev) =>
      prev.map((h) =>
        h.id === householdId
          ? {
              ...h,
              contact_status: newStatus,
              last_contact_at:
                newStatus === 'reached' ? new Date().toISOString() : h.last_contact_at,
            }
          : h
      )
    );

    try {
      const res = await fetch(`/api/households/${householdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server rejected contact status update');
      }

      showToast(`Household status updated to "${newStatus.replace('_', ' ')}".`);
      // Refresh metrics silently
      fetch('/api/outreach-metrics')
        .then((r) => r.json())
        .then((m) => m.success && setMetrics(m.data));
    } catch (err: unknown) {
      // Rollback on failure
      setHouseholds(prevHouseholds);
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Error: ${msg}`, 'error');
    }
  };

  // Handler 2: Update Shelter Bed Occupancy
  const handleUpdateShelterOccupancy = async (
    shelterId: string,
    newOccupied: number
  ) => {
    const prevShelters = [...shelters];

    // Optimistic Update
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id !== shelterId) return s;
        const free_beds = Math.max(0, s.capacity - newOccupied);
        const occupancy_pct =
          s.capacity > 0 ? Math.min(100, Math.round((newOccupied / s.capacity) * 100)) : 0;
        let status: 'available' | 'near_capacity' | 'full' = 'available';
        if (newOccupied >= s.capacity) status = 'full';
        else if (occupancy_pct >= 85) status = 'near_capacity';

        return {
          ...s,
          occupied: newOccupied,
          free_beds,
          occupancy_pct,
          status,
        };
      })
    );

    try {
      const res = await fetch(`/api/shelters/${shelterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupied: newOccupied }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Capacity integrity update failed');
      }

      showToast(`Shelter occupancy successfully updated to ${newOccupied} spaces.`);
      // Refresh metrics silently
      fetch('/api/outreach-metrics')
        .then((r) => r.json())
        .then((m) => m.success && setMetrics(m.data));
    } catch (err: unknown) {
      // Rollback
      setShelters(prevShelters);
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Occupancy rejected: ${msg}`, 'error');
      throw err;
    }
  };

  // Handler 3: Update Volunteer Task Status
  const handleUpdateVolunteerTask = async (
    taskId: string,
    newStatus: OutreachStatusType,
    note?: string
  ) => {
    const prevTasks = [...volunteerTasks];

    // Optimistic Update
    setVolunteerTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/outreach-actions/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update volunteer task');
      }

      showToast(`Volunteer task marked as "${newStatus.replace('_', ' ')}".`);

      // If safe confirmed, reload households to see the updated contact_status
      if (newStatus === 'safe_confirmed') {
        loadAllData();
      } else {
        fetch('/api/outreach-metrics')
          .then((r) => r.json())
          .then((m) => m.success && setMetrics(m.data));
      }
    } catch (err: unknown) {
      setVolunteerTasks(prevTasks);
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Task update failed: ${msg}`, 'error');
    }
  };

  // Handler 4: Run Safe No-Response Escalation Scan
  const handleTriggerEscalation = async () => {
    setIsEscalating(true);
    try {
      const res = await fetch('/api/outreach-actions/escalate', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Escalation scan failed');
      }

      showToast(
        data.message || 'Escalation complete. Uncontacted households queued for ground scout verification.',
        'success'
      );
      // Reload active data
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Escalation error: ${msg}`, 'error');
    } finally {
      setIsEscalating(false);
    }
  };

  // Handler 5: Open Simulator from Household List
  const handleOpenSimulator = (household: HouseholdWithZone) => {
    setSelectedHouseholdForAlert(household);
    setIsAlertModalOpen(true);
  };

  // Active Volunteer Task Count for Tab Badge
  const activeTaskCount = useMemo(() => {
    return volunteerTasks.filter(
      (t) => t.status === 'planned' || t.status === 'visit_assigned'
    ).length;
  }, [volunteerTasks]);

  return (
    <AppShell>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-18 right-6 z-50 px-4 py-2.5 rounded-lg shadow-lg border flex items-center gap-2.5 text-xs animate-in slide-in-from-top-2 duration-150 ${
            toast.type === 'error'
              ? 'bg-[#18232D] text-white border-[#BC414A]'
              : toast.type === 'info'
              ? 'bg-[#18232D] text-white border-[#375A6B]'
              : 'bg-[#18232D] text-white border-[#258167]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-[#BC414A] shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-4 h-4 text-[#375A6B] shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#258167] shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Outreach & Shelters"
        description="Verify high-risk vulnerable households, coordinate volunteer scout patrols, and balance live shelter bed occupancy."
        actions={
          <button
            type="button"
            onClick={() => loadAllData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E4E8EC] text-[#18232D] hover:bg-[#F7F8FA] text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#5F6B7A] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live Data</span>
          </button>
        }
      />

      <div className="space-y-4">
        {/* Compact Operational Summary Strip */}
        <ReachabilityStats metrics={metrics} isLoading={isLoading} />

        {/* Prominent Tab Navigation Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-[#E4E8EC] pb-1">
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Tab 1: Households */}
            <button
              type="button"
              onClick={() => setActiveTab('households')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'households'
                  ? 'bg-white text-[#18232D] border border-[#E4E8EC] shadow-xs'
                  : 'text-[#5F6B7A] hover:text-[#18232D] hover:bg-[#F7F8FA]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#375A6B]" />
              <span>Households</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-[#F0F4F8] text-[#375A6B] tabular-nums font-bold">
                {households.length}
              </span>
            </button>

            {/* Tab 2: Volunteer Tasks */}
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-white text-[#18232D] border border-[#E4E8EC] shadow-xs'
                  : 'text-[#5F6B7A] hover:text-[#18232D] hover:bg-[#F7F8FA]'
              }`}
            >
              <Footprints className="w-3.5 h-3.5 text-[#375A6B]" />
              <span>Volunteer Tasks</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums font-bold ${
                  activeTaskCount > 0
                    ? 'bg-[#FFF5E6] text-[#A87528]'
                    : 'bg-[#F0F4F8] text-[#375A6B]'
                }`}
              >
                {activeTaskCount}
              </span>
            </button>

            {/* Tab 3: Shelters */}
            <button
              type="button"
              onClick={() => setActiveTab('shelters')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'shelters'
                  ? 'bg-white text-[#18232D] border border-[#E4E8EC] shadow-xs'
                  : 'text-[#5F6B7A] hover:text-[#18232D] hover:bg-[#F7F8FA]'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#375A6B]" />
              <span>Shelters</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-[#F0F4F8] text-[#375A6B] tabular-nums font-bold">
                {shelters.length}
              </span>
            </button>
          </nav>

          {/* Context Helper indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#5F6B7A]">
            <span className="w-2 h-2 rounded-full bg-[#258167]" />
            <span>Community Response Workspace</span>
          </div>
        </div>

        {/* Tab Content Display (Rendering only selected interface) */}
        <div>
          {/* TAB 1: HOUSEHOLDS */}
          {activeTab === 'households' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Compact Silence Escalation Workflow Panel */}
              <SilenceEscalationTimeline
                onTriggerEscalation={handleTriggerEscalation}
                isEscalating={isEscalating}
              />

              {/* Accessible, Clean Household Directory */}
              <HouseholdOutreachList
                households={households}
                isLoading={isLoading}
                onSelectSimulateOutreach={handleOpenSimulator}
                onUpdateStatus={handleUpdateHouseholdStatus}
              />
            </div>
          )}

          {/* TAB 2: VOLUNTEER TASKS */}
          {activeTab === 'tasks' && (
            <div className="animate-in fade-in duration-150">
              <VolunteerTasksList
                tasks={volunteerTasks}
                isLoading={isLoading}
                onUpdateTaskStatus={handleUpdateVolunteerTask}
              />
            </div>
          )}

          {/* TAB 3: SHELTERS */}
          {activeTab === 'shelters' && (
            <div className="animate-in fade-in duration-150">
              <ShelterManagementGrid
                shelters={shelters}
                isLoading={isLoading}
                onUpdateOccupancy={handleUpdateShelterOccupancy}
              />
            </div>
          )}
        </div>
      </div>

      {/* Simulated Alert Planner Modal */}
      <AlertPlannerModal
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setSelectedHouseholdForAlert(null);
        }}
        targetHousehold={selectedHouseholdForAlert}
        onActionComplete={(newAction) => {
          showToast(
            `[SIMULATED] Drill outreach logged via ${newAction.channel.replace('_', ' ')}.`,
            'success'
          );
          loadAllData();
        }}
      />
    </AppShell>
  );
}
