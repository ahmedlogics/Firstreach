'use client';

import React from 'react';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { ReportFormData } from './types';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/reports/i18n';

interface ReportConfirmationModalProps {
  isOpen: boolean;
  formData: ReportFormData | null;
  zoneName: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  language?: Language;
}

export function ReportConfirmationModal({
  isOpen,
  formData,
  zoneName,
  onClose,
  onConfirm,
  isSubmitting = false,
  language = 'en',
}: ReportConfirmationModalProps) {
  if (!formData) return null;

  const t = TRANSLATIONS[language]?.modal || TRANSLATIONS.en.modal;
  const isRtl = language === 'ur' || language === 'sd';

  const severityLabels: Record<number, string> = {
    3: language === 'ur' ? '۳ — انتہائی جان لیوا' : language === 'sd' ? '۳ — انتهائي خطرو / جان ليوا' : '3 — Critical Surge (Chest deep / rooftop)',
    2: language === 'ur' ? '۲ — شدید سیلاب' : language === 'sd' ? '۲ — سخت ٻوڏ' : '2 — Severe Inundation (Waist deep)',
    1: language === 'ur' ? '۱ — درمیانہ سیلاب' : language === 'sd' ? '۱ — وچولي ٻوڏ' : '1 — Moderate Water (Knee deep)',
    0: language === 'ur' ? '۰ — معمولی بہاؤ' : language === 'sd' ? '۰ — معمولي وهڪرو' : '0 — Minor Runoff (Ankle deep)',
  };

  const triLabels = {
    trapped: {
      yes: language === 'ur' ? 'محصور ہیں' : language === 'sd' ? 'ڦاٿل آهن' : 'Trapped',
      no: language === 'ur' ? 'محصور نہیں' : language === 'sd' ? 'ڦاٿل ناهن' : 'Not Trapped',
    },
    medical: {
      yes: language === 'ur' ? 'فوری طبی امداد درکار' : language === 'sd' ? 'فوري طبي امداد کپي' : 'Urgent Medical',
      no: language === 'ur' ? 'طبی ایمرجنسی نہیں' : language === 'sd' ? 'طبي هنگامي ناهي' : 'No Urgent Medical',
    },
    mobility: {
      yes: language === 'ur' ? 'مدد کی ضرورت ہے' : language === 'sd' ? 'مدد جي ضرورت آهي' : 'Assistance Needed',
      no: language === 'ur' ? 'مدد درکار نہیں' : language === 'sd' ? 'مدد نٿي کپي' : 'No Help Needed',
    },
    unknown: language === 'ur' ? 'معلوم نہیں / غیر تصدیق شدہ' : language === 'sd' ? 'اڻڄاتل / تصديق کانسواءِ' : 'Unknown / Unconfirmed',
  };

  const renderTriStateBadge = (val: boolean | null, trueLabel: string, falseLabel: string) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
          <AlertTriangle className="w-3 h-3" />
          <span>{trueLabel}</span>
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-3 h-3" />
          <span>{falseLabel}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
        <HelpCircle className="w-3 h-3" />
        <span>{triLabels.unknown}</span>
      </span>
    );
  };

  const hasCoords = formData.lat !== null && formData.lng !== null;

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t.title}
      description={t.subtitle}
      confirmLabel={isSubmitting ? (language === 'ur' ? 'ارسال کیا جا رہا ہے...' : language === 'sd' ? 'اماڻيو پيو وڃي...' : 'Transmitting to Dispatch...') : t.confirmButton}
      cancelLabel={t.cancelButton}
      variant="teal"
      isDemoAction={false}
      details={
        <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-2.5 text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium">{t.zoneLabel}:</span>
            <span className="font-bold text-slate-800">{zoneName || formData.zoneId}</span>
          </div>

          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium">{t.severityLabel}:</span>
            <span className="font-bold text-slate-900">
              {severityLabels[formData.floodSeverity] ?? `Level ${formData.floodSeverity}`}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium">{t.peopleLabel}:</span>
            <span className="font-bold text-slate-800">
              {formData.peopleCount !== null ? (
                `${formData.peopleCount} ${language === 'ur' ? 'افراد' : language === 'sd' ? 'ماڻهو' : 'individuals'}`
              ) : (
                <span className="text-amber-700 italic">
                  {language === 'ur' ? 'معلوم نہیں (جائزہ لیا جائے گا)' : language === 'sd' ? 'اڻڄاتل (جائزو ورتو ويندو)' : 'Unknown (Flagged for review)'}
                </span>
              )}
            </span>
          </div>

          <div className="border-b border-slate-200 pb-2 space-y-1.5">
            <span className="text-slate-500 font-medium block">
              {language === 'ur' ? 'خطرے کی علامات:' : language === 'sd' ? 'خطري جون نشانيون:' : 'Vulnerability Indicators:'}
            </span>
            <div className="grid grid-cols-1 gap-1.5 pt-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">{t.trappedLabel}:</span>
                {renderTriStateBadge(formData.trapped, triLabels.trapped.yes, triLabels.trapped.no)}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">{t.medicalLabel}:</span>
                {renderTriStateBadge(formData.medicalUrgent, triLabels.medical.yes, triLabels.medical.no)}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">{t.mobilityLabel}:</span>
                {renderTriStateBadge(formData.mobilityHelp, triLabels.mobility.yes, triLabels.mobility.no)}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 pb-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 font-medium">
                {language === 'ur' ? 'نقشہ کوآرڈینیٹس:' : language === 'sd' ? 'نقشي جا ڪوآرڊينيٽس:' : 'Coordinates:'}
              </span>
              <span className={`font-mono font-semibold ${hasCoords ? 'text-teal-700' : 'text-amber-700 italic'}`}>
                {hasCoords
                  ? `${formData.lat}, ${formData.lng}`
                  : (language === 'ur' ? 'غیر موجود (قریبی زون کا اندازہ)' : language === 'sd' ? 'موجود ناهي (علائقي جو اندازو)' : 'None (Approximate Zone Location)')}
              </span>
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-medium block">{t.locationLabel}:</span>
            <p className="text-slate-800 italic mt-0.5 text-[11px] leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
              {formData.locationDescription}
            </p>
          </div>
        </div>
      }
    />
  );
}
