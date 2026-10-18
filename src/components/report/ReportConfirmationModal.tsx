'use client';

import React from 'react';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { ReportFormData } from './types';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface ReportConfirmationModalProps {
  isOpen: boolean;
  formData: ReportFormData | null;
  zoneName: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function ReportConfirmationModal({
  isOpen,
  formData,
  zoneName,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ReportConfirmationModalProps) {
  if (!formData) return null;

  const severityLabels: Record<number, string> = {
    3: 'Severe (Waist-to-neck level, rising fast)',
    2: 'Moderate (Ground floor flooded, knee level)',
    1: 'Minor (Street impassable, entering compound)',
    0: 'Low (Precautionary evacuation)',
  };

  const renderTriStateBadge = (val: boolean | null, trueLabel: string, falseLabel: string) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FAE8E7] text-[#B74349] border border-[#B74349]/20">
          <AlertTriangle className="w-3 h-3" />
          <span>{trueLabel}</span>
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#E5EEE8] text-[#377D65] border border-[#377D65]/20">
          <CheckCircle className="w-3 h-3" />
          <span>{falseLabel}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFF2DD] text-[#A87426] border border-[#A87426]/20">
        <HelpCircle className="w-3 h-3" />
        <span>Unknown / Unconfirmed</span>
      </span>
    );
  };

  const hasCoords = formData.lat !== null && formData.lng !== null;

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Review Emergency Intake Report"
      description="Verify that the critical facts below are accurate before lodging into the triage prioritization queue."
      confirmLabel={isSubmitting ? 'Submitting to Dispatch...' : 'Confirm & Submit Report'}
      cancelLabel="Edit Details"
      variant="teal"
      isDemoAction={false}
      details={
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between border-b border-[#E8E6E1] pb-2">
            <span className="text-[#757B81] font-medium">Target Zone:</span>
            <span className="font-bold text-[#252A30]">{zoneName || formData.zoneId}</span>
          </div>

          <div className="flex justify-between border-b border-[#E8E6E1] pb-2">
            <span className="text-[#757B81] font-medium">Assessed Severity:</span>
            <span className="font-bold text-[#252A30]">
              {severityLabels[formData.floodSeverity] ?? `Level ${formData.floodSeverity}`}
            </span>
          </div>

          <div className="flex justify-between border-b border-[#E8E6E1] pb-2">
            <span className="text-[#757B81] font-medium">People Needing Evacuation:</span>
            <span className="font-bold text-[#252A30]">
              {formData.peopleCount !== null ? (
                `${formData.peopleCount} individuals`
              ) : (
                <span className="text-[#A87426] italic">Unknown (Flagged for review)</span>
              )}
            </span>
          </div>

          <div className="border-b border-[#E8E6E1] pb-2 space-y-1.5">
            <span className="text-[#757B81] font-medium block">Vulnerability Indicators:</span>
            <div className="grid grid-cols-1 gap-1.5 pt-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#757B81]">Physically Trapped:</span>
                {renderTriStateBadge(formData.trapped, 'Trapped', 'Not Trapped')}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#757B81]">Urgent Medical Condition:</span>
                {renderTriStateBadge(formData.medicalUrgent, 'Urgent Medical', 'No Urgent Medical')}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#757B81]">Mobility / Wheelchair Assistance:</span>
                {renderTriStateBadge(formData.mobilityHelp, 'Assistance Needed', 'No Help Needed')}
              </div>
            </div>
          </div>

          <div className="border-b border-[#E8E6E1] pb-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#757B81] font-medium">Coordinates:</span>
              <span className={`font-mono font-semibold ${hasCoords ? 'text-[#536A82]' : 'text-[#A87426] italic'}`}>
                {hasCoords ? `${formData.lat}, ${formData.lng}` : 'None (Approximate Zone Location)'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[#757B81] font-medium block">Location Landmark:</span>
            <p className="text-[#252A30] italic mt-0.5 text-[11px] leading-relaxed bg-[#F7F6F2] p-2 rounded-lg border border-[#E8E6E1]">
              {formData.locationDescription}
            </p>
          </div>
        </div>
      }
    />
  );
}
