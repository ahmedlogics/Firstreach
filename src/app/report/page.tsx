'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/shared/AppShell';
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
    <AppShell>
      {/* Page Header: Neutral "Live intake (demo database)" badge replaces orange demo badge */}
      <PageHeader
        title="Submit Emergency Report"
        description="Provide essential information so response coordinators can evaluate and prioritize assistance during active flood surges."
        breadcrumbs={[{ label: 'Report Emergency' }]}
        showDemoBadge={false}
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Live intake (demo database)
          </span>
        }
      />

      {/* Real Success Banner */}
      {successResult && successResult.ok && (
        <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col gap-4 animate-in fade-in duration-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-emerald-900">
                    Emergency Report Lodged Successfully
                  </h4>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    Incident: {successResult.incidentId}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700">
                    Report ID: {successResult.reportId}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 font-semibold text-emerald-800">
                    Priority Score: {successResult.priorityScore} / 100
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 font-semibold text-teal-800 uppercase tracking-wide">
                    Status: {successResult.verificationStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#14B8A6] hover:bg-[#0D9488] text-white transition-colors cursor-pointer"
              >
                <span>View On Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSuccessResult(null)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Conditional Notice Flags: Incomplete information / Duplicate / Approximate Location */}
          <div className="space-y-2 pt-2 border-t border-emerald-200/80">
            {/* 1. Missing fields or Needs Review */}
            {(successResult.needsReview || successResult.missingFields.length > 0) && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">
                    Verification required: information is incomplete
                  </strong>
                  {successResult.missingFields.length > 0 && (
                    <span className="text-amber-800">
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
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">
                    Possible duplicate flagged for review
                  </strong>
                  <span className="text-blue-800">
                    This submission matched an active nearby emergency. It has been linked to the existing incident and earlier report ({successResult.possibleDuplicateOf}) rather than creating a duplicate dispatch queue.
                  </span>
                </div>
              </div>
            )}

            {/* 3. Approximate location when coordinates were not provided */}
            {!successResult.hasCoordinates && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 text-xs">
                <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Location is approximate and verification is required.</strong> No GPS coordinates were supplied; triage is mapped using the sector zone centroid.
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
          <div className="bg-[#0F172A] text-white rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-[#14B8A6] text-xs font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Voice / SMS Relay Dispatch</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              For residents in low-connectivity areas unable to load web forms, volunteer teams can transcribe call records directly into this interface.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Karachi Relay Desk:</span>
              <span className="font-mono text-slate-200 font-bold">1122 / +92 21 9920</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
