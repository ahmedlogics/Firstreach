'use client';

import React from 'react';
import { SeverityLevel } from '@/lib/types';
import { getSeverityColor } from '@/lib/utils';
import { ShieldAlert, AlertCircle, ShieldCheck } from 'lucide-react';

interface RiskIndicatorProps {
  level: SeverityLevel;
  waterDepthMeters?: number;
  timeToHarmHours?: number;
  showLabels?: boolean;
  className?: string;
}

export function RiskIndicator({
  level,
  waterDepthMeters,
  timeToHarmHours,
  showLabels = true,
  className = '',
}: RiskIndicatorProps) {
  const meta = getSeverityColor(level);

  const getIcon = () => {
    switch (level) {
      case 'critical':
        return <ShieldAlert className="w-4 h-4 text-[#BC414A]" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-[#A87528]" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-[#258167]" />;
    }
  };

  const percent = {
    critical: 95,
    high: 75,
    medium: 45,
    low: 20,
  }[level];

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[#18232D]">
          {getIcon()}
          <span className="capitalize">{level} Risk Profile</span>
        </div>
        {showLabels && waterDepthMeters !== undefined && (
          <span className="font-mono tabular-nums text-[#6B7782] font-medium">
            ~{waterDepthMeters.toFixed(1)}m flood water
          </span>
        )}
      </div>

      <div className="h-1.5 w-full bg-[#F7F8FA] rounded-full overflow-hidden border border-[#E4E8EC]">
        <div
          className={`h-full transition-all duration-200 rounded-full ${
            level === 'critical'
              ? 'bg-[#BC414A]'
              : level === 'high'
              ? 'bg-[#A87528]'
              : level === 'medium'
              ? 'bg-[#375A6B]'
              : 'bg-[#258167]'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {showLabels && timeToHarmHours !== undefined && (
        <div className="flex justify-between text-[11px] text-[#6B7782] pt-0.5">
          <span>Est. safety window:</span>
          <span className={`font-semibold tabular-nums ${timeToHarmHours <= 1.5 ? 'text-[#BC414A]' : 'text-[#18232D]'}`}>
            {timeToHarmHours <= 0 ? 'CRITICAL IMMINENT' : `${timeToHarmHours.toFixed(1)} hrs`}
          </span>
        </div>
      )}
    </div>
  );
}
