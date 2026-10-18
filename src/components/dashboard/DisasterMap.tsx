'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { DbIncident, DbRescueTeam, DbShelter, ZoneAnalytics } from '@/lib/dashboard/types';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

const DisasterMapClient = dynamic(() => import('./DisasterMapClient'), {
  ssr: false,
  loading: () => <LoadingSkeleton variant="map" className="h-[320px] sm:h-[350px] lg:h-[380px]" />,
});

interface DisasterMapProps {
  zones: ZoneAnalytics[];
  incidents: DbIncident[];
  rescueTeams: DbRescueTeam[];
  shelters: DbShelter[];
  simulationMinutes: number;
  onSelectIncident?: (incident: DbIncident) => void;
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorCount: number;
}

class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[DisasterMap] Caught transient Leaflet container transition error:', error);
  }

  handleReset = () => {
    this.setState((prev) => ({
      hasError: false,
      errorCount: prev.errorCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative w-full h-[320px] sm:h-[350px] lg:h-[380px] bg-[#18232D] rounded-xl overflow-hidden border border-[#E4E8EC] shadow-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
          <p className="text-xs text-[#5F6B7A]">Map view re-initializing...</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#375A6B] text-white hover:bg-[#2C4855] transition-colors cursor-pointer"
          >
            Reload Map Canvas
          </button>
        </div>
      );
    }

    return (
      <React.Fragment key={`map-boundary-retry-${this.state.errorCount}`}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

export function DisasterMap(props: DisasterMapProps) {
  return (
    <div className={props.className}>
      <MapErrorBoundary>
        <DisasterMapClient {...props} />
      </MapErrorBoundary>
    </div>
  );
}
