'use client';

import React, { useState } from 'react';
import { DbIncident, DbRescueTeam } from '@/lib/dispatch/types';
import { calculateDistanceKm, estimateArrivalMinutes, formatPkr } from '@/lib/dispatch/cost';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  LifeBuoy,
  Truck,
  Anchor,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Radio,
  Coins,
  Shield,
  Layers,
  Users,
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
        return <Anchor className="w-4 h-4 text-[#536A82]" />;
      case 'vehicle':
        return <Truck className="w-4 h-4 text-[#252A30]" />;
      case 'medical':
        return <LifeBuoy className="w-4 h-4 text-[#B74349]" />;
      default:
        return <LifeBuoy className="w-4 h-4 text-[#536A82]" />;
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
      className={`bg-white rounded-2xl border border-[#E8E6E1] shadow-sm p-5 sm:p-6 space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E6E1]">
        <div>
          <h3 className="text-base font-bold text-[#252A30] tracking-tight">
            Rescue Fleet & Resource Assets
          </h3>
          <p className="text-xs text-[#757B81]">
            Fleet readiness, single-team capacities & rate parameters.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#E5EEE8] text-[#377D65] border border-[#377D65]/20">
            {availableCount} Ready
          </span>
          {busyCount > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#FFF2DD] text-[#A87426] border border-[#A87426]/20">
              {busyCount} Engaged
            </span>
          )}
        </div>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex items-center gap-1 bg-[#F7F6F2] p-1 rounded-lg text-xs font-semibold border border-[#E8E6E1]">
        {[
          { label: 'All Craft', val: 'all' },
          { label: 'Boats', val: 'boat' },
          { label: 'Vehicles', val: 'vehicle' },
          { label: 'Medical', val: 'medical' },
        ].map(({ label, val }) => (
          <button
            key={val}
            onClick={() => setFilterType(val)}
            className={`px-2.5 py-1 rounded-md capitalize transition-all ${
              filterType === val
                ? 'bg-white text-[#252A30] font-bold shadow-2xs'
                : 'text-[#757B81] hover:text-[#252A30]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-8 text-center text-[#757B81] space-y-2">
            <div className="w-5 h-5 border-2 border-[#536A82] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading fleet telemetry...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#757B81] border border-dashed border-[#E8E6E1] rounded-xl">
            No rescue teams found matching filter.
          </div>
        ) : (
          filteredTeams.map((team) => {
            const isSelected = selectedTeamId === team.id;
            const isBusy = team.status !== 'available';

            // Calculate dynamic distance and simulated ETA to selected incident if coordinates exist
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
                className={`p-4 rounded-xl border transition-all ${
                  isBusy
                    ? 'border-[#E8E6E1] bg-[#F7F6F2]/70 opacity-70 cursor-not-allowed'
                    : isSelected
                    ? 'border-[#536A82] bg-[#EDF1F5]/40 ring-1 ring-[#536A82] cursor-pointer shadow-sm'
                    : 'border-[#E8E6E1] bg-white hover:border-[#D5D2CA] hover:bg-[#F7F6F2]/50 cursor-pointer shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl border border-[#E8E6E1] bg-[#F7F6F2] shadow-2xs">
                      {getTeamIcon(team.team_type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#252A30]">{team.name}</h4>
                      <p className="text-[10px] font-mono text-[#757B81] uppercase">
                        Type: {team.team_type} • ID: {team.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={team.status} size="sm" />
                </div>

                {/* Capabilities Chips */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {team.capabilities && team.capabilities.length > 0 ? (
                    team.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#F7F6F2] text-[#252A30] font-medium border border-[#E8E6E1]"
                      >
                        {cap}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-[#92979D] italic">
                      Standard evacuation gear
                    </span>
                  )}
                </div>

                {/* Metrics: Capacity, Rate Parameters, Distance/Simulated ETA */}
                <div className="flex flex-wrap items-center justify-between pt-2.5 mt-2.5 border-t border-[#E8E6E1] text-xs">
                  <span className="text-[#757B81] flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-[#92979D]" />
                    Capacity: <strong className="text-[#252A30]">{team.capacity} pax</strong>
                  </span>

                  <div className="flex items-center gap-2 font-mono tabular-nums text-[11px]">
                    {distanceKm !== null ? (
                      <span className="text-[#536A82] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#536A82]" />
                        Simulated ETA: ~{simulatedEta}m ({distanceKm} km)
                      </span>
                    ) : (
                      <span className="text-[#757B81]">
                        Base: {formatPkr(Number(team.fixed_cost) || 0)} (+{formatPkr(Number(team.cost_per_km) || 0)}/km)
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
