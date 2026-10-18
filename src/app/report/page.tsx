'use client';

import React, { useState } from 'react';
import { PublicShell } from '@/components/shared/PublicShell';
import { EmergencyReportForm } from '@/components/report/EmergencyReportForm';
import { OfflineQueueList } from '@/components/report/OfflineQueueList';
import { ReportGuidelinesCard } from '@/components/report/ReportGuidelinesCard';
import { LanguageSelector } from '@/components/report/LanguageSelector';
import { ReportSuccessResult } from '@/components/report/types';
import { Language, TRANSLATIONS } from '@/lib/reports/i18n';
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
  const [language, setLanguage] = useState<Language>('en');
  const [successResult, setSuccessResult] = useState<ReportSuccessResult | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'ur' || language === 'sd';

  const handleFormSuccess = (result: ReportSuccessResult) => {
    setSuccessResult(result);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fieldLabels: Record<string, string> = {
    peopleCount: language === 'ur' ? 'افراد کی تعداد' : language === 'sd' ? 'ماڻهن جو انگ' : 'People count',
    trapped: language === 'ur' ? 'محصور ہونے کی حالت' : language === 'sd' ? 'ڦاٿل هجڻ جي حالت' : 'Trapped status',
    medicalUrgent: language === 'ur' ? 'طبی ہنگامی حالت' : language === 'sd' ? 'طبي هنگامي حالت' : 'Medical urgency',
    mobilityHelp: language === 'ur' ? 'حرکت میں مدد' : language === 'sd' ? 'هلڻ ۾ مدد' : 'Mobility assistance',
    coordinates: language === 'ur' ? 'درست جی پی ایس کوآرڈینیٹس' : language === 'sd' ? 'صحيح جي پي ايس ڪوآرڊينيٽس' : 'Exact GPS coordinates',
  };

  return (
    <PublicShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Page Header with 3-Way Language Switcher (EN | اردو | سنڌي) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E8E6E1]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#757B81] mb-1">
              <span className="text-[#377D65] font-bold">FirstReach HQ</span>
              <span>/</span>
              <span className="text-[#252A30]">{t.header.breadcrumb}</span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-black text-[#252A30] tracking-tight ${isRtl ? 'font-serif' : ''}`}>
              {t.header.title}
            </h1>
            <p className="text-xs text-[#757B81] mt-1 max-w-2xl leading-relaxed">
              {t.header.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-[#252A30] border border-[#E8E6E1] shadow-2xs">
              {t.header.badge}
            </span>
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>

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
                      {t.successBanner.title}
                    </h4>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-[#377D65]/20 text-[#377D65]">
                      {t.successBanner.incident}: {successResult.incidentId}
                    </span>
                    <span className="text-[11px] font-mono text-[#757B81]">
                      {t.successBanner.reportId}: {successResult.reportId}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white border border-[#377D65]/20 font-semibold text-[#377D65]">
                      {t.successBanner.priorityScore}: {successResult.priorityScore} / 100
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#EDF1F5] font-semibold text-[#536A82] border border-[#536A82]/20 uppercase tracking-wide">
                      {t.successBanner.status}: {successResult.verificationStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#536A82] hover:bg-[#40566D] text-white transition-colors cursor-pointer shadow-2xs"
                >
                  <span>{t.successBanner.viewOnMap}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => setSuccessResult(null)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-[#377D65] hover:bg-white transition-colors cursor-pointer"
                >
                  {t.successBanner.dismiss}
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
                      {language === 'ur' ? 'توثیق درکار ہے: معلومات نامکمل ہیں' : language === 'sd' ? 'تصديق جي ضرورت: معلومات اڻپوري آهي' : 'Verification required: information is incomplete'}
                    </strong>
                    {successResult.missingFields.length > 0 && (
                      <span className="text-[#A87426]/90">
                        {language === 'ur' ? 'نامعلوم خانے: ' : language === 'sd' ? 'اڻڄاتل خانا: ' : 'Missing fields: '}
                        {successResult.missingFields
                          .map((f) => fieldLabels[f] || f)
                          .join(', ')}
                        .{' '}
                        {language === 'ur' ? 'ریسکیو ٹیمیں بھاری بوٹ بھیجنے سے پہلے زمینی سطح پر تصدیق کریں گی۔' : language === 'sd' ? 'ريسڪيو ٽيمون وڏي ٻيڙي موڪلڻ کان اڳ زميني تصديق ڪنديون.' : 'Field volunteers will verify on-site before dispatching heavy craft.'}
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
                      {language === 'ur' ? 'مشتبہ ڈپلیکیٹ رپورٹ کا جائزہ' : language === 'sd' ? 'مشتبهه ڊپليڪيٽ رپورٽ جو جائزو' : 'Possible duplicate flagged for review'}
                    </strong>
                    <span className="text-[#536A82]/90">
                      {language === 'ur'
                        ? `یہ رپورٹ قریبی موجودہ ایمرجنسی سے مماثل پائی گئی۔ نئی قطار بنانے کے بجائے اسے سابقہ واقعے (${successResult.possibleDuplicateOf}) کے ساتھ منسلک کر دیا گیا ہے۔`
                        : language === 'sd'
                        ? `هيءَ رپورٽ ويجهي اڳوڻي هنگامي حالت سان ملي ٿي. نئين قطار بنائڻ بجاءِ ان کي اڳوڻي واقعي (${successResult.possibleDuplicateOf}) سان ڳنڍيو ويو آهي.`
                        : `This submission matched an active nearby emergency. It has been linked to the existing incident and earlier report (${successResult.possibleDuplicateOf}) rather than creating a duplicate dispatch queue.`}
                    </span>
                  </div>
                </div>
              )}

              {/* 3. Approximate location when coordinates were not provided */}
              {!successResult.hasCoordinates && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] text-[#757B81] text-xs">
                  <Info className="w-4 h-4 text-[#757B81] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#252A30]">
                      {language === 'ur' ? 'مقام کا اندازہ لگایا گیا ہے اور تصدیق درکار ہے۔' : language === 'sd' ? 'هنڌ جو رڳو اندازو آهي ۽ تصديق کپي.' : 'Location is approximate and verification is required.'}
                    </strong>{' '}
                    {language === 'ur' ? 'کوئی جی پی ایس کوآرڈینیٹس فراہم نہیں کیے گئے؛ امدادی ٹیموں کو متعلقہ سیکٹر زون کے درمیانی مرکز پر دکھایا گیا ہے۔' : language === 'sd' ? 'ڪي به جي پي ايس ڪوآرڊينيٽس ناهن مليل؛ ريسڪيو نقشو علائقي جي مرڪز تي ٻڌايو ويو آهي.' : 'No GPS coordinates were supplied; triage is mapped using the sector zone centroid.'}
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

            {/* Emergency Intake Form with Language state */}
            <EmergencyReportForm
              language={language}
              onSubmitSuccess={handleFormSuccess}
            />
          </div>

          <div className="space-y-6">
            <ReportGuidelinesCard language={language} />

            {/* Quick FAQ / Call Center Box */}
            <div className="bg-[#252A30] text-[#F7F6F2] rounded-2xl p-5 border border-[#343B43] space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-[#EDF1F5] text-xs font-bold uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#536A82]" />
                <span>
                  {language === 'ur' ? 'صوتی و ایس ایم ایس ریلے انٹیک' : language === 'sd' ? 'آواز ۽ ايس ايم ايس ريلي انٽيڪ' : 'Voice / SMS Relay Dispatch'}
                </span>
              </div>
              <p className="text-xs text-[#92979D] leading-relaxed">
                {language === 'ur'
                  ? 'کمزور انٹرنیٹ والے متاثرین کے لیے ریلیف رضاکار کال یا وائرلیس ریکارڈز براہ راست اس انٹرفیس میں درج کر سکتے ہیں۔'
                  : language === 'sd'
                  ? 'ڪمزور انٽرنيٽ وارن متاثرن لاءِ امدادي رضاڪار ڪال يا وائرليس رڪارڊز سڌو سنئون هتي داخل ڪري سگهن ٿا.'
                  : 'For residents in low-connectivity areas unable to load web forms, volunteer teams can transcribe call records directly into this interface.'}
              </p>
              <div className="pt-2 border-t border-[#343B43] flex items-center justify-between text-[11px] text-[#92979D]">
                <span>{language === 'ur' ? 'کراچی ریلے ڈیسک:' : language === 'sd' ? 'ڪراچي ريلي ڊيسڪ:' : 'Karachi Relay Desk:'}</span>
                <span className="font-mono text-[#F7F6F2] font-bold" dir="ltr">1122 / +92 21 9920</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
