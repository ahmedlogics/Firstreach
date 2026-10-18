import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E8E6E1] bg-white text-[#757B81] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E8E6E1]">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#252A30] text-white flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-[#F7F6F2]" />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#252A30]">
                FirstReach
              </span>
              <span className="text-[11px] text-[#92979D]">
                Disaster Response Coordination Platform
              </span>
            </div>
            <p className="text-xs text-[#757B81] max-w-md">
              Algorithmic triage and community outreach coordinating scarce rescue resources during active flood disasters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#757B81]">
            <Link href="/" className="hover:text-[#252A30] transition-colors">
              Home
            </Link>
            <Link href="/report" className="hover:text-[#252A30] transition-colors">
              Report Emergency
            </Link>
            <Link href="/login" className="hover:text-[#252A30] transition-colors">
              Coordinator Login
            </Link>
            <Link href="/dashboard" className="hover:text-[#252A30] transition-colors">
              Operations Overview
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#92979D]">
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
