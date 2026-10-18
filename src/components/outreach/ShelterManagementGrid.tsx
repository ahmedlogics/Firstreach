'use client';

import React, { useState } from 'react';
import { ShelterWithZone } from '@/lib/outreach/types';
import { CapacityProgress } from '@/components/shared/CapacityProgress';
import {
  Home,
  MapPin,
  AlertTriangle,
  Plus,
  Minus,
  Users,
  ShieldCheck,
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

  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + s.occupied, 0);
  const totalFreeBeds = Math.max(0, totalCapacity - totalOccupied);

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
      setActionError('Occupied beds cannot be negative.');
      return;
    }
    if (value > capacity) {
      setActionError(
        `Capacity integrity error: ${value} exceeds total shelter capacity of ${capacity} beds.`
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
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-[#0D9488]">
              <Home className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Designated Evacuation Shelters
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
              Live Bed Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time bed availability ensuring safe intake without exceeding structural capacity.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700">
          <span>Total Fleet Capacity: <strong>{totalCapacity}</strong> beds</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-bold">{totalFreeBeds} free</span>
        </div>
      </div>

      {/* Global Error Banner */}
      {actionError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-xs font-bold text-red-900 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Coordinated Dispatch Notice */}
      <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center gap-2.5 text-xs text-teal-900">
        <ShieldCheck className="w-4 h-4 text-[#0D9488] shrink-0" />
        <span className="text-[11px] leading-relaxed">
          <strong>Member 3 Coordination:</strong> Rescue dispatchers allocate evacuees based on live free beds. Over-capacity intake is strictly prevented at database level.
        </span>
      </div>

      {/* Shelter Grid */}
      {isLoading ? (
        <div className="p-8 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading shelter network telemetry...</p>
        </div>
      ) : shelters.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No shelter complexes registered in current zone database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shelters.map((s) => {
            const isFull = s.status === 'full';
            const isNearCapacity = s.status === 'near_capacity';
            const isBusy = updatingShelterId === s.id;

            return (
              <div
                key={s.id}
                className={`p-4 rounded-xl border transition-all ${
                  isFull
                    ? 'border-red-300 bg-red-50/20 shadow-2xs'
                    : isNearCapacity
                    ? 'border-amber-300 bg-amber-50/20 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Title & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {s.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.zone_name}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shrink-0 ${
                      isFull
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : isNearCapacity
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {isFull ? 'Full' : isNearCapacity ? 'Near Capacity' : 'Available'}
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="py-2">
                  <CapacityProgress
                    total={s.capacity}
                    occupied={s.occupied}
                    label="Bed Occupancy"
                  />
                </div>

                {/* Free Bed Count & Stats */}
                <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100 text-slate-600">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Free Capacity:</span>
                    <span
                      className={`font-mono text-sm ${
                        s.free_beds === 0
                          ? 'text-red-600 font-extrabold'
                          : s.free_beds <= 5
                          ? 'text-amber-600 font-bold'
                          : 'text-emerald-700 font-bold'
                      }`}
                    >
                      {s.free_beds} beds
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {s.occupied} of {s.capacity} occupied
                  </span>
                </div>

                {/* Intake Adjustment Controls */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Intake Adjust
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Quick Step -1 */}
                    <button
                      type="button"
                      disabled={isBusy || s.occupied <= 0}
                      onClick={() => handleStepOccupancy(s, -1)}
                      className="p-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Release 1 bed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Step +1 */}
                    <button
                      type="button"
                      disabled={isBusy || s.occupied >= s.capacity}
                      onClick={() => handleStepOccupancy(s, 1)}
                      className="p-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Admit 1 person"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {/* Custom Update Button */}
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
                      className="px-2.5 py-1 text-[11px] font-bold text-[#0D9488] bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Update Bed Occupancy
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingOccupancy.name} (Max Capacity: {editingOccupancy.capacity} beds)
              </p>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Current Occupied Beds:
                </label>
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
                  className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Database constraint strictly enforces: 0 &le; occupied &le; {editingOccupancy.capacity}.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOccupancy(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingShelterId === editingOccupancy.shelterId}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-lg shadow-xs"
                >
                  Save Occupancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
