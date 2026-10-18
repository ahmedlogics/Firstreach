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
      color: 'bg-[#258167]',
      text: 'Telemetry Active',
      subtext: 'Supabase Engine Online',
      textColor: 'text-[#258167]',
      bgColor: 'bg-[#E9F3EF]',
      borderColor: 'border-[#258167]/25',
    },
    syncing: {
      color: 'bg-[#A87528]',
      text: 'Syncing Simulation',
      subtext: 'Re-calculating crest models',
      textColor: 'text-[#A87528]',
      bgColor: 'bg-[#FFF4E3]',
      borderColor: 'border-[#A87528]/25',
    },
    offline: {
      color: 'bg-[#BC414A]',
      text: 'Simulation Disconnected',
      subtext: 'Cached state active',
      textColor: 'text-[#BC414A]',
      bgColor: 'bg-[#FBECEE]',
      borderColor: 'border-[#BC414A]/25',
    },
  }[status];

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] text-xs font-medium border ${config.bgColor} ${config.borderColor} ${className}`}
      title="System operational telemetry and database connection status"
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`} />
      </span>
      <Wifi className={`w-3.5 h-3.5 ${config.textColor}`} />
      <span className={config.textColor}>{config.text}</span>
      {showDetails && (
        <span className="text-[#8B959E] text-[11px] border-l border-[#E4E8EC] pl-1.5 ml-0.5">
          {config.subtext}
        </span>
      )}
    </div>
  );
}
