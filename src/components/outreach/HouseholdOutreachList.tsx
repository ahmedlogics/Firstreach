'use client';

import React, { useState, useMemo } from 'react';
import {
  ContactStatusType,
  HouseholdWithZone,
  ReachabilityType,
} from '@/lib/outreach/types';
import { DataTableWrapper } from '@/components/shared/DataTableWrapper';
import { DetailDrawer } from '@/components/shared/DetailDrawer';
import {
  PhoneOff,
  Phone,
  Smartphone,
  HelpCircle,
  Clock,
  Search,
  Radio,
  Eye,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  AlertTriangle,
  HeartPulse,
  Accessibility,
  ShieldAlert,
} from 'lucide-react';

interface HouseholdOutreachListProps {
  households: HouseholdWithZone[];
  isLoading?: boolean;
  onSelectSimulateOutreach: (household: HouseholdWithZone) => void;
  onUpdateStatus: (id: string, newStatus: ContactStatusType) => Promise<void>;
  className?: string;
}

const PAGE_SIZE = 12;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inspectingHousehold, setInspectingHousehold] = useState<HouseholdWithZone | null>(null);

  // Extract unique zones for filtering
  const uniqueZones = useMemo(() => {
    const set = new Set<string>();
    households.forEach((h) => {
      if (h.zone_name) set.add(h.zone_name);
    });
    return Array.from(set).sort();
  }, [households]);

  // Client-side filtering & priority sorting
  const filteredAndSorted = useMemo(() => {
    const result = households.filter((h) => {
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

    // Default sorting: Prioritize uncontacted and needs_visit households first, then by silence hours
    return result.sort((a, b) => {
      const priorityOrder: Record<ContactStatusType, number> = {
        needs_visit: 1,
        no_response: 2,
        unknown: 3,
        reached: 4,
      };

      const orderA = priorityOrder[a.contact_status] || 5;
      const orderB = priorityOrder[b.contact_status] || 5;

      if (orderA !== orderB) return orderA - orderB;
      return (b.silence_hours || 0) - (a.silence_hours || 0);
    });
  }, [households, search, filterReachability, filterStatus, filterZone]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterReachability, filterStatus, filterZone]);

  // Pagination slice
  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE) || 1;
  const paginatedHouseholds = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  const handleStatusChange = async (
    householdId: string,
    newStatus: ContactStatusType
  ) => {
    setUpdatingId(householdId);
    try {
      await onUpdateStatus(householdId, newStatus);
      if (inspectingHousehold && inspectingHousehold.id === householdId) {
        setInspectingHousehold({
          ...inspectingHousehold,
          contact_status: newStatus,
        });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const renderReachabilityBadge = (reach: ReachabilityType) => {
    switch (reach) {
      case 'no_phone':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-semibold bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25">
            <PhoneOff className="w-3.5 h-3.5 text-[#BC414A]" />
            <span>No Phone</span>
          </span>
        );
      case 'basic_phone':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#FFF4E3] text-[#A87528] border border-[#A87528]/25">
            <Phone className="w-3.5 h-3.5 text-[#A87528]" />
            <span>Basic 2G</span>
          </span>
        );
      case 'smartphone':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#EAF0F4] text-[#375A6B] border border-[#375A6B]/25">
            <Smartphone className="w-3.5 h-3.5 text-[#375A6B]" />
            <span>Smartphone</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#F7F8FA] text-[#8B959E] border border-[#E4E8EC]">
            <HelpCircle className="w-3.5 h-3.5 text-[#8B959E]" />
            <span>Unknown</span>
          </span>
        );
    }
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E4E8EC] shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#8B959E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by household code (e.g. DEMO-HH-B1) or sector..."
              className="w-full pl-8 pr-4 py-1.5 text-xs bg-[#F7F8FA] border border-[#E4E8EC] rounded-[10px] text-[#18232D] placeholder-[#8B959E] focus:outline-none focus:ring-1 focus:ring-[#375A6B] focus:bg-white transition-colors"
            />
          </div>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Zone Filter */}
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F7F8FA] border border-[#E4E8EC] rounded-[10px] text-[#18232D] font-medium focus:outline-none focus:ring-1 focus:ring-[#375A6B] cursor-pointer"
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
              className="px-2.5 py-1.5 bg-[#F7F8FA] border border-[#E4E8EC] rounded-[10px] text-[#18232D] font-medium focus:outline-none focus:ring-1 focus:ring-[#375A6B] cursor-pointer"
            >
              <option value="all">All Connectivity</option>
              <option value="no_phone">No Phone</option>
              <option value="basic_phone">Basic 2G</option>
              <option value="smartphone">Smartphone</option>
              <option value="unknown">Unknown</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F7F8FA] border border-[#E4E8EC] rounded-[10px] text-[#18232D] font-medium focus:outline-none focus:ring-1 focus:ring-[#375A6B] cursor-pointer"
            >
              <option value="all">All Contact Statuses</option>
              <option value="needs_visit">Needs Visit</option>
              <option value="no_response">No Response</option>
              <option value="unknown">Unknown</option>
              <option value="reached">Reached / Confirmed</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Count Bar */}
        <div className="flex items-center justify-between text-[11px] text-[#6B7782] pt-1 border-t border-[#E4E8EC]">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[#18232D] tabular-nums">{filteredAndSorted.length}</strong> of{' '}
              <strong className="text-[#18232D] tabular-nums">{households.length}</strong> tracked households
            </span>
            {(search || filterZone !== 'all' || filterReachability !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterZone('all');
                  setFilterReachability('all');
                  setFilterStatus('all');
                }}
                className="text-[#375A6B] font-semibold hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] tabular-nums">
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTableWrapper
        footer={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-[#6B7782]">
              Prioritizing households requiring contact or field verification.
            </span>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-[#E4E8EC] bg-white text-[#18232D] text-xs font-medium hover:bg-[#F7F8FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="px-2 text-xs font-mono tabular-nums text-[#18232D]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-[#E4E8EC] bg-white text-[#18232D] text-xs font-medium hover:bg-[#F7F8FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        }
      >
        <thead>
          <tr className="border-b border-[#E4E8EC] bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-wider text-[#6B7782]">
            <th className="py-2.5 px-3.5 text-left">Household</th>
            <th className="py-2.5 px-3.5 text-left">Sector & Risk</th>
            <th className="py-2.5 px-3.5 text-left">Vulnerabilities</th>
            <th className="py-2.5 px-3.5 text-left">Reachability</th>
            <th className="py-2.5 px-3.5 text-left">Contact Status</th>
            <th className="py-2.5 px-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E4E8EC] text-xs">
          {isLoading ? (
            <tr>
              <td colSpan={6} className="p-12 text-center">
                <div className="w-6 h-6 border-2 border-[#375A6B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#6B7782] font-medium">
                  Synchronizing household registry from Supabase...
                </p>
              </td>
            </tr>
          ) : paginatedHouseholds.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-10 text-center">
                <Search className="w-7 h-7 text-[#8B959E] mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-[#18232D]">No matching households</h4>
                <p className="text-[11px] text-[#6B7782] max-w-sm mx-auto mt-0.5">
                  No records match your query and filter criteria.
                </p>
              </td>
            </tr>
          ) : (
            paginatedHouseholds.map((h) => {
              const isUpdating = updatingId === h.id;

              return (
                <tr
                  key={h.id}
                  className="hover:bg-[#F7F8FA] transition-colors group cursor-pointer"
                  onClick={() => setInspectingHousehold(h)}
                >
                  {/* Household Code & Count */}
                  <td className="py-2.5 px-3.5">
                    <span className="font-mono font-semibold text-[#18232D] block">
                      {h.label}
                    </span>
                    <span className="text-[#6B7782] text-[11px] tabular-nums">
                      {h.people_count} {h.people_count === 1 ? 'member' : 'members'}
                    </span>
                  </td>

                  {/* Zone & Flood Risk */}
                  <td className="py-2.5 px-3.5">
                    <span className="font-medium text-[#18232D] block truncate max-w-[150px]">
                      {h.zone_name}
                    </span>
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded-[4px] text-[10px] font-semibold mt-0.5 ${
                        h.zone_flood_risk === 3
                          ? 'bg-[#FBECEE] text-[#BC414A]'
                          : h.zone_flood_risk === 2
                          ? 'bg-[#FFF4E3] text-[#A87528]'
                          : 'bg-[#E9F3EF] text-[#258167]'
                      }`}
                    >
                      Risk Tier {h.zone_flood_risk}
                    </span>
                  </td>

                  {/* Vulnerabilities Chips */}
                  <td className="py-2.5 px-3.5 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {h.elderly_present && (
                        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#EAF0F4] text-[#375A6B] text-[10px] font-medium border border-[#375A6B]/20">
                          Elderly
                        </span>
                      )}
                      {h.mobility_assistance && (
                        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#EAF0F4] text-[#375A6B] text-[10px] font-medium border border-[#375A6B]/20">
                          Mobility
                        </span>
                      )}
                      {h.medical_support_needed && (
                        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#FBECEE] text-[#BC414A] text-[10px] font-semibold border border-[#BC414A]/25">
                          Medical
                        </span>
                      )}
                      {!h.elderly_present && !h.mobility_assistance && !h.medical_support_needed && (
                        <span className="text-[10px] text-[#8B959E] italic">None logged</span>
                      )}
                    </div>
                  </td>

                  {/* Reachability Badge */}
                  <td className="py-2.5 px-3.5 whitespace-nowrap">
                    {renderReachabilityBadge(h.reachability)}
                  </td>

                  {/* Contact Status (Interactive Dropdown) */}
                  <td
                    className="py-2.5 px-3.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5">
                      {isUpdating ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#375A6B] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <select
                          value={h.contact_status}
                          onChange={(e) =>
                            handleStatusChange(
                              h.id,
                              e.target.value as ContactStatusType
                            )
                          }
                          className={`text-xs font-semibold px-2 py-1 rounded-[6px] border focus:outline-none transition-colors cursor-pointer ${
                            h.contact_status === 'reached'
                              ? 'bg-[#E9F3EF] text-[#258167] border-[#258167]/30'
                              : h.contact_status === 'needs_visit'
                              ? 'bg-[#FFF4E3] text-[#A87528] border-[#A87528]/30'
                              : h.contact_status === 'no_response'
                              ? 'bg-[#FBECEE] text-[#BC414A] border-[#BC414A]/30'
                              : 'bg-[#F7F8FA] text-[#6B7782] border-[#E4E8EC]'
                          }`}
                        >
                          <option value="needs_visit">Needs Visit</option>
                          <option value="no_response">No Response</option>
                          <option value="unknown">Unknown</option>
                          <option value="reached">Reached</option>
                        </select>
                      )}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td
                    className="py-2.5 px-3.5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectingHousehold(h)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-medium bg-white text-[#18232D] border border-[#E4E8EC] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                        title="View complete household profile and contact details"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#6B7782]" />
                        <span>Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectSimulateOutreach(h)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#EAF0F4] text-[#375A6B] hover:bg-[#375A6B] hover:text-white border border-[#375A6B]/25 transition-colors cursor-pointer"
                        title="Simulate outbound warning or welfare check"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Alert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </DataTableWrapper>

      {/* Household Details Slide-Over Drawer */}
      <DetailDrawer
        isOpen={Boolean(inspectingHousehold)}
        onClose={() => setInspectingHousehold(null)}
        title={inspectingHousehold ? `Household ${inspectingHousehold.label}` : 'Household Details'}
        subtitle={inspectingHousehold?.zone_name || 'Designated flood sector'}
        badge={
          inspectingHousehold && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] ${
                inspectingHousehold.contact_status === 'reached'
                  ? 'bg-[#E9F3EF] text-[#258167]'
                  : inspectingHousehold.contact_status === 'needs_visit'
                  ? 'bg-[#FFF4E3] text-[#A87528]'
                  : 'bg-[#FBECEE] text-[#BC414A]'
              }`}
            >
              {inspectingHousehold.contact_status.replace('_', ' ').toUpperCase()}
            </span>
          )
        }
        width="md"
        footer={
          inspectingHousehold && (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setInspectingHousehold(null)}
                className="px-3 py-1.5 rounded-[8px] border border-[#E4E8EC] text-xs font-medium text-[#6B7782] hover:bg-[#F7F8FA]"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const h = inspectingHousehold;
                  setInspectingHousehold(null);
                  onSelectSimulateOutreach(h);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold bg-[#375A6B] hover:bg-[#294858] text-white shadow-subtle"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Simulate Outreach Alert</span>
              </button>
            </div>
          )
        }
      >
        {inspectingHousehold && (
          <div className="space-y-4 text-xs text-[#18232D]">
            {/* Quick Profile */}
            <div className="p-3.5 rounded-[10px] bg-[#F7F8FA] border border-[#E4E8EC] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B7782]">Family Size:</span>
                <strong className="text-[#18232D] tabular-nums font-mono">{inspectingHousehold.people_count} individuals</strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B7782]">Sector Location:</span>
                <strong className="text-[#18232D]">{inspectingHousehold.zone_name}</strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B7782]">Flood Threat Tier:</span>
                <strong className="text-[#BC414A]">Tier {inspectingHousehold.zone_flood_risk}/3</strong>
              </div>
              {inspectingHousehold.zone_minutes_to_impact !== null && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B7782]">Crest Arrival:</span>
                  <strong className="font-mono text-[#18232D]">~{inspectingHousehold.zone_minutes_to_impact} minutes</strong>
                </div>
              )}
            </div>

            {/* Reachability & Device Profile */}
            <div className="p-3.5 rounded-[10px] border border-[#E4E8EC] space-y-2">
              <h4 className="font-semibold text-xs text-[#18232D] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#375A6B]" />
                <span>Connectivity Profile</span>
              </h4>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#6B7782]">Hardware Access:</span>
                {renderReachabilityBadge(inspectingHousehold.reachability)}
              </div>
              <p className="text-[11px] text-[#6B7782] leading-relaxed pt-1 border-t border-[#E4E8EC]">
                {inspectingHousehold.reachability === 'no_phone'
                  ? 'No working handset present. Requires volunteer scout physical door check or community siren broadcast.'
                  : inspectingHousehold.reachability === 'basic_phone'
                  ? 'Capable of 2G text notifications and automated synthesized voice calls.'
                  : 'Full smartphone access with data push alert compatibility.'}
              </p>
            </div>

            {/* Vulnerability Factors */}
            <div className="p-3.5 rounded-[10px] border border-[#E4E8EC] space-y-2">
              <h4 className="font-semibold text-xs text-[#18232D] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#A87528]" />
                <span>Vulnerability Indicators</span>
              </h4>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7782]">Elderly Resident Present:</span>
                  <strong className={inspectingHousehold.elderly_present ? 'text-[#A87528]' : 'text-[#6B7782]'}>
                    {inspectingHousehold.elderly_present ? 'Yes' : 'No'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7782]">Mobility Assistance Needed:</span>
                  <strong className={inspectingHousehold.mobility_assistance ? 'text-[#A87528]' : 'text-[#6B7782]'}>
                    {inspectingHousehold.mobility_assistance ? 'Yes' : 'No'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7782]">Urgent Medical Support:</span>
                  <strong className={inspectingHousehold.medical_support_needed ? 'text-[#BC414A]' : 'text-[#6B7782]'}>
                    {inspectingHousehold.medical_support_needed ? 'Yes (Priority)' : 'No'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Contact History & Status Edits */}
            <div className="p-3.5 rounded-[10px] border border-[#E4E8EC] space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-[#18232D] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#375A6B]" />
                  <span>Contact Tracking</span>
                </h4>
                <span className="text-[10px] font-mono tabular-nums text-[#8B959E]">
                  {inspectingHousehold.silence_hours}h silence logged
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <span className="text-[#6B7782] block">Update Status in Database:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['needs_visit', 'no_response', 'unknown', 'reached'] as ContactStatusType[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(inspectingHousehold.id, st)}
                      className={`px-2 py-1.5 rounded-[6px] text-xs font-medium capitalize border transition-colors cursor-pointer text-center ${
                        inspectingHousehold.contact_status === st
                          ? 'bg-[#375A6B] text-white border-[#375A6B] font-semibold'
                          : 'bg-white text-[#18232D] border-[#E4E8EC] hover:bg-[#F7F8FA]'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4E8EC] text-[11px] text-[#8B959E]">
                Last contact: {inspectingHousehold.last_contact_at ? new Date(inspectingHousehold.last_contact_at).toLocaleString() : 'No prior contact recorded'}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}