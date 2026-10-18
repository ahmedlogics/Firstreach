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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#252A30]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E8E6E1] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E8E6E1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#252A30] tracking-tight">
                Simulated Alert Planner
              </h3>
              <p className="text-xs text-[#757B81]">
                Outbound community outreach testing module
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#92979D] hover:text-[#252A30] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Explicit DEMO ONLY Banner */}
          <div className="p-3.5 rounded-xl bg-[#FFF2DD] border border-[#A87426]/30 flex items-start gap-2.5 text-xs text-[#A87426]">
            <AlertTriangle className="w-4 h-4 text-[#A87426] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-[#A87426]/20 text-[#A87426] font-mono text-[10px] uppercase tracking-wider font-bold">
                  DEMO ONLY / SIMULATED
                </span>
                <span className="text-[#252A30]">Training Drill Protocol</span>
              </div>
              <p className="text-[11px] text-[#757B81] leading-relaxed">
                Actions executed here are synthetic simulations logged for evaluation.
                No physical emergency SMS or live cellular broadcasts will be transmitted.
              </p>
            </div>
          </div>

          {/* Target Summary */}
          {targetHousehold && (
            <div className="p-3 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#92979D] text-[10px] uppercase font-semibold block">
                  Target Household
                </span>
                <span className="font-mono font-bold text-[#252A30]">
                  {targetHousehold.label}
                </span>
                <span className="text-[#757B81] ml-1.5">
                  ({targetHousehold.zone_name})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#92979D] text-[10px] uppercase font-semibold block">
                  Reachability
                </span>
                <span className="font-medium text-[#252A30] capitalize">
                  {targetHousehold.reachability.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Channel Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#252A30] block">
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
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#536A82] bg-[#EDF1F5] ring-1 ring-[#536A82] shadow-xs'
                        : 'border-[#E8E6E1] bg-white hover:border-[#536A82]/30 hover:bg-[#F7F6F2]'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#536A82] text-white'
                          : 'bg-[#F7F6F2] text-[#757B81]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-[#252A30] truncate">
                          {ch.title}
                        </span>
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#F7F6F2] text-[#757B81]">
                          {ch.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#757B81] mt-0.5 leading-snug">
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
            <label className="text-xs font-semibold text-[#252A30] block">
              Simulation Note / Broadcast Context (Optional):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Flash flood warning drill; instructions to move to nearest designated shelter."
              rows={2}
              className="w-full p-2.5 text-xs bg-[#F7F6F2] border border-[#E8E6E1] rounded-lg text-[#252A30] placeholder:text-[#92979D] focus:outline-none focus:ring-2 focus:ring-[#536A82]"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#FAE8E7] border border-[#B74349]/30 text-xs text-[#B74349] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#B74349]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-[#757B81] hover:text-[#252A30] hover:bg-[#F7F6F2] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#536A82] hover:bg-[#40566D] disabled:bg-slate-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
