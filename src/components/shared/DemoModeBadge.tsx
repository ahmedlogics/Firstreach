'use妹client';

import React from 'react';
import { Database, ShieldAlert } from 'lucide-react';

interface DemoModeBadgeProps {
  className?: string;
  variant?: 'compact' | 'expanded';
}

export function DemoModeBadge({ className = '', variant = 'compact' }: DemoModeBadgeProps) {
  if (variant === 'expanded') {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium ${className}`}>
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <div>
          <span className="font-semibold uppercase tracking-wider text-[10px] bg-amber-400/20 px-1.5 py-0.5 rounded mr-1.5 text-amber-200">
            Demo Mode
          </span>
          <span className="text-amber-300/90">Synthetic Karachi Flood Data</span>
        </div>
      </div>
    );
  }

  return (
    <span
      title="This environment is operating on simulated flood data for CODE//CONNECT hackathon evaluation."
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 border border-amber-200 text-amber-800 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#F5B544] animate-ping" />
      <Database className="w-3.5 h-3.5 text-amber-600" />
      <span>Demo Data (Simulated)</span>
    </span>
  );
}
