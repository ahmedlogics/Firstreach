'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { emergencyReportSchema } from '@/lib/reports/schema';
import { ReportFormData, ReportSuccessResult, ZoneItem } from './types';
import { ReportConfirmationModal } from './ReportConfirmationModal';
import { offlineReportQueue } from '@/lib/reports/offlineQueue';
import {
  MapPin,
  User,
  Phone,
  AlertTriangle,
  HeartPulse,
  Waves,
  PersonStanding,
  Send,
  HelpCircle,
  Clock,
  Compass,
  RefreshCw,
  CheckCircle,
  X,
  Navigation,
} from 'lucide-react';

interface EmergencyReportFormProps {
  onSubmitSuccess: (result: ReportSuccessResult) => void;
  className?: string;
}

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
}: EmergencyReportFormProps) {
  // 1. Idempotency Key State
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');

  // 2. Form state
  const [formData, setFormData] = useState<ReportFormData>(() =>
    DEFAULT_FORM_DATA('')
  );

  // Initialize idempotency key on first client mount
  useEffect(() => {
    const key = crypto.randomUUID();
    setIdempotencyKey(key);
    setFormData((prev) => ({ ...prev, idempotencyKey: key }));
  }, []);

  // 3. Zone loading state
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
      setZonesError('Unable to load emergency response zones. Please check your connection.');
    } finally {
      setZonesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // 4. Geolocation state
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState<boolean>(false);

  const handleUseMyLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
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
        let msg = 'Location access was denied or is unavailable.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. You can enter coordinates manually or leave them blank.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again or enter manually.';
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

  // 5. Validation, submission error, and offline state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);

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

  // Build the clean payload for Zod validation and API submission
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

  // Client-side validation using shared Zod schema
  const validateForm = () => {
    const payload = buildPayload();
    const result = emergencyReportSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0]?.toString() || 'general';
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  // Initiates review modal
  const handleReviewClick = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setOfflineNotice(null);

    if (zonesError) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsConfirmationOpen(true);
  };

  // Execute the real API submission (reuses the same idempotencyKey on retry)
  const executeSubmission = async () => {
    setIsSubmitting(true);
    setGeneralError(null);
    setOfflineNotice(null);

    const payload = buildPayload();

    // Check if device is offline prior to dispatch
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsConfirmationOpen(false);
      setIsSubmitting(false);
      await offlineReportQueue.enqueue(payload);
      setOfflineNotice('Saved on this device. NOT delivered yet.');
      const nextKey = crypto.randomUUID();
      setIdempotencyKey(nextKey);
      setFormData(DEFAULT_FORM_DATA(nextKey));
      setGpsSuccess(false);
      setGpsError(null);
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
        setIsConfirmationOpen(false);
        setIsSubmitting(false);
        setGeneralError('Too many reports, please wait a minute');
        return;
      }

      // Handle HTTP 400: Validation error with field details (Rule 2: do NOT queue 400s; show "Needs correction")
      if (res.status === 400) {
        setIsConfirmationOpen(false);
        setIsSubmitting(false);
        const errData = await res.json().catch(() => ({}));
        if (errData.details && Array.isArray(errData.details)) {
          const serverFieldErrors: Record<string, string> = {};
          for (const item of errData.details) {
            const field = item.field || (Array.isArray(item.path) ? item.path[0] : 'general');
            if (field && !serverFieldErrors[field]) {
              serverFieldErrors[field] = item.message;
            }
          }
          setErrors(serverFieldErrors);
          setGeneralError('Needs correction: please check the highlighted fields.');
        } else {
          setGeneralError('Needs correction: ' + (errData.error || 'Validation failed.'));
        }
        return;
      }

      // Handle HTTP 500 or any non-OK status
      if (res.status === 500 || !res.ok) {
        setIsConfirmationOpen(false);
        setIsSubmitting(false);
        setGeneralError('Could not save report. Please try again.');
        return;
      }

      const data = await res.json();

      // Rule: Never show success unless the response has ok: true
      if (!data.ok) {
        setIsConfirmationOpen(false);
        setIsSubmitting(false);
        setGeneralError(data.error || 'Could not save report. Please try again.');
        return;
      }

      // SUCCESS!
      setIsConfirmationOpen(false);
      setIsSubmitting(false);
      setErrors({});
      setGeneralError(null);
      setOfflineNotice(null);

      // Notify parent page with verified response and coordinate flag
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
    } catch {
      // Network failure / connection lost: save report locally with status 'local_only' (Rule 2)
      setIsConfirmationOpen(false);
      setIsSubmitting(false);
      await offlineReportQueue.enqueue(payload);
      setOfflineNotice('Saved on this device. NOT delivered yet.');
      const nextKey = crypto.randomUUID();
      setIdempotencyKey(nextKey);
      setFormData(DEFAULT_FORM_DATA(nextKey));
      setGpsSuccess(false);
      setGpsError(null);
    }
  };

  const selectedZone = zones.find((z) => z.id === formData.zoneId);

  return (
    <>
      <form onSubmit={handleReviewClick} className={`space-y-6 ${className}`}>
        {/* OFFLINE NOTICE BANNER (Rule 3: Saved on this device. NOT delivered yet.) */}
        {offlineNotice && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <h5 className="font-extrabold text-xs text-amber-900 tracking-tight">
                  Saved on this device. NOT delivered yet.
                </h5>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Your emergency intake is securely stored in your browser's offline storage. It will be dispatched automatically as soon as internet connection is restored.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOfflineNotice(null)}
              className="px-2.5 py-1 rounded-lg text-amber-800 hover:bg-amber-100 text-xs font-semibold shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TOP LEVEL ERROR BANNER (429, 500, server error) */}
        {generalError && (
          <div
            className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 ${
              generalError.includes('minute')
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle
                className={`w-4 h-4 shrink-0 ${
                  generalError.includes('minute') ? 'text-amber-600' : 'text-red-600'
                }`}
              />
              <span className="font-semibold">{generalError}</span>
            </div>

            {/* Offer Retry button for 500 (keeps form values & same idempotencyKey) */}
            {!generalError.includes('minute') && !generalError.includes('Needs correction') && (
              <button
                type="button"
                onClick={executeSubmission}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                <span>{isSubmitting ? 'Retrying...' : 'Retry Submission'}</span>
              </button>
            )}
          </div>
        )}

        {/* SECTION A: REPORTER INFORMATION */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#14B8A6] flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Section A: Reporter Information
              </h3>
              <p className="text-xs text-[#64748B]">
                Who is submitting this incident notification?
              </p>
            </div>
          </div>

          {/* Radio toggle: Myself vs Someone Else */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Reporting Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <label
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                  formData.reportingFor === 'myself'
                    ? 'border-[#14B8A6] bg-teal-50/50 text-[#0F172A] ring-1 ring-[#14B8A6]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="reportingFor"
                  checked={formData.reportingFor === 'myself'}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, reportingFor: 'myself' }))
                  }
                  className="accent-[#14B8A6]"
                />
                <span>Reporting for Myself / Family</span>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                  formData.reportingFor === 'someone_else'
                    ? 'border-[#14B8A6] bg-teal-50/50 text-[#0F172A] ring-1 ring-[#14B8A6]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="reportingFor"
                  checked={formData.reportingFor === 'someone_else'}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, reportingFor: 'someone_else' }))
                  }
                  className="accent-[#14B8A6]"
                />
                <span>Reporting for Someone Else</span>
              </label>
            </div>
            {errors.reportingFor && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.reportingFor}</p>
            )}
          </div>

          {/* Reporter Name & Contact Number & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Your Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.reporterName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, reporterName: val }));
                    if (errors.reporterName) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.reporterName;
                        return copy;
                      });
                    }
                  }}
                  placeholder="e.g. Tariq Mehmood"
                  className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white ${
                    errors.reporterName ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.reporterName && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.reporterName}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Callback Phone <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
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
                  placeholder="+92 300 1234567"
                  className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white ${
                    errors.reporterPhone ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.reporterPhone && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.reporterPhone}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Reporter Relationship <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reporterRole}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reporterRole: e.target.value as ReportFormData['reporterRole'],
                  }))
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white"
              >
                <option value="resident">Affected Resident</option>
                <option value="neighbor">Nearby Neighbor</option>
                <option value="volunteer">Field Volunteer</option>
                <option value="other">Public Passerby / Relative</option>
              </select>
              {errors.reporterRole && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.reporterRole}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION B: EMERGENCY LOCATION */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#14B8A6] flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Section B: Incident Location & Coordinates
              </h3>
              <p className="text-xs text-[#64748B]">
                Precise sector identification to dispatch nearest rescue unit.
              </p>
            </div>
          </div>

          {/* Zone loading error notice */}
          {zonesError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{zonesError}</span>
              </div>
              <button
                type="button"
                onClick={fetchZones}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-800 hover:bg-red-100 font-semibold text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Zone Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Sector / Zone <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.zoneId}
              disabled={zonesLoading || Boolean(zonesError)}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, zoneId: e.target.value }))
              }
              className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white disabled:opacity-60 ${
                errors.zoneId ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
              }`}
            >
              {zonesLoading ? (
                <option value="">Loading response zones...</option>
              ) : zones.length === 0 ? (
                <option value="">No zones available</option>
              ) : (
                zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} {z.flood_risk ? `(Risk: ${z.flood_risk})` : ''}
                  </option>
                ))
              )}
            </select>
            {errors.zoneId && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.zoneId}</p>
            )}
          </div>

          {/* Location Description & Landmarks */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Detailed Street Address & Landmark <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.locationDescription}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, locationDescription: e.target.value }))
              }
              placeholder="e.g. House 42-B, St 6, behind submerged Jamia Mosque. Yellow gate, 2nd floor balcony."
              className={`w-full p-3 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white ${
                errors.locationDescription ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
              }`}
            />
            {errors.locationDescription && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">
                {errors.locationDescription}
              </p>
            )}
          </div>

          {/* Coordinates Bar: "Use my location" button + optional manual lat/lng */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#14B8A6]" />
                <span className="text-xs font-bold text-slate-800">
                  GPS Location Coordinates
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  (Optional &bull; Enables precision mapping)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={gpsLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-teal-200 text-[#0F766E] hover:bg-teal-50 text-xs font-bold shadow-xs transition-colors disabled:opacity-60"
                >
                  <Navigation
                    className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin text-teal-600' : 'text-teal-600'}`}
                  />
                  <span>{gpsLoading ? 'Acquiring GPS...' : 'Use My Location'}</span>
                </button>

                {(formData.lat !== null || formData.lng !== null) && (
                  <button
                    type="button"
                    onClick={handleClearCoordinates}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                    title="Clear coordinates"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {gpsSuccess && (
              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>GPS coordinates acquired from your device.</span>
              </p>
            )}

            {gpsError && (
              <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1.5 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{gpsError}</span>
              </p>
            )}

            {/* Manual Lat / Lng Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Latitude (Karachi: 24.6000 to 25.3000)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  placeholder="e.g. 24.86300 (or leave blank)"
                  value={formData.lat ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setFormData((prev) => ({
                      ...prev,
                      lat: val === '' ? null : parseFloat(val),
                    }));
                  }}
                  className={`w-full px-3 py-1.5 text-xs font-mono bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] ${
                    errors.lat ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.lat && (
                  <p className="text-[11px] text-red-600 mt-0.5 font-medium">{errors.lat}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Longitude (Karachi: 66.7000 to 67.5000)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  placeholder="e.g. 67.01400 (or leave blank)"
                  value={formData.lng ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setFormData((prev) => ({
                      ...prev,
                      lng: val === '' ? null : parseFloat(val),
                    }));
                  }}
                  className={`w-full px-3 py-1.5 text-xs font-mono bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] ${
                    errors.lng ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.lng && (
                  <p className="text-[11px] text-red-600 mt-0.5 font-medium">{errors.lng}</p>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Note: If coordinates are omitted, the report is saved with approximate zone location and flagged for coordinator verification.
            </p>
          </div>
        </div>

        {/* SECTION C: EMERGENCY DETAILS & TRI-STATE VULNERABILITY */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#14B8A6] flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Section C: Emergency Urgency & Vulnerability Matrix
              </h3>
              <p className="text-xs text-[#64748B]">
                These indicators directly determine the algorithmic life-safety priority score.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Flood Severity (0..3) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Water Depth & Flood Severity <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.floodSeverity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    floodSeverity: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              >
                <option value={3}>Level 3: Severe (Waist-to-neck level, rising fast)</option>
                <option value={2}>Level 2: Moderate (Ground floor flooded, knee level)</option>
                <option value={1}>Level 1: Minor (Street impassable, threshold level)</option>
                <option value={0}>Level 0: Low (Precautionary evacuation notice)</option>
              </select>
              {errors.floodSeverity && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {errors.floodSeverity}
                </p>
              )}
            </div>

            {/* People Count + Unknown option */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  People Needing Evacuation
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-amber-800 font-semibold cursor-pointer">
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
                    className="accent-amber-600 rounded"
                  />
                  <span>Count Unknown</span>
                </label>
              </div>

              {formData.isPeopleCountUnknown ? (
                <div className="px-3 py-2 text-xs font-semibold bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-center justify-between">
                  <span>Count Unknown (Sent as null)</span>
                  <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">
                    Flagged for review
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
                  className={`w-full px-3 py-2 text-xs font-semibold bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] ${
                    errors.peopleCount ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
              )}
              {errors.peopleCount && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {errors.peopleCount}
                </p>
              )}
            </div>
          </div>

          {/* Tri-State Vulnerability Factors (Trapped, Medical, Mobility) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 block">
                Tri-State Vulnerability Indicators
              </label>
              <span className="text-[11px] text-slate-500 italic">
                Unknown is logged as unverified null, never as false
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Factor 1: Trapped */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Physically Trapped</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Blocked exits, cutoff on upper roof, or rising water.
                </p>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, trapped: true }))}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      formData.trapped === true
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, trapped: false }))}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      formData.trapped === false
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, trapped: null }))}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      formData.trapped === null
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Unknown
                  </button>
                </div>
              </div>

              {/* Factor 2: Urgent Medical */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <HeartPulse className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Urgent Medical Need</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Oxygen, dialysis, insulin, injury, or critical illness.
                </p>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, medicalUrgent: true }))}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      formData.medicalUrgent === true
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, medicalUrgent: false }))}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      formData.medicalUrgent === false
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, medicalUrgent: null }))}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      formData.medicalUrgent === null
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Unknown
                  </button>
                </div>
              </div>

              {/* Factor 3: Mobility Assistance */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <PersonStanding className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Mobility Assistance</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Bedridden, wheelchair, infant, or elderly unable to wade.
                </p>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, mobilityHelp: true }))}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      formData.mobilityHelp === true
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, mobilityHelp: false }))}
                    className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      formData.mobilityHelp === false
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, mobilityHelp: null }))}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      formData.mobilityHelp === null
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Unknown
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Medical or Rescue Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Additional Medical or Rescue Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="e.g. Diabetic needing insulin cooling; power disconnected; two elderly residents on second floor."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white"
            />
            {errors.description && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.description}</p>
            )}
          </div>
        </div>

        {/* SECTION D: INFORMATION OBSERVATION TIMING */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#14B8A6] flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Section D: Observation Timing
              </h3>
              <p className="text-xs text-[#64748B]">
                Help coordinators evaluate report freshness and decay rates.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              When did you observe this situation? <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.observationOption}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  observationOption: e.target.value as ReportFormData['observationOption'],
                }))
              }
              className="w-full sm:w-80 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            >
              <option value="now">Observed just now / within last 5 minutes</option>
              <option value="15m">Observed about 15 minutes ago</option>
              <option value="1h">Observed 1 hour ago</option>
              <option value="3h">Observed 2 to 4 hours ago</option>
              <option value="12h">Observed earlier today (~12 hours ago)</option>
              <option value="24h">Observed yesterday (~24 hours ago)</option>
            </select>
            {errors.observedAt && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.observedAt}</p>
            )}
          </div>
        </div>

        {/* Form Submission Actions & Review Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4 text-[#14B8A6] shrink-0" />
            <span>Reports are algorithmically ranked before dispatcher assignment.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || zonesLoading || Boolean(zonesError)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-sm font-bold shadow-card transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Evaluating Triage...' : 'Review & Submit Report'}</span>
          </button>
        </div>
      </form>

      {/* Confirmation & Review Modal */}
      <ReportConfirmationModal
        isOpen={isConfirmationOpen}
        formData={formData}
        zoneName={selectedZone?.name || formData.zoneId}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={executeSubmission}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
