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
      className="bg-white rounded-2xl border border-[#E8E6E1] shadow-2xs p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-[#EDF1F5] text-[#536A82] border border-[#E8E6E1]">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-[#252A30]">{t.title}</h3>
      </div>

      <p className="text-xs text-[#757B81] leading-relaxed">
        {t.callout}
      </p>

      <div className="space-y-3 pt-1 text-xs">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1]">
          <Clock className="w-4 h-4 text-[#757B81] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#252A30] block">{t.tip1Title}</strong>
            <span className="text-[#757B81]">{t.tip1Desc}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1]">
          <Compass className="w-4 h-4 text-[#757B81] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#252A30] block">{t.tip2Title}</strong>
            <span className="text-[#757B81]">{t.tip2Desc}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFF2DD] border border-[#A87426]/30 text-[#A87426]">
          <AlertCircle className="w-4 h-4 text-[#A87426] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#A87426] block font-semibold">{t.tip3Title}</strong>
            <span className="text-[#A87426]/90">{t.tip3Desc}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
