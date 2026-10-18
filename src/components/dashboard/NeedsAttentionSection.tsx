'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DbIncident, DbShelter, ZoneAnalytics } from '@/lib/dashboard/types';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import {
  AlertTriangle,
  ArrowRight,
  Flame,
  EyeOff,
  Home,
  CheckCircle2,
  Clock,
  Compass,
  Users,
} from 'lucide-react';

interface NeedsAttentionSectionProps {
  incidents: DbIncident[];
  zones: ZoneAnalytics[];
  shelters: DbShelter[];
  onForwardToDispatch: (incident: DbIncident) => void;
  onInspectIncident: (incident: DbIncident) => void;
  onDispatchVerification: (zone: ZoneAnalytics) => void;
  className?: string;
}

export function NeedsAttentionSection({
  incidents,
  zones,
  shelters,
  onForwardToDispatch,
  onInspectIncident,
  onDispatchVerification,
  className = '',
}: NeedsAttentionSectionProps) {
  const router = useRouter();

  // 1. Critical or unassigned incidents (priority_score >= 80 or status === 'open')
  const criticalIncidents = incidents
    .filter((inc) => inc.priority_score >= 80 || inc.status === 'open')
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 3);

  // 2. High-threat blind spot zones needing verification
  const topBlindSpots = zones
    .filter((z) => z.isBlindSpot)
    .sort((a, b) => b.flood_risk - a.flood_risk)
    .slice(0, 1);

  // 3. Shelters near or at capacity (>= 85% full)
  const fullShelters = shelters
    .filter((s) => s.capacity > 0 && s.occupied / s.capacity >= 0.85)
    .slice(0, 1);

  const totalItemsCount = criticalIncidents.length + topBlindSpots.length + fullShelters.length;

  return (
    <div className={`bg-white rounded-xl border border-[#E4E8EC] shadow-xs p-4 space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E4E8EC]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#18232D] tracking-tight">
                Needs Attention
              </h2>
              {totalItemsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25">
                  {totalItemsCount} actionable
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#5F6B7A]">
              Urgent incidents, coverage deficits, and capacity warnings requiring action
            </p>
          </div>
        </div>

        {totalItemsCount > 0 && (
          <button
            type="button"
            onClick={() => router.push('/dispatch')}
            className="text-[11px] font-semibold text-[#375A6B] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Open Dispatch Console</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Action Items List */}
      {totalItemsCount === 0 ? (
        <div className="p-5 text-center rounded-lg bg-[#F7F8FA] border border-dashed border-[#E4E8EC] space-y-1">
          <CheckCircle2 className="w-5 h-5 text-[#258167] mx-auto" />
          <p className="text-xs font-semibold text-[#18232D]">All critical situations addressed</p>
          <p className="text-[11px] text-[#5F6B7A]">No open life-threat emergencies or unverified high-risk sectors at this time.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Critical Incidents */}
          {criticalIncidents.map((inc) => {
            const formattedId = `INC-${inc.id.slice(0, 8).toUpperCase()}`;
            const isUnassigned = inc.status === 'open';

            return (
              <div
                key={inc.id}
                className="p-3 rounded-lg border border-[#BC414A]/25 bg-[#FBECEE]/25 hover:bg-[#FBECEE]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#18232D]">
                      {formattedId}
                    </span>
                    <span className="text-[11px] text-[#5F6B7A]">•</span>
                    <span className="text-xs font-semibold text-[#18232D] truncate">
                      {inc.zone_name || 'Unassigned Sector'}
                    </span>
                    <PriorityBadge score={inc.priority_score} size="sm" />
                    {isUnassigned && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FFF5E6] text-[#A87528] border border-[#A87528]/25 uppercase font-mono">
                        Awaiting Unit
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#5F6B7A] line-clamp-1">
                    {inc.priority_reason || inc.details || 'Severe flood threat with trapped residents.'}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-[#5F6B7A] font-mono">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#5F6B7A]" />
                      <span>{inc.people_count} people</span>
                    </span>
                    {inc.minutes_to_harm !== null ? (
                      <span className="flex items-center gap-1 text-[#BC414A] font-bold">
                        <Clock className="w-3 h-3" />
                        <span>{inc.minutes_to_harm}m to harm</span>
                      </span>
                    ) : (
                      <span className="text-[#5F6B7A]">Time: Assessing</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onInspectIncident(inc)}
                    className="px-2.5 py-1 text-xs font-medium text-[#5F6B7A] bg-white border border-[#E4E8EC] hover:bg-[#F7F8FA] hover:text-[#18232D] rounded-lg transition-colors cursor-pointer"
                  >
                    Inspect
                  </button>
                  <button
                    type="button"
                    onClick={() => onForwardToDispatch(inc)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#BC414A] hover:bg-[#A3343C] rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Dispatch Unit</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Top Blind Spot Verification Alert */}
          {topBlindSpots.map((zone) => (
            <div
              key={`blindspot-${zone.id}`}
              className="p-3 rounded-lg border border-[#A87528]/25 bg-[#FFF5E6]/30 hover:bg-[#FFF5E6]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="p-1 rounded bg-[#FFF5E6] text-[#A87528] border border-[#A87528]/25">
                    <EyeOff className="w-3 h-3" />
                  </span>
                  <span className="font-semibold text-xs text-[#18232D]">
                    {zone.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FAE8E7] text-[#BC414A] border border-[#BC414A]/25 uppercase font-mono">
                    Tier {zone.flood_risk} Surge
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FFF5E6] text-[#A87528] border border-[#A87528]/25 font-mono">
                    0 incoming calls
                  </span>
                </div>

                <p className="text-[11px] text-[#5F6B7A] line-clamp-1">
                  High flood risk sector with {zone.noPhoneCount} offline households. Silence indicates possible blackout.
                </p>
              </div>

              {/* Action */}
              <div className="shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onDispatchVerification(zone)}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#18232D] hover:bg-[#2C3E50] rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Compass className="w-3 h-3 text-[#E4E8EC]" />
                  <span>Task Patrol</span>
                </button>
              </div>
            </div>
          ))}

          {/* Full Shelter Warning */}
          {fullShelters.map((shelter) => {
            const free = Math.max(0, shelter.capacity - shelter.occupied);
            return (
              <div
                key={`shelter-${shelter.id}`}
                className="p-3 rounded-lg border border-[#BC414A]/25 bg-[#FBECEE]/25 hover:bg-[#FBECEE]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="p-1 rounded bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25">
                      <Home className="w-3 h-3" />
                    </span>
                    <span className="font-semibold text-xs text-[#18232D]">
                      Shelter Capacity Alert: {shelter.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25 font-mono">
                      {Math.round((shelter.occupied / shelter.capacity) * 100)}% Full
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5F6B7A]">
                    Only {free} spaces remaining ({shelter.occupied}/{shelter.capacity} occupied). Reroute evacuees.
                  </p>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => router.push('/outreach')}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-[#375A6B] bg-[#F0F4F8] hover:bg-[#375A6B] hover:text-white border border-[#375A6B]/25 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Manage Shelters</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
