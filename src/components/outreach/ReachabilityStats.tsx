'use client';

import React from 'react';
import { StatCard } from '@/components/shared/StatCard';
import {
  PhoneOff,
  UserCheck,
  Footprints,
  Home,
} from 'lucide-react';
import { ReachabilityOverviewMetrics } from '@/lib/outreach/types';

interface ReachabilityStatsProps {
  metrics: ReachabilityOverviewMetrics;
  isLoading?: boolean;
}

export function ReachabilityStats({
  metrics,
  isLoading = false,
}: ReachabilityStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Stat 1: Zero Phone Access */}
      <StatCard
        label="No Phone Access"
        value={isLoading ? '...' : metrics.noPhoneCount}
        icon={PhoneOff}
        variant="critical"
        subtitle="Blackout vulnerable households"
        trend={{
          value: 'Requires ground visit',
          isPositive: false,
        }}
      />

      {/* Stat 2: Uncontacted / Needs Visit */}
      <StatCard
        label="Uncontacted / Needs Check"
        value={isLoading ? '...' : metrics.uncontactedCount + metrics.needsVisitCount}
        icon={UserCheck}
        variant="warning"
        subtitle="Unresponsive in flood path"
        trend={{
          value: 'Silence ≠ Emergency',
          isPositive: false,
        }}
      />

      {/* Stat 3: Active Volunteer Patrols */}
      <StatCard
        label="Active Volunteer Patrols"
        value={isLoading ? '...' : metrics.activeVolunteerTasks}
        icon={Footprints}
        variant="teal"
        subtitle="Field welfare reconnaissance"
        trend={{
          value: 'Ground scout checks',
          isPositive: true,
        }}
      />

      {/* Stat 4: Shelter Fleet Availability */}
      <StatCard
        label="Shelter Free Beds"
        value={isLoading ? '...' : metrics.totalFreeBeds}
        icon={Home}
        variant="info"
        subtitle={`Of ${metrics.totalShelterCapacity} total capacity`}
        trend={{
          value: `${metrics.sheltersNearCapacityCount} near capacity`,
          isPositive: metrics.totalFreeBeds > 10,
        }}
      />
    </div>
  );
}
