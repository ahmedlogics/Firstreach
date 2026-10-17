'use client';

import React from 'react';
import { StatCard } from '@/components/shared/StatCard';
import {
  AlertTriangle,
  Flame,
  LifeBuoy,
  PhoneOff,
  AlertOctagon,
} from 'lucide-react';
import { MOCK_DASHBOARD_STATS } from '@/lib/mock-data';

interface EmergencyStatsProps {
  simulationHour?: number;
  onFilterClick?: (filterType: string) => void;
}

export function EmergencyStats({
  simulationHour = 0,
  onFilterClick,
}: EmergencyStatsProps) {
  // Simulate dynamic scaling with flood hour
  const activeEmergencies = MOCK_DASHBOARD_STATS.activeEmergencies + simulationHour * 3;
  const criticalCases = Math.min(activeEmergencies, MOCK_DASHBOARD_STATS.criticalCases + simulationHour * 2);
  const availableTeams = Math.max(1, MOCK_DASHBOARD_STATS.availableRescueTeams - Math.floor(simulationHour * 0.5));
  const unreachableHouseholds = MOCK_DASHBOARD_STATS.unreachableHouseholds + simulationHour * 45;
  const unservedRequests = MOCK_DASHBOARD_STATS.unservedRequests + (simulationHour >= 2 ? 2 : 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        label="Active Emergencies"
        value={activeEmergencies}
        icon={AlertTriangle}
        variant="neutral"
        subtitle="Reported in Karachi sector"
        trend={{
          value: `+${simulationHour * 3} in sim`,
          isPositive: false,
        }}
        onClick={() => onFilterClick?.('all')}
      />

      <StatCard
        label="Critical Cases"
        value={criticalCases}
        icon={Flame}
        variant="critical"
        subtitle="Immediate threat to life"
        trend={{
          value: 'Priority 90+',
          isPositive: false,
        }}
        onClick={() => onFilterClick?.('critical')}
      />

      <StatCard
        label="Available Teams"
        value={availableTeams}
        icon={LifeBuoy}
        variant="teal"
        subtitle="Boats, vehicles & medical"
        trend={{
          value: '3 active staging',
          isPositive: true,
        }}
        onClick={() => onFilterClick?.('teams')}
      />

      <StatCard
        label="Unreachable Homes"
        value={unreachableHouseholds}
        icon={PhoneOff}
        variant="warning"
        subtitle="Zero cellular response"
        trend={{
          value: 'Verification needed',
          isPositive: false,
        }}
        onClick={() => onFilterClick?.('unreachable')}
      />

      <StatCard
        label="Unserved Requests"
        value={unservedRequests}
        icon={AlertOctagon}
        variant="critical"
        subtitle="Resource deficit alerts"
        trend={{
          value: 'Requires escalation',
          isPositive: false,
        }}
        onClick={() => onFilterClick?.('unserved')}
      />
    </div>
  );
}
