'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/shared/AppShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { AllocationPrincipleBanner } from '@/components/dispatch/AllocationPrincipleBanner';
import { RankedEmergencyQueue } from '@/components/dispatch/RankedEmergencyQueue';
import { RescueTeamList } from '@/components/dispatch/RescueTeamList';
import { AssignmentRecommendationPanel } from '@/components/dispatch/AssignmentRecommendationPanel';
import { UnservedEmergenciesPanel } from '@/components/dispatch/UnservedEmergenciesPanel';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmergencyIncident, RescueTeam } from '@/lib/types';
import { MOCK_INCIDENTS, MOCK_RESCUE_TEAMS } from '@/lib/mock-data';
import { CheckCircle2 } from 'lucide-react';

function DispatchWorkspace() {
  const searchParams = useSearchParams();
  const initialIncidentId = searchParams.get('incidentId');

  // Selected state
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(() => {
    if (initialIncidentId) {
      return MOCK_INCIDENTS.find((i) => i.id === initialIncidentId) || MOCK_INCIDENTS[0];
    }
    return MOCK_INCIDENTS[0];
  });

  const [selectedTeam, setSelectedTeam] = useState<RescueTeam | null>(MOCK_RESCUE_TEAMS[0]);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [escalatedIncidentId, setEscalatedIncidentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync if query param changes
  useEffect(() => {
    if (initialIncidentId) {
      const match = MOCK_INCIDENTS.find((i) => i.id === initialIncidentId);
      if (match) setSelectedIncident(match);
    }
  }, [initialIncidentId]);

  const handleConfirmDispatch = () => {
    if (!selectedIncident || !selectedTeam) return;

    setToastMessage(`Simulated dispatch authorized for ${selectedTeam.name} to ${selectedIncident.id} (${selectedIncident.zoneName}). Target ETA: ~${selectedTeam.etaMinutes}m.`);
    setIsDispatchModalOpen(false);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleEscalateIncident = (incidentId: string) => {
    setEscalatedIncidentId(incidentId);
  };

  const handleConfirmEscalation = () => {
    setToastMessage(`Incident ${escalatedIncidentId} escalated to Sindh Rangers / Military 5-Corps for amphibious extraction.`);
    setEscalatedIncidentId(null);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Rescue Resource Allocation"
        description="Prioritize urgent incidents, evaluate suitable rescue teams, and coordinate timely assistance across active flood sectors."
        breadcrumbs={[{ label: 'Rescue Allocation' }]}
      />

      <div className="space-y-6">
        {/* Core Allocation Principle Banner */}
        <AllocationPrincipleBanner />

        {/* Two-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Ranked Queue & Unserved Alerts */}
          <div className="lg:col-span-7 space-y-6">
            <RankedEmergencyQueue
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
            />

            <UnservedEmergenciesPanel
              onEscalate={handleEscalateIncident}
            />
          </div>

          {/* Right Column (5 cols): Assignment Recommendation & Fleet Readiness */}
          <div className="lg:col-span-5 space-y-6">
            <AssignmentRecommendationPanel
              selectedIncident={selectedIncident}
              selectedTeam={selectedTeam}
              onApproveDispatch={() => setIsDispatchModalOpen(true)}
            />

            <RescueTeamList
              selectedTeamId={selectedTeam?.id}
              onSelectTeam={(team) => setSelectedTeam(team)}
            />
          </div>
        </div>
      </div>

      {/* Dispatch Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onConfirm={handleConfirmDispatch}
        title="Confirm Rescue Unit Deployment"
        description={`Authorize dispatch of ${selectedTeam?.name} to emergency ${selectedIncident?.id}. Team will be tasked with rapid swiftwater extraction.`}
        confirmLabel="Authorize Simulated Dispatch"
        variant="teal"
        isDemoAction={true}
        details={
          selectedIncident && selectedTeam && (
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Incident:</span>
                <strong>{selectedIncident.id} ({selectedIncident.zoneName})</strong>
              </div>
              <div className="flex justify-between">
                <span>People Needing Rescue:</span>
                <strong className="text-red-600">{selectedIncident.affectedPeople} trapped</strong>
              </div>
              <div className="flex justify-between">
                <span>Assigned Unit:</span>
                <strong>{selectedTeam.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Estimated Arrival Time:</span>
                <strong className="text-teal-700 font-mono">~{selectedTeam.etaMinutes} minutes</strong>
              </div>
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
        confirmLabel="Simulate Military Escalation"
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
