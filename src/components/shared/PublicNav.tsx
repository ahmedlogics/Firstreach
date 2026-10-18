'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';
import { RaabtaLogo } from '@/components/shared/RaabtaLogo';

export function PublicNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener for homepage transparent navbar transition
  React.useEffect(() => {
    if (!isHome) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 48);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const isTransparent = isHome && !isScrolled && !mobileMenuOpen;

  return (
    <header
      className={`${
        isHome ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
      } z-50 transition-colors duration-300 ${
        isTransparent
          ? 'bg-gradient-to-b from-[#081219]/70 via-[#081219]/30 to-transparent border-b border-transparent'
          : 'bg-[#F7F8FA]/90 backdrop-blur-md border-b border-[#E4E8EC] shadow-2xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <RaabtaLogo
            size="sm"
            variant={isTransparent ? 'glass' : 'dark'}
            showUrdu={true}
            showSubtitle={false}
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav
          className={`hidden md:flex items-center gap-8 text-xs font-semibold transition-colors ${
            isTransparent ? 'text-[#D9E1E6]' : 'text-[#6B7782]'
          }`}
        >
          <Link
            href="/#how-it-works"
            className={`transition-colors ${
              isTransparent ? 'hover:text-white' : 'hover:text-[#18232D]'
            }`}
          >
            How It Works
          </Link>
          <Link
            href="/#interactive-demo"
            className={`transition-colors ${
              isTransparent ? 'hover:text-white' : 'hover:text-[#18232D]'
            }`}
          >
            Interactive Demo
          </Link>
          <Link
            href="/#our-approach"
            className={`transition-colors ${
              isTransparent ? 'hover:text-white' : 'hover:text-[#18232D]'
            }`}
          >
            Our Approach
          </Link>
          <Link
            href="/login"
            className={`transition-colors ${
              isTransparent
                ? 'text-white/80 hover:text-white'
                : pathname === '/login'
                ? 'text-[#18232D]'
                : 'hover:text-[#18232D]'
            }`}
          >
            Coordinator Login
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/report"
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-xs font-semibold transition-all shadow-subtle ${
              isTransparent
                ? 'bg-white text-[#18232D] hover:bg-white/90 ring-1 ring-white/40'
                : pathname === '/report'
                ? 'bg-[#18232D] text-white'
                : 'bg-[#18232D] hover:bg-[#25323F] text-white'
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
          className={`md:hidden p-2 rounded-[10px] transition-colors cursor-pointer ${
            isTransparent
              ? 'text-white hover:bg-white/10'
              : 'text-[#18232D] hover:bg-[#EAF0F4]'
          }`}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E4E8EC] bg-white px-5 pt-3 pb-6 space-y-3.5 animate-in slide-in-from-top-2 duration-150 shadow-md">
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-[#6B7782] hover:text-[#18232D] py-1.5"
          >
            How It Works
          </Link>
          <Link
            href="/#interactive-demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-[#6B7782] hover:text-[#18232D] py-1.5"
          >
            Interactive Demo
          </Link>
          <Link
            href="/#our-approach"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-[#6B7782] hover:text-[#18232D] py-1.5"
          >
            Our Approach
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-[#6B7782] hover:text-[#18232D] py-1.5"
          >
            Coordinator Login
          </Link>
          <div className="pt-2">
            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-xs font-semibold bg-[#18232D] text-white shadow-subtle hover:bg-[#25323F]"
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
