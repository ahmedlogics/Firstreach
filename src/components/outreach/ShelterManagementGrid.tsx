'use client';

import React, { useState, useMemo } from 'react';
import { ShelterWithZone } from '@/lib/outreach/types';
import { CapacityProgress } from '@/components/shared/CapacityProgress';
import {
  Home,
  MapPin,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  Filter,
  CheckCircle2,
  X,
  Bed,
} from 'lucide-react';

interface ShelterManagementGridProps {
  shelters: ShelterWithZone[];
  isLoading?: boolean;
  onUpdateOccupancy: (shelterId: string, newOccupied: number) => Promise<void>;
  className?: string;
}

export function ShelterManagementGrid({
  shelters,
  isLoading = false,
  onUpdateOccupancy,
  className = '',
}: ShelterManagementGridProps) {
  const [updatingShelterId, setUpdatingShelterId] = useState<string | null>(null);
  const [editingOccupancy, setEditingOccupancy] = useState<{
    shelterId: string;
    value: number;
    capacity: number;
    name: string;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'near_capacity' | 'full'>('all');

  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + s.occupied, 0);
  const totalFreeBeds = Math.max(0, totalCapacity - totalOccupied);
  const totalOccupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  // Filtered Shelters
  const filteredShelters = useMemo(() => {
    return shelters.filter((s) => {
      const matchesSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.zone_name ? s.zone_name.toLowerCase().includes(searchQuery.toLowerCase()) : false);

      const matchesStatus =
        statusFilter === 'all' || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [shelters, searchQuery, statusFilter]);

  const handleStepOccupancy = async (
    shelter: ShelterWithZone,
    delta: number
  ) => {
    const nextOccupied = shelter.occupied + delta;
    if (nextOccupied < 0) return;
    if (nextOccupied > shelter.capacity) {
      setActionError(
        `Cannot exceed shelter capacity of ${shelter.capacity} beds for ${shelter.name}.`
      );
      setTimeout(() => setActionError(null), 4000);
      return;
    }

    setUpdatingShelterId(shelter.id);
    setActionError(null);
    try {
      await onUpdateOccupancy(shelter.id, nextOccupied);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionError(msg || 'Failed to update bed occupancy');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setUpdatingShelterId(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOccupancy) return;

    const { shelterId, value, capacity } = editingOccupancy;
    if (value < 0) {
      setActionError('Occupied spaces cannot be negative.');
      return;
    }
    if (value > capacity) {
      setActionError(
        `Integrity error: ${value} exceeds total shelter capacity of ${capacity} spaces.`
      );
      return;
    }

    setUpdatingShelterId(shelterId);
    setActionError(null);
    try {
      await onUpdateOccupancy(shelterId, value);
      setEditingOccupancy(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionError(msg || 'Failed to persist occupancy update');
    } finally {
      setUpdatingShelterId(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Controls & Filter Bar */}
      <div className="bg-white rounded-xl border border-[#E4E8EC] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F0F4F8] text-[#375A6B]">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#18232D]">
                Designated Evacuation Shelters
              </h3>
              <p className="text-xs text-[#5F6B7A]">
                Real-time bed availability ensuring safe intake without exceeding structural capacity.
              </p>
            </div>
          </div>

          {/* Quick Fleet Health Badge */}
          <div className="flex items-center gap-3 text-xs bg-[#F7F8FA] px-3 py-1.5 rounded-lg border border-[#E4E8EC] text-[#5F6B7A]">
            <span>Total Fleet: <strong className="text-[#18232D] tabular-nums">{totalCapacity}</strong> beds</span>
            <span className="text-[#E4E8EC]">•</span>
            <span>Occupied: <strong className="text-[#18232D] tabular-nums">{totalOccupied}</strong> ({totalOccupancyPct}%)</span>
            <span className="text-[#E4E8EC]">•</span>
            <span className="text-[#258167] font-semibold tabular-nums">{totalFreeBeds} free</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-[#E4E8EC]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5F6B7A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shelters by name or zone..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg text-[#18232D] placeholder:text-[#5F6B7A] focus:outline-none focus:ring-1 focus:ring-[#375A6B]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5F6B7A] hover:text-[#18232D]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] text-[#5F6B7A] font-medium mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {(['all', 'available', 'near_capacity', 'full'] as const).map((st) => {
              const label =
                st === 'all'
                  ? 'All'
                  : st === 'available'
                  ? 'Available'
                  : st === 'near_capacity'
                  ? 'Near Capacity'
                  : 'Full';
              const isSelected = statusFilter === st;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#18232D] text-white shadow-xs'
                      : 'bg-[#F7F8FA] text-[#5F6B7A] hover:bg-[#E4E8EC]/60 hover:text-[#18232D] border border-[#E4E8EC]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {actionError && (
        <div className="p-3 rounded-xl bg-[#FBECEE] border border-[#BC414A]/30 text-xs text-[#BC414A] flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#BC414A] shrink-0" />
            <span className="font-medium">{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs font-semibold text-[#BC414A] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Shelter Cards Grid */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E4E8EC] p-12 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#375A6B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#5F6B7A]">Synchronizing shelter telemetry...</p>
        </div>
      ) : filteredShelters.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E4E8EC] p-10 text-center space-y-1">
          <Home className="w-6 h-6 text-[#5F6B7A] mx-auto opacity-50" />
          <p className="text-xs font-medium text-[#18232D]">No shelters match query</p>
          <p className="text-[11px] text-[#5F6B7A]">Try clearing filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredShelters.map((s) => {
            const isFull = s.status === 'full';
            const isNearCapacity = s.status === 'near_capacity';
            const isBusy = updatingShelterId === s.id;
            const pct = s.capacity > 0 ? Math.round((s.occupied / s.capacity) * 100) : 0;

            return (
              <div
                key={s.id}
                className={`p-4 rounded-xl border transition-all ${
                  isFull
                    ? 'border-[#BC414A]/35 bg-[#FBECEE]/20 shadow-xs'
                    : isNearCapacity
                    ? 'border-[#A87528]/35 bg-[#FFF5E6]/20 shadow-xs'
                    : 'border-[#E4E8EC] bg-white hover:border-[#375A6B]/30'
                }`}
              >
                {/* Header: Shelter Name, Zone, & Availability Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#18232D] truncate">
                      {s.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-[#5F6B7A] mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#5F6B7A] shrink-0" />
                      <span className="truncate">{s.zone_name}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                      isFull
                        ? 'bg-[#FBECEE] text-[#BC414A] border-[#BC414A]/30'
                        : isNearCapacity
                        ? 'bg-[#FFF5E6] text-[#A87528] border-[#A87528]/30'
                        : 'bg-[#EBF7F2] text-[#258167] border-[#258167]/30'
                    }`}
                  >
                    {isFull ? 'Full' : isNearCapacity ? 'Near Capacity' : 'Available'}
                  </span>
                </div>

                {/* Primary Metric Strip */}
                <div className="grid grid-cols-4 gap-2 p-2.5 bg-[#F7F8FA] rounded-lg border border-[#E4E8EC] mb-3 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#5F6B7A] block">Occupied</span>
                    <span className="text-xs font-bold text-[#18232D] tabular-nums">{s.occupied}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#5F6B7A] block">Free</span>
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        s.free_beds === 0
                          ? 'text-[#BC414A]'
                          : s.free_beds <= 5
                          ? 'text-[#A87528]'
                          : 'text-[#258167]'
                      }`}
                    >
                      {s.free_beds}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#5F6B7A] block">Capacity</span>
                    <span className="text-xs font-bold text-[#18232D] tabular-nums">{s.capacity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#5F6B7A] block">Fill Rate</span>
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        isFull
                          ? 'text-[#BC414A]'
                          : isNearCapacity
                          ? 'text-[#A87528]'
                          : 'text-[#18232D]'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Single Clear Progress Bar */}
                <div className="mb-3">
                  <CapacityProgress
                    total={s.capacity}
                    occupied={s.occupied}
                    label="Current Occupancy"
                    showLabels={false}
                  />
                </div>

                {/* Intake Adjustment Controls */}
                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#E4E8EC]">
                  <div className="flex items-center gap-1 text-[11px] text-[#5F6B7A]">
                    <Bed className="w-3.5 h-3.5 text-[#5F6B7A]" />
                    <span>Intake Adjustment:</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Step -1 (Release Bed) */}
                    <button
                      type="button"
                      disabled={isBusy || s.occupied <= 0}
                      onClick={() => handleStepOccupancy(s, -1)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[#E4E8EC] bg-[#F7F8FA] text-[#18232D] hover:bg-[#E4E8EC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Release 1 bed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    {/* Step +1 (Admit Person) */}
                    <button
                      type="button"
                      disabled={isBusy || s.occupied >= s.capacity}
                      onClick={() => handleStepOccupancy(s, 1)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[#E4E8EC] bg-[#F7F8FA] text-[#18232D] hover:bg-[#E4E8EC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Admit 1 person"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {/* Set Count (Direct Value) */}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        setEditingOccupancy({
                          shelterId: s.id,
                          value: s.occupied,
                          capacity: s.capacity,
                          name: s.name,
                        })
                      }
                      className="px-2.5 py-1 text-xs font-semibold text-[#375A6B] bg-[#F0F4F8] border border-[#375A6B]/25 rounded-lg hover:bg-[#375A6B] hover:text-white transition-colors cursor-pointer"
                    >
                      Set Count
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Count Modal */}
      {editingOccupancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18232D]/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-xl p-5 shadow-lg border border-[#E4E8EC] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#18232D]">
                  Set Occupied Spaces
                </h4>
                <p className="text-xs text-[#5F6B7A] mt-0.5">
                  {editingOccupancy.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingOccupancy(null)}
                className="text-[#5F6B7A] hover:text-[#18232D] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs font-medium text-[#18232D] mb-1">
                  <span>Occupied Beds:</span>
                  <span className="text-[#5F6B7A] tabular-nums">
                    Max: {editingOccupancy.capacity}
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={editingOccupancy.capacity}
                  value={editingOccupancy.value}
                  onChange={(e) =>
                    setEditingOccupancy({
                      ...editingOccupancy,
                      value: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2.5 text-sm bg-[#F7F8FA] border border-[#E4E8EC] rounded-lg font-mono font-bold text-[#18232D] focus:outline-none focus:ring-1 focus:ring-[#375A6B]"
                  autoFocus
                />
                <p className="text-[11px] text-[#5F6B7A] mt-1.5 leading-snug">
                  Structural safety validation: occupancy cannot be negative and cannot exceed shelter capacity ({editingOccupancy.capacity}).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E8EC]">
                <button
                  type="button"
                  onClick={() => setEditingOccupancy(null)}
                  className="px-3 py-1.5 text-xs font-medium text-[#5F6B7A] hover:bg-[#F7F8FA] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingShelterId === editingOccupancy.shelterId}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#375A6B] hover:bg-[#2C4855] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Update Occupancy</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
