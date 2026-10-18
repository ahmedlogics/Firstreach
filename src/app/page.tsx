import React from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/shared/PublicShell';
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
} from 'lucide-react';

export default function HomePage() {
  return (
    <PublicShell>
      {/* SECTION B: HERO */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/20 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#377D65]" />
          <span>CODE//CONNECT&apos;26 Hackathon Prototype</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#252A30] tracking-tight leading-[1.15]">
          Help reaches those who need it most.
        </h1>

        <p className="text-base sm:text-lg text-[#757B81] max-w-2xl mx-auto leading-relaxed font-normal">
          FirstReach helps identify vulnerable people, prioritize urgent emergencies, and coordinate limited rescue resources before situations become critical.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/report"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[#536A82] hover:bg-[#40566D] text-white shadow-xs transition-colors"
          >
            <span>Report an Emergency</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-white border border-[#E8E6E1] text-[#252A30] hover:bg-[#F7F6F2] shadow-xs transition-colors"
          >
            <span>Enter Response Center</span>
          </Link>
        </div>

        <p className="text-xs text-[#92979D] pt-2">
          Hackathon evaluation prototype &bull; Not connected to live emergency services (1122 / 911).
        </p>
      </section>

      {/* SECTION C: HOW FIRSTREACH WORKS */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-[#E8E6E1] bg-white">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#536A82]">
              Workflow Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#252A30] tracking-tight mt-1">
              How FirstReach Works
            </h2>
            <p className="text-sm text-[#757B81] mt-2">
              A structured, human-in-the-loop coordination model addressing acute life threats under resource scarcity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="space-y-3 p-6 rounded-xl border border-[#E8E6E1] bg-[#F7F6F2]">
              <div className="text-xs font-mono font-bold text-[#536A82] tracking-wider">
                01 &mdash; IDENTIFY
              </div>
              <h3 className="text-base font-semibold text-[#252A30]">
                Community & Incident Intake
              </h3>
              <p className="text-xs text-[#757B81] leading-relaxed">
                Detect reported emergencies and vulnerable communities, including households without reliable phone or digital communication.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 p-6 rounded-xl border border-[#E8E6E1] bg-[#F7F6F2]">
              <div className="text-xs font-mono font-bold text-[#536A82] tracking-wider">
                02 &mdash; PRIORITIZE
              </div>
              <h3 className="text-base font-semibold text-[#252A30]">
                Life-First Algorithmic Triage
              </h3>
              <p className="text-xs text-[#757B81] leading-relaxed">
                Evaluate danger, medical urgency, vulnerability factors, and projected time before serious harm to rank acute life threats.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 p-6 rounded-xl border border-[#E8E6E1] bg-[#F7F6F2]">
              <div className="text-xs font-mono font-bold text-[#536A82] tracking-wider">
                03 &mdash; COORDINATE
              </div>
              <h3 className="text-base font-semibold text-[#252A30]">
                Resource Matching & Missions
              </h3>
              <p className="text-xs text-[#757B81] leading-relaxed">
                Recommend suitable rescue craft, track real-time operations, manage shelter capacity, and account for fleet scarcity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: CORE ALLOCATION DOCTRINE */}
      <section id="our-approach" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-[#E8E6E1] bg-[#F7F6F2]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#536A82]">
              Decision Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#252A30] tracking-tight">
              How Rescue Decisions Are Made
            </h2>
            <div className="p-4 rounded-xl bg-white border border-[#E8E6E1] shadow-2xs mt-4">
              <p className="text-sm font-semibold text-[#252A30] italic">
                &ldquo;Life safety, medical criticality, and timely intervention determine rescue priority. Financial cost is considered only after rescue suitability and urgency.&rdquo;
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Principle 1 */}
            <div className="p-5 rounded-xl bg-white border border-[#E8E6E1] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#EDF1F5] text-[#536A82] flex items-center justify-center text-xs font-mono font-bold">
                  1
                </span>
                <h3 className="text-sm font-semibold text-[#252A30]">
                  Life-Threat Assessment
                </h3>
              </div>
              <p className="text-xs text-[#757B81] leading-relaxed pl-8">
                Assess disaster severity, medical urgency, vulnerability indicators, and residents unable to evacuate independently.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="p-5 rounded-xl bg-white border border-[#E8E6E1] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#EDF1F5] text-[#536A82] flex items-center justify-center text-xs font-mono font-bold">
                  2
                </span>
                <h3 className="text-sm font-semibold text-[#252A30]">
                  Timely Intervention
                </h3>
              </div>
              <p className="text-xs text-[#757B81] leading-relaxed pl-8">
                Compare estimated arrival times with the available time before serious harm, proactively flagging units risking late arrival.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="p-5 rounded-xl bg-white border border-[#E8E6E1] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#EDF1F5] text-[#536A82] flex items-center justify-center text-xs font-mono font-bold">
                  3
                </span>
                <h3 className="text-sm font-semibold text-[#252A30]">
                  Mandatory Rescue Capability
                </h3>
              </div>
              <p className="text-xs text-[#757B81] leading-relaxed pl-8">
                Ensure the recommended team has suitable equipment, sufficient boat capacity, and relevant paramedic capabilities.
              </p>
            </div>

            {/* Principle 4 */}
            <div className="p-5 rounded-xl bg-white border border-[#E8E6E1] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#EDF1F5] text-[#536A82] flex items-center justify-center text-xs font-mono font-bold">
                  4
                </span>
                <h3 className="text-sm font-semibold text-[#252A30]">
                  Cost as a Secondary Factor
                </h3>
              </div>
              <p className="text-xs text-[#757B81] leading-relaxed pl-8">
                Compare estimated dispatch costs and fuel consumption only between similarly suitable and timely rescue options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION E: REACHING THE UNREACHABLE */}
      <section id="unreachable" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-[#E8E6E1] bg-white">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#536A82]">
              Equity in Crisis Response
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#252A30] tracking-tight">
              Not everyone can ask for help.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-[#757B81] leading-relaxed">
            <p>
              In severe floods, telecommunication towers fail, handsets lose battery, and low-income families without smartphones are cut off from emergency dispatch lines. Isolated elderly, bedridden patients, and households without mobile coverage are often rendered invisible to ordinary call centers.
            </p>
            <p>
              FirstReach cross-references flood inundation maps with tracked household communication statuses. Rather than declaring an automatic emergency when a household stops responding, the platform coordinates door-to-door field volunteer patrols to physically ascertain safety and prevent blind boat deployments.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] flex items-center gap-3 text-xs text-[#252A30] font-medium">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/20 shrink-0">
              Core Protocol
            </span>
            <span>
              Silence triggers targeted physical verification &mdash; never premature disaster victim assumptions.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION F: HANDLING UNCERTAINTY */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-[#E8E6E1] bg-[#F7F6F2]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#536A82]">
              Operational Resilience
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#252A30] tracking-tight">
              Handling Uncertainty in Disaster Realities
            </h2>
            <p className="text-xs text-[#757B81]">
              FirstReach flags uncertainty and enables coordinator review rather than pretending every observation is complete or perfectly accurate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-[#E8E6E1] space-y-1.5">
              <strong className="text-[#252A30] block font-semibold">Missing Information</strong>
              <p className="text-[#757B81] leading-relaxed">
                Unknown person counts and approximate locations are stored as explicit unknowns, never assumed as zero danger.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E8E6E1] space-y-1.5">
              <strong className="text-[#252A30] block font-semibold">Duplicate Reports</strong>
              <p className="text-[#757B81] leading-relaxed">
                Repeated caller submissions from the same flooded quadrant are clustered to prevent redundant boat deployments.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E8E6E1] space-y-1.5">
              <strong className="text-[#252A30] block font-semibold">Conflicting Observations</strong>
              <p className="text-[#757B81] leading-relaxed">
                Contradictory or unverified social notices are flagged for ground verification before committing scarce assets.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E8E6E1] space-y-1.5">
              <strong className="text-[#252A30] block font-semibold">Incomplete Coverage</strong>
              <p className="text-[#757B81] leading-relaxed">
                Cellular blackouts and non-smartphone households are mapped as reporting blind spots prompting outreach scans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[#E8E6E1] bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#252A30] tracking-tight">
            Ready to explore FirstReach?
          </h2>
          <p className="text-xs sm:text-sm text-[#757B81] max-w-xl mx-auto">
            Test our public reporting intake or enter the response command center to review live flood simulations, priority triage, and rescue asset allocation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/report"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#536A82] hover:bg-[#40566D] text-white shadow-xs transition-colors"
            >
              Submit an Incident Report
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#F7F6F2] hover:bg-[#EDF1F5] text-[#252A30] border border-[#E8E6E1] transition-colors"
            >
              Enter Response Center
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
