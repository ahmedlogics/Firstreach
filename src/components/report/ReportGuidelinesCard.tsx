'use client';

import React from 'react';
import {
  ShieldAlert,
  AlertCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/reports/i18n';

interface ReportGuidelinesCardProps {
  language?: Language;
}

export function ReportGuidelinesCard({ language = 'en' }: ReportGuidelinesCardProps) {
  const t = TRANSLATIONS[language]?.guidelines || TRANSLATIONS.en.guidelines;
  const isRtl = language === 'ur' || language === 'sd';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-teal-50 text-[#14B8A6] border border-teal-100">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-[#0F172A]">{t.title}</h3>
      </div>

      <p className="text-xs text-[#64748B] leading-relaxed">
        {t.callout}
      </p>

      <div className="space-y-3 pt-1 text-xs">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800 block">{t.tip1Title}</strong>
            <span className="text-slate-500">{t.tip1Desc}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <Compass className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800 block">{t.tip2Title}</strong>
            <span className="text-slate-500">{t.tip2Desc}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-900 block font-semibold">{t.tip3Title}</strong>
            <span className="text-amber-800/90">{t.tip3Desc}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
