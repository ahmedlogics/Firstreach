'use client';

import React from 'react';
import { Wifi, Activity } from 'lucide-react';

interface ConnectionStatusProps {
  status?: 'connected' | 'syncing' | 'offline';
  className?: string;
  showDetails?: boolean;
}

export function ConnectionStatus({
  status = 'connected',
  className = '',
  showDetails = false,
}: ConnectionStatusProps) {
  const config = {
    connected: {
      color: 'bg-emerald-500',
      text: 'Telemetry Active',
      subtext: 'Supabase Engine Online',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    syncing: {
      color: 'bg-amber-500',
      text: 'Syncing Simulation',
      subtext: 'Re-calculating crest models',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    offline: {
      color: 'bg-red-500',
      text: 'Simulation Disconnected',
      subtext: 'Cached state active',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  }[status];

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bgColor} ${config.borderColor} ${className}`}
      title="System operational telemetry and database connection status"
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`} />
      </span>
      <Wifi className={`w-3.5 h-3.5 ${config.textColor}`} />
      <span className={config.textColor}>{config.text}</span>
      {showDetails && (
        <span className="text-slate-400 text-[11px] border-l border-slate-200 pl-1.5 ml-0.5">
          {config.subtext}
        </span>
      )}
    </div>
  );
}
