'use client';

import React, { useState } from 'react';
import { Household, OutreachMethod } from '@/lib/types';
import { MOCK_HOUSEHOLDS } from '@/lib/mock-data';
import { DataTableWrapper } from '@/components/shared/DataTableWrapper';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  PhoneOff,
  Phone,
  Wifi,
  Clock,
  Send,
  MessageSquare,
  Volume2,
  Footprints,
  Bell,
  Search,
} from 'lucide-react';

interface HouseholdOutreachListProps {
  onSimulateOutreach: (household: Household, method: OutreachMethod) => void;
  className?: string;
}

export function HouseholdOutreachList({
  onSimulateOutreach,
  className = '',
}: HouseholdOutreachListProps) {
  const [search, setSearch] = useState('');
  const [filterReachability, setFilterReachability] = useState<string>('all');

  const filteredHouseholds = MOCK_HOUSEHOLDS.filter((h) => {
    const matchesSearch =
      search === '' ||
      h.referenceCode.toLowerCase().includes(search.toLowerCase()) ||
      h.zoneName.toLowerCase().includes(search.toLowerCase()) ||
      h.headOfHousehold.toLowerCase().includes(search.toLowerCase());

    const matchesReach =
      filterReachability === 'all' || h.phoneReachability === filterReachability;

    return matchesSearch && matchesReach;
  });

  const getReachabilityIcon = (reach: Household['phoneReachability']) => {
    switch (reach) {
      case 'none':
        return (
          <span className="flex items-center gap-1 text-red-600 font-bold text-xs">
            <PhoneOff className="w-3.5 h-3.5" /> No Handset / Blackout
          </span>
        );
      case 'intermittent':
        return (
          <span className="flex items-center gap-1 text-amber-600 font-bold text-xs">
            <Wifi className="w-3.5 h-3.5" /> Intermittent / Batt Saving
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
            <Phone className="w-3.5 h-3.5" /> Active Connected
          </span>
        );
    }
  };

  const getMethodButton = (method: OutreachMethod, household: Household) => {
    switch (method) {
      case 'volunteer_visit':
        return (
          <button
            onClick={() => onSimulateOutreach(household, 'volunteer_visit')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Footprints className="w-3 h-3" />
            <span>Task Volunteer Visit</span>
          </button>
        );
      case 'loudspeaker_alert':
        return (
          <button
            onClick={() => onSimulateOutreach(household, 'loudspeaker_alert')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <Volume2 className="w-3 h-3" />
            <span>Mosque Horn Request</span>
          </button>
        );
      case 'sms_fallback':
        return (
          <button
            onClick={() => onSimulateOutreach(household, 'sms_fallback')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Simulate SMS Ping</span>
          </button>
        );
      default:
        return (
          <button
            onClick={() => onSimulateOutreach(household, 'volunteer_visit')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Footprints className="w-3 h-3" />
            <span>Outreach Action</span>
          </button>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E2E8F0]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search household ref, family head, or zone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Connectivity:</span>
          <select
            value={filterReachability}
            onChange={(e) => setFilterReachability(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
          >
            <option value="all">All Households</option>
            <option value="none">Zero Handset Access</option>
            <option value="intermittent">Intermittent / Power Loss</option>
            <option value="connected">Connected</option>
          </select>
        </div>
      </div>

      {/* Household Table */}
      <DataTableWrapper
        footer={
          <div className="flex items-center justify-between">
            <span>Displaying {filteredHouseholds.length} high-vulnerability tracked households</span>
            <span className="text-slate-400 italic">Actions update simulated outreach logs</span>
          </div>
        }
      >
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3 px-4">Ref Code / Head</th>
            <th className="py-3 px-4">Zone & Members</th>
            <th className="py-3 px-4">Vulnerability Factors</th>
            <th className="py-3 px-4">Connectivity</th>
            <th className="py-3 px-4">Last Contact</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Simulated Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] text-xs">
          {filteredHouseholds.map((h) => (
            <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3.5 px-4">
                <span className="font-mono font-bold text-slate-900 block">{h.referenceCode}</span>
                <span className="text-slate-500 text-[11px]">{h.headOfHousehold}</span>
              </td>

              <td className="py-3.5 px-4">
                <span className="font-semibold text-slate-800 block truncate max-w-[150px]">{h.zoneName}</span>
                <span className="text-slate-400 text-[11px]">{h.totalMembers} family members</span>
              </td>

              <td className="py-3.5 px-4 max-w-xs">
                <div className="flex flex-wrap gap-1">
                  {h.vulnerabilityIndicators.map((vuln, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                    >
                      {vuln}
                    </span>
                  ))}
                </div>
              </td>

              <td className="py-3.5 px-4 whitespace-nowrap">
                {getReachabilityIcon(h.phoneReachability)}
              </td>

              <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {h.lastSuccessfulContact}
                </span>
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  ({h.silenceDurationHours}h silent)
                </span>
              </td>

              <td className="py-3.5 px-4">
                <StatusBadge status={h.contactStatus} size="sm" />
              </td>

              <td className="py-3.5 px-4 text-right">
                {getMethodButton(h.recommendedOutreachMethod, h)}
              </td>
            </tr>
          ))}
        </tbody>
      </DataTableWrapper>
    </div>
  );
}
