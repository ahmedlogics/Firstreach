'use client';

import React from 'react';
import { RescueTeam } from '@/lib/types';
import { MOCK_RESCUE_TEAMS } from '@/lib/mock-data';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrencyPkr } from '@/lib/utils';
import {
  LifeBuoy,
  Truck,
  Anchor,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';

interface RescueTeamListProps {
  selectedTeamId?: string;
  onSelectTeam?: (team: RescueTeam) => void;
  className?: string;
}

export function RescueTeamList({
  selectedTeamId,
  onSelectTeam,
  className = '',
}: RescueTeamListProps) {
  const getTeamIcon = (type: RescueTeam['type']) => {
    switch (type) {
      case 'medical_boat':
      case 'boat':
        return <Anchor className="w-4 h-4 text-[#14B8A6]" />;
      case 'high_clearance_vehicle':
        return <Truck className="w-4 h-4 text-blue-600" />;
      default:
        return <LifeBuoy className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
            Rescue Fleet & Resource Assets
          </h3>
          <p className="text-xs text-[#64748B]">
            Real-time readiness of swiftwater boats, military trucks & paramedics.
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-[#14B8A6] border border-teal-200">
          3 Teams Ready
        </span>
      </div>

      <div className="space-y-3">
        {MOCK_RESCUE_TEAMS.map((team) => {
          const isSelected = selectedTeamId === team.id;
          const isBusy = team.status === 'busy';

          return (
            <div
              key={team.id}
              onClick={() => !isBusy && onSelectTeam?.(team)}
              className={`p-4 rounded-xl border transition-all ${
                isBusy
                  ? 'border-slate-200 bg-slate-50/70 opacity-75 cursor-not-allowed'
                  : isSelected
                  ? 'border-[#14B8A6] bg-teal-50/30 ring-2 ring-[#14B8A6]/40 cursor-pointer shadow-subtle'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                    {getTeamIcon(team.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{team.name}</h4>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">
                      Callsign: {team.contactCallsign}
                    </p>
                  </div>
                </div>

                <StatusBadge status={team.status} size="sm" />
              </div>

              {/* Location & Current Assignment */}
              <div className="text-xs text-slate-600 space-y-1 mt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Staged at: {team.location}</span>
                </div>
                {team.currentAssignment && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 italic">
                    Engaged: {team.currentAssignment}
                  </p>
                )}
              </div>

              {/* Capabilities Chips */}
              <div className="flex flex-wrap gap-1 mt-2.5">
                {team.capabilities.map((cap, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                    {cap}
                  </span>
                ))}
              </div>

              {/* Metrics: Capacity, ETA, Cost */}
              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Capacity: <strong className="text-slate-800">{team.capacity} persons</strong>
                </span>

                <div className="flex items-center gap-3 font-mono tabular-nums">
                  <span className="text-teal-700 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-600" />
                    ETA: ~{team.etaMinutes}m
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Est: {formatCurrencyPkr(team.estimatedCostPkr)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
