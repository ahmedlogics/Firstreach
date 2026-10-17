'use client';

import React from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { DashboardStatistics } from '@/lib/dashboard/types';
import {
  AlertTriangle,
  Flame,
  LifeBuoy,
  PhoneOff,
  AlertOctagon,
  Users,
} from 'lucide-react';

interface DashboardStatsProps {
  stats: DashboardStatistics;
  simulationMinutes?: number;
  onFilterClick?: (filterType: string) => void;
  className?: string;
}

export function DashboardStats({
  stats,
  simulationMinutes = 0,
  onFilterClick,
  className = '',
}: DashboardStatsProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
      {/* 1. Active Emergencies */}
      <StatCard
        label="Active Emergencies"
        value={stats.activeEmergencies}
        icon={AlertTriangle}
        variant="neutral"
        subtitle="Status: open / assigned / in progress"
        trend={{
          value: 'Live DB count',
          isPositive: true,
        }}
        onClick={() => onFilterClick?.('active')}
      />

      {/* 2. Critical Emergencies (priority_score >= 80) */}
      <StatCard
        label="Critical Emergencies"
        value={stats.criticalEmergencies}
        icon={Flame}
        variant="critical"
        subtitle="Priority score ≥ 80 (UI threshold)"
        trend={{
          value: 'Highest life-threat',
          isPositive: false,
        }}
        onClick={() => onFilterClick?.('critical')}
      />

      {/* 3. Available Rescue Teams */}
      <StatCard
        label="Available Teams"
        value={stats.availableRescueTeams}
        icon={LifeBuoy}
        variant="teal"
        subtitle="Boats, vehicles & medical units"
        trend={{
          value: 'Ready for dispatch',
          isPositive: true,
        }}
        onClick={() => onFilterClick?.('teams')}
      />

      {/* 4. Unreachable Households */}
      <StatCard
        label="Unreachable Homes"
        value={stats.unreachableHouseholds}
        icon={PhoneOff}
        variant="warning"
        subtitle={`+ ${stats.uncontactedHouseholds} unconfirmed contacts`}
        trend={{
          value: 'no_phone access',
          isPositive: false,
        }}
        onClick={() => onFilterClick?.('unreachable')}
      />

      {/* 5. Unserved Emergencies */}
      <StatCard
        label="Unserved Incidents"
        value={stats.unservedEmergencies}
        icon={AlertOctagon}
        variant={typeof stats.unservedEmergencies === 'number' && stats.unservedEmergencies > 0 ? 'critical' : 'neutral'}
        subtitle="Open with no active team assigned"
        trend={{
          value: 'Awaiting resource',
          isPositive: false,
        }}
        onClick={() => onFilterClick?.('unserved')}
      />
    </div>
  );
}
