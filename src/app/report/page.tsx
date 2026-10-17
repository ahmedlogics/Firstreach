'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmergencyReportForm } from '@/components/report/EmergencyReportForm';
import { ReportGuidelinesCard } from '@/components/report/ReportGuidelinesCard';
import { ReportConfirmationModal } from '@/components/report/ReportConfirmationModal';
import { EmergencyReportFormData } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function ReportPage() {
  const router = useRouter();
  const [pendingFormData, setPendingFormData] = useState<EmergencyReportFormData | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [successReportId, setSuccessReportId] = useState<string | null>(null);

  const handleFormSubmit = (data: EmergencyReportFormData) => {
    setPendingFormData(data);
    setIsConfirmationOpen(true);
  };

  const handleConfirmReport = () => {
    // Generate simulated incident ID
    const generatedId = `EMG-${Math.floor(8100 + Math.random() * 899)}`;
    setIsConfirmationOpen(false);
    setSuccessReportId(generatedId);
  };

  return (
    <AppShell>
      {/* Page Header */}
      <PageHeader
        title="Submit Emergency Report"
        description="Provide essential information so response coordinators can evaluate and prioritize assistance during active flood surges."
        breadcrumbs={[{ label: 'Report Emergency' }]}
      />

      {/* Success Banner if simulated submission occurred */}
      {successReportId && (
        <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-900">
                  Incident Lodged Successfully (Demo Simulation)
                </h4>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  {successReportId}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Your intake has been prioritized based on verified vulnerability indicators. In live mode, this persists to Supabase table <code className="bg-emerald-100 px-1 py-0.5 rounded">incidents</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
            >
              <span>View On Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSuccessReportId(null)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Form on Left, Guidelines & Help on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EmergencyReportForm onSubmitSuccess={handleFormSubmit} />
        </div>

        <div className="space-y-6">
          <ReportGuidelinesCard />

          {/* Quick FAQ / Call Center Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
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

      {/* Confirmation Modal */}
      <ReportConfirmationModal
        isOpen={isConfirmationOpen}
        formData={pendingFormData}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmReport}
      />
    </AppShell>
  );
}
