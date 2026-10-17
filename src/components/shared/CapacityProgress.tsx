'use client';

import React from 'react';
import { formatNumber } from '@/lib/utils';
import { Users, AlertTriangle } from 'lucide-react';

interface CapacityProgressProps {
  total: number;
  occupied: number;
  label?: string;
  className?: string;
  showLabels?: boolean;
}

export function CapacityProgress({
  total,
  occupied,
  label = 'Shelter Occupancy',
  className = '',
  showLabels = true,
}: CapacityProgressProps) {
  // Prevent overflow math bugs
  const clampedOccupied = Math.min(occupied, total);
  const percentage = Math.round((clampedOccupied / total) * 100);
  const available = Math.max(0, total - occupied);
  const isFull = available === 0;
  const isNearCapacity = percentage >= 85;

  let barColor = 'bg-[#10B981]';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (isFull || percentage >= 95) {
    barColor = 'bg-[#F16D70]';
    badgeColor = 'text-red-700 bg-red-50 border-red-200';
  } else if (isNearCapacity) {
    barColor = 'bg-[#F5B544]';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{label}</span>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold border tabular-nums flex items-center gap-1 ${badgeColor}`}>
            {(isNearCapacity || isFull) && <AlertTriangle className="w-3 h-3 shrink-0" />}
            <span>{percentage}% full</span>
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between items-center text-[11px] text-slate-500 tabular-nums">
          <span>
            <strong className="text-slate-800">{formatNumber(clampedOccupied)}</strong> / {formatNumber(total)} occupied
          </span>
          <span className={`font-semibold ${available <= 20 ? 'text-red-600' : 'text-slate-600'}`}>
            {isFull ? '0 spaces left' : `${formatNumber(available)} beds available`}
          </span>
        </div>
      )}
    </div>
  );
}
