'use client';

import React, { useState, useMemo } from 'react';
import { DbIncident, PriorityTier } from '@/lib/dispatch/types';
import { getPriorityTier } from '@/lib/dispatch/priority';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Flame,
  Users,
  Clock,
  HeartPulse,
  AlertOctagon,
  ChevronRight,
  Filter,
  Search,
  Waves,
  Accessibility,
  ShieldAlert,
  CheckCircle2,
  CheckCircle,
  Radio,
  Eye,
} from 'lucide-react';

interface RankedEmergencyQueueProps {
  incidents: DbIncident[];
  selectedIncident: DbIncident | null;
  onSelectIncident: (incident: DbIncident) => void;
  unservedIncidentIds?: Set<string>;
  isLoading?: boolean;
  className?: string;
}

export function RankedEmergencyQueue({
  incidents,
  selectedIncident,
  onSelectIncident,
  unservedIncidentIds = new Set(),
  isLoading = false,
  className = '',
}: RankedEmergencyQueueProps) {
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterVerification, setFilterVerification] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'assigned'>('open');
  const [searchQuery, setSearchQuery] = useState('');

  // Live count calculations for filter badges
  const counts = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter((i) => i.status === 'open').length;
    const assigned = incidents.filter((i) => i.status === 'assigned').length;

    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    for (const inc of incidents) {
      const tier = getPriorityTier(inc.priority_score ?? 0);
      if (tier === 'critical') critical++;
      else if (tier === 'high') high++;
      else if (tier === 'medium') medium++;
      else low++;
    }

    return { total, open, assigned, critical, high, medium, low };
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        // Status filter
        if (filterStatus === 'open' && inc.status !== 'open') return false;
        if (filterStatus === 'assigned' && inc.status !== 'assigned') return false;

        // Tier filter
        const tier = getPriorityTier(inc.priority_score ?? 0);
        if (filterTier !== 'all' && tier !== filterTier) return false;

        // Verification filter
        if (filterVerification !== 'all' && inc.verification_status !== filterVerification) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = inc.id.toLowerCase().includes(q);
          const matchDetails = (inc.details || '').toLowerCase().includes(q);
          const matchReason = (inc.priority_reason || '').toLowerCase().includes(q);
          if (!matchId && !matchDetails && !matchReason) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Life-First Sorting: Priority Score descending, then shortest minutes_to_harm
        if ((b.priority_score ?? 0) !== (a.priority_score ?? 0)) {
          return (b.priority_score ?? 0) - (a.priority_score ?? 0);
        }
        const timeA = a.minutes_to_harm ?? 9999;
        const timeB = b.minutes_to_harm ?? 9999;
        return timeA - timeB;
      });
  }, [incidents, filterTier, filterVerification, filterStatus, searchQuery]);

  const getTierAccentColor = (score: number) => {
    const tier = getPriorityTier(score);
    switch (tier) {
      case 'critical':
        return 'border-l-4 border-l-[#F16D70]';
      case 'high':
        return 'border-l-4 border-l-[#F5B544]';
      case 'medium':
        return 'border-l-4 border-l-blue-500';
      case 'low':
        return 'border-l-4 border-l-emerald-500';
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-card p-5 sm:p-6 space-y-4 ${className}`}
    >
      {/* Header with Title & Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Ranked Emergency Queue
            </h3>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredIncidents.length} of {incidents.length}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Prioritized by threat severity, urgent medical criteria, and time-to-harm.
          </p>
        </div>

        {/* Status Filter Tabs (Open / Assigned / All) with Live Badges */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${filterStatus === 'open'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <span>Open</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${filterStatus === 'open' ? 'bg-teal-50 text-teal-700 font-bold' : 'bg-slate-200 text-slate-600'
                }`}
            >
              {counts.open}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('assigned')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${filterStatus === 'assigned'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <span>Assigned</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${filterStatus === 'assigned' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-slate-200 text-slate-600'
                }`}
            >
              {counts.assigned}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${filterStatus === 'all' ? 'bg-slate-200 text-slate-800 font-bold' : 'bg-slate-200 text-slate-600'
                }`}
            >
              {counts.total}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by ID, details, or symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:bg-white text-xs"
          />
        </div>

        {/* Tier filter */}
        <div className="sm:col-span-3">
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:bg-white text-xs font-medium"
          >
            <option value="all">All Tiers ({counts.total})</option>
            <option value="critical">Critical ({counts.critical})</option>
            <option value="high">High ({counts.high})</option>
            <option value="medium">Medium ({counts.medium})</option>
            <option value="low">Low ({counts.low})</option>
          </select>
        </div>

        {/* Verification filter */}
        <div className="sm:col-span-3">
          <select
            value={filterVerification}
            onChange={(e) => setFilterVerification(e.target.value)}
            className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/40 focus:bg-white text-xs font-medium"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="conflicting">Conflicting</option>
          </select>
        </div>
      </div>

      {/* Incidents List with Scroll */}
      <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Synchronizing emergency queue with database...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl p-6 text-slate-400 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-600">No matching incidents found</p>
            <p className="text-[11px] text-slate-400">
              Try adjusting your filter criteria or status options.
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isSelected = selectedIncident?.id === incident.id;
            const isUnserved = unservedIncidentIds.has(incident.id);
            const isAssigned = incident.status === 'assigned';
            const tier = getPriorityTier(incident.priority_score ?? 0);
            const tierAccent = getTierAccentColor(incident.priority_score ?? 0);

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${tierAccent} ${isSelected
                    ? 'border-[#14B8A6] bg-gradient-to-r from-teal-50/70 to-teal-50/30 ring-2 ring-[#14B8A6]/40 shadow-card-hover'
                    : isUnserved
                      ? 'border-red-300 bg-red-50/30 hover:bg-red-50/60 shadow-2xs'
                      : isAssigned
                        ? 'border-blue-200 bg-blue-50/20 hover:bg-blue-50/40 opacity-85'
                        : 'border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300 shadow-2xs'
                  }`}
              >
                {/* Header row: ID, Priority, Statuses */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Selection radio visual indicator */}
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${isSelected
                          ? 'border-[#14B8A6] bg-[#14B8A6] text-white'
                          : 'border-slate-300 bg-white'
                        }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <span className="font-mono text-xs font-extrabold text-slate-900">
                      {incident.id.length > 12 ? `${incident.id.slice(0, 8)}...` : incident.id}
                    </span>

                    <PriorityBadge score={incident.priority_score ?? 0} size="sm" />

                    <span className="capitalize text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      Tier: {tier}
                    </span>

                    {isUnserved && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                        <AlertOctagon className="w-3 h-3 text-red-600" />
                        Deficit
                      </span>
                    )}

                    {isSelected && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-teal-600 text-white animate-in fade-in">
                        INSPECTING
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={incident.status} size="sm" />
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${incident.verification_status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : incident.verification_status === 'conflicting'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {incident.verification_status}
                    </span>
                  </div>
                </div>

                {/* Details & Rationale */}
                <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-medium">
                  {incident.details || incident.priority_reason || 'Emergency rescue report logged in flood inundation zone.'}
                </p>

                {/* Factors Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    <Waves className="w-3 h-3 text-blue-500" />
                    Flood Level {incident.flood_severity ?? 0}/3
                  </span>

                  {incident.medical_urgent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                      <HeartPulse className="w-3 h-3 text-red-500" />
                      Medical Alert
                    </span>
                  )}

                  {incident.mobility_help && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      <Accessibility className="w-3 h-3 text-amber-500" />
                      Mobility Assistance
                    </span>
                  )}

                  {incident.verification_status === 'conflicting' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      <ShieldAlert className="w-3 h-3 text-purple-600" />
                      Conflicting Reports
                    </span>
                  )}
                </div>

                {/* Tags & Urgency Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {incident.people_count ?? 1} persons needing rescue
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {incident.minutes_to_harm !== null ? (
                      <span
                        className={
                          incident.minutes_to_harm <= 30
                            ? 'text-red-600 font-bold'
                            : incident.minutes_to_harm <= 60
                              ? 'text-amber-600 font-semibold'
                              : 'text-slate-600'
                        }
                      >
                        ~{incident.minutes_to_harm}m before critical harm
                      </span>
                    ) : (
                      <span className="text-amber-700 italic">
                        Time-to-harm unconfirmed
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 ml-1 transition-transform ${isSelected ? 'translate-x-1 text-[#14B8A6]' : 'text-slate-400'
                        }`}
                    />
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
