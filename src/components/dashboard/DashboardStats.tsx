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
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 ${className}`}>
      {/* 1. Active Emergencies */}
      <StatCard
        label="Active Emergencies"
        value={stats.activeEmergencies}
        icon={AlertTriangle}
        variant="neutral"
        subtitle="Open or assigned"
        onClick={() => onFilterClick?.('active')}
      />

      {/* 2. Critical Emergencies */}
      <StatCard
        label="Critical Emergencies"
        value={stats.criticalEmergencies}
        icon={Flame}
        variant="critical"
        subtitle="Priority score ≥ 80"
        onClick={() => onFilterClick?.('critical')}
      />

      {/* 3. Available Teams */}
      <StatCard
        label="Available Teams"
        value={stats.availableRescueTeams}
        icon={LifeBuoy}
        variant="teal"
        subtitle="Ready for dispatch"
        onClick={() => onFilterClick?.('teams')}
      />

      {/* 4. Unreachable Households */}
      <StatCard
        label="Unreachable Homes"
        value={stats.unreachableHouseholds}
        icon={PhoneOff}
        variant="warning"
        subtitle="No phone access"
        onClick={() => onFilterClick?.('unreachable')}
      />

      {/* 5. Awaiting Assignment (Distinguished from genuinely unserved emergencies) */}
      <StatCard
        label="Awaiting Assignment"
        value={stats.unservedEmergencies}
        icon={AlertOctagon}
        variant={typeof stats.unservedEmergencies === 'number' && stats.unservedEmergencies > 0 ? 'critical' : 'neutral'}
        subtitle="Pending team dispatch"
        onClick={() => onFilterClick?.('unserved')}
      />
    </div>
  );
}
