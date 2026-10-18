'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shared/AppShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { NeedsAttentionSection } from '@/components/dashboard/NeedsAttentionSection';
import { FloodTimelineSlider } from '@/components/dashboard/FloodTimelineSlider';
import { DisasterMap } from '@/components/dashboard/DisasterMap';
import { IncidentPriorityTable } from '@/components/dashboard/IncidentPriorityTable';
import { IncidentDetailDrawer } from '@/components/dashboard/IncidentDetailDrawer';
import { BlindSpotPanel } from '@/components/dashboard/BlindSpotPanel';
import { ZoneCoveragePanel } from '@/components/dashboard/ZoneCoveragePanel';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { DashboardOverviewResponse, DbIncident, ZoneAnalytics } from '@/lib/dashboard/types';
import {
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // State management
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationMinutes, setSimulationMinutes] = useState(0);

  // Interaction drawer & dialog state
  const [inspectingIncident, setInspectingIncident] = useState<DbIncident | null>(null);
  const [verificationZone, setVerificationZone] = useState<ZoneAnalytics | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data fetching function from server API route
  const fetchOverview = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/dashboard/overview', {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }
      const json: DashboardOverviewResponse = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to parse database records');
      }
      setData(json);
      setError(null);
    } catch (err: unknown) {
      console.error('[Dashboard fetch error]:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Unable to establish database connection');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and 12-second polling interval with cleanup
  useEffect(() => {
    fetchOverview();

    const interval = setInterval(() => {
      fetchOverview();
    }, 12000);

    return () => clearInterval(interval);
  }, [fetchOverview]);

  const handleForwardToDispatch = (incident: DbIncident) => {
    router.push(`/dispatch?incidentId=${incident.id}`);
  };

  const handleConfirmVerification = () => {
    if (!verificationZone) return;
    setToastMessage(`Volunteer verification patrol dispatched to ${verificationZone.name}. Scout notified.`);
    setVerificationZone(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppShell>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-[#18232D] text-white px-4 py-2.5 rounded-lg shadow-xl border border-[#273642] flex items-center gap-2 text-xs animate-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#258167]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header (No duplicate breadcrumbs, compact action area, truthful connection indicator) */}
      <PageHeader
        title="Operations Overview"
        description="Real-time multi-agency disaster monitoring, prioritized interventions, and flood surge forecasting."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Truthful Connection & Sync Status Indicator */}
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EC] text-xs text-[#5F6B7A]">
              <span className="w-2 h-2 rounded-full bg-[#258167]" />
              <span className="font-semibold text-[#18232D]">Connected</span>
              <span className="text-[#E4E8EC]">•</span>
              <span className="font-mono text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#5F6B7A]" />
                {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : '12s interval'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchOverview(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E4E8EC] text-[#18232D] hover:bg-[#F7F8FA] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#5F6B7A] ${isRefreshing ? 'animate-spin text-[#375A6B]' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            {/* Report Emergency Button */}
            <button
              type="button"
              onClick={() => router.push('/report')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#BC414A] hover:bg-[#A3343C] text-white transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Emergency</span>
            </button>
          </div>
        }
      />

      {/* Main Dashboard Layout */}
      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton variant="stat" lines={4} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 space-y-3">
              <LoadingSkeleton variant="card" className="h-[140px]" />
              <LoadingSkeleton variant="map" className="h-[360px]" />
            </div>
            <div className="lg:col-span-5">
              <LoadingSkeleton variant="table-row" lines={6} />
            </div>
          </div>
        </div>
      ) : error ? (
        <ErrorState
          title="Telemetry Feed Interrupted"
          message={error}
          onRetry={() => fetchOverview(true)}
        />
      ) : data ? (
        <div className="space-y-4">
          {/* Row 1: Compact Operational Summary Strip */}
          <DashboardStats
            stats={data.statistics}
            simulationMinutes={simulationMinutes}
            onFilterClick={(type) => {
              if (type === 'unreachable') router.push('/outreach');
              if (type === 'teams' || type === 'unserved' || type === 'critical') router.push('/dispatch');
            }}
          />

          {/* Row 2: Central Operational Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column (lg:col-span-7): Needs Attention (Actions First!) + Flood Simulation + Risk Map */}
            <div className="lg:col-span-7 space-y-4 flex flex-col min-w-0 max-w-full">
              {/* PRIMARY CONTENT: Actions First */}
              <NeedsAttentionSection
                incidents={data.incidents}
                zones={data.zones}
                shelters={data.shelters}
                onForwardToDispatch={handleForwardToDispatch}
                onInspectIncident={(inc) => setInspectingIncident(inc)}
                onDispatchVerification={(zone) => setVerificationZone(zone)}
              />

              {/* SECONDARY CONTENT: Flood Simulation docked above Risk Map */}
              <div className="space-y-2">
                <FloodTimelineSlider
                  zones={data.zones}
                  simulationMinutes={simulationMinutes}
                  onSimulationChange={setSimulationMinutes}
                  onReset={() => setSimulationMinutes(0)}
                />

                <DisasterMap
                  zones={data.zones}
                  incidents={data.incidents}
                  rescueTeams={data.rescueTeams}
                  shelters={data.shelters}
                  simulationMinutes={simulationMinutes}
                  onSelectIncident={(incident) => handleForwardToDispatch(incident)}
                />
              </div>
            </div>

            {/* Right Column (lg:col-span-5): Concise Emergency Priority Queue */}
            <div className="lg:col-span-5 space-y-2 flex flex-col min-w-0 max-w-full">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#18232D] tracking-tight">
                    Emergency Priority Queue
                  </h2>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/30 font-mono">
                    {data.incidents.length} active
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E4E8EC] shadow-xs p-3.5 flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
                <IncidentPriorityTable
                  incidents={data.incidents}
                  onForwardToDispatch={handleForwardToDispatch}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Bottom Operations Intelligence — Areas Needing Verification & Collapsible Coverage Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BlindSpotPanel
              zones={data.zones}
              onDispatchVerification={(zone) => setVerificationZone(zone)}
            />

            <ZoneCoveragePanel
              zones={data.zones}
              defaultExpanded={false}
            />
          </div>
        </div>
      ) : null}

      {/* Slide-out details drawer for inspecting incident directly from Needs Attention */}
      <IncidentDetailDrawer
        incident={inspectingIncident}
        isOpen={Boolean(inspectingIncident)}
        onClose={() => setInspectingIncident(null)}
        onDispatchClick={handleForwardToDispatch}
      />

      {/* Verification Dispatch Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(verificationZone)}
        onClose={() => setVerificationZone(null)}
        onConfirm={handleConfirmVerification}
        title="Authorize Field Welfare Check"
        description={`Deploy a community volunteer scout to ${verificationZone?.name} to verify whether households in flood risk Tier ${verificationZone?.flood_risk} have safely evacuated.`}
        confirmLabel="Simulate Dispatch"
        variant="warning"
        isDemoAction={true}
        details={
          verificationZone && (
            <div className="space-y-1 text-xs">
              <div><strong>Sector:</strong> {verificationZone.name}</div>
              <div><strong>Reason:</strong> {verificationZone.blindSpotReason}</div>
              <div><strong>Households without phone:</strong> {verificationZone.noPhoneCount} homes</div>
            </div>
          )
        }
      />
    </AppShell>
  );
}
