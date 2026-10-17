'use client';

import React from 'react';
import { EmergencyReportFormData } from '@/lib/types';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

interface ReportConfirmationModalProps {
  isOpen: boolean;
  formData: EmergencyReportFormData | null;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function ReportConfirmationModal({
  isOpen,
  formData,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ReportConfirmationModalProps) {
  if (!formData) return null;

  const activeFactors = [
    formData.factors.risingWater && 'Rising Water Surge',
    formData.factors.medicalEmergency && 'Critical Medical Condition',
    formData.factors.mobilityAssistanceRequired && 'Mobility Assistance Needed',
    formData.factors.peopleTrapped && 'Individuals Trapped',
    formData.factors.elderlyPresent && 'Elderly Present',
    formData.factors.childrenPresent && 'Infants / Children Present',
  ].filter(Boolean) as string[];

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Review Emergency Intake Report"
      description="Verify that the critical facts below are accurate before lodging into the triage prioritization queue."
      confirmLabel={isSubmitting ? 'Submitting Report...' : 'Simulate Lodging Report'}
      cancelLabel="Edit Details"
      variant="teal"
      isDemoAction={true}
      details={
        <div className="space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500">Target Zone:</span>
            <span className="font-bold text-slate-800">{formData.zoneId}</span>
          </div>

          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500">People Requiring Evacuation:</span>
            <span className="font-bold text-red-600">{formData.affectedPeople} individuals</span>
          </div>

          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500">Assessed Severity:</span>
            <span className="font-bold uppercase text-slate-900">{formData.floodSeverity}</span>
          </div>

          <div className="border-b border-slate-200 pb-1.5">
            <span className="text-slate-500 block mb-1">Identified Risk Factors:</span>
            {activeFactors.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {activeFactors.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-semibold">
                    {f}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 italic">No secondary medical/mobility flags indicated</span>
            )}
          </div>

          <div>
            <span className="text-slate-500 block">Location Landmark:</span>
            <p className="text-slate-700 italic mt-0.5">{formData.locationDescription}</p>
          </div>
        </div>
      }
    />
  );
}
