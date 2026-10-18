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
    <div className={`bg-white rounded-2xl border border-[#E8E6E1] shadow-xs p-5 sm:p-6 space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E6E1]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#EDF1F5] text-[#536A82]">
              <Home className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#252A30]">
              Designated Evacuation Shelters
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/20">
              Live Bed Telemetry
            </span>
          </div>
          <p className="text-xs text-[#757B81] mt-0.5">
            Real-time bed availability ensuring safe intake without exceeding structural capacity.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-medium bg-[#F7F6F2] px-3 py-1.5 rounded-lg border border-[#E8E6E1] text-[#757B81]">
          <span>Total Fleet Capacity: <strong className="text-[#252A30]">{totalCapacity}</strong> beds</span>
          <span className="text-[#E8E6E1]">•</span>
          <span className="text-[#377D65] font-semibold">{totalFreeBeds} free</span>
        </div>
      </div>

      {/* Global Error Banner */}
      {actionError && (
        <div className="p-3 rounded-xl bg-[#FAE8E7] border border-[#B74349]/30 text-xs text-[#B74349] flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#B74349] shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-xs font-semibold text-[#B74349] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Coordinated Dispatch Notice */}
      <div className="p-3 rounded-xl bg-[#EDF1F5] border border-[#536A82]/20 flex items-center gap-2.5 text-xs text-[#252A30]">
        <ShieldCheck className="w-4 h-4 text-[#536A82] shrink-0" />
        <span className="text-[11px] leading-relaxed">
          <strong>Member 3 Coordination:</strong> Rescue dispatchers allocate evacuees based on live free beds. Over-capacity intake is strictly prevented at database level.
        </span>
      </div>

      {/* Shelter Grid */}
      {isLoading ? (
        <div className="p-8 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#536A82] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#757B81]">Loading shelter network telemetry...</p>
        </div>
      ) : shelters.length === 0 ? (
        <div className="p-8 text-center text-[#92979D] text-xs">
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
                    ? 'border-[#B74349]/40 bg-[#FAE8E7]/30 shadow-xs'
                    : isNearCapacity
                    ? 'border-[#A87426]/40 bg-[#FFF2DD]/30 shadow-xs'
                    : 'border-[#E8E6E1] bg-white hover:border-[#536A82]/30'
                }`}
              >
                {/* Title & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#252A30] truncate">
                      {s.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-[#757B81] mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#92979D] shrink-0" />
                      <span className="truncate">{s.zone_name}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border shrink-0 ${
                      isFull
                        ? 'bg-[#FAE8E7] text-[#B74349] border-[#B74349]/30'
                        : isNearCapacity
                        ? 'bg-[#FFF2DD] text-[#A87426] border-[#A87426]/30'
                        : 'bg-[#E5EEE8] text-[#377D65] border-[#377D65]/30'
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
                <div className="flex items-center justify-between text-xs py-2 border-t border-[#E8E6E1] text-[#757B81]">
                  <div className="flex items-center gap-1.5 font-semibold text-[#252A30]">
                    <Users className="w-3.5 h-3.5 text-[#92979D]" />
                    <span>Free Capacity:</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        s.free_beds === 0
                          ? 'text-[#B74349]'
                          : s.free_beds <= 5
                          ? 'text-[#A87426]'
                          : 'text-[#377D65]'
                      }`}
                    >
                      {s.free_beds} beds
                    </span>
                  </div>

                  <span className="text-[11px] text-[#92979D]">
                    {s.occupied} of {s.capacity} occupied
                  </span>
                </div>

                {/* Intake Adjustment Controls */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E8E6E1]">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#92979D]">
                    Intake Adjust
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Quick Step -1 */}
                    <button
                      type="button"
                      disabled={isBusy || s.occupied <= 0}
                      onClick={() => handleStepOccupancy(s, -1)}
                      className="p-1 rounded-lg border border-[#E8E6E1] bg-[#F7F6F2] text-[#252A30] hover:bg-[#EDF1F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Release 1 bed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Step +1 */}
                    <button
                      type="button"
                      disabled={isBusy || s.occupied >= s.capacity}
                      onClick={() => handleStepOccupancy(s, 1)}
                      className="p-1 rounded-lg border border-[#E8E6E1] bg-[#F7F6F2] text-[#252A30] hover:bg-[#EDF1F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#536A82] bg-[#EDF1F5] border border-[#536A82]/30 rounded-lg hover:bg-[#536A82] hover:text-white transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252A30]/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-lg border border-[#E8E6E1] space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-[#252A30]">
                Update Bed Occupancy
              </h4>
              <p className="text-xs text-[#757B81] mt-0.5">
                {editingOccupancy.name} (Max Capacity: {editingOccupancy.capacity} beds)
              </p>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#252A30] block mb-1">
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
                  className="w-full p-2 text-sm bg-[#F7F6F2] border border-[#E8E6E1] rounded-lg font-mono font-semibold text-[#252A30] focus:outline-none focus:ring-2 focus:ring-[#536A82]"
                  autoFocus
                />
                <p className="text-[10px] text-[#92979D] mt-1">
                  Database constraint strictly enforces: 0 &le; occupied &le; {editingOccupancy.capacity}.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOccupancy(null)}
                  className="px-3 py-1.5 text-xs font-medium text-[#757B81] hover:bg-[#F7F6F2] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingShelterId === editingOccupancy.shelterId}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#536A82] hover:bg-[#40566D] rounded-lg shadow-xs transition-colors cursor-pointer"
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
