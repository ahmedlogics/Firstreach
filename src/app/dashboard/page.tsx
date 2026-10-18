'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shared/AppShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { FloodTimelineSlider } from '@/components/dashboard/FloodTimelineSlider';
import { DisasterMap } from '@/components/dashboard/DisasterMap';
import { IncidentPriorityTable } from '@/components/dashboard/IncidentPriorityTable';
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
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // State management
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationMinutes, setSimulationMinutes] = useState(0);

  // Interaction dialog state
  const [verificationZone, setVerificationZone] = useState<ZoneAnalytics | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data fetching function from server API route (preserves Supabase integration)
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
    } catch (err: any) {
      console.error('[Dashboard fetch error]:', err);
      setError(err.message || 'Unable to establish database connection');
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
    setToastMessage(`Volunteer verification patrol dispatched to ${verificationZone.name}. Scout notified via SMS mesh.`);
    setVerificationZone(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppShell>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#252A30] text-white px-4 py-2.5 rounded-xl shadow-xl border border-[#343B43] flex items-center gap-2 text-xs animate-in slide-in-from-top-4 duration-150">
          <CheckCircle2 className="w-4 h-4 text-[#377D65]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header (Single heading, no repeated Demo Mode indicator) */}
      <PageHeader
        title="Operations Overview"
        showDemoBadge={false}
        breadcrumbs={[{ label: 'Dashboard' }]}
        className="mb-4"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOverview(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E8E6E1] text-[#252A30] hover:bg-[#EDF1F5] transition-colors shadow-subtle disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#757B81] ${isRefreshing ? 'animate-spin text-[#536A82]' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => router.push('/report')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#536A82] hover:bg-[#40566D] text-white transition-all shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Incident Intake</span>
            </button>
          </div>
        }
      />

      {/* Compact Telemetry Status Bar */}
      <div className="mb-4 p-2.5 rounded-xl bg-white border border-[#E8E6E1] shadow-subtle flex items-center justify-between text-xs text-[#757B81]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#377D65] shrink-0" />
          <span className="font-semibold text-[#252A30]">Live Telemetry</span>
          <span className="text-[#E8E6E1]">•</span>
          <span className="text-[#92979D] text-[11px]">12s Sync Cycle</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#92979D] font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-[#92979D]" />
          <span>Synced: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'Connecting...'}</span>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton variant="stat" lines={5} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 space-y-3">
              <LoadingSkeleton variant="card" className="h-[120px]" />
              <LoadingSkeleton variant="map" className="h-[440px]" />
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
          {/* Row 1: Simplified KPI Statistics Grid */}
          <DashboardStats
            stats={data.statistics}
            simulationMinutes={simulationMinutes}
            onFilterClick={(type) => {
              if (type === 'unreachable') router.push('/outreach');
              if (type === 'teams' || type === 'unserved') router.push('/dispatch');
            }}
          />

          {/* Row 2: Central Operational Intelligence — Risk Map (with compact docked Flood Simulation) + Priority Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left: Risk Map and visually associated Flood Simulation */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-2 flex flex-col min-w-0 max-w-full">
              <h2 className="text-sm font-extrabold text-[#252A30] tracking-tight">
                Risk Map
              </h2>

              {/* Visually associated container */}
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

            {/* Right: Emergency Priority Queue */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-2 flex flex-col min-w-0 max-w-full">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-[#252A30] tracking-tight">
                  Priority Queue
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAE8E7] text-[#B74349] border border-[#B74349]/30 font-mono">
                  {data.incidents.length} active
                </span>
              </div>

              <div className="bg-white rounded-xl border border-[#E8E6E1] shadow-subtle p-3 sm:p-3.5 flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
                <IncidentPriorityTable
                  incidents={data.incidents}
                  onForwardToDispatch={handleForwardToDispatch}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Bottom Operations Row — Areas Needing Verification & Coverage Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BlindSpotPanel
              zones={data.zones}
              onDispatchVerification={(zone) => setVerificationZone(zone)}
            />

            <ZoneCoveragePanel zones={data.zones} />
          </div>
        </div>
      ) : null}

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
