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
        return <ShieldAlert className="w-4 h-4 text-[#B74349]" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-[#A87426]" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-[#377D65]" />;
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
        <div className="flex items-center gap-1.5 font-semibold text-[#252A30]">
          {getIcon()}
          <span className="capitalize">{level} Risk Profile</span>
        </div>
        {showLabels && waterDepthMeters !== undefined && (
          <span className="font-mono tabular-nums text-[#757B81] font-medium">
            ~{waterDepthMeters.toFixed(1)}m flood water
          </span>
        )}
      </div>

      <div className="h-1.5 w-full bg-[#F7F6F2] rounded-full overflow-hidden border border-[#E8E6E1]">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            level === 'critical'
              ? 'bg-[#B74349]'
              : level === 'high'
              ? 'bg-[#A87426]'
              : level === 'medium'
              ? 'bg-[#536A82]'
              : 'bg-[#377D65]'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {showLabels && timeToHarmHours !== undefined && (
        <div className="flex justify-between text-[11px] text-[#757B81] pt-0.5">
          <span>Est. safety window:</span>
          <span className={`font-semibold tabular-nums ${timeToHarmHours <= 1.5 ? 'text-[#B74349]' : 'text-[#252A30]'}`}>
            {timeToHarmHours <= 0 ? 'CRITICAL IMMINENT' : `${timeToHarmHours.toFixed(1)} hrs`}
          </span>
        </div>
      )}
    </div>
  );
}
