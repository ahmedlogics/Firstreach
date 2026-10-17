'use client';

import React, { useState, useMemo } from 'react';
import { EmergencyIncident, SeverityLevel } from '@/lib/types';
import { MOCK_INCIDENTS } from '@/lib/mock-data';
import { DataTableWrapper } from '@/components/shared/DataTableWrapper';
import { SearchAndFilterBar } from '@/components/shared/SearchAndFilterBar';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { IncidentDetailDrawer } from './IncidentDetailDrawer';
import { formatTimeUrgency } from '@/lib/utils';
import {
  ArrowUpDown,
  ExternalLink,
  Users,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flame,
} from 'lucide-react';

interface EmergencyPriorityTableProps {
  onSelectIncidentForDispatch?: (incident: EmergencyIncident) => void;
  className?: string;
}

export function EmergencyPriorityTable({
  onSelectIncidentForDispatch,
  className = '',
}: EmergencyPriorityTableProps) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortField, setSortField] = useState<'priorityScore' | 'timeUrgencyHours' | 'affectedPeople'>('priorityScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);

  // Filter & sort logic
  const filteredIncidents = useMemo(() => {
    return MOCK_INCIDENTS.filter((inc) => {
      const matchesSearch =
        search === '' ||
        inc.id.toLowerCase().includes(search.toLowerCase()) ||
        inc.zoneName.toLowerCase().includes(search.toLowerCase()) ||
        inc.locationDescription.toLowerCase().includes(search.toLowerCase());

      const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
      const matchesVerification =
        verificationFilter === 'all' || inc.verificationStatus === verificationFilter;

      return matchesSearch && matchesSeverity && matchesVerification;
    }).sort((a, b) => {
      const factor = sortOrder === 'asc' ? 1 : -1;
      if (sortField === 'priorityScore') return (a.priorityScore - b.priorityScore) * factor;
      if (sortField === 'timeUrgencyHours') return (a.timeUrgencyHours - b.timeUrgencyHours) * factor;
      if (sortField === 'affectedPeople') return (a.affectedPeople - b.affectedPeople) * factor;
      return 0;
    });
  }, [search, severityFilter, verificationFilter, sortField, sortOrder]);

  const handleSort = (field: 'priorityScore' | 'timeUrgencyHours' | 'affectedPeople') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Search and Filters */}
      <SearchAndFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search incident ID, zone, or caller description..."
        totalResults={filteredIncidents.length}
        onReset={() => {
          setSearch('');
          setSeverityFilter('all');
          setVerificationFilter('all');
        }}
        filters={[
          {
            id: 'severity',
            label: 'Severity',
            value: severityFilter,
            options: [
              { label: 'All Severities', value: 'all' },
              { label: 'Critical', value: 'critical' },
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
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
              { label: 'Pending', value: 'pending_verification' },
            ],
            onChange: setVerificationFilter,
          },
        ]}
      />

      {/* Incident Data Table */}
      <DataTableWrapper
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Showing {filteredIncidents.length} prioritized emergency queues • Prioritized by life threat & time-to-harm
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Sorted by: {sortField} ({sortOrder.toUpperCase()})
            </span>
          </div>
        }
      >
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3 px-4">Incident ID</th>
            <th className="py-3 px-4">Location / Zone</th>
            <th
              className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
              onClick={() => handleSort('affectedPeople')}
            >
              <div className="flex items-center gap-1">
                <span>People</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3 px-4">Severity</th>
            <th
              className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
              onClick={() => handleSort('priorityScore')}
            >
              <div className="flex items-center gap-1">
                <span>Priority Score</span>
                <ArrowUpDown className="w-3 h-3 text-[#14B8A6]" />
              </div>
            </th>
            <th className="py-3 px-4">Verification</th>
            <th
              className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
              onClick={() => handleSort('timeUrgencyHours')}
            >
              <div className="flex items-center gap-1">
                <span>Time Urgency</span>
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </th>
            <th className="py-3 px-4">Dispatch Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] text-xs">
          {filteredIncidents.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-8 text-center text-slate-500">
                No emergency incidents match current query filters.
              </td>
            </tr>
          ) : (
            filteredIncidents.map((incident) => {
              const isCritical = incident.severity === 'critical';
              const isUnserved = incident.status === 'unserved';

              return (
                <tr
                  key={incident.id}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    isUnserved ? 'bg-red-50/30' : ''
                  }`}
                  onClick={() => setActiveIncident(incident)}
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      {isCritical && (
                        <span className="w-2 h-2 rounded-full bg-[#F16D70] animate-ping" />
                      )}
                      <span>{incident.id}</span>
                    </div>
                  </td>

                  {/* Zone & Location Description */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-semibold text-slate-900 truncate">
                      {incident.zoneName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {incident.locationDescription}
                    </p>
                  </td>

                  {/* Affected Count */}
                  <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-slate-800">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{incident.affectedPeople}</span>
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      status={incident.severity}
                      variant="severity"
                      severity={incident.severity}
                      size="sm"
                    />
                  </td>

                  {/* Priority Score */}
                  <td className="py-3.5 px-4">
                    <PriorityBadge score={incident.priorityScore} size="sm" />
                  </td>

                  {/* Verification */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={incident.verificationStatus} size="sm" />
                  </td>

                  {/* Time Urgency */}
                  <td className="py-3.5 px-4 font-mono tabular-nums">
                    <span className={`font-semibold ${
                      incident.timeUrgencyHours <= 1.5 ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {formatTimeUrgency(incident.timeUrgencyHours)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={incident.status} size="sm" />
                  </td>

                  {/* Action */}
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

      {/* Incident Detail Drawer */}
      <IncidentDetailDrawer
        incident={activeIncident}
        isOpen={Boolean(activeIncident)}
        onClose={() => setActiveIncident(null)}
        onDispatchClick={onSelectIncidentForDispatch}
      />
    </div>
  );
}
