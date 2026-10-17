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
    <div className={`p-6 rounded-2xl border border-red-200 bg-red-50/50 flex flex-col items-center text-center ${className}`}>
      <div className="w-10 h-10 rounded-full bg-red-100 text-[#F16D70] flex items-center justify-center mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-bold text-red-900 mb-1">{title}</h4>
      <p className="text-xs text-red-700/80 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-red-200 text-red-700 shadow-subtle hover:bg-red-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
}
