'use client';

import React, { useState, useMemo } from 'react';
import { DbIncident } from '@/lib/dashboard/types';
import { DataTableWrapper } from '@/components/shared/DataTableWrapper';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { IncidentDetailDrawer } from './IncidentDetailDrawer';
import { getPriorityTier } from '@/lib/dashboard/helpers';
import {
  ArrowUpDown,
  Search,
  X,
  ChevronDown,
  Users,
  Clock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface IncidentPriorityTableProps {
  incidents: DbIncident[];
  onForwardToDispatch?: (incident: DbIncident) => void;
  className?: string;
}

export function IncidentPriorityTable({
  incidents,
  onForwardToDispatch,
  className = '',
}: IncidentPriorityTableProps) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<'priority_score' | 'minutes_to_harm' | 'people_count'>('priority_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeIncident, setActiveIncident] = useState<DbIncident | null>(null);

  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        const matchesSearch =
          search === '' ||
          inc.id.toLowerCase().includes(search.toLowerCase()) ||
          (inc.zone_name && inc.zone_name.toLowerCase().includes(search.toLowerCase())) ||
          (inc.details && inc.details.toLowerCase().includes(search.toLowerCase()));

        const { tier } = getPriorityTier(inc.priority_score);
        const matchesSeverity = severityFilter === 'all' || tier.toLowerCase() === severityFilter.toLowerCase();
        const matchesVerification = verificationFilter === 'all' || inc.verification_status === verificationFilter;
        const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;

        return matchesSearch && matchesSeverity && matchesVerification && matchesStatus;
      })
      .sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        if (sortField === 'priority_score') return (a.priority_score - b.priority_score) * factor;
        if (sortField === 'minutes_to_harm') {
          const aVal = a.minutes_to_harm ?? 9999;
          const bVal = b.minutes_to_harm ?? 9999;
          return (aVal - bVal) * factor;
        }
        if (sortField === 'people_count') return (a.people_count - b.people_count) * factor;
        return 0;
      });
  }, [incidents, search, severityFilter, verificationFilter, statusFilter, sortField, sortOrder]);

  const handleSort = (field: 'priority_score' | 'minutes_to_harm' | 'people_count') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const hasActiveFilters = Boolean(search || severityFilter !== 'all' || verificationFilter !== 'all' || statusFilter !== 'all');

  return (
    <div className={`space-y-2.5 w-full min-w-0 max-w-full overflow-hidden ${className}`}>
      {/* Compact dedicated toolbar */}
      <div className="space-y-2 w-full min-w-0">
        {/* Full-width Search Input */}
        <div className="relative w-full min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5F6B7A] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sector, ID, or situation notes..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg text-[#18232D] placeholder:text-[#5F6B7A] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:bg-white transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5F6B7A] hover:text-[#18232D] p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3 Compact Filter Dropdowns */}
        <div className="grid grid-cols-3 gap-1.5 w-full min-w-0">
          {/* Priority Filter */}
          <div className="relative w-full min-w-0">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full appearance-none pl-2 pr-5 py-1.5 text-[11px] font-semibold bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg text-[#18232D] hover:bg-[#F0F4F8] focus:outline-none focus:ring-1 focus:ring-[#375A6B] cursor-pointer truncate"
              title="Filter by priority tier"
            >
              <option value="all">Priority: All</option>
              <option value="critical">Critical (≥80)</option>
              <option value="high">High (60-79)</option>
              <option value="medium">Medium (40-59)</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5F6B7A] pointer-events-none" />
          </div>

          {/* Verification Filter */}
          <div className="relative w-full min-w-0">
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full appearance-none pl-2 pr-5 py-1.5 text-[11px] font-semibold bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg text-[#18232D] hover:bg-[#F0F4F8] focus:outline-none focus:ring-1 focus:ring-[#375A6B] cursor-pointer truncate"
              title="Filter by verification state"
            >
              <option value="all">Verify: All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5F6B7A] pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative w-full min-w-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none pl-2 pr-5 py-1.5 text-[11px] font-semibold bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg text-[#18232D] hover:bg-[#F0F4F8] focus:outline-none focus:ring-1 focus:ring-[#375A6B] cursor-pointer truncate"
              title="Filter by dispatch state"
            >
              <option value="all">State: All</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5F6B7A] pointer-events-none" />
          </div>
        </div>

        {/* Filter status / active reset bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-[11px] text-[#5F6B7A] px-0.5">
            <span>{filteredIncidents.length} matching incidents</span>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSeverityFilter('all');
                setVerificationFilter('all');
                setStatusFilter('all');
              }}
              className="text-[#BC414A] hover:underline font-medium text-[11px] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Incident Data Table */}
      <DataTableWrapper
        footer={
          <div className="flex items-center justify-between text-xs text-[#5F6B7A] px-1 py-0.5">
            <span>
              {filteredIncidents.length} of {incidents.length} emergencies
            </span>
            <span className="font-mono text-[11px] text-[#5F6B7A]">
              Sorted by: {sortField.replace('_', ' ')}
            </span>
          </div>
        }
      >
        <thead>
          <tr className="border-b border-[#E4E8EC] bg-[#F7F8FA] text-[10px] font-bold uppercase tracking-wider text-[#5F6B7A]">
            <th className="py-2 px-2.5">Incident & Sector</th>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-[#18232D] transition-colors"
              onClick={() => handleSort('priority_score')}
            >
              <div className="flex items-center gap-1 text-[#375A6B]">
                <span>Severity</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-[#18232D] transition-colors"
              onClick={() => handleSort('people_count')}
            >
              <div className="flex items-center gap-1">
                <span>People</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="py-2 px-2.5 cursor-pointer hover:text-[#18232D] transition-colors"
              onClick={() => handleSort('minutes_to_harm')}
            >
              <div className="flex items-center gap-1">
                <span>Time Urgency</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-2 px-2.5">Verification</th>
            <th className="py-2 px-2.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E4E8EC] text-xs">
          {filteredIncidents.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-[#5F6B7A]">
                No incidents match current filter criteria.
              </td>
            </tr>
          ) : (
            filteredIncidents.map((incident) => {
              const formattedId = `INC-${incident.id.slice(0, 8).toUpperCase()}`;
              const isCritical = incident.priority_score >= 80;

              return (
                <tr
                  key={incident.id}
                  className="hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                  onClick={() => setActiveIncident(incident)}
                >
                  {/* Incident ID & Location (Showing Uncertainty if unassigned) */}
                  <td className="py-2 px-2.5 min-w-[140px] max-w-[200px]">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-[#18232D]">
                      {isCritical && (
                        <span className="w-2 h-2 rounded-full bg-[#BC414A] shrink-0" />
                      )}
                      <span>{formattedId}</span>
                    </div>
                    <div className="text-[11px] font-medium text-[#18232D] truncate mt-0.5">
                      {incident.zone_name ? (
                        <span>{incident.zone_name}</span>
                      ) : (
                        <span className="text-[#A87528] italic flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          <span>Location Pending</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Severity Badge */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <PriorityBadge score={incident.priority_score} size="sm" />
                  </td>

                  {/* People */}
                  <td className="py-2 px-2.5 font-mono tabular-nums font-semibold text-[#18232D] whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#5F6B7A]" />
                      <span>{incident.people_count}</span>
                    </div>
                  </td>

                  {/* Time Urgency (Displaying Uncertainty honestly if null) */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    {incident.minutes_to_harm !== null ? (
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold ${
                          incident.minutes_to_harm <= 30
                            ? 'bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/30'
                            : 'bg-[#F7F8FA] text-[#18232D] border border-[#E4E8EC]'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{incident.minutes_to_harm}m</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-[#5F6B7A] bg-[#F7F8FA] px-1.5 py-0.5 rounded border border-[#E4E8EC]" title="Time to harm not yet calculated">
                        — (Assessing)
                      </span>
                    )}
                  </td>

                  {/* Verification */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <StatusBadge status={incident.verification_status} size="sm" />
                  </td>

                  {/* View Details Action */}
                  <td className="py-2 px-2.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIncident(incident);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F0F4F8] hover:bg-[#375A6B] hover:text-white text-[#18232D] transition-colors cursor-pointer"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </DataTableWrapper>

      {/* Slide-out details drawer */}
      <IncidentDetailDrawer
        incident={activeIncident}
        isOpen={Boolean(activeIncident)}
        onClose={() => setActiveIncident(null)}
        onDispatchClick={onForwardToDispatch}
      />
    </div>
  );
}
