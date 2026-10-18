export type StaffRole = 'coordinator' | 'rescue_team' | 'volunteer';
export type UserRole = StaffRole | 'public';

export interface RaabtaUser {
  id: string;
  email: string;
  role: StaffRole;
  displayName: string;
  teamId?: string | null;
  volunteerName?: string | null;
}

export const ROLE_LANDING_PAGES: Record<StaffRole, string> = {
  coordinator: '/dashboard',
  rescue_team: '/field',
  volunteer: '/volunteer',
};
