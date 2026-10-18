'use client';

import React from 'react';
import { Language, TRANSLATIONS } from '@/lib/reports/i18n';
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
      className={`inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-xs ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <div className="flex items-center gap-1 pl-2 pr-1 text-slate-400 select-none">
        <Globe className="w-3.5 h-3.5 text-teal-600" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hidden sm:inline">
          Language
        </span>
      </div>

      <div className="flex items-center gap-1">
        {languages.map((lang) => {
          const isActive = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange(lang.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#14B8A6] text-white shadow-xs scale-102'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
