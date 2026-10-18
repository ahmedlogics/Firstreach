import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicShell } from '@/components/shared/PublicShell';
import { InteractiveRescueExperience } from '@/components/landing/InteractiveRescueExperience';
import {
  ArrowRight,
  ChevronDown,
  ShieldAlert,
  HeartHandshake,
  Eye,
  Radio,
  FileCheck2,
  Users2,
  Clock,
  Compass,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <PublicShell>
      {/* =========================================================================
          SECTION 1: HERO SECTION (100svh Full-Bleed Cinematic Photography)
         ========================================================================= */}
      <section className="relative min-h-[100svh] w-full flex items-center overflow-hidden bg-[#081219]">
        {/* Full-bleed background image with responsive object position */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-flood-rescue.jpg"
            alt="Disaster response rescue team assisting flood-affected residents in an urban neighborhood"
            fill
            priority
            quality={92}
            sizes="100vw"
            className="object-cover object-[75%_center] sm:object-center select-none"
          />

          {/* Cinematic layered vignette and dark directional gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(8,18,25,0.92) 0%, rgba(8,18,25,0.76) 42%, rgba(8,18,25,0.38) 72%, rgba(8,18,25,0.22) 100%)',
            }}
          />

          {/* Bottom vignette for seamless transition into the page */}
          <div
            className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(8,18,25,0.85) 0%, rgba(8,18,25,0.35) 60%, transparent 100%)',
            }}
          />
        </div>

        {/* Hero Editorial Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 sm:pt-28 pb-20 flex flex-col justify-center min-h-[100svh]">
          <div className="max-w-2xl space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-medium tracking-[0.2em] uppercase bg-white/10 text-[#D9E1E6] border border-white/20 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#258167] animate-pulse" />
              <span>Disaster Response, Reimagined</span>
            </div>

            {/* Primary Editorial Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.03] drop-shadow-sm">
              Before it&apos;s too late.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg md:text-xl text-[#D9E1E6] max-w-xl leading-relaxed font-normal">
              Connecting those in danger with the help they need, when they need it most.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 sm:pt-4">
              <Link
                href="/report"
                className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-[12px] text-sm font-bold bg-white text-[#18232D] hover:bg-[#F7F8FA] transition-all duration-200 shadow-md ring-1 ring-white/60 focus:outline-hidden focus:ring-2 focus:ring-white"
              >
                <span>Report an Emergency</span>
                <ArrowRight className="w-4 h-4 text-[#18232D] group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <Link
                href="/#interactive-demo"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-[12px] text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-xs transition-colors duration-200 focus:outline-hidden focus:ring-2 focus:ring-white/50"
              >
                <span>Explore RAABTA</span>
              </Link>
            </div>
          </div>

          {/* Bottom Hero Detail & Minimal Scroll Cue */}
          <div className="mt-auto pt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-xs text-[#D9E1E6]/80 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A87528]" />
              <p className="text-[11px] sm:text-xs">
                Demonstration platform &bull; Not connected to emergency services (1122 / 911).
              </p>
            </div>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-medium text-white/70 hover:text-white transition-colors group self-start sm:self-auto motion-safe:animate-pulse"
            >
              <span>Scroll to explore</span>
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: HOW FIRSTREACH WORKS (#how-it-works)
         ========================================================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F7F8FA] border-b border-[#E4E8EC]">
        <div className="max-w-7xl mx-auto space-y-14">
          {/* Section Header */}
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#375A6B]">
              Operational Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#18232D] tracking-tight">
              From distress to coordinated response.
            </h2>
            <p className="text-sm sm:text-base text-[#6B7782] leading-relaxed">
              One connected workflow. Clearer decisions when time matters.
            </p>
          </div>

          {/* Four-step process timeline */}
          <div className="relative">
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-7 left-10 right-10 h-0.5 bg-[#E4E8EC] z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* Step 1 */}
              <div className="bg-white rounded-xl border border-[#E4E8EC] p-6 space-y-4 hover:border-[#375A6B]/40 transition-all duration-200 shadow-2xs group">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-full bg-[#18232D] text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                    01
                  </span>
                  <span className="text-xs font-mono font-bold text-[#375A6B] tracking-wider uppercase">
                    Report
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#18232D] group-hover:text-[#375A6B] transition-colors">
                    Incident Intake
                  </h3>
                  <p className="text-xs text-[#6B7782] leading-relaxed mt-1.5">
                    Residents or community volunteers submit emergencies directly, including proxy reporting for neighbors without phone access.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl border border-[#E4E8EC] p-6 space-y-4 hover:border-[#375A6B]/40 transition-all duration-200 shadow-2xs group">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-full bg-[#375A6B] text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                    02
                  </span>
                  <span className="text-xs font-mono font-bold text-[#375A6B] tracking-wider uppercase">
                    Assess
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#18232D] group-hover:text-[#375A6B] transition-colors">
                    Life-Safety Triage
                  </h3>
                  <p className="text-xs text-[#6B7782] leading-relaxed mt-1.5">
                    RAABTA evaluates flood severity, trapped status, medical urgency, and data reliability to calculate triage priority.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl border border-[#E4E8EC] p-6 space-y-4 hover:border-[#375A6B]/40 transition-all duration-200 shadow-2xs group">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-full bg-[#18232D] text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                    03
                  </span>
                  <span className="text-xs font-mono font-bold text-[#375A6B] tracking-wider uppercase">
                    Coordinate
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#18232D] group-hover:text-[#375A6B] transition-colors">
                    Resource Matching
                  </h3>
                  <p className="text-xs text-[#6B7782] leading-relaxed mt-1.5">
                    Dispatchers review suitable rescue craft, verify arrival time estimates, and approve transparent recommendations.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl border border-[#E4E8EC] p-6 space-y-4 hover:border-[#375A6B]/40 transition-all duration-200 shadow-2xs group">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-full bg-[#258167] text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                    04
                  </span>
                  <span className="text-xs font-mono font-bold text-[#258167] tracking-wider uppercase">
                    Respond
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#18232D] group-hover:text-[#258167] transition-colors">
                    Mission Tracking
                  </h3>
                  <p className="text-xs text-[#6B7782] leading-relaxed mt-1.5">
                    Rescue operations are tracked through on-scene extraction, shelter arrival, and final resolution without lost handoffs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: INTERACTIVE RESCUE EXPERIENCE (#interactive-demo)
         ========================================================================= */}
      <section id="interactive-demo" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#375A6B]">
              Interactive Simulation
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#18232D] tracking-tight">
              See how RAABTA responds.
            </h2>
            <p className="text-sm sm:text-base text-[#6B7782] leading-relaxed">
              Step through how RAABTA ingests, triages, and coordinates rescue for a high-risk household in real time.
            </p>
          </div>

          {/* Interactive Simulation Component */}
          <InteractiveRescueExperience />
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: WHAT MAKES FIRSTREACH DIFFERENT (#our-approach)
         ========================================================================= */}
      <section id="our-approach" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E4E8EC]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#375A6B]">
              Humanitarian Principles
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#18232D] tracking-tight">
              Help shouldn&apos;t depend on who can call.
            </h2>
            <p className="text-sm sm:text-base text-[#6B7782] leading-relaxed">
              Traditional emergency dispatch leaves the most vulnerable invisible. RAABTA is built on three foundational principles.
            </p>
          </div>

          {/* Principle 1: Reach the Unreachable (Paired with documentary photo) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-4">
            <div className="lg:col-span-7 relative h-72 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden border border-[#E4E8EC] shadow-xs">
              <Image
                src="/images/outreach-wellness-check.jpg"
                alt="Humanitarian disaster volunteers conducting an in-person wellness check for an elderly resident during floodwaters"
                fill
                quality={88}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081219]/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-[11px] font-medium flex items-center justify-between">
                <span>Field Verification &bull; Community Outreach</span>
                <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                  Ground Team Check
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0F4] text-[#375A6B] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#18232D] tracking-tight">
                Reach the unreachable
              </h3>
              <p className="text-sm text-[#6B7782] leading-relaxed">
                Identify high-risk communities with insufficient reporting and plan proactive ground verification for households without reliable communication, electricity, or digital access.
              </p>
              <div className="pt-2 border-t border-[#E4E8EC] space-y-2 text-xs text-[#18232D]">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#258167] mt-1.5 shrink-0" />
                  <span>Tracks silent zones where network towers have failed</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#258167] mt-1.5 shrink-0" />
                  <span>Enables proxy reports from neighbors and community volunteers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Principle 2 & 3 in Editorial Two-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            {/* Principle 2 */}
            <div className="p-7 sm:p-8 rounded-2xl border border-[#E4E8EC] bg-[#F7F8FA] space-y-5">
              <div className="w-10 h-10 rounded-xl bg-[#BC414A]/10 text-[#BC414A] flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#18232D] tracking-tight">
                Prioritize human safety
              </h3>
              <p className="text-sm text-[#6B7782] leading-relaxed">
                Immediate danger, medical urgency, and timely intervention take precedence over financial cost or administrative convenience.
              </p>
              <div className="p-4 rounded-xl bg-white border border-[#E4E8EC] shadow-2xs">
                <p className="text-xs font-semibold text-[#18232D] italic">
                  &ldquo;Life safety, medical criticality, and timely intervention determine rescue priority. Financial cost is considered only after rescue suitability and urgency.&rdquo;
                </p>
              </div>
            </div>

            {/* Principle 3 */}
            <div className="p-7 sm:p-8 rounded-2xl border border-[#E4E8EC] bg-[#F7F8FA] space-y-5">
              <div className="w-10 h-10 rounded-xl bg-[#375A6B]/10 text-[#375A6B] flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#18232D] tracking-tight">
                Make decisions transparent
              </h3>
              <p className="text-sm text-[#6B7782] leading-relaxed">
                Rescue recommendations explain their exact reasoning—why a specific boat was selected, what factors drove priority—remaining subject to human coordination.
              </p>
              <div className="p-4 rounded-xl bg-white border border-[#E4E8EC] shadow-2xs space-y-2 text-xs">
                <span className="font-mono font-bold text-[#375A6B] block">
                  Human-In-The-Loop Governance
                </span>
                <p className="text-[#6B7782]">
                  Algorithmic scores rank urgency, but human dispatch coordinators confirm assignments, review telemetry, and retain operational discretion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FINAL CALL TO ACTION (Dark Graphite)
         ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#18232D] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-mono font-semibold text-[#D9E1E6] tracking-widest uppercase">
              Action Ready
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Every minute matters.
            </h2>
            <p className="text-base sm:text-lg text-[#D9E1E6] max-w-xl mx-auto leading-relaxed">
              Report a developing emergency or explore coordinated response operations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[12px] text-sm font-bold bg-white text-[#18232D] hover:bg-[#F7F8FA] transition-all duration-200 shadow-sm"
            >
              <span>Report an Emergency</span>
              <ArrowRight className="w-4 h-4 text-[#18232D]" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[12px] text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-colors duration-200"
            >
              <span>Coordinator Access</span>
            </Link>
          </div>

          <p className="text-xs text-[#D9E1E6]/70 pt-2">
            Public reporting is open without credentials &bull; Response dashboard requires coordinator authorization.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
