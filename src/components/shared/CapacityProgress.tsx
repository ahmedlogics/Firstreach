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

  let barColor = 'bg-[#377D65]';
  let badgeColor = 'text-[#377D65] bg-[#E5EEE8] border-[#377D65]/30';

  if (isFull || percentage >= 95) {
    barColor = 'bg-[#B74349]';
    badgeColor = 'text-[#B74349] bg-[#FAE8E7] border-[#B74349]/30';
  } else if (isNearCapacity) {
    barColor = 'bg-[#A87426]';
    badgeColor = 'text-[#A87426] bg-[#FFF2DD] border-[#A87426]/30';
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[#252A30]">
            <Users className="w-3.5 h-3.5 text-[#757B81]" />
            <span>{label}</span>
          </div>
          <div className={`px-2 py-0.5 rounded-md text-[11px] font-bold border tabular-nums flex items-center gap-1 ${badgeColor}`}>
            {(isNearCapacity || isFull) && <AlertTriangle className="w-3 h-3 shrink-0" />}
            <span>{percentage}% full</span>
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="h-2.5 w-full bg-[#F7F6F2] rounded-full overflow-hidden border border-[#E8E6E1] p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between items-center text-[11px] text-[#757B81] tabular-nums">
          <span>
            <strong className="text-[#252A30]">{formatNumber(clampedOccupied)}</strong> / {formatNumber(total)} occupied
          </span>
          <span className={`font-semibold ${available <= 20 ? 'text-[#B74349]' : 'text-[#757B81]'}`}>
            {isFull ? '0 spaces left' : `${formatNumber(available)} beds available`}
          </span>
        </div>
      )}
    </div>
  );
}
