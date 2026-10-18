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
      color: 'bg-[#377D65]',
      text: 'Telemetry Active',
      subtext: 'Supabase Engine Online',
      textColor: 'text-[#377D65]',
      bgColor: 'bg-[#E5EEE8]',
      borderColor: 'border-[#377D65]/30',
    },
    syncing: {
      color: 'bg-[#A87426]',
      text: 'Syncing Simulation',
      subtext: 'Re-calculating crest models',
      textColor: 'text-[#A87426]',
      bgColor: 'bg-[#FFF2DD]',
      borderColor: 'border-[#A87426]/30',
    },
    offline: {
      color: 'bg-[#B74349]',
      text: 'Simulation Disconnected',
      subtext: 'Cached state active',
      textColor: 'text-[#B74349]',
      bgColor: 'bg-[#FAE8E7]',
      borderColor: 'border-[#B74349]/30',
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
