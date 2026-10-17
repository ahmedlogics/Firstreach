'use client';

import React from 'react';
import { StatCard } from '@/components/shared/StatCard';
import {
  PhoneOff,
  UserCheck,
  Footprints,
  Home,
} from 'lucide-react';
import { MOCK_HOUSEHOLDS, MOCK_SHELTERS } from '@/lib/mock-data';

export function ReachabilityStats() {
  const noPhoneCount = MOCK_HOUSEHOLDS.filter((h) => h.phoneReachability === 'none').length * 48; // scaled
  const unconfirmedCount = 278;
  const volunteerTasksRequired = 12;
  const sheltersNearCapacity = MOCK_SHELTERS.filter((s) => s.status === 'near_capacity').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="No Phone Access"
        value={noPhoneCount}
        icon={PhoneOff}
        variant="critical"
        subtitle="Vulnerable to blackout"
        trend={{
          value: 'Requires in-person visit',
          isPositive: false,
        }}
      />

      <StatCard
        label="Unconfirmed Check-ins"
        value={unconfirmedCount}
        icon={UserCheck}
        variant="warning"
        subtitle="Overdue contact window"
        trend={{
          value: '>12h silence in flood zone',
          isPositive: false,
        }}
      />

      <StatCard
        label="Volunteer Visits Needed"
        value={volunteerTasksRequired}
        icon={Footprints}
        variant="teal"
        subtitle="Reconnaissance tasks"
        trend={{
          value: '4 dispatched',
          isPositive: true,
        }}
      />

      <StatCard
        label="Shelters Near Capacity"
        value={sheltersNearCapacity}
        icon={Home}
        variant="info"
        subtitle="Surjani & Korangi complexes"
        trend={{
          value: '>85% occupied',
          isPositive: false,
        }}
      />
    </div>
  );
}
