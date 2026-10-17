'use client';

import React from 'react';
import { MOCK_SHELTERS } from '@/lib/mock-data';
import { CapacityProgress } from '@/components/shared/CapacityProgress';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatNumber } from '@/lib/utils';
import {
  Home,
  MapPin,
  HeartPulse,
  Utensils,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function ShelterManagementGrid() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Designated Evacuation Shelters
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              Active Bed Tracking
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Real-time occupancy monitoring preventing overload and ensuring food/medical provisions.
          </p>
        </div>

        <div className="text-xs text-slate-600 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          Total Fleet Capacity: 2,350 beds
        </div>
      </div>

      {/* Grid of Shelter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_SHELTERS.map((shelter) => {
          const isNearCapacity = shelter.status === 'near_capacity';
          const isFull = shelter.availableSpaces <= 10;

          return (
            <div
              key={shelter.id}
              className={`p-5 rounded-xl border transition-all ${
                isFull
                  ? 'border-red-300 bg-red-50/20 shadow-xs'
                  : isNearCapacity
                  ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {shelter.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{shelter.zone}</span>
                  </div>
                </div>

                <StatusBadge status={shelter.status} size="sm" />
              </div>

              {/* Progress Bar Component */}
              <div className="py-2">
                <CapacityProgress
                  total={shelter.totalCapacity}
                  occupied={shelter.occupiedSpaces}
                  label="Bed Occupancy"
                />
              </div>

              {/* Support Provisions Tags */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-1 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                      shelter.hasMedicalSupport
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'bg-slate-100 text-slate-400 line-through'
                    }`}
                  >
                    <HeartPulse className="w-3 h-3" />
                    Medical Post
                  </span>

                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                      shelter.hasFoodSupply
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'bg-slate-100 text-slate-400 line-through'
                    }`}
                  >
                    <Utensils className="w-3 h-3" />
                    Rations Supply
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Updated {shelter.lastUpdated}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
