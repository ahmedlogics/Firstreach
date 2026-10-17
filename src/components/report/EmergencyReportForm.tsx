'use client';

import React, { useState } from 'react';
import { EmergencyReportFormData, SeverityLevel } from '@/lib/types';
import { MOCK_ZONES } from '@/lib/mock-data';
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
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface EmergencyReportFormProps {
  onSubmitSuccess: (data: EmergencyReportFormData) => void;
  className?: string;
}

export function EmergencyReportForm({
  onSubmitSuccess,
  className = '',
}: EmergencyReportFormProps) {
  // Local form state
  const [formData, setFormData] = useState<EmergencyReportFormData>({
    reportingFor: 'myself',
    reporterName: '',
    reporterPhone: '',
    reporterRole: 'resident',
    zoneId: 'zone-surjani',
    locationDescription: '',
    latitude: 25.025,
    longitude: 67.042,
    affectedPeople: 1,
    floodSeverity: 'high',
    factors: {
      risingWater: true,
      medicalEmergency: false,
      mobilityAssistanceRequired: false,
      peopleTrapped: false,
      elderlyPresent: false,
      childrenPresent: false,
    },
    additionalDescription: '',
    reliabilityConfirmed: true,
    lastObservationTime: 'Within last 15 minutes',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form before submission
  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.locationDescription.trim()) {
      errs.locationDescription = 'Please provide landmarks, street numbers, or building descriptions.';
    } else if (formData.locationDescription.trim().length < 8) {
      errs.locationDescription = 'Location description should be descriptive enough for field navigators.';
    }

    if (formData.affectedPeople <= 0) {
      errs.affectedPeople = 'Affected people must be at least 1.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess(formData);
    }, 600);
  };

  const handleZoneChange = (zoneId: string) => {
    const zone = MOCK_ZONES.find((z) => z.id === zoneId);
    setFormData((prev) => ({
      ...prev,
      zoneId,
      latitude: zone ? zone.coordinates[0] : prev.latitude,
      longitude: zone ? zone.coordinates[1] : prev.longitude,
    }));
  };

  const toggleFactor = (key: keyof EmergencyReportFormData['factors']) => {
    setFormData((prev) => ({
      ...prev,
      factors: {
        ...prev.factors,
        [key]: !prev.factors[key],
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
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
            <p className="text-xs text-[#64748B]">Who is submitting this incident notification?</p>
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
                onChange={() => setFormData((prev) => ({ ...prev, reportingFor: 'myself' }))}
                className="accent-[#14B8A6]"
              />
              <span>Reporting for Myself / My Family</span>
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
                onChange={() => setFormData((prev) => ({ ...prev, reportingFor: 'someone_else' }))}
                className="accent-[#14B8A6]"
              />
              <span>Reporting for Someone Else</span>
            </label>
          </div>
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
                onChange={(e) => setFormData((prev) => ({ ...prev, reporterName: e.target.value }))}
                placeholder="e.g. Tariq Mehmood"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white"
              />
            </div>
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
                onChange={(e) => setFormData((prev) => ({ ...prev, reporterPhone: e.target.value }))}
                placeholder="+92 300 1234567"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Reporter Relationship <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.reporterRole}
              onChange={(e) => setFormData((prev) => ({ ...prev, reporterRole: e.target.value as any }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white"
            >
              <option value="resident">Affected Resident</option>
              <option value="neighbor">Nearby Neighbor</option>
              <option value="volunteer">Field Volunteer</option>
              <option value="other">Public Passerby / Relative</option>
            </select>
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
            <p className="text-xs text-[#64748B]">Precise sector identification to dispatch nearest boat or high-clearance truck.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Sector / Zone <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.zoneId}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white"
            >
              {MOCK_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.area})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Estimated Latitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.latitude}
              onChange={(e) => setFormData((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || '' }))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Estimated Longitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.longitude}
              onChange={(e) => setFormData((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || '' }))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>
        </div>

        {/* Location Description */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Detailed Street Address & Landmark <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={formData.locationDescription}
            onChange={(e) => setFormData((prev) => ({ ...prev, locationDescription: e.target.value }))}
            placeholder="e.g. House 42-B, St 6, behind submerged Jamia Mosque. Yellow gate, 2nd floor balcony."
            className={`w-full p-3 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white ${
              errors.locationDescription ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
            }`}
          />
          {errors.locationDescription && (
            <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.locationDescription}</p>
          )}
        </div>

        {/* Map Selection Placeholder Component */}
        <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#14B8A6]" />
            <span>Interactive Map Coordinate Picker (Click to drop pin on Karachi Grid)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              // Simulated pin drop
              setFormData((prev) => ({
                ...prev,
                latitude: Number((24.95 + Math.random() * 0.08).toFixed(4)),
                longitude: Number((67.02 + Math.random() * 0.12).toFixed(4)),
              }));
            }}
            className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold"
          >
            Auto-Detect GPS
          </button>
        </div>
      </div>

      {/* SECTION C: EMERGENCY DETAILS & VULNERABILITY */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#14B8A6] flex items-center justify-center font-bold text-xs">
            3
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Section C: Emergency Urgency & Vulnerability Matrix
            </h3>
            <p className="text-xs text-[#64748B]">These factors directly determine the algorithmic life-safety priority score.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Total Individuals Trapped / Needing Rescue <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={formData.affectedPeople}
              onChange={(e) => setFormData((prev) => ({ ...prev, affectedPeople: parseInt(e.target.value, 10) || 1 }))}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Water Depth & Ingress Severity <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.floodSeverity}
              onChange={(e) => setFormData((prev) => ({ ...prev, floodSeverity: e.target.value as SeverityLevel }))}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            >
              <option value="critical">Critical (Water waist-to-neck level, rising fast)</option>
              <option value="high">High (Ground floor submerged, cutoff on roof)</option>
              <option value="medium">Medium (Surrounding streets impassable, water at threshold)</option>
              <option value="low">Low (Precautionary evacuation request)</option>
            </select>
          </div>
        </div>

        {/* Vulnerability Factors Checkbox Grid */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Select All Applicable Vulnerability Factors:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              { key: 'risingWater', label: 'Rapidly Rising Water Surge', icon: Waves },
              { key: 'medicalEmergency', label: 'Critical Medical Emergency', icon: HeartPulse },
              { key: 'mobilityAssistanceRequired', label: 'Wheelchair / Bedridden Mobility Need', icon: PersonStanding },
              { key: 'peopleTrapped', label: 'Physically Trapped (Blocked Doors)', icon: AlertTriangle },
              { key: 'elderlyPresent', label: 'Elderly Residents Present (65+)', icon: User },
              { key: 'childrenPresent', label: 'Infants / Young Children Present', icon: User },
            ].map((item) => {
              const isChecked = formData.factors[item.key as keyof EmergencyReportFormData['factors']];
              const Icon = item.icon;

              return (
                <label
                  key={item.key}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    isChecked
                      ? 'bg-red-50/60 border-red-300 text-red-950 font-semibold'
                      : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleFactor(item.key as keyof EmergencyReportFormData['factors'])}
                    className="accent-red-600 w-4 h-4 rounded"
                  />
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-red-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Additional Description */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Additional Medical or Rescue Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={formData.additionalDescription}
            onChange={(e) => setFormData((prev) => ({ ...prev, additionalDescription: e.target.value }))}
            placeholder="e.g. Diabetic needing insulin refrigeration, battery dead on oxygen backup unit."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:bg-white"
          />
        </div>
      </div>

      {/* SECTION D: INFORMATION RELIABILITY */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#14B8A6] flex items-center justify-center font-bold text-xs">
            4
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Section D: Verification & Information Reliability
            </h3>
            <p className="text-xs text-[#64748B]">Prevent duplicate dispatches and false alarms.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Time of Direct Observation
            </label>
            <select
              value={formData.lastObservationTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastObservationTime: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            >
              <option value="Currently observing / On-site now">Currently observing / On-site now</option>
              <option value="Within last 15 minutes">Within last 15 minutes</option>
              <option value="1 to 2 hours ago">1 to 2 hours ago</option>
              <option value="Older than 2 hours / Phone disconnected">Older than 2 hours / Phone disconnected</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.reliabilityConfirmed}
                onChange={(e) => setFormData((prev) => ({ ...prev, reliabilityConfirmed: e.target.checked }))}
                className="accent-[#14B8A6] w-4 h-4 rounded"
              />
              <span className="font-semibold">
                Direct visual confirmation (I have personally seen this situation)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Form Submission Actions & Demo Disclaimer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <HelpCircle className="w-4 h-4 text-[#14B8A6]" />
          <span>Reports are algorithmically ranked before dispatcher assignment.</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-sm font-bold shadow-card transition-all disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Evaluating Triage...' : 'Submit Emergency Report'}</span>
        </button>
      </div>
    </form>
  );
}
