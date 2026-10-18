'use client';

import React, { useState, useMemo } from 'react';
import {
  ContactStatusType,
  HouseholdWithZone,
  ReachabilityType,
} from '@/lib/outreach/types';
import { DataTableWrapper } from '@/components/shared/DataTableWrapper';
import {
  PhoneOff,
  Phone,
  Smartphone,
  HelpCircle,
  Clock,
  Search,
  Radio,
} from 'lucide-react';

interface HouseholdOutreachListProps {
  households: HouseholdWithZone[];
  isLoading?: boolean;
  onSelectSimulateOutreach: (household: HouseholdWithZone) => void;
  onUpdateStatus: (id: string, newStatus: ContactStatusType) => Promise<void>;
  className?: string;
}

export function HouseholdOutreachList({
  households,
  isLoading = false,
  onSelectSimulateOutreach,
  onUpdateStatus,
  className = '',
}: HouseholdOutreachListProps) {
  const [search, setSearch] = useState('');
  const [filterReachability, setFilterReachability] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Extract unique zones for filtering
  const uniqueZones = useMemo(() => {
    const set = new Set<string>();
    households.forEach((h) => {
      if (h.zone_name) set.add(h.zone_name);
    });
    return Array.from(set).sort();
  }, [households]);

  // Client-side filtering
  const filtered = useMemo(() => {
    return households.filter((h) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        h.label.toLowerCase().includes(q) ||
        (h.zone_name && h.zone_name.toLowerCase().includes(q));

      const matchesReach =
        filterReachability === 'all' || h.reachability === filterReachability;

      const matchesStatus =
        filterStatus === 'all' || h.contact_status === filterStatus;

      const matchesZone = filterZone === 'all' || h.zone_name === filterZone;

      return matchesSearch && matchesReach && matchesStatus && matchesZone;
    });
  }, [households, search, filterReachability, filterStatus, filterZone]);

  const handleStatusChange = async (
    householdId: string,
    newStatus: ContactStatusType
  ) => {
    setUpdatingId(householdId);
    try {
      await onUpdateStatus(householdId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderReachabilityBadge = (reach: ReachabilityType) => {
    switch (reach) {
      case 'no_phone':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FAE8E7] text-[#B74349] border border-[#B74349]/30">
            <PhoneOff className="w-3.5 h-3.5 text-[#B74349]" />
            <span>No Phone</span>
          </span>
        );
      case 'basic_phone':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFF2DD] text-[#A87426] border border-[#A87426]/30">
            <Phone className="w-3.5 h-3.5 text-[#A87426]" />
            <span>Basic 2G</span>
          </span>
        );
      case 'smartphone':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/30">
            <Smartphone className="w-3.5 h-3.5 text-[#536A82]" />
            <span>Smartphone</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F7F6F2] text-[#757B81] border border-[#E8E6E1]">
            <HelpCircle className="w-3.5 h-3.5 text-[#92979D]" />
            <span>Unknown</span>
          </span>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E6E1] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#92979D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by household code (e.g. DEMO-HH-B1) or zone..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F7F6F2] border border-[#E8E6E1] rounded-lg text-[#252A30] placeholder-[#92979D] focus:outline-none focus:ring-2 focus:ring-[#536A82]"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Zone Filter */}
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="px-3 py-2 bg-[#F7F6F2] border border-[#E8E6E1] rounded-lg text-[#252A30] font-medium focus:outline-none focus:ring-2 focus:ring-[#536A82]"
            >
              <option value="all">All Sectors ({uniqueZones.length})</option>
              {uniqueZones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>

            {/* Reachability Filter */}
            <select
              value={filterReachability}
              onChange={(e) => setFilterReachability(e.target.value)}
              className="px-3 py-2 bg-[#F7F6F2] border border-[#E8E6E1] rounded-lg text-[#252A30] font-medium focus:outline-none focus:ring-2 focus:ring-[#536A82]"
            >
              <option value="all">All Connectivity</option>
              <option value="no_phone">No Phone Handset</option>
              <option value="basic_phone">Basic 2G Phone</option>
              <option value="smartphone">Smartphone Connected</option>
              <option value="unknown">Reachability Unknown</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-[#F7F6F2] border border-[#E8E6E1] rounded-lg text-[#252A30] font-medium focus:outline-none focus:ring-2 focus:ring-[#536A82]"
            >
              <option value="all">All Contact Statuses</option>
              <option value="reached">Reached / Confirmed</option>
              <option value="needs_visit">Needs Visit</option>
              <option value="no_response">No Response</option>
              <option value="unknown">Status Unknown</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Pill */}
        <div className="flex items-center justify-between text-[11px] text-[#757B81] pt-1 border-t border-[#E8E6E1]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#252A30]">
              Showing {filtered.length} of {households.length} tracked households
            </span>
            {(search || filterZone !== 'all' || filterReachability !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterZone('all');
                  setFilterReachability('all');
                  setFilterStatus('all');
                }}
                className="text-[#536A82] font-semibold hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#377D65]" />
            <span>Strict Schema Enums Validated</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTableWrapper
        footer={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-[#757B81] font-medium">
              Updating status synchronizes immediately with server database.
            </span>
            <span className="text-[#92979D] italic">
              Simulated alerts log to <code>outreach_actions</code> without external SMS burn.
            </span>
          </div>
        }
      >
        <thead>
          <tr className="border-b border-[#E8E6E1] bg-[#F7F6F2] text-[11px] font-semibold uppercase tracking-wider text-[#757B81]">
            <th className="py-3 px-4 text-left">Household Ref / Family</th>
            <th className="py-3 px-4 text-left">Sector & Flood Risk</th>
            <th className="py-3 px-4 text-left">Vulnerabilities</th>
            <th className="py-3 px-4 text-left">Reachability</th>
            <th className="py-3 px-4 text-left">Contact Status (Update)</th>
            <th className="py-3 px-4 text-left">Last Contact</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E8E6E1] text-xs">
          {isLoading ? (
            <tr>
              <td colSpan={7} className="p-12 text-center">
                <div className="w-8 h-8 border-3 border-[#536A82] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#757B81] font-medium">
                  Synchronizing household registry from Supabase...
                </p>
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-12 text-center">
                <Search className="w-8 h-8 text-[#92979D] mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-[#252A30]">No matching households found</h4>
                <p className="text-xs text-[#757B81] max-w-sm mx-auto">
                  No household records matched your current query and filter selections. Try broadening your criteria.
                </p>
              </td>
            </tr>
          ) : (
            filtered.map((h) => {
              const isUpdating = updatingId === h.id;

              return (
                <tr
                  key={h.id}
                  className="hover:bg-[#F7F6F2]/60 transition-colors group"
                >
                  {/* Household Code & Count */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-[#252A30] block text-xs">
                      {h.label}
                    </span>
                    <span className="text-[#757B81] text-[11px]">
                      {h.people_count} family {h.people_count === 1 ? 'member' : 'members'}
                    </span>
                  </td>

                  {/* Zone & Flood Risk */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#252A30] block truncate max-w-[160px]">
                      {h.zone_name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          h.zone_flood_risk === 3
                            ? 'bg-[#FAE8E7] text-[#B74349]'
                            : h.zone_flood_risk === 2
                            ? 'bg-[#FFF2DD] text-[#A87426]'
                            : 'bg-[#E5EEE8] text-[#377D65]'
                        }`}
                      >
                        Risk Tier {h.zone_flood_risk}
                      </span>
                      {h.zone_minutes_to_impact !== null && (
                        <span className="text-[10px] text-[#92979D]">
                          ~{h.zone_minutes_to_impact}m crest
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Vulnerabilities Chips */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {h.elderly_present && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#EDF1F5] text-[#536A82] text-[10px] font-medium border border-[#536A82]/20">
                          Elderly
                        </span>
                      )}
                      {h.mobility_assistance && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#EDF1F5] text-[#536A82] text-[10px] font-medium border border-[#536A82]/20">
                          Mobility
                        </span>
                      )}
                      {h.medical_support_needed && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#FAE8E7] text-[#B74349] text-[10px] font-medium border border-[#B74349]/20">
                          Medical Urgent
                        </span>
                      )}
                      {!h.elderly_present && !h.mobility_assistance && !h.medical_support_needed && (
                        <span className="text-[10px] text-[#92979D] italic">None logged</span>
                      )}
                    </div>
                  </td>

                  {/* Reachability Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderReachabilityBadge(h.reachability)}
                  </td>

                  {/* Contact Status (Interactive Dropdown) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-[#536A82] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <select
                          value={h.contact_status}
                          onChange={(e) =>
                            handleStatusChange(
                              h.id,
                              e.target.value as ContactStatusType
                            )
                          }
                          className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none transition-colors cursor-pointer ${
                            h.contact_status === 'reached'
                              ? 'bg-[#E5EEE8] text-[#377D65] border-[#377D65]/40'
                              : h.contact_status === 'needs_visit'
                              ? 'bg-[#FFF2DD] text-[#A87426] border-[#A87426]/40'
                              : h.contact_status === 'no_response'
                              ? 'bg-[#FAE8E7] text-[#B74349] border-[#B74349]/40'
                              : 'bg-[#F7F6F2] text-[#757B81] border-[#E8E6E1]'
                          }`}
                        >
                          <option value="reached">Reached</option>
                          <option value="needs_visit">Needs Visit</option>
                          <option value="no_response">No Response</option>
                          <option value="unknown">Unknown</option>
                        </select>
                      )}
                    </div>
                  </td>

                  {/* Last Contact Time */}
                  <td className="py-3.5 px-4 text-[#757B81] font-mono text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#92979D]" />
                      <span>
                        {h.last_contact_at
                          ? new Date(h.last_contact_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'No record'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#92979D] block pt-0.5">
                      {h.silence_hours}h silent
                    </span>
                  </td>

                  {/* Action Button: Trigger Simulator */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectSimulateOutreach(h)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EDF1F5] text-[#536A82] hover:bg-[#536A82] hover:text-white border border-[#536A82]/30 transition-colors shadow-xs cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Simulate Alert</span>
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </DataTableWrapper>
    </div>
  );
}