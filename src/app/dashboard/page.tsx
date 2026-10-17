'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmergencyStats } from '@/components/dashboard/EmergencyStats';
import { FloodProgressionTimeline } from '@/components/dashboard/FloodProgressionTimeline';
import { LiveDisasterMap } from '@/components/dashboard/LiveDisasterMap';
import { EmergencyPriorityTable } from '@/components/dashboard/EmergencyPriorityTable';
import { HighRiskBlindSpotPanel } from '@/components/dashboard/HighRiskBlindSpotPanel';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { EmergencyIncident } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  Share2,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [simulationHour, setSimulationHour] = useState(0);
  const [selectedIncidentForDispatch, setSelectedIncidentForDispatch] = useState<EmergencyIncident | null>(null);
  const [verificationZone, setVerificationZone] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDispatchRedirect = (incident: EmergencyIncident) => {
    // Smoothly route to dispatch page with incident pre-selected
    router.push(`/dispatch?incidentId=${incident.id}`);
  };

  const handleSimulateVerification = () => {
    setToastMessage(`Simulated verification patrol dispatched to ${verificationZone}. Field team tasked via SMS mesh.`);
    setVerificationZone(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppShell>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs animate-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-4 h-4 text-[#14B8A6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Emergency Operations Overview"
        description="Monitor developing threats, prioritize vulnerable residents, and coordinate rescue resources across the Karachi monsoon response grid."
        breadcrumbs={[{ label: 'Operations Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSimulationHour(0);
                setToastMessage('Operations telemetry synchronized with base scenario.');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Sync Telemetry</span>
            </button>
            <button
              onClick={() => router.push('/report')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#14B8A6] hover:bg-[#0D9488] text-white transition-all shadow-subtle"
            >
              <span>+ New Intake Report</span>
            </button>
          </div>
        }
      />

      {/* Main Command Dashboard Layout */}
      <div className="space-y-6">
        {/* Row 1: KPI Stats Grid */}
        <EmergencyStats
          simulationHour={simulationHour}
          onFilterClick={(type) => {
            if (type === 'unreachable') router.push('/outreach');
            if (type === 'teams' || type === 'unserved') router.push('/dispatch');
          }}
        />

        {/* Row 2: Flood Progression Timeline Simulation */}
        <FloodProgressionTimeline
          currentHour={simulationHour}
          onHourChange={setSimulationHour}
          onReset={() => setSimulationHour(0)}
        />

        {/* Row 3: Live Disaster Risk Map (Large Panel) */}
        <LiveDisasterMap
          simulationHour={simulationHour}
          onSelectIncident={(incident) => handleDispatchRedirect(incident)}
        />

        {/* Row 4: High-Risk Blind-Spot Panel (Areas Requiring Verification) */}
        <HighRiskBlindSpotPanel
          onDispatchVerification={(zoneName) => setVerificationZone(zoneName)}
        />

        {/* Row 5: Emergency Priority List & Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
                Emergency Priority Queue
              </h2>
              <p className="text-xs text-[#64748B]">
                Algorithmic life-safety prioritization ranking callers by time-to-harm, mobility constraints, and water rise rate.
              </p>
            </div>
          </div>

          <EmergencyPriorityTable
            onSelectIncidentForDispatch={handleDispatchRedirect}
          />
        </div>
      </div>

      {/* Verification Dispatch Confirmation Modal */}
      <ConfirmationDialog
        isOpen={Boolean(verificationZone)}
        onClose={() => setVerificationZone(null)}
        onConfirm={handleSimulateVerification}
        title="Dispatch Ground Verification Patrol"
        description={`Deploy a mobile volunteer reconnaissance unit to ${verificationZone} to conduct physical door-to-door welfare checks in areas unreachable by mobile phone.`}
        confirmLabel="Simulate Dispatch Patrol"
        variant="warning"
        isDemoAction={true}
        details={
          <div>
            <p><strong>Target Zone:</strong> {verificationZone}</p>
            <p><strong>Objective:</strong> Verify physical water level & elderly status without falsely registering confirmed rescue emergency.</p>
          </div>
        }
      />
    </AppShell>
  );
}
