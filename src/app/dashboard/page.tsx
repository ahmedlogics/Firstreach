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
  Database,
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

  // Interaction dialog state
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
    setToastMessage(`Volunteer verification patrol dispatched to ${verificationZone.name}. Field scout notified via SMS mesh.`);
    setVerificationZone(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppShell>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Emergency Operations Overview"
        description="Monitor developing threats, prioritize vulnerable residents, and coordinate rescue resources across the Karachi monsoon response grid."
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOverview(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-[#14B8A6]' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
            </button>

            <button
              onClick={() => router.push('/report')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#14B8A6] hover:bg-[#0D9488] text-white transition-all shadow-subtle"
            >
              <Plus className="w-4 h-4" />
              <span>New Incident Intake</span>
            </button>
          </div>
        }
      />

      {/* Telemetry Status Bar */}
      <div className="mb-6 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="font-semibold text-slate-900">Database Engine:</span>
          <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
            Supabase PostgreSQL Live
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-500 hidden sm:inline">Automatic 12s polling cycle active</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5" />
          <span>Last sync: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'Connecting...'}</span>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton variant="stat" lines={5} />
          <LoadingSkeleton variant="card" lines={3} />
          <LoadingSkeleton variant="map" className="h-[460px]" />
          <LoadingSkeleton variant="table-row" lines={4} />
        </div>
      ) : error ? (
        <ErrorState
          title="Telemetry Feed Interrupted"
          message={error}
          onRetry={() => fetchOverview(true)}
        />
      ) : data ? (
        <div className="space-y-6">
          {/* Row 1: KPI Statistics Grid (Connected to Supabase data) */}
          <DashboardStats
            stats={data.statistics}
            simulationMinutes={simulationMinutes}
            onFilterClick={(type) => {
              if (type === 'unreachable') router.push('/outreach');
              if (type === 'teams' || type === 'unserved') router.push('/dispatch');
            }}
          />

          {/* Row 2: Flood Progression Timeline Simulation Slider */}
          <FloodTimelineSlider
            zones={data.zones}
            simulationMinutes={simulationMinutes}
            onSimulationChange={setSimulationMinutes}
            onReset={() => setSimulationMinutes(0)}
          />

          {/* Row 3: Interactive Leaflet Map with OpenStreetMap */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                  Geospatial Operations Map
                </h2>
                <p className="text-xs text-[#64748B]">
                  OpenStreetMap tiles rendering zone centroids, active callers, rescue units, and evacuation shelters.
                </p>
              </div>
            </div>

            <DisasterMap
              zones={data.zones}
              incidents={data.incidents}
              rescueTeams={data.rescueTeams}
              shelters={data.shelters}
              simulationMinutes={simulationMinutes}
              onSelectIncident={(incident) => handleForwardToDispatch(incident)}
            />
          </div>

          {/* Row 4: High-Risk Blind-Spot Panel (Areas Requiring Verification) */}
          <BlindSpotPanel
            zones={data.zones}
            onDispatchVerification={(zone) => setVerificationZone(zone)}
          />

          {/* Row 5: Emergency Priority List & Details Drawer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                  Emergency Priority Queue
                </h2>
                <p className="text-xs text-[#64748B]">
                  Persisted incidents ranked by database priority_score, medical urgency, and minutes-to-harm.
                </p>
              </div>
            </div>

            <IncidentPriorityTable
              incidents={data.incidents}
              onForwardToDispatch={handleForwardToDispatch}
            />
          </div>

          {/* Row 6: Reporting Coverage & Demographic Fairness Breakdown */}
          <ZoneCoveragePanel zones={data.zones} />
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
