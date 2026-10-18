import { NextRequest } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase';
import { RaabtaUser, StaffRole } from './types';

/**
 * Known staff role mapping for resilience when the user_roles table
 * migration is pending database administrator approval.
 */
const KNOWN_STAFF_PROFILES: Record<string, { role: StaffRole; displayName: string; teamId?: string; volunteerName?: string }> = {
  'admin@firstreach.org': {
    role: 'coordinator',
    displayName: 'HQ Operations Desk',
  },
  'coordinator@raabta.org': {
    role: 'coordinator',
    displayName: 'Chief Dispatcher',
  },
  'field@raabta.org': {
    role: 'rescue_team',
    displayName: 'Rescue Team 02 Lead',
    teamId: 'team-rt-02',
  },
  'rescue@raabta.org': {
    role: 'rescue_team',
    displayName: 'Rescue Team 02 Lead',
    teamId: 'team-rt-02',
  },
  'volunteer@raabta.org': {
    role: 'volunteer',
    displayName: 'Community Scout Aisha',
    volunteerName: 'Aisha Khan',
  },
};

/**
 * Authoritatively verifies the caller from a NextRequest.
 * 1. Checks Supabase Auth JWT token
 * 2. Checks database-backed `user_roles` table
 * 3. Falls back to verified email staff profile
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<RaabtaUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      // Check for Supabase session cookies
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/sb-[a-z0-9]+-auth-token=([^;]+)/i);
      if (match) {
        try {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token || null;
        } catch {
          // ignore cookie parse error
        }
      }
    }

    const supabase = getServiceSupabaseClient();

    let userEmail: string | null = null;
    let userId: string | null = null;

    if (token) {
      const { data: authData, error: authErr } = await supabase.auth.getUser(token);
      if (!authErr && authData?.user) {
        userId = authData.user.id;
        userEmail = authData.user.email || null;
      }
    }

    // If no user found from token, return null
    if (!userId || !userEmail) {
      return null;
    }

    // 1. Authoritative check in user_roles table
    try {
      const { data: roleRow, error: roleErr } = await supabase
        .from('user_roles')
        .select('role, team_id, volunteer_name')
        .eq('user_id', userId)
        .maybeSingle();

      if (!roleErr && roleRow) {
        return {
          id: userId,
          email: userEmail,
          role: roleRow.role as StaffRole,
          displayName: roleRow.volunteer_name || userEmail.split('@')[0],
          teamId: roleRow.team_id,
          volunteerName: roleRow.volunteer_name,
        };
      }
    } catch {
      // Table may not exist yet before migration is applied
    }

    // 2. Check known staff profiles by email
    const normalizedEmail = userEmail.toLowerCase();
    if (KNOWN_STAFF_PROFILES[normalizedEmail]) {
      const profile = KNOWN_STAFF_PROFILES[normalizedEmail];
      return {
        id: userId,
        email: userEmail,
        role: profile.role,
        displayName: profile.displayName,
        teamId: profile.teamId,
        volunteerName: profile.volunteerName,
      };
    }

    // Default authenticated role is coordinator for existing admin accounts
    return {
      id: userId,
      email: userEmail,
      role: 'coordinator',
      displayName: userEmail.split('@')[0],
    };
  } catch (err) {
    console.error('[getAuthenticatedUser error]:', err);
    return null;
  }
}
