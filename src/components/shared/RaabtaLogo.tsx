'use client';

import React from 'react';

interface RaabtaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showUrdu?: boolean;
  variant?: 'light' | 'dark' | 'glass';
  isMarkOnly?: boolean;
}

/**
 * RAABTA (رابطہ) — Official Product Logo
 * Combines a location pin with two interconnected nodes forming an assistance lifeline link.
 */
export function RaabtaLogo({
  className = '',
  size = 'md',
  showSubtitle = false,
  showUrdu = false,
  variant = 'dark',
  isMarkOnly = false,
}: RaabtaLogoProps) {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  }[size];

  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  const markBackground = {
    dark: 'bg-[#18232D] text-white',
    light: 'bg-white text-[#18232D] border border-[#E4E8EC] shadow-2xs',
    glass: 'bg-white/15 text-white border border-white/25 backdrop-blur-xs',
  }[variant];

  const textColor = {
    dark: 'text-[#18232D]',
    light: 'text-[#18232D]',
    glass: 'text-white',
  }[variant];

  const subtextColor = {
    dark: 'text-[#5F6B7A]',
    light: 'text-[#6B7782]',
    glass: 'text-[#D9E1E6]',
  }[variant];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Connected Lifeline Pin SVG Icon */}
      <div
        className={`${iconDimensions} rounded-[10px] ${markBackground} flex items-center justify-center shrink-0 transition-colors shadow-2xs`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          {/* Location pin outer envelope */}
          <path d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5 6.5 11.5 7.5 12.5 1-1 7.5-7.5 7.5-12.5A7.5 7.5 0 0 0 12 2z" />
          {/* Node 1: Citizen / Distress node */}
          <circle cx="9.5" cy="9.5" r="1.5" fill="currentColor" />
          {/* Node 2: Responders / Assistance node */}
          <circle cx="14.5" cy="9.5" r="1.5" fill="currentColor" />
          {/* Connection Bridge: Lifeline linking the two nodes */}
          <path d="M9.5 9.5h5" strokeWidth="2.5" />
        </svg>
      </div>

      {!isMarkOnly && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight ${textSize} ${textColor}`}>
              RAABTA
            </span>
            {showUrdu && (
              <span
                dir="rtl"
                className={`font-serif text-xs font-semibold px-1 rounded bg-[#EAF0F4] text-[#375A6B] border border-[#375A6B]/20`}
              >
                رابطہ
              </span>
            )}
          </div>
          {showSubtitle && (
            <span className={`text-[10px] font-medium tracking-normal mt-0.5 ${subtextColor}`}>
              Disaster Response &amp; Coordination
            </span>
          )}
        </div>
      )}
    </div>
  );
}
