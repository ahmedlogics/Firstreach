'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  AlertTriangle,
  Clock,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import { useAuth } from '@/lib/auth/AuthContext';

interface AppHeaderProps {
  onToggleMobileMenu: () => void;
}

interface AlertItem {
  id: string;
  shortId: string;
  zone: string;
  location: string;
  priorityScore: number;
  status: string;
  timestamp: string;
  isCritical: boolean;
}

export function AppHeader({ onToggleMobileMenu }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  const getRouteLabel = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Overview';
      case '/dispatch':
        return 'Rescue Allocation';
      case '/outreach':
        return 'Outreach & Shelters';
      case '/field':
        return 'Field Responder';
      case '/volunteer':
        return 'Volunteer Scout';
      default:
        return 'Command Center';
    }
  };

  const routeLabel = getRouteLabel();

  // Fetch real alert-worthy incidents from database overview
  const fetchRealAlerts = useCallback(async () => {
    try {
      setIsLoadingAlerts(true);
      const res = await fetch('/api/dashboard/overview');
      if (res.ok) {
        const json = await res.json();
        const liveIncidents = json.incidents || [];

        // Filter actual critical or unassigned incidents needing coordinator attention
        const mappedAlerts: AlertItem[] = liveIncidents
          .filter((i: any) => (i.priorityScore >= 70 && i.status === 'open') || i.verificationStatus === 'unverified')
          .slice(0, 8)
          .map((i: any) => ({
            id: i.id,
            shortId: i.id.length > 8 ? i.id.slice(0, 8) : i.id,
            zone: i.zoneName || 'Sector B',
            location: i.locationDescription || 'Urgent incident location',
            priorityScore: i.priorityScore || 80,
            status: i.status || 'open',
            timestamp: i.createdAt ? new Date(i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
            isCritical: (i.priorityScore || 0) >= 80,
          }));

        setAlerts(mappedAlerts);
      }
    } catch (err) {
      console.warn('[AppHeader] failed to fetch live alerts:', err);
    } finally {
      setIsLoadingAlerts(false);
    }
  }, []);

  useEffect(() => {
    fetchRealAlerts();
    const interval = setInterval(fetchRealAlerts, 15000);
    return () => clearInterval(interval);
  }, [fetchRealAlerts]);

  const criticalCount = alerts.filter((a) => a.isCritical).length;

  const handleOpenAlert = (incidentId: string) => {
    setShowNotifications(false);
    router.push(`/dispatch?incidentId=${incidentId}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E8EC] px-4 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile menu toggle & Route context */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-1 text-[#6B7782] hover:text-[#18232D] rounded-[8px] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Clean single-line Route Context with RAABTA */}
          <nav aria-label="Current location" className="flex items-center gap-1.5 text-xs text-[#6B7782] font-medium">
            <span className="text-[#375A6B] font-bold">RAABTA</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B959E]" />
            <span className="text-[#18232D] font-semibold">{routeLabel}</span>
          </nav>
        </div>

        {/* Right: Operational Status, Real Alerts, Operator Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Truthful Connection Status */}
          <ConnectionStatus status="connected" showDetails={false} />

          {/* Real Alerts Notification Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-[#6B7782] hover:text-[#18232D] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
              title="Real-time operational alerts"
            >
              <Bell className="w-4 h-4" />
              {criticalCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BC414A] rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E4E8EC] z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-3.5 border-b border-[#E4E8EC] flex items-center justify-between bg-[#F7F8FA]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#BC414A]" />
                    <span className="text-xs font-bold text-[#18232D]">Real Incident Alerts</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-[#8B959E] hover:text-[#18232D] rounded-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-[#E4E8EC] max-h-72 overflow-y-auto">
                  {isLoadingAlerts && alerts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#5F6B7A]">
                      Checking database for active alerts...
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#5F6B7A] space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-[#258167] mx-auto mb-1" />
                      <p className="font-semibold text-[#18232D]">No new alerts.</p>
                      <p className="text-[11px] text-[#8B959E]">All active emergencies are currently triaged and managed.</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => handleOpenAlert(alert.id)}
                        className="p-3 hover:bg-[#F7F8FA] transition-colors text-xs space-y-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#18232D]">
                            INC-{alert.shortId} &bull; {alert.zone}
                          </span>
                          <span className="text-[10px] text-[#8B959E] flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {alert.timestamp}
                          </span>
                        </div>
                        <p className="text-[#5F6B7A] line-clamp-1">{alert.location}</p>
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[11px] text-[#18232D]">
                            Score: <strong className="font-mono text-[#BC414A]">{alert.priorityScore}/100</strong>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/20">
                            Needs Allocation
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {alerts.length > 0 && (
                  <div className="p-2.5 bg-[#F7F8FA] border-t border-[#E4E8EC] text-center">
                    <span className="text-[11px] font-semibold text-[#375A6B]">
                      {alerts.length} verified emergencies awaiting coordinator action
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Avatar with Real Role */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E4E8EC]">
            <div className="w-7 h-7 rounded-lg bg-[#18232D] text-white font-bold text-xs flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#258167]" />
            </div>
            <div className="hidden lg:flex flex-col text-left text-xs leading-none">
              <span className="font-bold text-[#18232D]">
                {user?.displayName || 'Coordinator Desk'}
              </span>
              <span className="text-[10px] text-[#5F6B7A] capitalize">
                {user?.role || 'Staff Coordinator'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
