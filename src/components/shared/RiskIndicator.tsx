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
        return <ShieldAlert className="w-4 h-4 text-[#F16D70] animate-bounce" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-[#F5B544]" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
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
        <div className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
          {getIcon()}
          <span className="capitalize">{level} Risk Profile</span>
        </div>
        {showLabels && waterDepthMeters !== undefined && (
          <span className="font-mono tabular-nums text-slate-500 font-medium">
            ~{waterDepthMeters.toFixed(1)}m flood water
          </span>
        )}
      </div>

      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            level === 'critical'
              ? 'bg-[#F16D70]'
              : level === 'high'
              ? 'bg-[#F5B544]'
              : level === 'medium'
              ? 'bg-blue-500'
              : 'bg-[#10B981]'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {showLabels && timeToHarmHours !== undefined && (
        <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
          <span>Est. safety window:</span>
          <span className={`font-semibold tabular-nums ${timeToHarmHours <= 1.5 ? 'text-red-600' : 'text-slate-700'}`}>
            {timeToHarmHours <= 0 ? 'CRITICAL IMMINENT' : `${timeToHarmHours.toFixed(1)} hrs`}
          </span>
        </div>
      )}
    </div>
  );
}
