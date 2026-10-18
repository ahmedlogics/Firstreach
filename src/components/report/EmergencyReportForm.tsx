'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { emergencyReportSchema } from '@/lib/reports/schema';
import { ReportFormData, ReportSuccessResult, ZoneItem } from './types';
import { offlineReportQueue } from '@/lib/reports/offlineQueue';
import {
  User,
  Phone,
  AlertTriangle,
  HeartPulse,
  PersonStanding,
  Send,
  HelpCircle,
  Compass,
  RefreshCw,
  CheckCircle,
  X,
  Navigation,
  Map,
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  Waves,
  Clock,
  ShieldCheck,
  Edit2,
} from 'lucide-react';

import { Language, TRANSLATIONS } from '@/lib/reports/i18n';
import { LocationMapPicker } from './LocationMapPicker';

interface EmergencyReportFormProps {
  onSubmitSuccess: (result: ReportSuccessResult) => void;
  className?: string;
  language?: Language;
}

type IntakeStep = 1 | 2 | 3 | 4;

const DEFAULT_FORM_DATA = (initialKey: string): ReportFormData => ({
  zoneId: '',
  locationDescription: '',
  observationOption: 'now',
  reportingFor: 'myself',
  reporterRole: 'resident',
  floodSeverity: 2,
  peopleCount: 1,
  isPeopleCountUnknown: false,
  trapped: null,
  medicalUrgent: null,
  mobilityHelp: null,
  lat: null,
  lng: null,
  description: '',
  reporterName: '',
  reporterPhone: '',
  idempotencyKey: initialKey,
});

