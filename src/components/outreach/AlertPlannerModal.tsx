'use client';

import React, { useState } from 'react';
import {
  HouseholdWithZone,
  OutreachActionWithDetails,
  OutreachChannelType,
} from '@/lib/outreach/types';
import {
  Smartphone,
  MessageSquare,
  PhoneCall,
  Footprints,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  X,
  Radio,
} from 'lucide-react';

interface AlertPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetHousehold?: HouseholdWithZone | null;
  targetZoneId?: string | null;
  onActionComplete?: (action: OutreachActionWithDetails) => void;
}

export function AlertPlannerModal({
  isOpen,
  onClose,
  targetHousehold,
  targetZoneId,
  onActionComplete,
}: AlertPlannerModalProps) {
  const [selectedChannel, setSelectedChannel] =
    useState<OutreachChannelType>('sms_demo');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const channels: {
    id: OutreachChannelType;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    tag: string;
  }[] = [
    {
      id: 'sms_demo',
      title: 'Simulated 2G SMS Ping',
      description: 'Ultra-low-bandwidth text alert designed for basic and non-smart devices.',
      icon: MessageSquare,
      tag: 'SIMULATED SMS',
    },
    {
      id: 'app_demo',
      title: 'Simulated Push Alert',
      description: 'Interactive rich push alert with geo-pinned evacuation route.',
      icon: Smartphone,
      tag: 'SIMULATED PUSH',
    },
    {
      id: 'call_demo',
      title: 'Automated IVR Voice Call',
      description: 'Synthesized Urdu/Sindhi automated voice hotline check-in call.',
      icon: PhoneCall,
      tag: 'SIMULATED VOICE',
    },
    {
      id: 'volunteer_visit',
      title: 'Task Field Volunteer Patrol',
      description: 'Generate physical door-to-door welfare check for neighborhood volunteers.',
      icon: Footprints,
      tag: 'VOLUNTEER PATROL',
    },
    {
      id: 'broadcast_demo',
      title: 'Mosque Horn / Siren Broadcast',
      description: 'Coordinate localized acoustic siren alert through community minarets.',
      icon: Volume2,
      tag: 'ACOUSTIC SIREN',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        household_id: targetHousehold?.id || null,
        zone_id: targetHousehold?.zone_id || targetZoneId || null,
        channel: selectedChannel,
        status: selectedChannel === 'volunteer_visit' ? 'planned' : 'sent_demo',
        note: `[DEMO ONLY / SIMULATED] ${note.trim() || `Automated ${selectedChannel.replace('_', ' ')} triggered`}`,
        attempted_at: new Date().toISOString(),
      };

      const res = await fetch('/api/outreach-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch simulated outreach action');
      }

      if (onActionComplete) {
        onActionComplete(data.data);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || 'Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-[#0D9488] border border-teal-100">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Simulated Alert Planner
              </h3>
              <p className="text-xs text-slate-500">
                Outbound community outreach testing module
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Explicit DEMO ONLY Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 font-mono text-[10px] uppercase tracking-wider font-extrabold">
                  DEMO ONLY / SIMULATED
                </span>
                <span>Training Drill Protocol</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Actions executed here are synthetic simulations logged for evaluation.
                No physical emergency SMS or live cellular broadcasts will be transmitted.
              </p>
            </div>
          </div>

          {/* Target Summary */}
          {targetHousehold && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Target Household
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {targetHousehold.label}
                </span>
                <span className="text-slate-500 ml-1.5">
                  ({targetHousehold.zone_name})
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Reachability
                </span>
                <span className="font-semibold text-slate-700 capitalize">
                  {targetHousehold.reachability.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Channel Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Select Simulated Outreach Channel:
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {channels.map((ch) => {
                const Icon = ch.icon;
                const isSelected = selectedChannel === ch.id;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannel(ch.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'border-[#0D9488] bg-teal-50/50 ring-2 ring-[#0D9488]/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#0D9488] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {ch.title}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {ch.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {ch.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Simulation Note / Broadcast Context (Optional):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Flash flood warning drill; instructions to move to nearest designated shelter."
              rows={2}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-slate-300 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging Drill...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dispatch Simulated Action</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
