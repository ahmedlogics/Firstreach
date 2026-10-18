'use client';

import React from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/shared/PublicShell';
import {
  Shield,
  ArrowRight,
  Info,
  Lock,
  Radio,
  Users2,
  Activity,
  ArrowLeft,
} from 'lucide-react';

export default function LoginPage() {
  return (
    <PublicShell>
      <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 sm:p-10 shadow-xs space-y-8">
          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#252A30] text-white flex items-center justify-center mx-auto shadow-xs">
              <Shield className="w-6 h-6 text-[#F7F6F2]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252A30] tracking-tight">
              Coordinator Response Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#757B81] max-w-md mx-auto">
              Emergency dispatch management, field volunteer coordination, and real-time flood intelligence operations.
            </p>
          </div>

          {/* Honest Prototype Notice (No fake auth) */}
          <div className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#536A82] font-semibold">
              <Info className="w-4 h-4 shrink-0" />
              <span>Authentication Architecture Status</span>
            </div>
            <p className="text-[#757B81] leading-relaxed">
              <strong>Hackathon Prototype Notice:</strong> Production authentication (single sign-on, Supabase Auth session tokens, and role-based coordinator access control) is currently pending deployment.
            </p>
            <p className="text-[#757B81] leading-relaxed">
              To allow judges and evaluators to test all functional modules, <strong>direct evaluation access</strong> to the Operations Command Center is enabled below.
            </p>
          </div>

          {/* Planned Operational Controls Summary */}
          <div className="space-y-2.5 pt-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#92979D] block">
              Coordinator Workspaces Available In Prototype
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-[#E8E6E1] bg-white space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#252A30]">
                  <Activity className="w-3.5 h-3.5 text-[#536A82]" />
                  <span>Overview</span>
                </div>
                <p className="text-[11px] text-[#757B81]">
                  Telemetry, risk mapping & simulation.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[#E8E6E1] bg-white space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#252A30]">
                  <Radio className="w-3.5 h-3.5 text-[#536A82]" />
                  <span>Dispatch</span>
                </div>
                <p className="text-[11px] text-[#757B81]">
                  Triage queue & rescue asset allocation.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[#E8E6E1] bg-white space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#252A30]">
                  <Users2 className="w-3.5 h-3.5 text-[#536A82]" />
                  <span>Outreach</span>
                </div>
                <p className="text-[11px] text-[#757B81]">
                  Household checks & shelter capacity.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[#536A82] hover:bg-[#40566D] text-white shadow-xs transition-colors"
            >
              <span>Enter Operations Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#757B81] hover:text-[#252A30] hover:bg-[#F7F6F2] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
