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
        <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] bg-[#252A30] rounded-xl overflow-hidden border border-[#E8E6E1] shadow-subtle flex flex-col items-center justify-center p-6 text-center space-y-3">
          <p className="text-xs text-[#92979D]">Map view re-initializing...</p>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#536A82] text-white hover:bg-[#40566D] transition-colors cursor-pointer"
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
    <div className={`relative isolate z-0 ${props.className || ''}`}>
      <MapErrorBoundary>
        <DisasterMapClient {...props} />
      </MapErrorBoundary>
    </div>
  );
}
