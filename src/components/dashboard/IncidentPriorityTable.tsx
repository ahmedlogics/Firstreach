'use client';

import React, { useState, useMemo } from 'react';
import { DbIncident } from '@/lib/dashboard/types';
import { DataTableWrapper } from '@/components/shared/DataTableWrapper';
import { SearchAndFilterBar } from '@/components/shared/SearchAndFilterBar';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { IncidentDetailDrawer } from './IncidentDetailDrawer';
import { formatFloodSeverity, getPriorityTier } from '@/lib/dashboard/helpers';
import {
  ArrowUpDown,
  ExternalLink,
  Users,
  Clock,
  ArrowRight,
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

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Compact Search and Filter Bar */}
      <SearchAndFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Filter by zone, ID, or caller note..."
        totalResults={filteredIncidents.length}
        onReset={() => {
          setSearch('');
          setSeverityFilter('all');
          setVerificationFilter('all');
          setStatusFilter('all');
        }}
        filters={[
          {
            id: 'priority_tier',
            label: 'Priority',
            value: severityFilter,
            options: [
              { label: 'All Tiers', value: 'all' },
              { label: 'Critical (≥80)', value: 'critical' },
              { label: 'High (60-79)', value: 'high' },
              { label: 'Medium (40-59)', value: 'medium' },
            ],
            onChange: setSeverityFilter,
          },
          {
            id: 'verification',
            label: 'Verification',
            value: verificationFilter,
            options: [
              { label: 'All', value: 'all' },
              { label: 'Verified', value: 'verified' },
              { label: 'Unverified', value: 'unverified' },
            ],
            onChange: setVerificationFilter,
          },
          {
            id: 'status',
            label: 'State',
            value: statusFilter,
            options: [
              { label: 'All States', value: 'all' },
              { label: 'Open', value: 'open' },
              { label: 'Assigned', value: 'assigned' },
              { label: 'In Progress', value: 'in_progress' },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Incident Data Table */}
      <DataTableWrapper
        footer={
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 py-0.5">
            <span>
              {filteredIncidents.length} of {incidents.length} emergency incidents
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Sorted by: {sortField.replace('_', ' ')}
            </span>
          </div>
        }
      >
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="py-2.5 px-3">Identifier</th>
            <th className="py-2.5 px-3">Sector</th>
            <th
              className="py-2.5 px-3 cursor-pointer hover:text-slate-800 transition-colors"
              onClick={() => handleSort('people_count')}
            >
              <div className="flex items-center gap-1">
                <span>People</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="py-2.5 px-3 cursor-pointer hover:text-slate-800 transition-colors"
              onClick={() => handleSort('priority_score')}
            >
              <div className="flex items-center gap-1 text-[#14B8A6]">
                <span>Priority</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="py-2.5 px-3 cursor-pointer hover:text-slate-800 transition-colors"
              onClick={() => handleSort('minutes_to_harm')}
            >
              <div className="flex items-center gap-1">
                <span>Time-To-Harm</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-2.5 px-3">Verification</th>
            <th className="py-2.5 px-3">Status</th>
            <th className="py-2.5 px-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] text-xs">
          {filteredIncidents.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-6 text-center text-slate-500">
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
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => setActiveIncident(incident)}
                >
                  {/* Clean Non-Truncated ID with Full Tooltip */}
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    <span
                      title={`Full Database UUID: ${incident.id}`}
                      className="cursor-help inline-flex items-center gap-1.5"
                    >
                      {isCritical && (
                        <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0" />
                      )}
                      <span>{formattedId}</span>
                    </span>
                  </td>

                  {/* Sector & Details */}
                  <td className="py-2.5 px-3 max-w-[140px] truncate">
                    <strong className="text-slate-800 font-semibold block truncate">
                      {incident.zone_name || 'Unassigned'}
                    </strong>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {incident.details || 'No caller note'}
                    </span>
                  </td>

                  {/* People */}
                  <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{incident.people_count}</span>
                    </div>
                  </td>

                  {/* Priority Badge */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <PriorityBadge score={incident.priority_score} size="sm" />
                  </td>

                  {/* Time to Harm */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {incident.minutes_to_harm !== null ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                          incident.minutes_to_harm <= 30
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{incident.minutes_to_harm}m</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">—</span>
                    )}
                  </td>

                  {/* Verification */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge status={incident.verification_status} size="sm" />
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge status={incident.status} size="sm" />
                  </td>

                  {/* View Details Action */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIncident(incident);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-[#14B8A6] hover:text-white text-slate-700 transition-colors shadow-2xs"
                    >
                      <span>View Details</span>
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
