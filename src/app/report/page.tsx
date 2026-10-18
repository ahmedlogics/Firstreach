'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RaabtaLogo } from '@/components/shared/RaabtaLogo';
import { EmergencyReportForm } from '@/components/report/EmergencyReportForm';
import { OfflineQueueList } from '@/components/report/OfflineQueueList';
import { LanguageSelector } from '@/components/report/LanguageSelector';
import { ReportSuccessResult } from '@/components/report/types';
import { Language, TRANSLATIONS } from '@/lib/reports/i18n';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  PhoneCall,
  ShieldAlert,
  ChevronDown,
  RefreshCw,
  Home,
} from 'lucide-react';

export default function ReportPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('en');
  const [successResult, setSuccessResult] = useState<ReportSuccessResult | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'ur' || language === 'sd';

  const handleFormSuccess = (result: ReportSuccessResult) => {
    setSuccessResult(result);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyReference = (refText: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(refText);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  const shortRefNumber = successResult?.reportId
    ? `REF-${successResult.reportId.slice(0, 8).toUpperCase()}`
    : 'REF-SUBMITTED';

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col text-[#18232D] antialiased">
      {/* =========================================================================
          DEDICATED MINIMAL EMERGENCY REPORTING HEADER
          Left: RAABTA Logo + "← Back to Home"
          Right: Multilingual Selector
          NO coordinator sidebar, NO marketing nav, NO redundant report buttons
         ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E4E8EC] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 group focus:outline-none">
            <RaabtaLogo size="sm" showSubtitle={false} showUrdu={true} />
          </Link>

          <div className="h-4 w-px bg-[#E4E8EC]" />

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6B7A] hover:text-[#18232D] transition-colors"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            <span>{language === 'ur' ? 'مرکزی صفحہ پر واپس' : language === 'sd' ? 'مکيه صفحي ڏانهن واپس' : 'Back to Home'}</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* =========================================================================
            STATE A: DEDICATED CONFIRMATION SCREEN (REPLACES FORM ON SUCCESS)
           ========================================================================= */}
        {successResult && successResult.ok ? (
          <div className="bg-white rounded-2xl border border-[#E4E8EC] shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Success Icon & Heading */}
            <div className="text-center space-y-2.5">
              <div className="w-14 h-14 rounded-full bg-[#EBF7F2] text-[#258167] border border-[#258167]/30 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#18232D] tracking-tight">
                {language === 'ur' ? 'ہنگامی رپورٹ موصول ہوگئی' : language === 'sd' ? 'هنگامي رپورٽ ملي وئي' : 'Emergency Report Received'}
              </h1>
              <p className="text-xs sm:text-sm text-[#5F6B7A] max-w-md mx-auto leading-relaxed">
                {language === 'ur'
                  ? 'آپ کی رپورٹ ریسکیو کوآرڈینیشن سسٹم میں درج کر لی گئی ہے۔ امدادی ٹیمیں ترجیحی بنیادوں پر جائزہ لے رہی ہیں۔'
                  : language === 'sd'
                  ? 'توهان جي رپورٽ ريسڪيو سسٽم ۾ داخل ڪئي وئي آهي. امدادي ٽيمون ترجيحي بنيادن تي جائزو وٺي رهيون آهن.'
                  : 'Your report has been logged into the response coordination system and queued for immediate life-safety triage.'}
              </p>
            </div>

            {/* Reference Number Card */}
            <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E4E8EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono text-[#5F6B7A] uppercase tracking-wider block">
                  {language === 'ur' ? 'رپورٹ ریفرنس نمبر' : language === 'sd' ? 'رپورٽ ريفرنس نمبر' : 'Intake Reference Number'}
                </span>
                <span className="font-mono text-base font-bold text-[#18232D] tracking-wider block mt-0.5">
                  {shortRefNumber}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyReference(shortRefNumber)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E8EC] bg-white hover:bg-[#F7F8FA] text-xs font-semibold text-[#18232D] transition-colors cursor-pointer self-start sm:self-auto"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#258167]" />
                    <span className="text-[#258167]">{language === 'ur' ? 'کاپی ہوگیا' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#5F6B7A]" />
                    <span>{language === 'ur' ? 'ریفرنس کاپی کریں' : 'Copy Reference'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Verification Status & Uncertainty Warning */}
            <div className="p-4 rounded-xl border border-[#375A6B]/20 bg-[#EAF0F4]/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5F6B7A]">Triage Assessment:</span>
                <span className="font-bold text-[#18232D]">
                  Priority Score {successResult.priorityScore} / 100
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5F6B7A]">Intake Status:</span>
                <span className="font-semibold uppercase tracking-wider text-[#375A6B]">
                  {successResult.verificationStatus}
                </span>
              </div>

              <div className="pt-2 border-t border-[#375A6B]/15 text-[11px] text-[#5F6B7A] leading-relaxed">
                <strong className="text-[#18232D]">Notice: </strong>
                {language === 'ur'
                  ? 'رپورٹ موصول ہونے کا یہ مطلب نہیں کہ ریسکیو بوٹ فوری طور پر روانہ ہو چکی ہے۔ پانی کی سطح اور طبی خطرے کے مطابق وسائل مختص کیے جاتے ہیں۔'
                  : 'Report receipt does not guarantee immediate rescue arrival. Available craft and volunteer teams are deployed based on acute life-threat ranking.'}
              </div>
            </div>

            {/* Safety Guidance */}
            <div className="p-4 rounded-xl bg-[#FFF5E6] border border-[#A87528]/30 space-y-1.5 text-xs text-[#A87528]">
              <div className="flex items-center gap-2 font-bold text-[#18232D]">
                <AlertTriangle className="w-4 h-4 text-[#A87528]" />
                <span>{language === 'ur' ? 'فوری حفاظتی ہدایات' : 'Critical Safety Action'}</span>
              </div>
              <p className="text-[11px] text-[#18232D] leading-relaxed">
                {language === 'ur'
                  ? 'اگر پانی کی سطح تیزی سے بلند ہو رہی ہو، تو فوری طور پر عمارت کی بالائی منزل یا چھت پر منتقل ہو جائیں۔ لائیو بجلی کے تاروں سے دور رہیں۔'
                  : 'If floodwaters are rising, move elderly and children to the highest accessible floor or roof. Avoid wading through rapid currents or submerged electrical points.'}
              </p>
            </div>

            {/* Direct Confirmation Actions: Submit Another Report OR Return Home */}
            <div className="pt-3 border-t border-[#E4E8EC] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSuccessResult(null)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#18232D] hover:bg-[#25323F] text-white shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'ایک اور رپورٹ درج کریں' : language === 'sd' ? 'ٻي رپورٽ درج ڪريو' : 'Submit Another Report'}</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-[#E4E8EC] hover:bg-[#F7F8FA] text-[#18232D] transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#5F6B7A]" />
                <span>{language === 'ur' ? 'مرکزی صفحہ پر جائیں' : language === 'sd' ? 'مکيه صفحي ڏانهن وڃو' : 'Return Home'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
              STATE B: GUIDED EMERGENCY REPORT FORM
             ========================================================================= */
          <div className="space-y-6">
            {/* Calm Intake Page Header */}
            <div className="pb-4 border-b border-[#E4E8EC]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5F6B7A] mb-1">
                <span className="text-[#375A6B] font-bold">RAABTA</span>
                <span>/</span>
                <span className="text-[#18232D]">{t.header.breadcrumb}</span>
              </div>
              <h1 className={`text-xl sm:text-2xl font-bold text-[#18232D] tracking-tight ${isRtl ? 'font-serif' : ''}`}>
                {t.header.title}
              </h1>
              <p className="text-xs text-[#5F6B7A] mt-1 max-w-xl leading-relaxed">
                {t.header.description}
              </p>
            </div>

            {/* Offline Device Queue Status */}
            <OfflineQueueList language={language} />

            {/* 4-Step Guided Intake Stepper */}
            <EmergencyReportForm
              onSubmitSuccess={handleFormSuccess}
              language={language}
            />

            {/* Collapsible Guidelines Drawer */}
            <div className="pt-2">
              <div className="border border-[#E4E8EC] rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setShowGuidelines(!showGuidelines)}
                  className="w-full px-4 py-3 text-left text-xs font-semibold text-[#18232D] flex items-center justify-between hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#375A6B]" />
                    <span>{language === 'ur' ? 'رپورٹنگ کے اصول اور طریقہ کار' : language === 'sd' ? 'رپورٽنگ جا اصول' : 'Reporting Protocols & Verification Notice'}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#5F6B7A] transition-transform duration-150 ${
                      showGuidelines ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showGuidelines && (
                  <div className="p-4 border-t border-[#E4E8EC] bg-[#F7F8FA] space-y-3 text-xs text-[#5F6B7A] leading-relaxed animate-in fade-in duration-150">
                    <div className="space-y-1">
                      <strong className="text-[#18232D] block">
                        {language === 'ur' ? 'ایماندارانہ معلومات:' : 'Honest Information:'}
                      </strong>
                      <p>
                        {language === 'ur'
                          ? 'اگر افراد کی تعداد یا کسی طبی حالت کا علم نہ ہو، تو "معلوم نہیں" کا انتخاب کریں۔ اندازہ لگانے سے غلط ترجیح پیدا ہو سکتی ہے۔'
                          : 'If you cannot verify exact numbers or medical conditions, select "Unknown". Selecting Unknown retains a safety buffer without distorting dispatch queues.'}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-[#E4E8EC]">
                      <strong className="text-[#18232D] block">
                        {language === 'ur' ? 'پڑوسیوں اور کمیونٹی کی جانب سے رپورٹ:' : 'Proxy Community Reports:'}
                      </strong>
                      <p>
                        {language === 'ur'
                          ? 'آپ ان متاثرین کے لیے بھی رپورٹ درج کرا سکتے ہیں جن کے پاس موبائل فون یا بجلی کی سہولت موجود نہیں۔'
                          : 'You may report on behalf of neighbors who lack mobile phones or power connectivity. Mark the relationship clearly in Step 1.'}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-[#E4E8EC]">
                      <strong className="text-[#18232D] block">
                        {language === 'ur' ? 'براہ راست ہنگامی ہیلپ لائنز:' : 'Direct Emergency Helplines:'}
                      </strong>
                      <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] font-bold text-[#18232D]">
                        <span className="px-2 py-0.5 rounded bg-white border border-[#E4E8EC]">Rescue 1122</span>
                        <span className="px-2 py-0.5 rounded bg-white border border-[#E4E8EC]">PDMA: 1736</span>
                        <span className="px-2 py-0.5 rounded bg-white border border-[#E4E8EC]">Edhi: 115</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Minimal Public Footer */}
      <footer className="border-t border-[#E4E8EC] bg-white py-4 px-6 text-xs text-[#6B7782]">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span className="font-semibold text-[#18232D]">
            RAABTA &bull; Disaster Response &amp; Coordination
          </span>
          <span className="text-[11px] text-[#8B959E]">
            Demonstration Platform &bull; Evaluation Prototype
          </span>
        </div>
      </footer>
    </div>
  );
}
