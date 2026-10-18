'use client';

import React, { useState } from 'react';
import { PublicShell } from '@/components/shared/PublicShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmergencyReportForm } from '@/components/report/EmergencyReportForm';
import { OfflineQueueList } from '@/components/report/OfflineQueueList';
import { ReportGuidelinesCard } from '@/components/report/ReportGuidelinesCard';
import { ReportSuccessResult } from '@/components/report/types';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function ReportPage() {
  const router = useRouter();
  const [successResult, setSuccessResult] = useState<ReportSuccessResult | null>(null);

  const handleFormSuccess = (result: ReportSuccessResult) => {
    setSuccessResult(result);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fieldLabels: Record<string, string> = {
    peopleCount: 'People count',
    trapped: 'Trapped status',
    medicalUrgent: 'Medical urgency',
    mobilityHelp: 'Mobility assistance',
    coordinates: 'Exact GPS coordinates',
  };

  return (
    <PublicShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page Header: Neutral "Live intake (demo database)" badge */}
        <PageHeader
          title="Submit Emergency Report"
          rootHref="/"
          rootLabel="Home"
          breadcrumbs={[{ label: 'Report Emergency' }]}
          showDemoBadge={false}
          badge={
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-white text-[#252A30] border border-[#E8E6E1] shadow-2xs">
              Live Intake Portal
            </span>
          }
        />

      {/* Real Success Banner */}
      {successResult && successResult.ok && (
        <div className="mb-6 p-5 rounded-2xl bg-[#E5EEE8] border border-[#377D65]/30 text-[#252A30] flex flex-col gap-4 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white text-[#377D65] border border-[#377D65]/20 shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-[#252A30]">
                    Emergency Report Lodged Successfully
                  </h4>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-[#377D65]/20 text-[#377D65]">
                    Incident: {successResult.incidentId}
                  </span>
                  <span className="text-[11px] font-mono text-[#757B81]">
                    Report ID: {successResult.reportId}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-white border border-[#377D65]/20 font-semibold text-[#377D65]">
                    Priority Score: {successResult.priorityScore} / 100
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-[#EDF1F5] font-semibold text-[#536A82] border border-[#536A82]/20 uppercase tracking-wide">
                    Status: {successResult.verificationStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#536A82] hover:bg-[#40566D] text-white transition-colors cursor-pointer shadow-2xs"
              >
                <span>View On Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSuccessResult(null)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-[#377D65] hover:bg-white transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Conditional Notice Flags: Incomplete information / Duplicate / Approximate Location */}
          <div className="space-y-2 pt-2 border-t border-[#377D65]/20">
            {/* 1. Missing fields or Needs Review */}
            {(successResult.needsReview || successResult.missingFields.length > 0) && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FFF2DD] border border-[#A87426]/30 text-[#A87426] text-xs">
                <AlertTriangle className="w-4 h-4 text-[#A87426] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">
                    Verification required: information is incomplete
                  </strong>
                  {successResult.missingFields.length > 0 && (
                    <span className="text-[#A87426]/90">
                      Missing fields:{' '}
                      {successResult.missingFields
                        .map((f) => fieldLabels[f] || f)
                        .join(', ')}
                      . Field volunteers will verify on-site before dispatching heavy craft.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 2. Possible Duplicate */}
            {successResult.possibleDuplicateOf && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#EDF1F5] border border-[#536A82]/30 text-[#536A82] text-xs">
                <Info className="w-4 h-4 text-[#536A82] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">
                    Possible duplicate flagged for review
                  </strong>
                  <span className="text-[#536A82]/90">
                    This submission matched an active nearby emergency. It has been linked to the existing incident and earlier report ({successResult.possibleDuplicateOf}) rather than creating a duplicate dispatch queue.
                  </span>
                </div>
              </div>
            )}

            {/* 3. Approximate location when coordinates were not provided */}
            {!successResult.hasCoordinates && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] text-[#757B81] text-xs">
                <Info className="w-4 h-4 text-[#757B81] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#252A30]">Location is approximate and verification is required.</strong> No GPS coordinates were supplied; triage is mapped using the sector zone centroid.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Form & Offline Queue on Left, Guidelines & Help on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Offline Queue List (Rule 6) */}
          <OfflineQueueList />

          {/* Emergency Intake Form */}
          <EmergencyReportForm onSubmitSuccess={handleFormSuccess} />
        </div>

        <div className="space-y-6">
          <ReportGuidelinesCard />

          {/* Quick FAQ / Call Center Box */}
          <div className="bg-[#252A30] text-[#F7F6F2] rounded-2xl p-5 border border-[#343B43] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#EDF1F5] text-xs font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4 text-[#536A82]" />
              <span>Voice / SMS Relay Dispatch</span>
            </div>
            <p className="text-xs text-[#92979D] leading-relaxed">
              For residents in low-connectivity areas unable to load web forms, volunteer teams can transcribe call records directly into this interface.
            </p>
            <div className="pt-2 border-t border-[#343B43] flex items-center justify-between text-[11px] text-[#92979D]">
              <span>Karachi Relay Desk:</span>
              <span className="font-mono text-[#F7F6F2] font-bold">1122 / +92 21 9920</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PublicShell>
  );
}
