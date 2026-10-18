'use client';

import React from 'react';
import { Language } from '@/lib/reports/i18n';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  className?: string;
}

export function LanguageSelector({
  currentLanguage,
  onLanguageChange,
  className = '',
}: LanguageSelectorProps) {
  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ur', label: 'Urdu', native: 'اردو' },
    { code: 'sd', label: 'Sindhi', native: 'سنڌي' },
  ];

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-lg bg-[#F7F8FA] border border-[#E4E8EC] shadow-2xs ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <div className="flex items-center gap-1 pl-1.5 pr-1 text-[#5F6B7A] select-none">
        <Globe className="w-3.5 h-3.5 text-[#375A6B]" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5F6B7A] hidden sm:inline">
          Language
        </span>
      </div>

      <div className="flex items-center gap-0.5">
        {languages.map((lang) => {
          const isActive = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange(lang.code)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#18232D] text-white shadow-xs'
                  : 'text-[#5F6B7A] hover:text-[#18232D] hover:bg-[#E4E8EC]/60'
              }`}
              title={`Switch to ${lang.label} (${lang.native})`}
            >
              <span>{lang.native}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
