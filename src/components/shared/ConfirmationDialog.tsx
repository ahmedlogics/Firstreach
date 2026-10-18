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
    teal: 'bg-[#375A6B] hover:bg-[#294858] text-white focus:ring-[#375A6B]',
    danger: 'bg-[#BC414A] hover:bg-[#96373c] text-white focus:ring-[#BC414A]',
    warning: 'bg-[#A87528] hover:bg-[#8c601f] text-white focus:ring-[#A87528]',
  }[variant];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-[#E4E8EC] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E4E8EC]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-[10px] ${
              variant === 'danger' ? 'bg-[#FBECEE] text-[#BC414A]' : variant === 'warning' ? 'bg-[#FFF4E3] text-[#A87528]' : 'bg-[#EAF0F4] text-[#375A6B]'
            }`}>
              {variant === 'danger' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-[#18232D]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-[#8B959E] hover:text-[#18232D] hover:bg-[#F7F8FA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#6B7782] leading-relaxed">
            {description}
          </p>

          {details && (
            <div className="p-4 rounded-[10px] bg-[#F7F8FA] border border-[#E4E8EC] text-xs text-[#18232D] space-y-2">
              {details}
            </div>
          )}

          {isDemoAction && (
            <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-[#FFF4E3] border border-[#A87528]/25 text-[#A87528] text-xs">
              <ShieldAlert className="w-4 h-4 text-[#A87528] shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Simulated Action Notice:</strong> In this hackathon demo build, this action triggers local state workflow updates. Live radio and satellite dispatch triggers will link to Supabase RPC hooks in Phase 2.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#F7F8FA] border-t border-[#E4E8EC]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#6B7782] hover:bg-[#E4E8EC] border border-[#E4E8EC] rounded-[10px] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-[10px] shadow-subtle focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${variantButtonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
