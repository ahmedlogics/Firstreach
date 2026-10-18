'use client';

import React, { useState } from 'react';
import { DbIncident, DbRescueTeam } from '@/lib/dispatch/types';
import { calculateDistanceKm, estimateArrivalMinutes } from '@/lib/dispatch/cost';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  LifeBuoy,
  Truck,
  Anchor,
  Clock,
  MapPin,
  Check,
} from 'lucide-react';

interface RescueTeamListProps {
  teams: DbRescueTeam[];
  selectedTeamId?: string;
  selectedIncident?: DbIncident | null;
  onSelectTeam?: (team: DbRescueTeam) => void;
  isLoading?: boolean;
  className?: string;
}

export function RescueTeamList({
  teams,
  selectedTeamId,
  selectedIncident,
  onSelectTeam,
  isLoading = false,
  className = '',
}: RescueTeamListProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const getTeamIcon = (type: DbRescueTeam['team_type']) => {
    switch (type) {
      case 'boat':
        return <Anchor className="w-4 h-4 text-[#375A6B]" />;
      case 'vehicle':
        return <Truck className="w-4 h-4 text-[#18232D]" />;
      case 'medical':
        return <LifeBuoy className="w-4 h-4 text-[#BC414A]" />;
      default:
        return <LifeBuoy className="w-4 h-4 text-[#375A6B]" />;
    }
  };

  const availableCount = teams.filter((t) => t.status === 'available').length;
  const busyCount = teams.filter((t) => t.status === 'busy').length;

  const filteredTeams = teams.filter((t) => {
    if (filterType === 'all') return true;
    return t.team_type === filterType;
  });

  return (
    <div
      className={`bg-white rounded-xl border border-[#E4E8EC] shadow-subtle p-4 sm:p-5 space-y-3.5 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E4E8EC]">
        <div>
          <h3 className="text-base font-semibold text-[#18232D] tracking-tight">
            Rescue Fleet & Craft Units
          </h3>
          <p className="text-xs text-[#6B7782] mt-0.5">
            Craft readiness, single-trip capacities, and staging locations.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-medium px-2 py-0.5 rounded-[6px] bg-[#E9F3EF] text-[#258167] border border-[#258167]/25 tabular-nums">
            {availableCount} Ready
          </span>
          {busyCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-[6px] bg-[#FFF4E3] text-[#A87528] border border-[#A87528]/25 tabular-nums">
              {busyCount} Engaged
            </span>
          )}
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-[10px] text-xs font-medium border border-[#E4E8EC]">
        {[
          { label: 'All Units', val: 'all' },
          { label: 'Boats', val: 'boat' },
          { label: 'Vehicles', val: 'vehicle' },
          { label: 'Medical', val: 'medical' },
        ].map(({ label, val }) => (
          <button
            key={val}
            onClick={() => setFilterType(val)}
            className={`px-2.5 py-1 rounded-[8px] capitalize transition-colors cursor-pointer ${
              filterType === val
                ? 'bg-white text-[#18232D] font-semibold shadow-subtle'
                : 'text-[#6B7782] hover:text-[#18232D]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Teams List */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-8 text-center text-[#6B7782] space-y-2">
            <div className="w-5 h-5 border-2 border-[#375A6B] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading fleet status...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#6B7782] border border-dashed border-[#E4E8EC] rounded-xl">
            No rescue teams found matching filter.
          </div>
        ) : (
          filteredTeams.map((team) => {
            const isSelected = selectedTeamId === team.id;
            const isBusy = team.status !== 'available';

            const distanceKm =
              selectedIncident && selectedIncident.lat && selectedIncident.lng
                ? calculateDistanceKm(
                    { lat: team.lat, lng: team.lng },
                    { lat: selectedIncident.lat, lng: selectedIncident.lng }
                  )
                : null;

            const simulatedEta = estimateArrivalMinutes(team, distanceKm);

            return (
              <div
                key={team.id}
                onClick={() => !isBusy && onSelectTeam?.(team)}
                className={`p-3 rounded-[10px] border transition-colors ${
                  isBusy
                    ? 'border-[#E4E8EC] bg-[#F7F8FA] opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-[#375A6B] bg-[#F7F8FA] shadow-subtle cursor-pointer ring-1 ring-[#375A6B]/30'
                    : 'border-[#E4E8EC] bg-white hover:bg-[#FAFBFD] hover:border-[#CBD5E1] cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-[8px] border border-[#E4E8EC] bg-[#F7F8FA]">
                      {getTeamIcon(team.team_type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#18232D]">{team.name}</h4>
                      <p className="text-[10px] font-mono text-[#8B959E] uppercase">
                        Type: {team.team_type} • ID: {team.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={team.status} size="sm" />
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#375A6B] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6B7782] pt-1.5 border-t border-[#E4E8EC]">
                  <span>Single-Trip Capacity: <strong className="text-[#18232D]">{team.capacity} pax</strong></span>

                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    {distanceKm !== null && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#8B959E]" />
                        {distanceKm.toFixed(1)} km
                      </span>
                    )}
                    {simulatedEta !== null && (
                      <span className="flex items-center gap-1 font-semibold text-[#375A6B]">
                        <Clock className="w-3 h-3 text-[#375A6B]" />
                        ~{simulatedEta} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
