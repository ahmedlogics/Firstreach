'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';

export function PublicNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F7F6F2]/95 backdrop-blur-md border-b border-[#E8E6E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#252A30] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <Shield className="w-4 h-4 text-[#F7F6F2]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-[#252A30]">
              FirstReach
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/20">
              v1.0
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#757B81]">
          <Link
            href="/#how-it-works"
            className="hover:text-[#252A30] transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#our-approach"
            className="hover:text-[#252A30] transition-colors"
          >
            Our Approach
          </Link>
          <Link
            href="/#unreachable"
            className="hover:text-[#252A30] transition-colors"
          >
            Reaching Unreachable
          </Link>
          <Link
            href="/login"
            className={`transition-colors ${pathname === '/login' ? 'text-[#252A30]' : 'hover:text-[#252A30]'}`}
          >
            Coordinator Login
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/report"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs ${
              pathname === '/report'
                ? 'bg-[#252A30] text-white'
                : 'bg-[#536A82] hover:bg-[#40566D] text-white'
            }`}
          >
            <span>Report Emergency</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#252A30] hover:bg-[#EDF1F5] transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8E6E1] bg-white px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-[#757B81] hover:text-[#252A30] py-1.5"
          >
            How It Works
          </Link>
          <Link
            href="/#our-approach"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-[#757B81] hover:text-[#252A30] py-1.5"
          >
            Our Approach
          </Link>
          <Link
            href="/#unreachable"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-[#757B81] hover:text-[#252A30] py-1.5"
          >
            Reaching Unreachable
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-[#757B81] hover:text-[#252A30] py-1.5"
          >
            Coordinator Login
          </Link>
          <div className="pt-2">
            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#536A82] text-white shadow-xs"
            >
              <span>Report Emergency</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
