'use client';

import React from 'react';
import { getPriorityScoreColor } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface PriorityBadgeProps {
  score: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriorityBadge({
  score,
  showScore = true,
  size = 'md',
  className = '',
}: PriorityBadgeProps) {
  const meta = getPriorityScoreColor(score);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${meta.badge} ${sizeClasses} ${className}`}
      title={`Calculated Priority Score: ${score}/100. Combines time-to-harm, mobility factors, medical necessity, and flood crest telemetry.`}
    >
      <Flame className={`w-3.5 h-3.5 shrink-0 ${score >= 90 ? 'text-[#B74349]' : score >= 70 ? 'text-[#A87426]' : 'text-[#536A82]'}`} />
      <span>{meta.level}</span>
      {showScore && (
        <span className="font-mono tabular-nums font-bold border-l border-current/20 pl-1.5 ml-0.5">
          {score}
        </span>
      )}
    </div>
  );
}
