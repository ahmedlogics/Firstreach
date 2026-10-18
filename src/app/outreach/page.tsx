'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

export default function OutreachPage() {
  // State
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
  const [isEscalating, setIsEscalating] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Modal State
  const [selectedHouseholdForAlert, setSelectedHouseholdForAlert] =
    useState<HouseholdWithZone | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  // Master Data Fetcher
  const loadAllData = useCallback(async () => {
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
    } catch (err: unknown) {
      console.error('[OutreachPage] Fetch error:', err);
      showToast('Failed to synchronize with server. Using cached data.', 'error');
    } finally {
      setIsLoading(false);
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
    // Snapshot previous state for rollback
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

      showToast(`Shelter occupancy successfully updated to ${newOccupied} beds.`);
      // Refresh metrics
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

  return (
    <AppShell>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs animate-in slide-in-from-top-4 duration-200 ${
            toast.type === 'error'
              ? 'bg-[#252A30] text-white border-[#B74349]'
              : toast.type === 'info'
              ? 'bg-[#252A30] text-white border-[#536A82]'
              : 'bg-[#252A30] text-white border-[#377D65]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-[#B74349] shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-4 h-4 text-[#536A82] shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#377D65] shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Community Outreach & Shelter Coordination"
        description="Verify reachability across high-risk sectors, coordinate door-to-door volunteer welfare patrols, and monitor shelter bed intake."
        breadcrumbs={[{ label: 'Outreach & Shelters' }]}
        actions={
          <button
            onClick={() => loadAllData()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E6E1] text-[#252A30] hover:bg-[#F7F6F2] text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#757B81]" />
            <span>Sync Live Data</span>
          </button>
        }
      />

      <div className="space-y-6">
        {/* Row 1: Key Dynamic Metrics */}
        <ReachabilityStats metrics={metrics} isLoading={isLoading} />

        {/* Row 2: Silence Escalation Architecture */}
        <SilenceEscalationTimeline
          onTriggerEscalation={handleTriggerEscalation}
          isEscalating={isEscalating}
        />

        {/* Row 3: Household Reachability Directory & Status Controls */}
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-[#252A30] tracking-tight">
              High-Risk Household Reachability Directory
            </h2>
            <p className="text-xs text-[#757B81]">
              Track vulnerable families in inundation sectors, update verified contact statuses, and launch simulated outreach alerts.
            </p>
          </div>

          <HouseholdOutreachList
            households={households}
            isLoading={isLoading}
            onSelectSimulateOutreach={handleOpenSimulator}
            onUpdateStatus={handleUpdateHouseholdStatus}
          />
        </div>

        {/* Row 4: Grid with Shelters on Left, Volunteer Tasks on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <ShelterManagementGrid
            shelters={shelters}
            isLoading={isLoading}
            onUpdateOccupancy={handleUpdateShelterOccupancy}
          />

          <VolunteerTasksList
            tasks={volunteerTasks}
            isLoading={isLoading}
            onUpdateTaskStatus={handleUpdateVolunteerTask}
          />
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
            `[DEMO ONLY / SIMULATED] Outreach drill dispatched via ${newAction.channel.replace('_', ' ')}.`,
            'success'
          );
          loadAllData();
        }}
      />
    </AppShell>
  );
}
