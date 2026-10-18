'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RaabtaLogo } from '@/components/shared/RaabtaLogo';
import { RequireAuth, useAuth } from '@/lib/auth/AuthContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import {
  LifeBuoy,
  Navigation,
  MapPin,
  Clock,
  HeartPulse,
  Users,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Send,
  Home,
  Shield,
  FileText,
} from 'lucide-react';

interface FieldMission {
  id: string;
  incident_id: string;
  team_id: string;
  status: 'assigned' | 'en_route' | 'completed' | 'cancelled';
  created_at: string;
  incident?: {
    id: string;
    location_description: string;
    details: string;
    priority_score: number;
    people_count: number;
    trapped: boolean;
    medical_urgent: boolean;
    flood_severity: number;
    zone_name?: string;
  };
}

interface ShelterOption {
  id: string;
  name: string;
  capacity: number;
  current_occupancy: number;
}

export default function FieldWorkspacePage() {
  return (
    <RequireAuth allowedRoles={['rescue_team', 'coordinator']}>
      <FieldWorkspaceContent />
    </RequireAuth>
  );
}

function FieldWorkspaceContent() {
  const { user, logout } = useAuth();
  const [missions, setMissions] = useState<FieldMission[]>([]);
  const [shelters, setShelters] = useState<ShelterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [fieldNote, setFieldNote] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Complete mission modal state
  const [completingMission, setCompletingMission] = useState<FieldMission | null>(null);
  const [assistedCount, setAssistedCount] = useState<number>(4);
  const [selectedShelterId, setSelectedShelterId] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchFieldData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      // 1. Fetch recommendations/assignments engine data
      const res = await fetch('/api/assignments/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const activeAssigned = data.activeAssignments || [];
        const allIncidents = data.allIncidents || [];
        const allShelters = data.shelters || [];

        // Map missions with incident details
        const mapped: FieldMission[] = activeAssigned.map((a: any) => {
          const inc = allIncidents.find((i: any) => i.id === a.incident_id);
          return {
            id: a.id,
            incident_id: a.incident_id,
            team_id: a.team_id,
            status: a.status,
            created_at: a.created_at || new Date().toISOString(),
            incident: inc
              ? {
                  id: inc.id,
                  location_description: inc.location_description || inc.details || 'Sector B residential zone',
                  details: inc.details || '',
                  priority_score: inc.priority_score ?? 85,
                  people_count: inc.people_count ?? 4,
                  trapped: Boolean(inc.trapped),
                  medical_urgent: Boolean(inc.medical_urgent),
                  flood_severity: inc.flood_severity ?? 2,
                  zone_name: inc.zone_name || 'Sector B',
                }
              : {
                  id: a.incident_id,
                  location_description: 'Active emergency extraction point',
                  details: 'Urgent rescue underway',
                  priority_score: 85,
                  people_count: 4,
                  trapped: true,
                  medical_urgent: true,
                  flood_severity: 2,
                  zone_name: 'Karachi Basin Sector',
                },
          };
        });

        setMissions(mapped);
        setShelters(allShelters);
        if (allShelters.length > 0 && !selectedShelterId) {
          setSelectedShelterId(allShelters[0].id);
        }
      }
    } catch (err) {
      console.error('[FieldWorkspace] fetch error:', err);
      showToast('error', 'Unable to refresh field telemetry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedShelterId]);

  useEffect(() => {
    fetchFieldData();
    const interval = setInterval(() => fetchFieldData(), 10000);
    return () => clearInterval(interval);
  }, [fetchFieldData]);

  // Handle Mark En Route (Start Mission)
  const handleStartMission = async (missionId: string) => {
    setActiveActionId(missionId);
    try {
      const res = await fetch(`/api/assignments/${missionId}/start`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-dispatcher-role': 'rescue_team',
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to start mission');
      }

      showToast('success', 'Status updated: Unit EN ROUTE to destination.');
      fetchFieldData();
    } catch (err: any) {
      showToast('error', err.message || 'Error updating status');
    } finally {
      setActiveActionId(null);
    }
  };

  // Handle Complete Mission
  const handleConfirmComplete = async () => {
    if (!completingMission) return;
    setActiveActionId(completingMission.id);
    try {
      const res = await fetch(`/api/assignments/${completingMission.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dispatcher-role': 'rescue_team',
        },
        body: JSON.stringify({
          assisted_people_count: assistedCount,
          team_ready: true,
          shelter_id: selectedShelterId || null,
          evacuees_arrived_count: assistedCount,
          resolution_notes: resolutionNotes || fieldNote || 'Field evacuation successfully completed. Victims delivered to shelter safely.',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit completion report');
      }

      showToast('success', `Rescue completed! ${assistedCount} evacuees safe.`);
      setCompletingMission(null);
      setFieldNote('');
      fetchFieldData();
    } catch (err: any) {
      showToast('error', err.message || 'Error completing mission');
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col text-[#18232D] antialiased">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 duration-150 ${
            toast.type === 'success'
              ? 'bg-[#18232D] text-white border-[#273642]'
              : 'bg-[#FBECEE] text-[#BC414A] border-[#BC414A]/30'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#258167]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#BC414A]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Field Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E4E8EC] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RaabtaLogo size="sm" showSubtitle={false} />
          <div className="h-4 w-px bg-[#E4E8EC] hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#18232D] uppercase tracking-wider">
              Field Responder Workspace
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF7F2] text-[#258167] border border-[#258167]/20">
              Active Unit
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right text-xs leading-tight">
            <span className="font-bold text-[#18232D]">
              {user?.displayName || 'Rescue Team RT-02'}
            </span>
            <span className="text-[10px] text-[#5F6B7A]">Inflatable Motorized Craft &bull; Paramedic Unit</span>
          </div>

          <button
            type="button"
            onClick={() => fetchFieldData(true)}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-[#5F6B7A] hover:text-[#18232D] hover:bg-[#F7F8FA] border border-[#E4E8EC] transition-colors cursor-pointer"
            title="Refresh active missions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#375A6B]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F7F8FA] hover:bg-[#FBECEE] text-[#5F6B7A] hover:text-[#BC414A] border border-[#E4E8EC] hover:border-[#BC414A]/30 transition-colors cursor-pointer"
            title="Sign out of field unit"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Field Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Unit Status Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#18232D] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#258167] animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-[#D9E1E6] uppercase">
                Vessel Status: Ready for Waterway Operations
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {user?.displayName || 'Rescue Team 02 (Delta Squad)'}
            </h2>
            <p className="text-xs text-[#D9E1E6]/80">
              Assigned Sector: Sector B Basin &bull; Draft: 0.25m &bull; Medical Emergency Certified
            </p>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:border-[#273642] sm:pl-5">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-[#D9E1E6] uppercase block">Assigned Missions</span>
              <span className="text-2xl font-black text-white font-mono">
                {missions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Missions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#18232D] uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#375A6B]" />
              <span>Assigned Rescue Missions</span>
            </h3>
            <span className="text-xs text-[#5F6B7A]">
              Real-time dispatch telemetry
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E4E8EC] space-y-3">
              <div className="w-6 h-6 border-2 border-[#18232D] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#5F6B7A]">Loading assigned unit missions...</p>
            </div>
          ) : missions.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-[#E4E8EC] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#258167] mx-auto" />
              <h4 className="text-sm font-bold text-[#18232D]">No pending missions assigned</h4>
              <p className="text-xs text-[#5F6B7A] max-w-sm mx-auto">
                Your unit is on standby. New emergency assignments from HQ Command will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {missions.map((mission) => {
                const isEnRoute = mission.status === 'en_route';
                const isCompleted = mission.status === 'completed';
                const inc = mission.incident;

                return (
                  <div
                    key={mission.id}
                    className={`rounded-2xl border bg-white p-5 sm:p-6 transition-all shadow-xs space-y-4 ${
                      isEnRoute
                        ? 'border-[#375A6B] ring-2 ring-[#375A6B]/10'
                        : isCompleted
                        ? 'border-[#258167]/30 bg-[#F7FBF9]'
                        : 'border-[#E4E8EC]'
                    }`}
                  >
                    {/* Mission Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E8EC] pb-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#18232D]">
                          MISSION #{mission.id.slice(0, 8)}
                        </span>
                        <PriorityBadge score={inc?.priority_score ?? 85} size="sm" />
                        <StatusBadge status={mission.status} size="sm" />
                      </div>

                      <div className="text-xs text-[#5F6B7A] flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#8B959E]" />
                        <span>{new Date(mission.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Mission Location & Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[#5F6B7A] font-semibold block text-[11px] uppercase tracking-wider">
                          Target Location / Address
                        </span>
                        <div className="flex items-start gap-1.5 font-bold text-[#18232D]">
                          <MapPin className="w-4 h-4 text-[#BC414A] shrink-0 mt-0.5" />
                          <span>{inc?.location_description || 'Sector B residential zone'}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[#5F6B7A] font-semibold block text-[11px] uppercase tracking-wider">
                          Critical Hazards &amp; Needs
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {inc?.trapped && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/20">
                              TRAPPED &bull; Water Rising
                            </span>
                          )}
                          {inc?.medical_urgent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/20 flex items-center gap-1">
                              <HeartPulse className="w-3 h-3 text-[#BC414A]" />
                              MED URGENT (Insulin)
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF0F4] text-[#375A6B] border border-[#375A6B]/20">
                            {inc?.people_count ?? 4} Evacuees
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Progression Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E8EC]">
                      <div className="text-xs text-[#5F6B7A]">
                        {isEnRoute ? (
                          <span className="text-[#375A6B] font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#375A6B] animate-ping" />
                            Craft in transit &bull; Approaching extraction point
                          </span>
                        ) : isCompleted ? (
                          <span className="text-[#258167] font-semibold">
                            Mission resolved &bull; Evacuees safe at shelter
                          </span>
                        ) : (
                          <span>Awaiting field team launch departure</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {mission.status === 'assigned' && (
                          <button
                            type="button"
                            onClick={() => handleStartMission(mission.id)}
                            disabled={activeActionId === mission.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#375A6B] hover:bg-[#294858] text-white transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Mark En Route / Depart</span>
                          </button>
                        )}

                        {mission.status === 'en_route' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCompletingMission(mission);
                              setAssistedCount(inc?.people_count ?? 4);
                            }}
                            disabled={activeActionId === mission.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#258167] hover:bg-[#1E6954] text-white transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete Rescue &bull; Deliver to Shelter</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Complete Mission Dialog */}
      {completingMission && (
        <div className="fixed inset-0 z-50 bg-[#18232D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E8EC] p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#258167] uppercase tracking-wider block">
                Field Mission Resolution
              </span>
              <h3 className="text-lg font-bold text-[#18232D]">
                Confirm Rescue Completion
              </h3>
              <p className="text-xs text-[#5F6B7A]">
                Report evacuees assisted and destination shelter for bed allocation.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#18232D] block">
                  Number of Persons Evacuated
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={assistedCount}
                  onChange={(e) => setAssistedCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E8EC] bg-[#F7F8FA] text-xs font-mono font-bold text-[#18232D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#18232D] block">
                  Destination Relief Shelter
                </label>
                <select
                  value={selectedShelterId}
                  onChange={(e) => setSelectedShelterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4E8EC] bg-[#F7F8FA] text-xs font-semibold text-[#18232D]"
                >
                  {shelters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.current_occupancy}/{s.capacity} beds occupied)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#18232D] block">
                  Field Handover Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Elderly resident stabilized with insulin. All 4 members escorted safely into shelter intake."
                  className="w-full p-2.5 rounded-xl border border-[#E4E8EC] bg-[#F7F8FA] text-xs text-[#18232D] placeholder-[#8B959E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E4E8EC]">
              <button
                type="button"
                onClick={() => setCompletingMission(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5F6B7A] hover:bg-[#F7F8FA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                disabled={activeActionId === completingMission.id}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#258167] hover:bg-[#1E6954] text-white transition-colors shadow-xs"
              >
                {activeActionId === completingMission.id ? 'Submitting...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
