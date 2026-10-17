'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { DbIncident, DbRescueTeam, DbShelter, ZoneAnalytics } from '@/lib/dashboard/types';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

const DisasterMapClient = dynamic(() => import('./DisasterMapClient'), {
  ssr: false,
  loading: () => <LoadingSkeleton variant="map" className="h-[380px] sm:h-[440px] lg:h-[480px]" />,
});

interface DisasterMapProps {
  zones: ZoneAnalytics[];
  incidents: DbIncident[];
  rescueTeams: DbRescueTeam[];
  shelters: DbShelter[];
  simulationMinutes: number;
  onSelectIncident?: (incident: DbIncident) => void;
  className?: string;
}

export function DisasterMap(props: DisasterMapProps) {
  return (
    <div className={props.className}>
      <DisasterMapClient {...props} />
    </div>
  );
}
