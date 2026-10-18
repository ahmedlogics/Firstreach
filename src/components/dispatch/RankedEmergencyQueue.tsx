'use client';

import React, { useState, useMemo } from 'react';
import { DbIncident } from '@/lib/dispatch/types';
import { getPriorityTier } from '@/lib/dispatch/priority';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Users,
  Clock,
  HeartPulse,
  AlertOctagon,
  ChevronRight,
  ChevronDown,
  Search,
  Waves,
  Accessibility,
  ShieldAlert,
  CheckCircle2,
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  return (
    <div
      className={`bg-white rounded-xl border border-[#E4E8EC] shadow-subtle p-4 sm:p-5 space-y-3.5 ${className}`}
    >
      {/* Header with Title & Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E8EC]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#18232D] tracking-tight">
              Emergency Queue
            </h3>
            <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-[6px] bg-[#F7F8FA] text-[#18232D] border border-[#E4E8EC] tabular-nums">
              {filteredIncidents.length} of {incidents.length}
            </span>
          </div>
          <p className="text-xs text-[#6B7782] mt-0.5">
            Ranked by priority score, medical criticality, and arrival urgency.
          </p>
        </div>

        {/* Status Filter Tabs (Open / Assigned / All) */}
        <div className="flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-[10px] text-xs font-medium border border-[#E4E8EC]">
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-2.5 py-1 rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterStatus === 'open'
                ? 'bg-white text-[#18232D] font-semibold shadow-subtle'
                : 'text-[#6B7782] hover:text-[#18232D]'
            }`}
          >
            <span>Open</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                filterStatus === 'open' ? 'bg-[#EAF0F4] text-[#375A6B] font-bold' : 'bg-[#E4E8EC] text-[#6B7782]'
              }`}
            >
              {counts.open}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('assigned')}
            className={`px-2.5 py-1 rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterStatus === 'assigned'
                ? 'bg-white text-[#18232D] font-semibold shadow-subtle'
                : 'text-[#6B7782] hover:text-[#18232D]'
            }`}
          >
            <span>Assigned</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                filterStatus === 'assigned' ? 'bg-[#EAF0F4] text-[#375A6B] font-bold' : 'bg-[#E4E8EC] text-[#6B7782]'
              }`}
            >
              {counts.assigned}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white text-[#18232D] font-semibold shadow-subtle'
                : 'text-[#6B7782] hover:text-[#18232D]'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                filterStatus === 'all' ? 'bg-[#EAF0F4] text-[#375A6B] font-bold' : 'bg-[#E4E8EC] text-[#6B7782]'
              }`}
            >
              {counts.total}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B959E]" />
          <input
            type="text"
            placeholder="Search by ID, zone, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-[10px] border border-[#E4E8EC] bg-[#F7F8FA] text-[#18232D] placeholder-[#8B959E] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:bg-white text-xs transition-colors"
          />
        </div>

        {/* Tier Filter */}
        <div className="sm:col-span-3">
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="w-full py-1.5 px-2.5 rounded-[10px] border border-[#E4E8EC] bg-[#F7F8FA] text-[#18232D] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:bg-white text-xs font-medium cursor-pointer transition-colors"
          >
            <option value="all">All Tiers ({counts.total})</option>
            <option value="critical">Critical ({counts.critical})</option>
            <option value="high">High ({counts.high})</option>
            <option value="medium">Medium ({counts.medium})</option>
            <option value="low">Low ({counts.low})</option>
          </select>
        </div>

        {/* Verification Filter */}
        <div className="sm:col-span-3">
          <select
            value={filterVerification}
            onChange={(e) => setFilterVerification(e.target.value)}
            className="w-full py-1.5 px-2.5 rounded-[10px] border border-[#E4E8EC] bg-[#F7F8FA] text-[#18232D] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:bg-white text-xs font-medium cursor-pointer transition-colors"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="conflicting">Conflicting</option>
          </select>
        </div>
      </div>

      {/* Compact Operational Incidents List */}
      <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-12 text-center text-[#6B7782] space-y-2">
            <div className="w-5 h-5 border-2 border-[#375A6B] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Synchronizing emergency queue with database...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-[#E4E8EC] rounded-xl p-6 text-[#6B7782] space-y-1">
            <CheckCircle2 className="w-7 h-7 text-[#8B959E] mx-auto mb-1" />
            <p className="text-xs font-semibold text-[#18232D]">No matching incidents</p>
            <p className="text-[11px] text-[#6B7782]">
              Try adjusting your search terms or filter criteria.
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isSelected = selectedIncident?.id === incident.id;
            const isUnserved = unservedIncidentIds.has(incident.id);
            const isAssigned = incident.status === 'assigned';
            const tier = getPriorityTier(incident.priority_score ?? 0);
            const isExpanded = expandedId === incident.id;
            const shortId = incident.id.length > 10 ? incident.id.slice(0, 8) : incident.id;

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={`relative rounded-[10px] border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#375A6B] bg-[#F7F8FA] shadow-subtle before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#375A6B] before:rounded-r'
                    : isUnserved
                    ? 'border-[#BC414A]/30 bg-[#FBECEE]/40 hover:bg-[#FBECEE]/70'
                    : isAssigned
                    ? 'border-[#E4E8EC] bg-white opacity-75 hover:opacity-100 hover:bg-[#F7F8FA]'
                    : 'border-[#E4E8EC] bg-white hover:bg-[#FAFBFD] hover:border-[#CBD5E1]'
                }`}
              >
                {/* Main Compact Row */}
                <div className="p-3">
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-3 gap-y-1.5">
                    {/* Left: ID & Key Urgency */}
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border shrink-0 ${
                          isSelected
                            ? 'border-[#375A6B] bg-[#375A6B] text-white'
                            : 'border-[#CBD5E1] bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1 h-1 rounded-full bg-white" />}
                      </div>

                      <span className="font-mono text-xs font-semibold text-[#18232D]">
                        {shortId}
                      </span>

                      <PriorityBadge score={incident.priority_score ?? 0} size="sm" />

                      {incident.medical_urgent && (
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25 text-[10px] font-semibold"
                          title="Urgent medical assistance required"
                        >
                          <HeartPulse className="w-3 h-3 text-[#BC414A]" />
                          <span>Medical</span>
                        </span>
                      )}

                      {isUnserved && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25">
                          <AlertOctagon className="w-3 h-3 text-[#BC414A]" />
                          <span>Deficit</span>
                        </span>
                      )}
                    </div>

                    {/* Right: People Count, Status & Expand */}
                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-[#18232D] tabular-nums">
                        <Users className="w-3 h-3 text-[#6B7782]" />
                        {incident.people_count ?? 1} pax
                      </span>

                      <StatusBadge status={incident.status} size="sm" />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : incident.id);
                        }}
                        className="p-1 rounded text-[#8B959E] hover:text-[#18232D] hover:bg-[#E4E8EC] transition-colors"
                        title={isExpanded ? 'Hide details' : 'Show details'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Supporting Sub-Row: Verification, Harm Window, Short Description Preview */}
                  <div className="flex items-center justify-between text-[11px] text-[#6B7782] pt-1.5 mt-1.5 border-t border-[#E4E8EC]/60">
                    <div className="flex items-center gap-2 truncate">
                      <span className="capitalize">{incident.verification_status}</span>
                      <span className="text-[#8B959E]">•</span>
                      <span className="truncate text-[#18232D]">
                        {incident.details || incident.priority_reason || 'Incident reported in flood sector.'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 font-mono tabular-nums ml-2">
                      <Clock className="w-3 h-3 text-[#8B959E]" />
                      {incident.minutes_to_harm !== null ? (
                        <span
                          className={
                            incident.minutes_to_harm <= 30
                              ? 'text-[#BC414A] font-semibold'
                              : incident.minutes_to_harm <= 60
                              ? 'text-[#A87528] font-medium'
                              : 'text-[#6B7782]'
                          }
                        >
                          ~{incident.minutes_to_harm}m window
                        </span>
                      ) : (
                        <span className="text-[#8B959E] italic">Unconfirmed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Details Accordion Panel */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-[#E4E8EC] bg-[#F7F8FA] rounded-b-[10px] space-y-2 text-xs text-[#18232D]">
                    {incident.priority_reason && (
                      <div className="p-2 rounded-[6px] bg-white border border-[#E4E8EC] text-[11px] text-[#6B7782] leading-relaxed">
                        <strong className="text-[#18232D]">Triage Rationale: </strong>
                        {incident.priority_reason}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-white border border-[#E4E8EC] text-[#18232D]">
                        <Waves className="w-3 h-3 text-[#375A6B]" />
                        Flood Level: {incident.flood_severity ?? 0}/3
                      </span>

                      {incident.mobility_help && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#FFF4E3] text-[#A87528] border border-[#A87528]/25 font-medium">
                          <Accessibility className="w-3 h-3 text-[#A87528]" />
                          Mobility Assistance Required
                        </span>
                      )}

                      {incident.verification_status === 'conflicting' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#FFF4E3] text-[#A87528] border border-[#A87528]/25 font-medium">
                          <ShieldAlert className="w-3 h-3 text-[#A87528]" />
                          Conflicting Field Reports
                        </span>
                      )}

                      {incident.lat && incident.lng && (
                        <span className="font-mono text-[#8B959E]">
                          Coords: {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
