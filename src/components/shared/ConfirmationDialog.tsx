'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'teal' | 'warning';
  isDemoAction?: boolean;
  details?: React.ReactNode;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'teal',
  isDemoAction = true,
  details,
}: ConfirmationDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantButtonClass = {
    teal: 'bg-[#536A82] hover:bg-[#40566D] text-white focus:ring-[#536A82]',
    danger: 'bg-[#B74349] hover:bg-[#96373c] text-white focus:ring-[#B74349]',
    warning: 'bg-[#A87426] hover:bg-[#8c601f] text-white focus:ring-[#A87426]',
  }[variant];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E8E6E1] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E6E1]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              variant === 'danger' ? 'bg-[#FAE8E7] text-[#B74349]' : variant === 'warning' ? 'bg-[#FFF2DD] text-[#A87426]' : 'bg-[#EDF1F5] text-[#536A82]'
            }`}>
              {variant === 'danger' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <h3 className="text-lg font-bold text-[#252A30]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#92979D] hover:text-[#252A30] hover:bg-[#EDF1F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#757B81] leading-relaxed">
            {description}
          </p>

          {details && (
            <div className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] text-xs text-[#252A30] space-y-2">
              {details}
            </div>
          )}

          {isDemoAction && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFF2DD] border border-[#A87426]/30 text-[#A87426] text-xs">
              <ShieldAlert className="w-4 h-4 text-[#A87426] shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Simulated Action Notice:</strong> In this hackathon demo build, this action triggers local state workflow updates. Live radio and satellite dispatch triggers will link to Supabase RPC hooks in Phase 2.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#F7F6F2] border-t border-[#E8E6E1]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#757B81] hover:bg-[#E8E6E1] rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg shadow-subtle focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${variantButtonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
