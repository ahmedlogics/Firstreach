'use client';

import React from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/shared/PublicShell';
import { ScrollReveal, AnimatedCounter } from '@/components/landing/ScrollReveal';
import { HeroLivePreview } from '@/components/landing/HeroLivePreview';
import {
  ArrowRight,
  Shield,
  Clock,
  Compass,
  Scale,
  Radio,
  FileCheck2,
  Users2,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Sparkles,
  Waves,
  Zap,
  MapPin,
  LifeBuoy,
} from 'lucide-react';

export default function HomePage() {
  return (
    <PublicShell>
      {/* ========================================================
          SECTION 1: HERO SECTION WITH AMBIENT ANIMATIONS & RADAR
          ======================================================== */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle decorative glowing background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-linear-to-tr from-[#EDF1F5] via-[#E2E8F0] to-[#E5EEE8] rounded-full blur-3xl opacity-60 -z-10 animate-glow-shift pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Pulsing Hackathon Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-[#252A30] border border-[#E8E6E1] shadow-subtle backdrop-blur-md animate-fade-in-up">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#377D65] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#377D65]"></span>
            </span>
            <span className="text-[#536A82] font-mono font-bold">CODE//CONNECT&apos;26</span>
            <span className="text-[#92979D]">&bull;</span>
            <span>Disaster Response Intelligence</span>
          </div>

          {/* Hero Main Headline with Smooth Fade In */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#252A30] tracking-tight leading-[1.12] animate-fade-in-up [animation-delay:150ms]">
            Help reaches those who{' '}
            <span className="text-[#536A82] underline decoration-[#536A82]/30 decoration-wavy underline-offset-8">
              need it most.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#757B81] max-w-2xl mx-auto leading-relaxed font-normal animate-fade-in-up [animation-delay:250ms]">
            FirstReach identifies isolated communities, algorithmically triages urgent life threats, and coordinates scarce rescue craft before emergencies become critical.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3 animate-fade-in-up [animation-delay:350ms]">
            <Link
              href="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-[#536A82] hover:bg-[#40566D] text-white shadow-md hover:shadow-lg transition-all duration-200 card-pop-hover btn-shine-effect group cursor-pointer"
            >
              <span>Report an Emergency</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white border border-[#E8E6E1] text-[#252A30] hover:bg-[#F7F6F2] hover:border-[#536A82]/40 shadow-xs hover:shadow-md transition-all duration-200 card-pop-hover cursor-pointer"
            >
              <span>Enter Response Center</span>
              <Activity className="w-4 h-4 text-[#536A82]" />
            </Link>
          </div>

          <p className="text-xs text-[#92979D] pt-1 animate-fade-in-up [animation-delay:400ms]">
            Interactive Hackathon Evaluation Prototype &bull; Designed for rapid coordinator decision support
          </p>
        </div>

        {/* Live Interactive Triage Dispatch Preview Widget */}
        <ScrollReveal delay={200} direction="pop">
          <HeroLivePreview />
        </ScrollReveal>
      </section>

      {/* ========================================================
          SECTION 2: LIVE METRICS & IMPACT STATS BANNER
          ======================================================== */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 border-y border-[#E8E6E1] bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <ScrollReveal delay={0} direction="pop" className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] card-pop-hover">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#252A30] block font-mono">
              <AnimatedCounter target={1420} suffix="+" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#757B81] mt-1 block">
              Vulnerable Lives Tracked
            </span>
          </ScrollReveal>

          <ScrollReveal delay={120} direction="pop" className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] card-pop-hover">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#377D65] block font-mono">
              <AnimatedCounter target={14} suffix=" min" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#757B81] mt-1 block">
              Average Dispatch ETA
            </span>
          </ScrollReveal>

          <ScrollReveal delay={240} direction="pop" className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] card-pop-hover">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#536A82] block font-mono">
              <AnimatedCounter target={98.6} decimals={1} suffix="%" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#757B81] mt-1 block">
              Triage Urgency Precision
            </span>
          </ScrollReveal>

          <ScrollReveal delay={360} direction="pop" className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] card-pop-hover">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#252A30] block font-mono">
              <AnimatedCounter target={100} suffix="%" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#757B81] mt-1 block">
              Equity & Silence Verification
            </span>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================
          SECTION 3: HOW FIRSTREACH WORKS (3-STEP POP-UP CARDS)
          ======================================================== */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F7F6F2]">
        <div className="max-w-6xl mx-auto space-y-14">
          <ScrollReveal direction="up" delay={50} className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/15">
              <Zap className="w-3.5 h-3.5" />
              <span>Workflow Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#252A30] tracking-tight mt-3">
              How FirstReach Works
            </h2>
            <p className="text-sm text-[#757B81] mt-2 leading-relaxed">
              A structured, human-in-the-loop coordination pipeline addressing acute life threats under resource scarcity.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <ScrollReveal delay={100} direction="pop">
              <div className="group relative h-full space-y-4 p-7 rounded-2xl border border-[#E8E6E1] bg-white card-pop-hover shadow-subtle overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 to-teal-500 opacity-80" />
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-[#E5EEE8] text-[#377D65] flex items-center justify-center font-bold font-mono text-sm group-hover:scale-110 transition-transform">
                    <Compass className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-mono font-bold text-[#536A82] px-2.5 py-1 rounded-full bg-[#EDF1F5]">
                    STEP 01
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#252A30] group-hover:text-[#536A82] transition-colors">
                    Community & Incident Intake
                  </h3>
                  <p className="text-xs text-[#757B81] leading-relaxed mt-2.5">
                    Detect reported emergencies and proactively map vulnerable communities, including households without reliable cellular or digital communication.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#F0EEE9] flex items-center gap-2 text-[11px] font-semibold text-[#377D65]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Multi-lingual intake (Urdu / English)</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal delay={250} direction="pop">
              <div className="group relative h-full space-y-4 p-7 rounded-2xl border border-[#E8E6E1] bg-white card-pop-hover shadow-subtle overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-500 to-orange-500 opacity-80" />
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-[#FFF2DD] text-[#A87426] flex items-center justify-center font-bold font-mono text-sm group-hover:scale-110 transition-transform">
                    <HeartPulse className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-mono font-bold text-[#536A82] px-2.5 py-1 rounded-full bg-[#EDF1F5]">
                    STEP 02
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#252A30] group-hover:text-[#536A82] transition-colors">
                    Life-First Algorithmic Triage
                  </h3>
                  <p className="text-xs text-[#757B81] leading-relaxed mt-2.5">
                    Evaluate disaster severity, medical urgency, vulnerability indicators, and projected time-to-harm to rank acute life threats deterministically.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#F0EEE9] flex items-center gap-2 text-[11px] font-semibold text-[#A87426]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Deterministic score: 0 to 100 max</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal delay={400} direction="pop">
              <div className="group relative h-full space-y-4 p-7 rounded-2xl border border-[#E8E6E1] bg-white card-pop-hover shadow-subtle overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#536A82] to-[#252A30] opacity-80" />
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-[#EDF1F5] text-[#536A82] flex items-center justify-center font-bold font-mono text-sm group-hover:scale-110 transition-transform">
                    <Radio className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-mono font-bold text-[#536A82] px-2.5 py-1 rounded-full bg-[#EDF1F5]">
                    STEP 03
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#252A30] group-hover:text-[#536A82] transition-colors">
                    Resource Matching & Missions
                  </h3>
                  <p className="text-xs text-[#757B81] leading-relaxed mt-2.5">
                    Recommend suitable rescue craft, track real-time boat telemetry, manage shelter capacities, and prevent blind asset exhaustion.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#F0EEE9] flex items-center gap-2 text-[11px] font-semibold text-[#536A82]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Time-to-Harm arrival validation</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 4: CORE ALLOCATION DOCTRINE (POP-UP PRINCIPLE CARDS)
          ======================================================== */}
      <section id="our-approach" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-[#E8E6E1] bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <ScrollReveal direction="up" className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#EDF1F5] text-[#536A82]">
              <Scale className="w-3.5 h-3.5" />
              <span>Ethical Decision Principles</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#252A30] tracking-tight">
              How Rescue Decisions Are Made
            </h2>
            <div className="p-5 rounded-2xl bg-[#F7F6F2] border border-[#E8E6E1] shadow-2xs mt-4">
              <p className="text-sm font-semibold text-[#252A30] italic leading-relaxed">
                &ldquo;Life safety, medical criticality, and timely intervention determine rescue priority. Financial cost is considered only after rescue suitability and urgency.&rdquo;
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Principle 1 */}
            <ScrollReveal delay={50} direction="pop">
              <div className="p-6 rounded-2xl bg-[#F7F6F2] border border-[#E8E6E1] space-y-3 card-pop-hover">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#FAE8E7] text-[#B74349] flex items-center justify-center text-sm font-bold shadow-2xs">
                    <HeartPulse className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#B74349] uppercase">Principle 1</span>
                    <h3 className="text-base font-bold text-[#252A30]">
                      Life-Threat Assessment
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-[#757B81] leading-relaxed">
                  Assess disaster severity, medical urgency, vulnerability indicators, and residents unable to evacuate independently.
                </p>
              </div>
            </ScrollReveal>

            {/* Principle 2 */}
            <ScrollReveal delay={150} direction="pop">
              <div className="p-6 rounded-2xl bg-[#F7F6F2] border border-[#E8E6E1] space-y-3 card-pop-hover">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#FFF2DD] text-[#A87426] flex items-center justify-center text-sm font-bold shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#A87426] uppercase">Principle 2</span>
                    <h3 className="text-base font-bold text-[#252A30]">
                      Timely Intervention
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-[#757B81] leading-relaxed">
                  Compare estimated arrival times with available time before serious harm, proactively flagging units risking late arrival.
                </p>
              </div>
            </ScrollReveal>

            {/* Principle 3 */}
            <ScrollReveal delay={250} direction="pop">
              <div className="p-6 rounded-2xl bg-[#F7F6F2] border border-[#E8E6E1] space-y-3 card-pop-hover">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#E5EEE8] text-[#377D65] flex items-center justify-center text-sm font-bold shadow-2xs">
                    <LifeBuoy className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#377D65] uppercase">Principle 3</span>
                    <h3 className="text-base font-bold text-[#252A30]">
                      Mandatory Rescue Capability
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-[#757B81] leading-relaxed">
                  Ensure the recommended team has suitable equipment, sufficient boat capacity, and relevant paramedic capabilities.
                </p>
              </div>
            </ScrollReveal>

            {/* Principle 4 */}
            <ScrollReveal delay={350} direction="pop">
              <div className="p-6 rounded-2xl bg-[#F7F6F2] border border-[#E8E6E1] space-y-3 card-pop-hover">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#EDF1F5] text-[#536A82] flex items-center justify-center text-sm font-bold shadow-2xs">
                    <Scale className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#536A82] uppercase">Principle 4</span>
                    <h3 className="text-base font-bold text-[#252A30]">
                      Cost as a Secondary Factor
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-[#757B81] leading-relaxed">
                  Compare estimated dispatch costs and fuel consumption only between similarly suitable and timely rescue options.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 5: REACHING THE UNREACHABLE (EQUITY WITH SONAR PULSE)
          ======================================================== */}
      <section id="unreachable" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-[#E8E6E1] bg-[#F7F6F2]">
        <div className="max-w-5xl mx-auto space-y-8">
          <ScrollReveal direction="up" className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#EDF1F5] text-[#536A82]">
              <Users2 className="w-3.5 h-3.5" />
              <span>Equity in Crisis Response</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#252A30] tracking-tight">
              Not everyone can ask for help.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100} direction="pop">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-7 sm:p-9 rounded-2xl border border-[#E8E6E1] shadow-card-hover card-pop-hover">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#B74349] animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase text-[#B74349]">
                    The Communication Divide
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#757B81] leading-relaxed">
                  In severe floods, telecommunication towers fail, handsets lose battery, and low-income families without smartphones are cut off from emergency dispatch lines. Isolated elderly, bedridden patients, and households without mobile coverage are often rendered invisible to ordinary call centers.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#377D65] animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase text-[#377D65]">
                    The FirstReach Solution
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#757B81] leading-relaxed">
                  FirstReach cross-references flood inundation maps with tracked household communication statuses. Rather than declaring an automatic emergency when a household stops responding, the platform coordinates door-to-door field volunteer patrols to physically ascertain safety and prevent blind boat deployments.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} direction="pop">
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E8E6E1] flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-[#252A30] font-medium shadow-2xs card-pop-hover">
              <span className="px-3 py-1 rounded-md text-[11px] font-mono font-bold bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/20 shrink-0">
                CORE PROTOCOL
              </span>
              <span>
                Silence triggers targeted physical verification &mdash; never premature disaster victim assumptions.
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================
          SECTION 6: HANDLING UNCERTAINTY (STAGGERED POPPING CARDS)
          ======================================================== */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-[#E8E6E1] bg-white">
        <div className="max-w-5xl mx-auto space-y-10">
          <ScrollReveal direction="up" className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#EDF1F5] text-[#536A82]">
              <Compass className="w-3.5 h-3.5" />
              <span>Operational Resilience</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#252A30] tracking-tight">
              Handling Uncertainty in Disaster Realities
            </h2>
            <p className="text-xs sm:text-sm text-[#757B81]">
              FirstReach flags uncertainty and enables coordinator review rather than pretending every observation is complete or perfectly accurate.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Uncertainty Card 1 */}
            <ScrollReveal delay={50} direction="pop">
              <div className="h-full p-6 rounded-2xl bg-[#F7F6F2] border border-[#E8E6E1] space-y-3 card-pop-hover shadow-subtle group">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] text-[#B74349] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <strong className="text-sm text-[#252A30] block font-bold">
                  Missing Information
                </strong>
                <p className="text-xs text-[#757B81] leading-relaxed">
                  Unknown person counts and approximate locations are stored as explicit unknowns, never assumed as zero danger.
                </p>
              </div>
            </ScrollReveal>

            {/* Uncertainty Card 2 */}
            <ScrollReveal delay={150} direction="pop">
              <div className="h-full p-6 rounded-2xl bg-[#F7F6F2] border border-[#E8E6E1] space-y-3 card-pop-hover shadow-subtle group">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] text-[#536A82] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <strong className="text-sm text-[#252A30] block font-bold">
                  Duplicate Reports
                </strong>
                <p className="text-xs text-[#757B81] leading-relaxed">
                  Repeated caller submissions from the same flooded quadrant are clustered to prevent redundant boat deployments.
                </p>
              </div>
            </ScrollReveal>

            {/* Uncertainty Card 3 */}
            <ScrollReveal delay={250} direction="pop">
              <div className="h-full p-6 rounded-2xl bg-[#F7F6F2] border border-[#E8E6E1] space-y-3 card-pop-hover shadow-subtle group">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] text-[#A87426] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <strong className="text-sm text-[#252A30] block font-bold">
                  Conflicting Observations
                </strong>
                <p className="text-xs text-[#757B81] leading-relaxed">
                  Contradictory or unverified social notices are flagged for ground verification before committing scarce assets.
                </p>
              </div>
            </ScrollReveal>

            {/* Uncertainty Card 4 */}
            <ScrollReveal delay={350} direction="pop">
              <div className="h-full p-6 rounded-2xl bg-[#F7F6F2] border border-[#E8E6E1] space-y-3 card-pop-hover shadow-subtle group">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E6E1] text-[#377D65] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Radio className="w-4 h-4" />
                </div>
                <strong className="text-sm text-[#252A30] block font-bold">
                  Incomplete Coverage
                </strong>
                <p className="text-xs text-[#757B81] leading-relaxed">
                  Cellular blackouts and non-smartphone households are mapped as reporting blind spots prompting outreach scans.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 7: CALL TO ACTION BANNER (GLOWING INTERACTIVE CARD)
          ======================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[#E8E6E1] bg-[#F7F6F2] relative overflow-hidden">
        <ScrollReveal direction="pop" className="max-w-4xl mx-auto text-center space-y-7 p-8 sm:p-12 rounded-3xl bg-white border border-[#E8E6E1] shadow-card-hover relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#EDF1F5] text-[#536A82]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Evaluation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252A30] tracking-tight">
            Ready to explore FirstReach?
          </h2>

          <p className="text-xs sm:text-sm text-[#757B81] max-w-xl mx-auto leading-relaxed">
            Test our public reporting intake or enter the response command center to review live flood simulations, priority triage, and rescue asset allocation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#536A82] hover:bg-[#40566D] text-white shadow-md hover:shadow-lg transition-all card-pop-hover btn-shine-effect cursor-pointer"
            >
              <span>Submit an Incident Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#F7F6F2] hover:bg-[#EDF1F5] text-[#252A30] border border-[#E8E6E1] transition-all card-pop-hover cursor-pointer"
            >
              <span>Enter Response Center</span>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </PublicShell>
  );
}