export function EmergencyReportForm({
  onSubmitSuccess,
  className = '',
  language = 'en',
}: EmergencyReportFormProps) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'ur' || language === 'sd';

  // 1. Guided Intake Step State (1: Reporter, 2: Location, 3: Emergency, 4: Review & Submit)
  const [currentStep, setCurrentStep] = useState<IntakeStep>(1);
  const [maxStepVisited, setMaxStepVisited] = useState<number>(1);

  // 2. Idempotency Key State
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');

  // 3. Form state (State is strictly preserved across all steps)
  const [formData, setFormData] = useState<ReportFormData>(() =>
    DEFAULT_FORM_DATA('')
  );

  // Initialize idempotency key on first client mount
  useEffect(() => {
    const key = crypto.randomUUID();
    setIdempotencyKey(key);
    setFormData((prev) => ({ ...prev, idempotencyKey: key }));
  }, []);

  // 4. Zone loading state
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [zonesLoading, setZonesLoading] = useState<boolean>(true);
  const [zonesError, setZonesError] = useState<string | null>(null);

  const fetchZones = useCallback(async () => {
    setZonesLoading(true);
    setZonesError(null);
    try {
      const res = await fetch('/api/reports/zones');
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      setZones(data);
      if (data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          zoneId: prev.zoneId || data[0].id,
        }));
      }
    } catch {
      setZonesError(
        language === 'ur'
          ? 'امدادی زونز لوڈ کرنے میں ناکامی۔ براہ کرم انٹرنیٹ کنکشن چیک کریں۔'
          : language === 'sd'
          ? 'امدادي علائقا لوڊ ڪرڻ ۾ ناڪامي. مهرباني ڪري انٽرنيٽ چيڪ ڪريو.'
          : 'Unable to load emergency response zones. Please check your connection.'
      );
    } finally {
      setZonesLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // 5. Geolocation state
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState<boolean>(false);

  const handleUseMyLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError(
        language === 'ur'
          ? 'آپ کا براؤزر جی پی ایس لوکیشن کو سپورٹ نہیں کرتا۔'
          : language === 'sd'
          ? 'اوهان جو برائوزر جي پي ايس سپورٽ نٿو ڪري.'
          : 'Geolocation is not supported by your browser.'
      );
      return;
    }

    setGpsLoading(true);
    setGpsError(null);
    setGpsSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setFormData((prev) => ({
          ...prev,
          lat,
          lng,
        }));
        setGpsLoading(false);
        setGpsSuccess(true);
      },
      (err) => {
        let msg =
          language === 'ur'
            ? 'لوکیشن تک رسائی حاصل نہیں ہو سکی۔'
            : language === 'sd'
            ? 'لوڪيشن جي رسائي حاصل نه ٿي سگهي.'
            : 'Location access was denied or is unavailable.';
        if (err.code === err.PERMISSION_DENIED) {
          msg =
            language === 'ur'
              ? 'لوکیشن کی اجازت نہیں ملی۔ آپ خود درج کر سکتے ہیں یا خالی چھوڑ دیں۔'
              : language === 'sd'
              ? 'لوڪيشن جي اجازت ناهي ملي. اوهان پاڻ داخل ڪري سگهو ٿا يا خالي ڇڏيو.'
              : 'Location permission denied. You can enter coordinates manually or leave them blank.';
        } else if (err.code === err.TIMEOUT) {
          msg =
            language === 'ur'
              ? 'لوکیشن حاصل کرنے میں زیادہ وقت لگا۔ دوبارہ کوشش کریں یا خود درج کریں۔'
              : language === 'sd'
              ? 'لوڪيشن ۾ دير ٿي وئي. ٻيهر ڪوشش ڪريو يا پاڻ لکو.'
              : 'Location request timed out. Please try again or enter manually.';
        }
        setGpsError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleClearCoordinates = () => {
    setFormData((prev) => ({ ...prev, lat: null, lng: null }));
    setGpsSuccess(false);
    setGpsError(null);
  };

  // Interactive Map & Pin-drop state
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [showManualCoords, setShowManualCoords] = useState<boolean>(false);

  const handleMapLocationSelect = (newLat: number | null, newLng: number | null, areaName?: string) => {
    setFormData((prev) => {
      let desc = prev.locationDescription;
      if (areaName && !desc.trim()) {
        desc = areaName;
      }
      return {
        ...prev,
        lat: newLat,
        lng: newLng,
        locationDescription: desc,
      };
    });
    setGpsSuccess(false);
    setGpsError(null);
    if (errors.lat || errors.lng) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.lat;
        delete copy.lng;
        return copy;
      });
    }
  };

  const handleMapZoneSelect = (newZoneId: string) => {
    setFormData((prev) => ({
      ...prev,
      zoneId: newZoneId,
    }));
    if (errors.zoneId) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.zoneId;
        return copy;
      });
    }
  };

  // 6. Validation, submission error, and offline state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper to resolve ISO timestamp from timing option
  const computeObservedAt = (option: ReportFormData['observationOption']): string => {
    const now = Date.now();
    switch (option) {
      case '15m':
        return new Date(now - 15 * 60 * 1000).toISOString();
      case '1h':
        return new Date(now - 60 * 60 * 1000).toISOString();
      case '3h':
        return new Date(now - 3 * 60 * 60 * 1000).toISOString();
      case '12h':
        return new Date(now - 12 * 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now - 24 * 60 * 60 * 1000).toISOString();
      case 'now':
      default:
        return new Date().toISOString();
    }
  };

  // Build clean payload for Zod validation and API submission
  const buildPayload = () => {
    const observedAt = computeObservedAt(formData.observationOption);
    const peopleCount = formData.isPeopleCountUnknown ? null : formData.peopleCount;

    return {
      zoneId: formData.zoneId,
      locationDescription: formData.locationDescription.trim(),
      observedAt,
      reportingFor: formData.reportingFor,
      reporterRole: formData.reporterRole,
      floodSeverity: formData.floodSeverity,
      peopleCount,
      trapped: formData.trapped,
      medicalUrgent: formData.medicalUrgent,
      mobilityHelp: formData.mobilityHelp,
      lat: formData.lat !== null && !isNaN(Number(formData.lat)) ? Number(formData.lat) : null,
      lng: formData.lng !== null && !isNaN(Number(formData.lng)) ? Number(formData.lng) : null,
      description: formData.description.trim() ? formData.description.trim() : null,
      reporterName: formData.reporterName.trim() ? formData.reporterName.trim() : null,
      reporterPhone: formData.reporterPhone.trim() ? formData.reporterPhone.trim() : '',
      idempotencyKey: idempotencyKey || undefined,
    };
  };

  const getFieldError = (field: string) => {
    if (!errors[field]) return null;
    return (t.validationErrors as Record<string, string>)?.[field] || errors[field];
  };

  // Step-specific validation before advancing
  const validateStep = (stepNumber: IntakeStep): boolean => {
    const newErrors: Record<string, string> = { ...errors };

    if (stepNumber === 1) {
      // Step 1: Reporter
      // Role is required, defaulted to 'resident'. Phone is optional but if provided, validate.
      if (formData.reporterPhone.trim()) {
        const phoneRegex = /^[\d\s+\-()]{7,20}$/;
        if (!phoneRegex.test(formData.reporterPhone.trim())) {
          newErrors.reporterPhone =
            language === 'ur'
              ? 'براہ کرم درست فون نمبر درج کریں۔'
              : language === 'sd'
              ? 'مهرباني ڪري صحيح فون نمبر لکو.'
              : 'Please enter a valid phone number format.';
          setErrors(newErrors);
          return false;
        }
      }
      delete newErrors.reporterPhone;
      setErrors(newErrors);
      return true;
    }

    if (stepNumber === 2) {
      // Step 2: Location
      let valid = true;
      if (!formData.zoneId) {
        newErrors.zoneId = t.validationErrors?.zoneId || 'Please select an emergency response zone.';
        valid = false;
      } else {
        delete newErrors.zoneId;
      }

      if (!formData.locationDescription.trim()) {
        newErrors.locationDescription =
          t.validationErrors?.locationDescription || 'Please specify the street address or nearby landmark.';
        valid = false;
      } else {
        delete newErrors.locationDescription;
      }

      setErrors(newErrors);
      return valid;
    }

    if (stepNumber === 3) {
      // Step 3: Emergency
      let valid = true;
      if (!formData.isPeopleCountUnknown && (formData.peopleCount === null || formData.peopleCount < 1)) {
        newErrors.peopleCount =
          language === 'ur'
            ? 'افراد کی تعداد کم از کم 1 ہونی چاہیے یا غیر معلوم پر نشان لگائیں۔'
            : language === 'sd'
            ? 'ماڻهن جو انگ گهٽ ۾ گهٽ 1 هجڻ گهرجي يا اڻڄاتل چونڊيو.'
            : 'People count must be at least 1, or check unknown.';
        valid = false;
      } else {
        delete newErrors.peopleCount;
      }
      setErrors(newErrors);
      return valid;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      const nextStep = (currentStep + 1) as IntakeStep;
      setCurrentStep(nextStep);
      setMaxStepVisited((prev) => Math.max(prev, nextStep));
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as IntakeStep);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  const handleJumpToStep = (targetStep: IntakeStep) => {
    if (targetStep < currentStep || targetStep <= maxStepVisited) {
      setCurrentStep(targetStep);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  // Execute the real API submission (Reuses idempotencyKey on retry)
  const executeSubmission = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Full client-side Zod validation prior to submission
    const payload = buildPayload();
    const result = emergencyReportSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0]?.toString() || 'general';
        if (!fieldErrors[field]) {
          const localizedMsg = (t.validationErrors as Record<string, string>)?.[field];
          fieldErrors[field] = localizedMsg || issue.message;
        }
      }
      setErrors(fieldErrors);
      setGeneralError(t.validationErrors?.generalCorrection || 'Please check the highlighted fields.');
      return;
    }

    setIsSubmitting(true);
    setGeneralError(null);
    setOfflineNotice(null);

    // Check if device is offline prior to dispatch
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsSubmitting(false);
      await offlineReportQueue.enqueue(payload);
      setOfflineNotice('Saved on this device. NOT delivered yet.');
      const nextKey = crypto.randomUUID();
      setIdempotencyKey(nextKey);
      setFormData(DEFAULT_FORM_DATA(nextKey));
      setGpsSuccess(false);
      setGpsError(null);
      setCurrentStep(1);
      return;
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Handle HTTP 429: Rate Limit
      if (res.status === 429) {
        setIsSubmitting(false);
        setGeneralError(t.validationErrors?.rateLimit || 'Too many reports, please wait a minute.');
        return;
      }

      // Handle HTTP 400: Validation error with field details
      if (res.status === 400) {
        setIsSubmitting(false);
        const errData = await res.json().catch(() => ({}));
        if (errData.details && Array.isArray(errData.details)) {
          const serverFieldErrors: Record<string, string> = {};
          for (const item of errData.details) {
            const field = item.field || (Array.isArray(item.path) ? item.path[0] : 'general');
            if (field && !serverFieldErrors[field]) {
              const localizedMsg = (t.validationErrors as Record<string, string>)?.[field];
              serverFieldErrors[field] = localizedMsg || item.message;
            }
          }
          setErrors(serverFieldErrors);
          setGeneralError(t.validationErrors?.generalCorrection || 'Needs correction: please check the highlighted fields.');
        } else {
          setGeneralError(t.validationErrors?.generalCorrection || ('Needs correction: ' + (errData.error || 'Validation failed.')));
        }
        return;
      }

      // Handle HTTP 500 or any non-OK status
      if (res.status === 500 || !res.ok) {
        setIsSubmitting(false);
        setGeneralError(t.validationErrors?.serverError || 'Could not save report. Please try again.');
        return;
      }

      const data = await res.json();

      if (!data.ok) {
        setIsSubmitting(false);
        setGeneralError(t.validationErrors?.serverError || data.error || 'Could not save report. Please try again.');
        return;
      }

      // SUCCESS!
      setIsSubmitting(false);
      setErrors({});
      setGeneralError(null);
      setOfflineNotice(null);

      // Notify parent page with verified response
      onSubmitSuccess({
        ok: true,
        reportId: data.reportId,
        incidentId: data.incidentId,
        verificationStatus: data.verificationStatus,
        priorityScore: data.priorityScore,
        needsReview: Boolean(data.needsReview),
        missingFields: Array.isArray(data.missingFields) ? data.missingFields : [],
        possibleDuplicateOf: data.possibleDuplicateOf || null,
        hasCoordinates: payload.lat !== null && payload.lng !== null,
      });

      // Generate a new idempotencyKey for the NEXT report and reset form
      const nextKey = crypto.randomUUID();
      setIdempotencyKey(nextKey);
      setFormData(DEFAULT_FORM_DATA(nextKey));
      setGpsSuccess(false);
      setGpsError(null);
      setCurrentStep(1);
    } catch {
      // Network failure / connection lost: save report locally
      setIsSubmitting(false);
      await offlineReportQueue.enqueue(payload);
      setOfflineNotice('Saved on this device. NOT delivered yet.');
      const nextKey = crypto.randomUUID();
      setIdempotencyKey(nextKey);
      setFormData(DEFAULT_FORM_DATA(nextKey));
      setGpsSuccess(false);
      setGpsError(null);
      setCurrentStep(1);
    }
  };

  const selectedZone = zones.find((z) => z.id === formData.zoneId);

  // Step Labels for Multilingual Stepper
  const stepsConfig = [
    {
      id: 1 as IntakeStep,
      title: language === 'ur' ? 'رپورٹر' : language === 'sd' ? 'رپورٽر' : 'Reporter',
      shortDesc: language === 'ur' ? 'شناخت' : language === 'sd' ? 'سڃاڻپ' : 'Identity',
    },
    {
      id: 2 as IntakeStep,
      title: language === 'ur' ? 'مقام' : language === 'sd' ? 'هنڌ' : 'Location',
      shortDesc: language === 'ur' ? 'پتہ و زون' : language === 'sd' ? 'علائقو' : 'Sector',
    },
    {
      id: 3 as IntakeStep,
      title: language === 'ur' ? 'ایمرجنسی' : language === 'sd' ? 'هنگامي حالت' : 'Emergency',
      shortDesc: language === 'ur' ? 'صورتحال' : language === 'sd' ? 'حالت' : 'Urgency',
    },
    {
      id: 4 as IntakeStep,
      title: language === 'ur' ? 'جائزہ اور ارسال' : language === 'sd' ? 'جائزو ۽ موڪليو' : 'Review & Submit',
      shortDesc: language === 'ur' ? 'توثیق' : language === 'sd' ? 'تصديق' : 'Verify',
    },
  ];

  const severityTitles: Record<number, string> = {
    3: t.sectionC.floodLevels[3].title,
    2: t.sectionC.floodLevels[2].title,
    1: t.sectionC.floodLevels[1].title,
    0: t.sectionC.floodLevels[0].title,
  };

  const triLabels = {
    yes: t.sectionC.triState.yes,
    no: t.sectionC.triState.no,
    unknown: t.sectionC.triState.unknown,
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* COMPACT PROGRESS STEPPER */}
      <div className="bg-white rounded-xl border border-[#E4E8EC] p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between">
          {stepsConfig.map((s, idx) => {
            const isCurrent = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            const isClickable = s.id <= maxStepVisited || s.id < currentStep;

            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => handleJumpToStep(s.id)}
                  className={`flex items-center gap-2 group transition-all text-left ${
                    isClickable ? 'cursor-pointer' : 'cursor-default opacity-60'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-[#375A6B] text-white ring-2 ring-[#375A6B]/20 shadow-xs'
                        : isCompleted
                        ? 'bg-[#258167] text-white'
                        : 'bg-[#F7F8FA] border border-[#E4E8EC] text-[#5F6B7A]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.id}
                  </span>
                  <div className="hidden sm:block">
                    <span
                      className={`text-xs font-semibold block leading-tight ${
                        isCurrent ? 'text-[#18232D]' : 'text-[#5F6B7A]'
                      }`}
                    >
                      {s.title}
                    </span>
                    <span className="text-[10px] text-[#5F6B7A] block">
                      {s.shortDesc}
                    </span>
                  </div>
                </button>

                {/* Separator line between steps */}
                {idx < stepsConfig.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-colors ${
                      currentStep > s.id ? 'bg-[#258167]' : 'bg-[#E4E8EC]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* OFFLINE NOTICE BANNER */}
      {offlineNotice && (
        <div className="p-3.5 rounded-xl bg-[#FFF5E6] border border-[#A87528]/30 text-[#A87528] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#A87528] shrink-0" />
            <div>
              <strong className="block font-semibold">
                {language === 'ur' ? 'اس ڈیوائس پر محفوظ ہو گیا۔ ابھی ارسال نہیں ہوا۔' : language === 'sd' ? 'هن ڊوائيس تي محفوظ ٿي ويو. اڃا ناهي پهتو.' : 'Saved on this device. NOT delivered yet.'}
              </strong>
              <span className="text-[11px] text-[#5F6B7A]">
                {language === 'ur' ? 'انٹرنیٹ بحال ہوتے ہی رپورٹ خودکار طور پر روانہ ہو جائے گی۔' : language === 'sd' ? 'انٽرنيٽ هلڻ سان رپورٽ موڪلي ويندي.' : 'Report will transmit automatically as soon as connectivity restores.'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOfflineNotice(null)}
            className="px-2.5 py-1 text-xs font-semibold text-[#A87528] hover:bg-[#A87528]/10 rounded-lg cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TOP LEVEL ERROR BANNER */}
      {generalError && (
        <div className="p-3.5 rounded-xl bg-[#FBECEE] border border-[#BC414A]/30 text-[#BC414A] text-xs flex items-center justify-between gap-2.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#BC414A] shrink-0" />
            <span className="font-semibold">{generalError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGeneralError(null)}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* FORM BODY CONTAINER */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {/* ================= STEP 1: REPORTER ================= */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-[#E4E8EC] shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-150">
            <div className="pb-3 border-b border-[#E4E8EC]">
              <h3 className="text-sm font-bold text-[#18232D]">
                {t.sectionA.title}
              </h3>
              <p className="text-xs text-[#5F6B7A] mt-0.5">
                {t.sectionA.subtitle}
              </p>
            </div>

            {/* Reporting For: Myself vs Someone Else */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#18232D] block">
                {t.sectionA.reportingForLabel} <span className="text-[#BC414A]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                    formData.reportingFor === 'myself'
                      ? 'border-[#375A6B] bg-[#F0F4F8] text-[#18232D] ring-1 ring-[#375A6B] shadow-xs'
                      : 'border-[#E4E8EC] bg-white text-[#5F6B7A] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportingFor"
                    checked={formData.reportingFor === 'myself'}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, reportingFor: 'myself' }))
                    }
                    className="accent-[#375A6B]"
                  />
                  <span>{t.sectionA.reportingForMyself}</span>
                </label>

                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                    formData.reportingFor === 'someone_else'
                      ? 'border-[#375A6B] bg-[#F0F4F8] text-[#18232D] ring-1 ring-[#375A6B] shadow-xs'
                      : 'border-[#E4E8EC] bg-white text-[#5F6B7A] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportingFor"
                    checked={formData.reportingFor === 'someone_else'}
                    onChange={() => {
                      setFormData((prev) => ({ ...prev, reportingFor: 'someone_else' }));
                      setIsMapOpen(true);
                    }}
                    className="accent-[#375A6B]"
                  />
                  <span>{t.sectionA.reportingForSomeoneElse}</span>
                </label>
              </div>
            </div>

            {/* Reporter Role & Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Role */}
              <div>
                <label className="text-xs font-semibold text-[#18232D] block mb-1">
                  {t.sectionA.reporterRoleLabel} <span className="text-[#BC414A]">*</span>
                </label>
                <select
                  value={formData.reporterRole}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reporterRole: e.target.value as ReportFormData['reporterRole'],
                    }))
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg text-[#18232D] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:bg-white"
                >
                  <option value="resident">{t.sectionA.roles.resident}</option>
                  <option value="neighbor">{t.sectionA.roles.neighbor}</option>
                  <option value="volunteer">{t.sectionA.roles.volunteer}</option>
                  <option value="other">{t.sectionA.roles.other}</option>
                </select>
              </div>

              {/* Full Name (Optional) */}
              <div>
                <label className="text-xs font-semibold text-[#18232D] block mb-1">
                  {t.sectionA.reporterNameLabel} <span className="text-[#5F6B7A] font-normal">({language === 'ur' ? 'اختیاری' : language === 'sd' ? 'اختياري' : 'Optional'})</span>
                </label>
                <div className="relative">
                  <User className={`w-3.5 h-3.5 text-[#5F6B7A] absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                  <input
                    type="text"
                    value={formData.reporterName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, reporterName: e.target.value }))
                    }
                    placeholder={t.sectionA.reporterNamePlaceholder}
                    className={`w-full ${isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-2 text-xs bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg text-[#18232D] placeholder:text-[#5F6B7A] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:bg-white`}
                  />
                </div>
              </div>

              {/* Contact Phone (Optional) */}
              <div>
                <label className="text-xs font-semibold text-[#18232D] block mb-1">
                  {t.sectionA.reporterPhoneLabel} <span className="text-[#5F6B7A] font-normal">({language === 'ur' ? 'اختیاری' : language === 'sd' ? 'اختياري' : 'Optional'})</span>
                </label>
                <div className="relative">
                  <Phone className={`w-3.5 h-3.5 text-[#5F6B7A] absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.reporterPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, reporterPhone: val }));
                      if (errors.reporterPhone) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.reporterPhone;
                          return copy;
                        });
                      }
                    }}
                    placeholder={t.sectionA.reporterPhonePlaceholder}
                    className={`w-full ${isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-2 text-xs bg-[#F7F8FA] border rounded-lg text-[#18232D] placeholder:text-[#5F6B7A] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:bg-white ${
                      errors.reporterPhone ? 'border-[#BC414A] bg-[#FBECEE]' : 'border-[#E4E8EC]'
                    }`}
                  />
                </div>
                {errors.reporterPhone && (
                  <p className="text-[11px] text-[#BC414A] mt-1 font-medium">{errors.reporterPhone}</p>
                )}
              </div>
            </div>

            {/* Step Navigation Bar */}
            <div className="flex items-center justify-end pt-4 border-t border-[#E4E8EC]">
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#375A6B] hover:bg-[#2C4855] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <span>{language === 'ur' ? 'اگلا: مقام درج کریں' : language === 'sd' ? 'اڳيون: هنڌ لکو' : 'Next: Location Details'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: LOCATION ================= */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl border border-[#E4E8EC] shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-150">
            <div className="pb-3 border-b border-[#E4E8EC]">
              <h3 className="text-sm font-bold text-[#18232D]">
                {t.sectionB.title}
              </h3>
              <p className="text-xs text-[#5F6B7A] mt-0.5">
                {t.sectionB.subtitle}
              </p>
            </div>

            {/* Zone Selector */}
            <div>
              <label className="text-xs font-semibold text-[#18232D] block mb-1">
                {t.sectionB.zoneLabel} <span className="text-[#BC414A]">*</span>
              </label>
              <select
                value={formData.zoneId}
                disabled={zonesLoading || Boolean(zonesError)}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, zoneId: e.target.value }));
                  if (errors.zoneId) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.zoneId;
                      return copy;
                    });
                  }
                }}
                className={`w-full px-3 py-2 text-xs bg-[#F7F8FA] border rounded-lg text-[#18232D] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:bg-white disabled:opacity-60 ${
                  errors.zoneId ? 'border-[#BC414A] bg-[#FBECEE]' : 'border-[#E4E8EC]'
                }`}
              >
                {zonesLoading ? (
                  <option value="">{t.sectionB.zoneLoading}</option>
                ) : zones.length === 0 ? (
                  <option value="">{t.sectionB.zoneEmpty}</option>
                ) : (
                  zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} {z.flood_risk ? `(${language === 'ur' ? 'خطرہ' : language === 'sd' ? 'خطرو' : 'Risk Tier'} ${z.flood_risk})` : ''}
                    </option>
                  ))
                )}
              </select>
              {errors.zoneId && (
                <p className="text-[11px] text-[#BC414A] mt-1 font-medium">{getFieldError('zoneId')}</p>
              )}
            </div>

            {/* Address / Landmark Description */}
            <div>
              <label className="text-xs font-semibold text-[#18232D] block mb-1">
                {t.sectionB.locationDescLabel} <span className="text-[#BC414A]">*</span>
              </label>
              <textarea
                rows={2}
                value={formData.locationDescription}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, locationDescription: e.target.value }));
                  if (errors.locationDescription) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.locationDescription;
                      return copy;
                    });
                  }
                }}
                placeholder={t.sectionB.locationDescPlaceholder}
                className={`w-full p-3 text-xs bg-[#F7F8FA] border rounded-lg text-[#18232D] placeholder:text-[#5F6B7A] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:bg-white ${
                  errors.locationDescription ? 'border-[#BC414A] bg-[#FBECEE]' : 'border-[#E4E8EC]'
                } ${isRtl ? 'text-right' : ''}`}
              />
              {errors.locationDescription && (
                <p className="text-[11px] text-[#BC414A] mt-1 font-medium">{getFieldError('locationDescription')}</p>
              )}
            </div>

            {/* Coordinates / Map Pin Bar */}
            <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E4E8EC] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#375A6B]" />
                  <span className="text-xs font-semibold text-[#18232D]">
                    {t.sectionB.gpsTitle}
                  </span>
                  <span className="text-[11px] text-[#5F6B7A]">
                    {t.sectionB.gpsSubtitle}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Toggle Map Picker */}
                  <button
                    type="button"
                    onClick={() => setIsMapOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      isMapOpen
                        ? 'bg-[#375A6B] text-white border-[#375A6B]'
                        : 'bg-white border-[#375A6B]/40 text-[#375A6B] hover:bg-[#F0F4F8]'
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>{isMapOpen ? t.sectionB.toggleMapButtonClose : t.sectionB.toggleMapButtonOpen}</span>
                  </button>

                  {/* Use Device GPS */}
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={gpsLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E4E8EC] text-[#375A6B] hover:bg-[#F0F4F8] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                    <span>{gpsLoading ? t.sectionB.acquiringGps : t.sectionB.useGpsButton}</span>
                  </button>

                  {(formData.lat !== null || formData.lng !== null) && (
                    <button
                      type="button"
                      onClick={handleClearCoordinates}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E4E8EC] text-[#5F6B7A] hover:bg-[#F7F8FA] text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.sectionB.clearGps}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Map Picker */}
              {isMapOpen && (
                <LocationMapPicker
                  lat={formData.lat}
                  lng={formData.lng}
                  zones={zones}
                  selectedZoneId={formData.zoneId}
                  onLocationSelect={handleMapLocationSelect}
                  onZoneSelect={handleMapZoneSelect}
                  language={language}
                  t={t}
                />
              )}

              {gpsSuccess && (
                <p className="text-[11px] text-[#258167] font-medium flex items-center gap-1.5 bg-[#EBF7F2] p-2 rounded-lg border border-[#258167]/30">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'ur' ? 'جی پی ایس کوآرڈینیٹس کامیابی سے حاصل کر لیے گئے۔' : language === 'sd' ? 'جي پي ايس ڪوآرڊينيٽس حاصل ٿي ويا.' : 'GPS coordinates acquired from your device.'}</span>
                </p>
              )}

              {gpsError && (
                <p className="text-[11px] text-[#A87528] font-medium flex items-center gap-1.5 bg-[#FFF5E6] p-2 rounded-lg border border-[#A87528]/30">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{gpsError}</span>
                </p>
              )}

              {/* Optional Advanced Coordinates Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualCoords(!showManualCoords)}
                  className="text-[11px] font-semibold text-[#5F6B7A] hover:text-[#18232D] inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>
                    {showManualCoords
                      ? (language === 'ur' ? '− جی پی ایس کوآرڈینیٹس چھپائیں' : '− Hide manual GPS coordinates')
                      : (language === 'ur' ? '+ اختیاری: دستی جی پی ایس کوآرڈینیٹس درج کریں' : '+ Optional: Enter precise GPS coordinates')}
                  </span>
                </button>

                {showManualCoords && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#5F6B7A] block mb-1">
                        {t.sectionB.latLabel}
                      </label>
                      <input
                        type="number"
                        dir="ltr"
                        step="0.00001"
                        placeholder={t.sectionB.latPlaceholder}
                        value={formData.lat ?? ''}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          setFormData((prev) => ({
                            ...prev,
                            lat: val === '' ? null : parseFloat(val),
                          }));
                        }}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#E4E8EC] rounded-lg text-[#18232D] focus:outline-none focus:ring-1 focus:ring-[#375A6B]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#5F6B7A] block mb-1">
                        {t.sectionB.lngLabel}
                      </label>
                      <input
                        type="number"
                        dir="ltr"
                        step="0.00001"
                        placeholder={t.sectionB.lngPlaceholder}
                        value={formData.lng ?? ''}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          setFormData((prev) => ({
                            ...prev,
                            lng: val === '' ? null : parseFloat(val),
                          }));
                        }}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#E4E8EC] rounded-lg text-[#18232D] focus:outline-none focus:ring-1 focus:ring-[#375A6B]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[#5F6B7A] italic">
                {language === 'ur' ? 'اگر کوآرڈینیٹس نہ ہوں تو متعلقہ زون کے مرکز کا اندازہ لگایا جائے گا۔' : language === 'sd' ? 'ڪوآرڊينيٽس کانسواءِ علائقي جي مرڪز جو اندازو لڳايو ويندو.' : 'If coordinates are omitted, the report is mapped to the sector centroid and verified by scouts.'}
              </p>
            </div>

            {/* Step Navigation Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E4E8EC]">
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#5F6B7A] hover:text-[#18232D] hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{language === 'ur' ? 'پیچھے: رپورٹر' : language === 'sd' ? 'پوئتي: رپورٽر' : 'Back: Reporter'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#375A6B] hover:bg-[#2C4855] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <span>{language === 'ur' ? 'اگلا: ایمرجنسی تفصیلات' : language === 'sd' ? 'اڳيون: هنگامي حالت' : 'Next: Emergency Details'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: EMERGENCY ================= */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl border border-[#E4E8EC] shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-150">
            <div className="pb-3 border-b border-[#E4E8EC]">
              <h3 className="text-sm font-bold text-[#18232D]">
                {t.sectionC.title}
              </h3>
              <p className="text-xs text-[#5F6B7A] mt-0.5">
                {t.sectionC.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Flood Severity (0..3) */}
              <div>
                <label className="text-xs font-semibold text-[#18232D] block mb-1">
                  {t.sectionC.floodSeverityLabel} <span className="text-[#BC414A]">*</span>
                </label>
                <select
                  value={formData.floodSeverity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      floodSeverity: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full px-3 py-2 text-xs font-medium bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg text-[#18232D] focus:outline-none focus:ring-1 focus:ring-[#375A6B]"
                >
                  <option value={3}>{t.sectionC.floodLevels[3].title} — {t.sectionC.floodLevels[3].desc}</option>
                  <option value={2}>{t.sectionC.floodLevels[2].title} — {t.sectionC.floodLevels[2].desc}</option>
                  <option value={1}>{t.sectionC.floodLevels[1].title} — {t.sectionC.floodLevels[1].desc}</option>
                  <option value={0}>{t.sectionC.floodLevels[0].title} — {t.sectionC.floodLevels[0].desc}</option>
                </select>
              </div>

              {/* People Count + Unknown Checkbox */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#18232D] block">
                    {t.sectionC.peopleCountLabel}
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-[#A87528] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPeopleCountUnknown}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          isPeopleCountUnknown: checked,
                          peopleCount: checked ? null : prev.peopleCount || 1,
                        }));
                      }}
                      className="accent-[#A87528] rounded"
                    />
                    <span>{t.sectionC.unknownPeopleCheckbox}</span>
                  </label>
                </div>

                {formData.isPeopleCountUnknown ? (
                  <div className="px-3 py-2 text-xs font-semibold bg-[#FFF5E6] border border-[#A87528]/30 rounded-lg text-[#A87528] flex items-center justify-between">
                    <span>{t.sectionC.triState.unknown}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {language === 'ur' ? 'جائزہ کیلئے نشان زد' : language === 'sd' ? 'جائزي لاءِ نشان' : 'Flagged for review'}
                    </span>
                  </div>
                ) : (
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.peopleCount ?? 1}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      setFormData((prev) => ({
                        ...prev,
                        peopleCount: isNaN(parsed) ? 1 : parsed,
                      }));
                    }}
                    className={`w-full px-3 py-2 text-xs font-medium bg-[#F7F8FA] border rounded-lg text-[#18232D] focus:outline-none focus:ring-1 focus:ring-[#375A6B] ${
                      errors.peopleCount ? 'border-[#BC414A] bg-[#FBECEE]' : 'border-[#E4E8EC]'
                    }`}
                  />
                )}
                {errors.peopleCount && (
                  <p className="text-[11px] text-[#BC414A] mt-1 font-medium">{getFieldError('peopleCount')}</p>
                )}
              </div>
            </div>

            {/* Tri-State Vulnerability Factors (Trapped, Medical, Mobility) */}
            <div className="space-y-3 pt-2 border-t border-[#E4E8EC]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#18232D] block">
                  {language === 'ur' ? 'تین رخی خطرے کی علامات' : language === 'sd' ? 'ٽي رخا خطري جا نشان' : 'Tri-State Vulnerability Indicators'}
                </label>
                <span className="text-[11px] text-[#5F6B7A] italic">
                  {language === 'ur' ? 'معلوم نہیں کو غیر تصدیق شدہ رکھا جائے گا' : language === 'sd' ? 'اڻڄاتل کي اڻ تصديق ٿيل رکيو ويندو' : 'Unknown is preserved as unverified null'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Trapped */}
                <div className="p-3 rounded-xl border border-[#E4E8EC] bg-[#F7F8FA] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18232D]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#BC414A] shrink-0" />
                    <span>{t.sectionC.trappedLabel}</span>
                  </div>
                  <p className="text-[11px] text-[#5F6B7A] leading-tight">
                    {t.sectionC.trappedDesc}
                  </p>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, trapped: true }))}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        formData.trapped === true
                          ? 'bg-[#BC414A] text-white border-[#BC414A] shadow-xs'
                          : 'bg-white text-[#18232D] border-[#E4E8EC] hover:bg-[#F0F4F8]'
                      }`}
                    >
                      {t.sectionC.triState.yes}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, trapped: false }))}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        formData.trapped === false
                          ? 'bg-[#258167] text-white border-[#258167] shadow-xs'
                          : 'bg-white text-[#18232D] border-[#E4E8EC] hover:bg-[#F0F4F8]'
                      }`}
                    >
                      {t.sectionC.triState.no}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, trapped: null }))}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        formData.trapped === null
                          ? 'bg-[#A87528] text-white border-[#A87528] shadow-xs'
                          : 'bg-white text-[#18232D] border-[#E4E8EC] hover:bg-[#F0F4F8]'
                      }`}
                    >
                      {t.sectionC.triState.unknown}
                    </button>
                  </div>
                </div>

                {/* 2. Medical Urgent */}
                <div className="p-3 rounded-xl border border-[#E4E8EC] bg-[#F7F8FA] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18232D]">
                    <HeartPulse className="w-3.5 h-3.5 text-[#BC414A] shrink-0" />
                    <span>{t.sectionC.medicalLabel}</span>
                  </div>
                  <p className="text-[11px] text-[#5F6B7A] leading-tight">
                    {t.sectionC.medicalDesc}
                  </p>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, medicalUrgent: true }))}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        formData.medicalUrgent === true
                          ? 'bg-[#BC414A] text-white border-[#BC414A] shadow-xs'
                          : 'bg-white text-[#18232D] border-[#E4E8EC] hover:bg-[#F0F4F8]'
                      }`}
                    >
                      {t.sectionC.triState.yes}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, medicalUrgent: false }))}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        formData.medicalUrgent === false
                          ? 'bg-[#258167] text-white border-[#258167] shadow-xs'
                          : 'bg-white text-[#18232D] border-[#E4E8EC] hover:bg-[#F0F4F8]'
                      }`}
                    >
                      {t.sectionC.triState.no}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, medicalUrgent: null }))}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        formData.medicalUrgent === null
                          ? 'bg-[#A87528] text-white border-[#A87528] shadow-xs'
                          : 'bg-white text-[#18232D] border-[#E4E8EC] hover:bg-[#F0F4F8]'
                      }`}
                    >
                      {t.sectionC.triState.unknown}
                    </button>
                  </div>
                </div>

                {/* 3. Mobility Help */}
                <div className="p-3 rounded-xl border border-[#E4E8EC] bg-[#F7F8FA] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18232D]">
                    <PersonStanding className="w-3.5 h-3.5 text-[#BC414A] shrink-0" />
                    <span>{t.sectionC.mobilityLabel}</span>
                  </div>
                  <p className="text-[11px] text-[#5F6B7A] leading-tight">
                    {t.sectionC.mobilityDesc}
                  </p>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, mobilityHelp: true }))}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        formData.mobilityHelp === true
                          ? 'bg-[#BC414A] text-white border-[#BC414A] shadow-xs'
                          : 'bg-white text-[#18232D] border-[#E4E8EC] hover:bg-[#F0F4F8]'
                      }`}
                    >
                      {t.sectionC.triState.yes}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, mobilityHelp: false }))}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        formData.mobilityHelp === false
                          ? 'bg-[#258167] text-white border-[#258167] shadow-xs'
                          : 'bg-white text-[#18232D] border-[#E4E8EC] hover:bg-[#F0F4F8]'
                      }`}
                    >
                      {t.sectionC.triState.no}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, mobilityHelp: null }))}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        formData.mobilityHelp === null
                          ? 'bg-[#A87528] text-white border-[#A87528] shadow-xs'
                          : 'bg-white text-[#18232D] border-[#E4E8EC] hover:bg-[#F0F4F8]'
                      }`}
                    >
                      {t.sectionC.triState.unknown}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Observation Timing & Situation Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E4E8EC]">
              <div>
                <label className="text-xs font-semibold text-[#18232D] block mb-1">
                  {t.sectionD.timingLabel} <span className="text-[#BC414A]">*</span>
                </label>
                <select
                  value={formData.observationOption}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      observationOption: e.target.value as ReportFormData['observationOption'],
                    }))
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg text-[#18232D] focus:outline-none focus:ring-1 focus:ring-[#375A6B]"
                >
                  <option value="now">{t.sectionD.options.now}</option>
                  <option value="15m">{t.sectionD.options['15m']}</option>
                  <option value="1h">{t.sectionD.options['1h']}</option>
                  <option value="3h">{t.sectionD.options['3h']}</option>
                  <option value="12h">{t.sectionD.options['12h']}</option>
                  <option value="24h">{t.sectionD.options['24h']}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18232D] block mb-1">
                  {t.sectionC.notesLabel} <span className="text-[#5F6B7A] font-normal">({language === 'ur' ? 'اختیاری' : language === 'sd' ? 'اختياري' : 'Optional'})</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder={t.sectionC.notesPlaceholder}
                  className={`w-full p-2.5 text-xs bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg text-[#18232D] placeholder:text-[#5F6B7A] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:bg-white ${
                    isRtl ? 'text-right' : ''
                  }`}
                />
              </div>
            </div>

            {/* Step Navigation Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E4E8EC]">
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#5F6B7A] hover:text-[#18232D] hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{language === 'ur' ? 'پیچھے: مقام' : language === 'sd' ? 'پوئتي: هنڌ' : 'Back: Location'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#375A6B] hover:bg-[#2C4855] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <span>{language === 'ur' ? 'اگلا: جائزہ اور تصدیق' : language === 'sd' ? 'اڳيون: جائزو ۽ تصديق' : 'Next: Review & Submit'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & SUBMIT ================= */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl border border-[#E4E8EC] shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-150">
            <div className="pb-3 border-b border-[#E4E8EC] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#18232D]">
                  {language === 'ur' ? 'رپورٹ کا حتمی جائزہ' : language === 'sd' ? 'رپورٽ جو حتمي جائزو' : 'Review & Confirmation'}
                </h3>
                <p className="text-xs text-[#5F6B7A] mt-0.5">
                  {language === 'ur' ? 'ارسال کرنے سے پہلے تفصیلات کی جانچ کریں' : language === 'sd' ? 'موڪلڻ کان اڳ تفصيل پڙهو' : 'Verify details before transmitting to emergency coordinators'}
                </p>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F0F4F8] text-[#375A6B] border border-[#375A6B]/25 uppercase">
                Step 4 of 4
              </span>
            </div>

            {/* Structured Summary Grid */}
            <div className="rounded-xl bg-[#F7F8FA] border border-[#E4E8EC] p-4 space-y-3 text-xs">
              {/* Row 1: Location & Sector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E4E8EC]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6B7A] block">
                    {language === 'ur' ? 'سیکٹر اور زون' : language === 'sd' ? 'علائقو ۽ زون' : 'Target Sector & Zone'}
                  </span>
                  <span className="font-bold text-[#18232D] text-sm">
                    {selectedZone?.name || formData.zoneId}
                  </span>
                  {selectedZone?.flood_risk && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25">
                      Risk Tier {selectedZone.flood_risk}
                    </span>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-[#5F6B7A] block">
                    {language === 'ur' ? 'کوآرڈینیٹس' : language === 'sd' ? 'ڪوآرڊينيٽس' : 'GPS Coordinates'}
                  </span>
                  <span className={`font-mono text-xs font-semibold ${formData.lat !== null ? 'text-[#258167]' : 'text-[#A87528]'}`}>
                    {formData.lat !== null && formData.lng !== null
                      ? `${formData.lat}, ${formData.lng} (Exact)`
                      : 'Approximate Zone Centroid'}
                  </span>
                </div>
              </div>

              {/* Row 2: Address Landmark */}
              <div className="pb-2.5 border-b border-[#E4E8EC]">
                <span className="text-[10px] uppercase font-bold text-[#5F6B7A] block">
                  {language === 'ur' ? 'پتہ اور نشانی' : language === 'sd' ? 'پتو ۽ نشان' : 'Landmark / Address'}
                </span>
                <p className="font-medium text-[#18232D] mt-0.5">
                  {formData.locationDescription}
                </p>
              </div>

              {/* Row 3: People & Flood Severity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-2.5 border-b border-[#E4E8EC]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6B7A] block">People</span>
                  <span className="font-bold text-[#18232D] text-sm tabular-nums">
                    {formData.peopleCount !== null ? (
                      `${formData.peopleCount} ${language === 'ur' ? 'افراد' : language === 'sd' ? 'ماڻهو' : 'people'}`
                    ) : (
                      <span className="text-[#A87528] italic">Unknown (Flagged)</span>
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6B7A] block">Flood Surge</span>
                  <span className="font-bold text-[#18232D] text-xs">
                    {severityTitles[formData.floodSeverity]}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6B7A] block">Observed</span>
                  <span className="font-medium text-[#18232D] text-xs">
                    {t.sectionD.options[formData.observationOption] || formData.observationOption}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6B7A] block">Reporter</span>
                  <span className="font-medium text-[#18232D] text-xs capitalize">
                    {formData.reportingFor === 'myself' ? 'Self / Household' : 'Someone else'} ({formData.reporterRole})
                  </span>
                </div>
              </div>

              {/* Row 4: Vulnerabilities Indicators */}
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5F6B7A] block mb-1.5">
                  Critical Vulnerabilities
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Trapped Badge */}
                  <div className="p-2 rounded-lg bg-white border border-[#E4E8EC]">
                    <span className="text-[10px] text-[#5F6B7A] block">Trapped</span>
                    <span
                      className={`font-bold ${
                        formData.trapped === true
                          ? 'text-[#BC414A]'
                          : formData.trapped === false
                          ? 'text-[#258167]'
                          : 'text-[#A87528]'
                      }`}
                    >
                      {formData.trapped === true ? 'YES' : formData.trapped === false ? 'NO' : 'UNKNOWN'}
                    </span>
                  </div>

                  {/* Medical Badge */}
                  <div className="p-2 rounded-lg bg-white border border-[#E4E8EC]">
                    <span className="text-[10px] text-[#5F6B7A] block">Urgent Medical</span>
                    <span
                      className={`font-bold ${
                        formData.medicalUrgent === true
                          ? 'text-[#BC414A]'
                          : formData.medicalUrgent === false
                          ? 'text-[#258167]'
                          : 'text-[#A87528]'
                      }`}
                    >
                      {formData.medicalUrgent === true ? 'YES' : formData.medicalUrgent === false ? 'NO' : 'UNKNOWN'}
                    </span>
                  </div>

                  {/* Mobility Badge */}
                  <div className="p-2 rounded-lg bg-white border border-[#E4E8EC]">
                    <span className="text-[10px] text-[#5F6B7A] block">Mobility Help</span>
                    <span
                      className={`font-bold ${
                        formData.mobilityHelp === true
                          ? 'text-[#BC414A]'
                          : formData.mobilityHelp === false
                          ? 'text-[#258167]'
                          : 'text-[#A87528]'
                      }`}
                    >
                      {formData.mobilityHelp === true ? 'YES' : formData.mobilityHelp === false ? 'NO' : 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Situation Notes (if any) */}
              {formData.description.trim() && (
                <div className="pt-2 border-t border-[#E4E8EC]">
                  <span className="text-[10px] uppercase font-bold text-[#5F6B7A] block">Notes:</span>
                  <p className="text-[#18232D] italic mt-0.5">{formData.description}</p>
                </div>
              )}
            </div>

            {/* Official Dispatch Disclaimer */}
            <div className="p-3 bg-[#F0F4F8] border border-[#375A6B]/25 rounded-lg text-xs text-[#18232D] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#375A6B] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#5F6B7A] leading-relaxed">
                {t.actions.algorithmNotice}
              </p>
            </div>

            {/* Submission & Edit Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E4E8EC]">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#5F6B7A] hover:text-[#18232D] hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer w-full sm:w-auto justify-center"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'تفصیلات میں ترمیم کریں' : language === 'sd' ? 'تفصيل تبديل ڪريو' : 'Edit Details'}</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || zonesLoading || Boolean(zonesError)}
                onClick={executeSubmission}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#BC414A] hover:bg-[#A3343C] disabled:bg-[#5F6B7A]/40 rounded-lg shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'ur' ? 'ارسال کیا جا رہا ہے...' : language === 'sd' ? 'موڪليو پيو وڃي...' : 'Transmitting Report...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'ur' ? 'ایمرجنسی رپورٹ ارسال کریں' : language === 'sd' ? 'هنگامي رپورٽ موڪليو' : 'Submit Emergency Report'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
