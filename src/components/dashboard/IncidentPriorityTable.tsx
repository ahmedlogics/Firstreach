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
  HeartPulse,
  Flame,
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
    <div className={`space-y-3.5 ${className}`}>
      {/* Search and Dynamic Filter Bar */}
      <SearchAndFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search incident ID, zone, or caller details..."
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
              { label: 'Low (<40)', value: 'low' },
            ],
            onChange: setSeverityFilter,
          },
          {
            id: 'verification',
            label: 'Verification',
            value: verificationFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Verified', value: 'verified' },
              { label: 'Unverified', value: 'unverified' },
              { label: 'Conflicting', value: 'conflicting' },
            ],
            onChange: setVerificationFilter,
          },
          {
            id: 'status',
            label: 'Dispatch State',
            value: statusFilter,
            options: [
              { label: 'All States', value: 'all' },
              { label: 'Open', value: 'open' },
              { label: 'Assigned', value: 'assigned' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Resolved', value: 'resolved' },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Incident Data Table */}
      <DataTableWrapper
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Showing {filteredIncidents.length} of {incidents.length} recorded emergency incidents • Persisted in Supabase
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Ordered by: {sortField} ({sortOrder.toUpperCase()})
            </span>
          </div>
        }
      >
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3 px-4">Incident ID</th>
            <th className="py-3 px-4">Zone & Details</th>
            <th
              className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
              onClick={() => handleSort('people_count')}
            >
              <div className="flex items-center gap-1">
                <span>People</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3 px-4">Flood Severity</th>
            <th
              className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
              onClick={() => handleSort('priority_score')}
            >
              <div className="flex items-center gap-1 text-[#14B8A6]">
                <span>Priority Score</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th
              className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
              onClick={() => handleSort('minutes_to_harm')}
            >
              <div className="flex items-center gap-1">
                <span>Time To Harm</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3 px-4">Verification</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] text-xs">
          {filteredIncidents.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-8 text-center text-slate-500">
                No incidents match the selected query criteria.
              </td>
            </tr>
          ) : (
            filteredIncidents.map((incident) => {
              const severityMeta = formatFloodSeverity(incident.flood_severity);
              const isCritical = incident.priority_score >= 80;

              return (
                <tr
                  key={incident.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => setActiveIncident(incident)}
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      {isCritical && (
                        <span className="w-2 h-2 rounded-full bg-[#F16D70] animate-ping" />
                      )}
                      <span>{incident.id.slice(0, 8)}...</span>
                    </div>
                  </td>

                  {/* Zone & Details */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-semibold text-slate-900 truncate">
                      {incident.zone_name || 'Unassigned Zone'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {incident.details || 'No details provided'}
                    </p>
                  </td>

                  {/* People */}
                  <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-slate-800">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{incident.people_count}</span>
                    </div>
                  </td>

                  {/* Flood Severity */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`text-[11px] ${severityMeta.colorClass}`}>
                      {severityMeta.label}
                    </span>
                  </td>

                  {/* Priority Score (Database Persisted) */}
                  <td className="py-3.5 px-4">
                    <PriorityBadge score={incident.priority_score} size="sm" />
                  </td>

                  {/* Minutes to harm */}
                  <td className="py-3.5 px-4 font-mono tabular-nums">
                    {incident.minutes_to_harm !== null ? (
                      <span className={incident.minutes_to_harm <= 30 ? 'text-red-600 font-bold' : 'text-slate-600'}>
                        {incident.minutes_to_harm} min
                      </span>
                    ) : (
                      <span className="text-slate-400">Unknown</span>
                    )}
                  </td>

                  {/* Verification */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={incident.verification_status} size="sm" />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={incident.status} size="sm" />
                  </td>

                  {/* Details Button */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIncident(incident);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-[#14B8A6] hover:text-white text-slate-700 transition-colors"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
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
