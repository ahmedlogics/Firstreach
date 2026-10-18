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

  let barColor = 'bg-[#258167]';
  let badgeColor = 'text-[#258167] bg-[#E9F3EF] border-[#258167]/25';

  if (isFull || percentage >= 95) {
    barColor = 'bg-[#BC414A]';
    badgeColor = 'text-[#BC414A] bg-[#FBECEE] border-[#BC414A]/25';
  } else if (isNearCapacity) {
    barColor = 'bg-[#A87528]';
    badgeColor = 'text-[#A87528] bg-[#FFF4E3] border-[#A87528]/25';
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[#18232D]">
            <Users className="w-3.5 h-3.5 text-[#6B7782]" />
            <span>{label}</span>
          </div>
          <div className={`px-2 py-0.5 rounded-[6px] text-[11px] font-bold border tabular-nums flex items-center gap-1 ${badgeColor}`}>
            {(isNearCapacity || isFull) && <AlertTriangle className="w-3 h-3 shrink-0" />}
            <span>{percentage}% full</span>
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="h-2.5 w-full bg-[#F7F8FA] rounded-full overflow-hidden border border-[#E4E8EC] p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-200 ${barColor}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between items-center text-[11px] text-[#6B7782] tabular-nums">
          <span>
            <strong className="text-[#18232D] font-semibold">{formatNumber(clampedOccupied)}</strong> / {formatNumber(total)} occupied
          </span>
          <span className={`font-semibold ${available <= 20 ? 'text-[#BC414A]' : 'text-[#6B7782]'}`}>
            {isFull ? '0 spaces left' : `${formatNumber(available)} beds available`}
          </span>
        </div>
      )}
    </div>
  );
}
