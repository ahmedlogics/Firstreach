'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicShell } from '@/components/shared/PublicShell';
import { supabase } from '@/lib/supabase';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const DEMO_EMAIL = 'admin@firstreach.org';
  const DEMO_PASSWORD = 'AdminPassword123!';

  const handleFillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Attempt authoritative Supabase authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        // Fallback check for resilience in offline/demo situations
        if (email.trim().toLowerCase() === DEMO_EMAIL.toLowerCase() && password === DEMO_PASSWORD) {
          setSuccess(true);
          setTimeout(() => {
            router.push('/dashboard');
          }, 600);
          return;
        }

        throw new Error(authError.message || 'Invalid email or password.');
      }

      if (data?.session || data?.user) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
      } else {
        throw new Error('Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      console.error('[Login Error]:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicShell>
      <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header */}
          <div className="space-y-2.5 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#252A30] text-white flex items-center justify-center mx-auto shadow-xs">
              <Shield className="w-6 h-6 text-[#F7F6F2]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#252A30] tracking-tight">
              Coordinator Login
            </h1>
            <p className="text-xs text-[#757B81]">
              Enter administrative credentials to access the Response Command Center.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-[#FAE8E7] border border-[#B74349]/30 text-[#B74349] text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="p-3 rounded-xl bg-[#E5EEE8] border border-[#377D65]/30 text-[#377D65] text-xs flex items-center gap-2 animate-in fade-in duration-150 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Authentication successful! Accessing Command Center...</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#252A30]"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#92979D]" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@firstreach.org"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E8E6E1] bg-[#F7F6F2] text-[#252A30] placeholder:text-[#92979D] focus:outline-none focus:ring-1 focus:ring-[#536A82] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#252A30]"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#92979D]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-[#E8E6E1] bg-[#F7F6F2] text-[#252A30] placeholder:text-[#92979D] focus:outline-none focus:ring-1 focus:ring-[#536A82] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#92979D] hover:text-[#252A30] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#536A82] hover:bg-[#40566D] disabled:opacity-60 text-white shadow-xs transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Admin Credentials Box */}
          <div className="pt-3 border-t border-[#E8E6E1] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#252A30] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#536A82]" />
                <span>Admin Credentials</span>
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="font-medium text-[#536A82] hover:text-[#40566D] hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-[#F7F6F2] border border-[#E8E6E1] text-[11px] font-mono space-y-1 text-[#757B81]">
              <div className="flex justify-between items-center">
                <span>Email:</span>
                <span className="text-[#252A30] font-semibold">{DEMO_EMAIL}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Password:</span>
                <span className="text-[#252A30] font-semibold">{DEMO_PASSWORD}</span>
              </div>
            </div>
          </div>

          {/* Return to Homepage */}
          <div className="text-center pt-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#757B81] hover:text-[#252A30] transition-colors"
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
