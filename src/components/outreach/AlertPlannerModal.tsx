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
      description: 'Ultra-low-bandwidth text alert designed for basic cellular and non-smart devices.',
      icon: MessageSquare,
      tag: 'SIMULATED SMS',
    },
    {
      id: 'app_demo',
      title: 'Simulated Push Alert',
      description: 'Interactive push alert simulation with evacuation route instructions.',
      icon: Smartphone,
      tag: 'SIMULATED PUSH',
    },
    {
      id: 'call_demo',
      title: 'Automated IVR Voice Call',
      description: 'Synthesized regional language automated voice check-in simulation.',
      icon: PhoneCall,
      tag: 'SIMULATED VOICE',
    },
    {
      id: 'volunteer_visit',
      title: 'Task Field Volunteer Patrol',
      description: 'Queue a physical door-to-door welfare check task for neighborhood volunteers.',
      icon: Footprints,
      tag: 'VOLUNTEER PATROL',
    },
    {
      id: 'broadcast_demo',
      title: 'Siren / Speaker Broadcast',
      description: 'Coordinate localized siren drill announcement simulation.',
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
        note: `[SIMULATED] ${note.trim() || `Synthetic ${selectedChannel.replace('_', ' ')} drill action`}`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18232D]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-[#E4E8EC] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E8EC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#F0F4F8] text-[#375A6B] border border-[#375A6B]/20">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#18232D]">
                Outreach Alert Simulation
              </h3>
              <p className="text-xs text-[#5F6B7A]">
                Synthetic communication and volunteer dispatch tool
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5F6B7A] hover:text-[#18232D] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* Explicit DEMO ONLY Banner */}
          <div className="p-3 rounded-lg bg-[#FFF5E6] border border-[#A87528]/30 flex items-start gap-2.5 text-xs text-[#A87528]">
            <AlertTriangle className="w-4 h-4 text-[#A87528] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-semibold flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-[#A87528]/20 text-[#A87528] font-mono text-[10px] uppercase tracking-wider font-bold">
                  SIMULATION ONLY
                </span>
                <span className="text-[#18232D]">Drill Mode</span>
              </div>
              <p className="text-[11px] text-[#5F6B7A] leading-relaxed">
                Actions executed here are operational simulations logged for readiness drills. No live cellular SMS broadcasts will be sent to civilian carriers.
              </p>
            </div>
          </div>

          {/* Target Summary */}
          {targetHousehold && (
            <div className="p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EC] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#5F6B7A] text-[10px] uppercase font-semibold block">
                  Target Household
                </span>
                <span className="font-mono font-bold text-[#18232D]">
                  {targetHousehold.label}
                </span>
                <span className="text-[#5F6B7A] ml-1.5">
                  ({targetHousehold.zone_name})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#5F6B7A] text-[10px] uppercase font-semibold block">
                  Reachability
                </span>
                <span className="font-medium text-[#18232D] capitalize">
                  {targetHousehold.reachability.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Channel Selection Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#18232D] block">
              Select Outreach Channel:
            </label>
            <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto pr-1">
              {channels.map((ch) => {
                const Icon = ch.icon;
                const isSelected = selectedChannel === ch.id;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannel(ch.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#375A6B] bg-[#F0F4F8] ring-1 ring-[#375A6B] shadow-xs'
                        : 'border-[#E4E8EC] bg-white hover:border-[#375A6B]/30 hover:bg-[#F7F8FA]'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#375A6B] text-white'
                          : 'bg-[#F7F8FA] text-[#5F6B7A]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-[#18232D] truncate">
                          {ch.title}
                        </span>
                        <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#F7F8FA] text-[#5F6B7A] border border-[#E4E8EC]">
                          {ch.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5F6B7A] mt-0.5 leading-snug">
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
            <label className="text-xs font-semibold text-[#18232D] block">
              Drill Context / Message Content (Optional):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Inundation advisory drill; proceed to nearest high-ground community shelter."
              rows={2}
              className="w-full p-2.5 text-xs bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg text-[#18232D] placeholder:text-[#5F6B7A] focus:outline-none focus:ring-1 focus:ring-[#375A6B]"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-[#FBECEE] border border-[#BC414A]/30 text-xs text-[#BC414A] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#BC414A]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E4E8EC]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-medium text-[#5F6B7A] hover:text-[#18232D] hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#375A6B] hover:bg-[#2C4855] disabled:bg-[#5F6B7A]/30 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging Drill...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
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
