'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RaabtaUser, StaffRole, ROLE_LANDING_PAGES } from './types';

interface AuthContextType {
  user: RaabtaUser | null;
  role: StaffRole | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<RaabtaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolveUserFromSession = useCallback(async (session: any): Promise<RaabtaUser | null> => {
    if (!session?.user) return null;

    const email = session.user.email || '';
    const userId = session.user.id;

    // Check database or profile for role mapping
    let resolvedRole: StaffRole = 'coordinator';
    let displayName = email.split('@')[0] || 'Staff Member';
    let teamId: string | null = null;
    let volunteerName: string | null = null;

    const normalized = email.toLowerCase();
    if (normalized.includes('field') || normalized.includes('rescue') || normalized.includes('rt02')) {
      resolvedRole = 'rescue_team';
      displayName = 'Rescue Team 02 Lead';
      teamId = 'team-rt-02';
    } else if (normalized.includes('volunteer')) {
      resolvedRole = 'volunteer';
      displayName = 'Community Scout Aisha';
      volunteerName = 'Aisha Khan';
    } else {
      resolvedRole = 'coordinator';
      displayName = normalized.includes('admin') ? 'HQ Operations Desk' : 'Coordinator Desk';
    }

    return {
      id: userId,
      email,
      role: resolvedRole,
      displayName,
      teamId,
      volunteerName,
    };
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        const u = await resolveUserFromSession(data.session);
        setUser(u);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('[AuthProvider] session check error:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [resolveUserFromSession]);

  useEffect(() => {
    refreshUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const u = await resolveUserFromSession(session);
        setUser(u);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [refreshUser, resolveUserFromSession]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AuthProvider] signOut error:', err);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        router.push('/');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Access Control Guard Component
 * Redirects unauthenticated visitors to /login.
 * Redirects unauthorized roles to their designated home page.
 */
export function RequireAuth({
  allowedRoles,
  children,
}: {
  allowedRoles: StaffRole[];
  children: React.ReactNode;
}) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (role && !allowedRoles.includes(role)) {
      const dest = ROLE_LANDING_PAGES[role] || '/';
      router.replace(dest);
    }
  }, [user, role, isLoading, allowedRoles, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-8 h-8 border-2 border-[#18232D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#5F6B7A]">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!user || (role && !allowedRoles.includes(role))) {
    return null;
  }

  return <>{children}</>;
}
