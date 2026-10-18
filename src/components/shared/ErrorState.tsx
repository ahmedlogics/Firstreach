'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Telemetry Stream Interrupted',
  message = 'An unexpected error occurred while communicating with the coordination layer. Try re-evaluating the incident queue.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`p-6 rounded-xl border border-[#BC414A]/25 bg-[#FBECEE] flex flex-col items-center text-center ${className}`}>
      <div className="w-10 h-10 rounded-[10px] bg-white text-[#BC414A] flex items-center justify-center mb-3 shadow-subtle border border-[#BC414A]/20">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-[#BC414A] mb-1">{title}</h4>
      <p className="text-xs text-[#6B7782] max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-white border border-[#BC414A]/25 text-[#BC414A] shadow-subtle hover:bg-[#FBECEE] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
}
