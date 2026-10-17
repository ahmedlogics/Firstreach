'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { ReachabilityStats } from '@/components/outreach/ReachabilityStats';
import { SilenceEscalationTimeline } from '@/components/outreach/SilenceEscalationTimeline';
import { HouseholdOutreachList } from '@/components/outreach/HouseholdOutreachList';
import { ShelterManagementGrid } from '@/components/outreach/ShelterManagementGrid';
import { VolunteerTasksList } from '@/components/outreach/VolunteerTasksList';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { Household, OutreachMethod } from '@/lib/types';
import { CheckCircle2, Radio, Footprints, MessageSquare } from 'lucide-react';

export default function OutreachPage() {
  const [pendingOutreach, setPendingOutreach] = useState<{
    household: Household;
    method: OutreachMethod;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSimulateOutreachAction = (household: Household, method: OutreachMethod) => {
    setPendingOutreach({ household, method });
  };

  const handleConfirmOutreach = () => {
    if (!pendingOutreach) return;

    const { household, method } = pendingOutreach;
    let label = 'Outreach action';
    if (method === 'volunteer_visit') label = `Volunteer verification patrol tasked to ${household.referenceCode}`;
    if (method === 'loudspeaker_alert') label = `Mosque minaret loudspeaker siren requested for ${household.zoneName}`;
    if (method === 'sms_fallback') label = `Simulated low-bandwidth emergency SMS triggered for ${household.referenceCode}`;

    setToastMessage(label);
    setPendingOutreach(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppShell>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Community Outreach & Shelter Coordination"
        description="Reach vulnerable households, organize verification tasks, and monitor shelter availability before water levels crest."
        breadcrumbs={[{ label: 'Outreach & Shelters' }]}
      />

      <div className="space-y-6">
        {/* Row 1: Key Reachability Stats */}
        <ReachabilityStats />

        {/* Row 2: Silence Escalation Protocol Architecture */}
        <SilenceEscalationTimeline />

        {/* Row 3: Household Reachability & Outreach Queue */}
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
              High-Risk Household Reachability Directory
            </h2>
            <p className="text-xs text-[#64748B]">
              Track households with chronic silence, zero phone access, or vulnerable family members in inundation paths.
            </p>
          </div>

          <HouseholdOutreachList
            onSimulateOutreach={handleSimulateOutreachAction}
          />
        </div>

        {/* Row 4: Grid with Shelters on Left, Volunteer Tasks on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ShelterManagementGrid />
          <VolunteerTasksList
            onCompleteTask={(taskId) => {
              setToastMessage(`Volunteer verification task ${taskId} marked as completed in simulated state.`);
              setTimeout(() => setToastMessage(null), 4000);
            }}
          />
        </div>
      </div>

      {/* Outreach Action Confirmation Modal */}
      <ConfirmationDialog
        isOpen={Boolean(pendingOutreach)}
        onClose={() => setPendingOutreach(null)}
        onConfirm={handleConfirmOutreach}
        title="Execute Simulated Community Outreach"
        description={`Send targeted intervention for household ${pendingOutreach?.household.referenceCode} (${pendingOutreach?.household.headOfHousehold}) in ${pendingOutreach?.household.zoneName}.`}
        confirmLabel="Simulate Action"
        variant="teal"
        isDemoAction={true}
        details={
          pendingOutreach && (
            <div className="space-y-1">
              <div><strong>Action Type:</strong> <span className="capitalize">{pendingOutreach.method.replace(/_/g, ' ')}</span></div>
              <div><strong>Vulnerabilities:</strong> {pendingOutreach.household.vulnerabilityIndicators.join(', ')}</div>
              <div><strong>Connectivity:</strong> {pendingOutreach.household.phoneReachability}</div>
            </div>
          )
        }
      />
    </AppShell>
  );
}
