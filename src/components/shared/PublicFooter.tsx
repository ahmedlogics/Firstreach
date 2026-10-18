import React from 'react';
import Link from 'next/link';
import { RaabtaLogo } from '@/components/shared/RaabtaLogo';

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E4E8EC] bg-white text-[#6B7782] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E4E8EC]">
          <div className="space-y-2">
            <RaabtaLogo size="md" variant="light" showSubtitle={true} showUrdu={true} />
            <p className="text-xs text-[#6B7782] max-w-md pt-1">
              Connecting vulnerable communities, emergency coordinators, and rescue resources during active flood disasters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#6B7782]">
            <Link href="/" className="hover:text-[#18232D] transition-colors">
              Home
            </Link>
            <Link href="/report" className="hover:text-[#18232D] transition-colors">
              Report Emergency
            </Link>
            <Link href="/login" className="hover:text-[#18232D] transition-colors">
              Coordinator Login
            </Link>
            <Link href="/dashboard" className="hover:text-[#18232D] transition-colors">
              Operations Overview
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#8B959E]">
          <p>
            Developed for CODE//CONNECT&apos;26 Hackathon &bull; Open-source civic disaster intelligence prototype.
          </p>
          <p className="italic">
            Notice: Not an active 911/1122 dispatch service. Actions and data are hackathon demonstrations.
          </p>
        </div>
      </div>
    </footer>
  );
}
