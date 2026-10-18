'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RaabtaLogo } from '@/components/shared/RaabtaLogo';
import { RequireAuth, useAuth } from '@/lib/auth/AuthContext';
import { OutreachActionWithDetails, OutreachStatusType } from '@/lib/outreach/types';
import {
  Users2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Footprints,
  FileCheck,
  Check,
  X,
  Phone,
  HelpCircle,
} from 'lucide-react';

export default function VolunteerWorkspacePage() {
  return (
    <RequireAuth allowedRoles={['volunteer', 'coordinator']}>
      <VolunteerWorkspaceContent />
    </RequireAuth>
  );
}

function VolunteerWorkspaceContent() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<OutreachActionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'my_visits' | 'completed'>('available');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Outcome submission state
  const [reportingTask, setReportingTask] = useState<OutreachActionWithDetails | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<OutreachStatusType>('safe_confirmed');
  const [outcomeNote, setOutcomeNote] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchVolunteerTasks = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/outreach-actions?channel=volunteer_visit');
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data || []);
      }
    } catch (err) {
      console.error('[VolunteerWorkspace] fetch error:', err);
      showToast('error', 'Unable to refresh verification tasks.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteerTasks();
    const interval = setInterval(() => fetchVolunteerTasks(), 12000);
    return () => clearInterval(interval);
  }, [fetchVolunteerTasks]);

  // Filter tasks into tabs
  const availableTasks = useMemo(() => tasks.filter((t) => t.status === 'planned'), [tasks]);
  const activeVisits = useMemo(() => tasks.filter((t) => t.status === 'visit_assigned'), [tasks]);
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === 'safe_confirmed' || t.status === 'needs_help' || t.status === 'no_response'),
    [tasks]
  );

  // Claim a planned task
  const handleClaimTask = async (taskId: string) => {
    setActiveActionId(taskId);
    try {
      const res = await fetch(`/api/outreach-actions/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'visit_assigned',
          note: `Claimed by community volunteer ${user?.displayName || 'Scout'}. Ground patrol underway.`,
        }),
      });

      if (!res.ok) throw new Error('Failed to claim task');

      showToast('success', 'Task claimed! Moved to Active Visits.');
      setActiveTab('my_visits');
      fetchVolunteerTasks();
    } catch (err: any) {
      showToast('error', err.message || 'Error claiming task');
    } finally {
      setActiveActionId(null);
    }
  };

  // Submit outcome
  const handleSubmitOutcome = async () => {
    if (!reportingTask) return;
    setActiveActionId(reportingTask.id);
    try {
      const res = await fetch(`/api/outreach-actions/${reportingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: outcomeStatus,
          note: outcomeNote || `Field visit completed by ${user?.displayName || 'Volunteer'}. Outcome verified.`,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit outcome report');

      showToast('success', 'Verification report submitted successfully.');
      setReportingTask(null);
      setOutcomeNote('');
      fetchVolunteerTasks();
    } catch (err: any) {
      showToast('error', err.message || 'Error submitting outcome');
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

      {/* Volunteer Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E4E8EC] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RaabtaLogo size="sm" showSubtitle={false} />
          <div className="h-4 w-px bg-[#E4E8EC] hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#18232D] uppercase tracking-wider">
              Volunteer Ground Workspace
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EAF0F4] text-[#375A6B] border border-[#375A6B]/20">
              Scout Network
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right text-xs leading-tight">
            <span className="font-bold text-[#18232D]">
              {user?.displayName || 'Community Scout'}
            </span>
            <span className="text-[10px] text-[#5F6B7A]">Verified Ground Volunteer</span>
          </div>

          <button
            type="button"
            onClick={() => fetchVolunteerTasks(true)}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-[#5F6B7A] hover:text-[#18232D] hover:bg-[#F7F8FA] border border-[#E4E8EC] transition-colors cursor-pointer"
            title="Refresh verification tasks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#375A6B]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F7F8FA] hover:bg-[#FBECEE] text-[#5F6B7A] hover:text-[#BC414A] border border-[#E4E8EC] hover:border-[#BC414A]/30 transition-colors cursor-pointer"
            title="Sign out of volunteer workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Volunteer Mission Banner */}
        <div className="p-5 rounded-2xl bg-[#18232D] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#258167]" />
              <span className="text-xs font-mono font-bold tracking-wider text-[#D9E1E6] uppercase">
                Field Verification Protocol
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Reaching Silent Households
            </h2>
            <p className="text-xs text-[#D9E1E6]/80 max-w-lg">
              Check in person on vulnerable homes in silent zones that cannot place phone calls. Confirm whether residents are safe or require immediate rescue allocation.
            </p>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-[#273642] pt-3 sm:pt-0 sm:pl-5">
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-[#D9E1E6] uppercase block">Available</span>
              <span className="text-2xl font-black text-white font-mono">
                {availableTasks.length}
              </span>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-[10px] text-[#D9E1E6] uppercase block">In Progress</span>
              <span className="text-2xl font-black text-[#A87528] font-mono">
                {activeVisits.length}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Filter Strip */}
        <div className="flex items-center gap-2 border-b border-[#E4E8EC] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'available'
                ? 'bg-[#18232D] text-white shadow-xs'
                : 'text-[#5F6B7A] hover:bg-[#E4E8EC]/60 hover:text-[#18232D]'
            }`}
          >
            Available to Claim ({availableTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my_visits')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'my_visits'
                ? 'bg-[#18232D] text-white shadow-xs'
                : 'text-[#5F6B7A] hover:bg-[#E4E8EC]/60 hover:text-[#18232D]'
            }`}
          >
            Visits in Progress ({activeVisits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-[#18232D] text-white shadow-xs'
                : 'text-[#5F6B7A] hover:bg-[#E4E8EC]/60 hover:text-[#18232D]'
            }`}
          >
            Completed Outcomes ({completedTasks.length})
          </button>
        </div>

        {/* Task Cards Container */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E4E8EC] space-y-3">
              <div className="w-6 h-6 border-2 border-[#18232D] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#5F6B7A]">Loading ground verification tasks...</p>
            </div>
          ) : (
            (() => {
              const displayList =
                activeTab === 'available'
                  ? availableTasks
                  : activeTab === 'my_visits'
                  ? activeVisits
                  : completedTasks;

              if (displayList.length === 0) {
                return (
                  <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-[#E4E8EC] space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-[#258167] mx-auto" />
                    <h4 className="text-sm font-bold text-[#18232D]">No tasks in this category</h4>
                    <p className="text-xs text-[#5F6B7A]">
                      {activeTab === 'available'
                        ? 'All registered silent-zone households have active verification patrols.'
                        : activeTab === 'my_visits'
                        ? 'You have no verification visits currently underway. Select an available task to claim it.'
                        : 'No completed tasks recorded during this operational window.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {displayList.map((task) => {
                    const isClaiming = activeActionId === task.id;

                    return (
                      <div
                        key={task.id}
                        className="p-5 rounded-2xl border border-[#E4E8EC] bg-white shadow-xs space-y-3 hover:border-[#375A6B]/40 transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E8EC] pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#18232D]">
                              TASK #{task.id.slice(0, 8)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                task.status === 'safe_confirmed'
                                  ? 'bg-[#EBF7F2] text-[#258167] border border-[#258167]/30'
                                  : task.status === 'needs_help'
                                  ? 'bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/30'
                                  : task.status === 'visit_assigned'
                                  ? 'bg-[#FFF4E3] text-[#A87528] border border-[#A87528]/30'
                                  : 'bg-[#F0F4F8] text-[#375A6B] border border-[#375A6B]/30'
                              }`}
                            >
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>

                          <span className="text-[11px] font-mono text-[#5F6B7A]">
                            {task.created_at ? new Date(task.created_at).toLocaleTimeString() : 'Pending'}
                          </span>
                        </div>

                        {/* Household Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[11px] text-[#5F6B7A] block font-semibold">
                              Target Household / Resident
                            </span>
                            <span className="font-bold text-[#18232D] text-sm block mt-0.5">
                              {task.household_label || 'Unregistered Household'}
                            </span>
                            <div className="flex items-center gap-1.5 text-[#5F6B7A] mt-1 text-[11px]">
                              <MapPin className="w-3.5 h-3.5 text-[#BC414A] shrink-0" />
                              <span>{task.zone_name || 'Assigned Flood Sector'}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] text-[#5F6B7A] block font-semibold">
                              Task Assignment Channel
                            </span>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              <span className="px-2 py-0.5 rounded bg-[#EAF0F4] text-[#375A6B] font-semibold text-[10px] border border-[#375A6B]/20 uppercase">
                                {task.channel.replace('_', ' ')}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#FFF4E3] text-[#A87528] font-semibold text-[10px] border border-[#A87528]/20">
                                Ground Verification
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {task.note && (
                          <div className="p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E4E8EC] text-[11px] text-[#5F6B7A]">
                            <strong className="text-[#18232D]">Notes: </strong>
                            {task.note}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E4E8EC]">
                          {task.status === 'planned' && (
                            <button
                              type="button"
                              onClick={() => handleClaimTask(task.id)}
                              disabled={isClaiming}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#375A6B] hover:bg-[#294858] text-white transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <Footprints className="w-3.5 h-3.5" />
                              <span>{isClaiming ? 'Claiming...' : 'Claim & Start Visit'}</span>
                            </button>
                          )}

                          {task.status === 'visit_assigned' && (
                            <button
                              type="button"
                              onClick={() => {
                                setReportingTask(task);
                                setOutcomeStatus('safe_confirmed');
                                setOutcomeNote('');
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#258167] hover:bg-[#1E6954] text-white transition-colors shadow-xs cursor-pointer"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Submit Verification Findings</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      </main>

      {/* Verification Outcome Dialog */}
      {reportingTask && (
        <div className="fixed inset-0 z-50 bg-[#18232D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E8EC] p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#375A6B] uppercase tracking-wider block">
                Ground Verification Outcome
              </span>
              <h3 className="text-lg font-bold text-[#18232D]">
                Report Findings for {reportingTask.household_label || 'Household'}
              </h3>
              <p className="text-xs text-[#5F6B7A]">
                Record observed status. Critical cases trigger immediate dispatch escalation.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#18232D] block">
                  Observed Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOutcomeStatus('safe_confirmed')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      outcomeStatus === 'safe_confirmed'
                        ? 'border-[#258167] bg-[#EBF7F2] text-[#258167] font-bold'
                        : 'border-[#E4E8EC] hover:bg-[#F7F8FA] text-[#18232D]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mb-1" />
                    <span className="block text-xs">Safe Confirmed</span>
                    <span className="text-[10px] opacity-75 font-normal">Water receding / safe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOutcomeStatus('needs_help')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      outcomeStatus === 'needs_help'
                        ? 'border-[#BC414A] bg-[#FBECEE] text-[#BC414A] font-bold'
                        : 'border-[#E4E8EC] hover:bg-[#F7F8FA] text-[#18232D]'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 mb-1" />
                    <span className="block text-xs">Needs Rescue</span>
                    <span className="text-[10px] opacity-75 font-normal">Escalate to Dispatch</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#18232D] block">
                  Field Observations &amp; Notes
                </label>
                <textarea
                  rows={3}
                  value={outcomeNote}
                  onChange={(e) => setOutcomeNote(e.target.value)}
                  placeholder="e.g. In-person visit conducted. Resident confirmed family is safe on second floor with clean drinking water."
                  className="w-full p-2.5 rounded-xl border border-[#E4E8EC] bg-[#F7F8FA] text-xs text-[#18232D] placeholder-[#8B959E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E4E8EC]">
              <button
                type="button"
                onClick={() => setReportingTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5F6B7A] hover:bg-[#F7F8FA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitOutcome}
                disabled={activeActionId === reportingTask.id}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#18232D] hover:bg-[#25323F] text-white transition-colors shadow-xs"
              >
                {activeActionId === reportingTask.id ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
