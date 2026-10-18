'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DbIncident, DbRescueTeam, DbShelter, ZoneAnalytics } from '@/lib/dashboard/types';
import { getPriorityTier, formatFloodSeverity, getSimulatedMinutesToImpact } from '@/lib/dashboard/helpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import {
  Layers,
  Flame,
  LifeBuoy,
  Home,
  Waves,
  AlertTriangle,
  ArrowRight,
  Info,
  ChevronDown,
} from 'lucide-react';

interface DisasterMapClientProps {
  zones: ZoneAnalytics[];
  incidents: DbIncident[];
  rescueTeams: DbRescueTeam[];
  shelters: DbShelter[];
  simulationMinutes: number;
  onSelectIncident?: (incident: DbIncident) => void;
}

// Controller component to safely invalidate map size after initial render
function MapController() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        // Safe fallback
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function DisasterMapClient({
  zones,
  incidents,
  rescueTeams,
  shelters,
  simulationMinutes,
  onSelectIncident,
}: DisasterMapClientProps) {
  const [activeLayer, setActiveLayer] = useState<'all' | 'incidents' | 'teams' | 'zones' | 'shelters'>('all');
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Default center based on zones or Karachi center (stable dependency)
  const initialCenter: [number, number] = useMemo(() => {
    if (zones.length > 0 && typeof zones[0].center_lat === 'number') {
      return [zones[0].center_lat, zones[0].center_lng];
    }
    return [24.86, 67.02];
  }, [zones.length > 0 ? zones[0].id : 'default']);

  // Create clean, readable custom DivIcons for Leaflet
  const createIncidentIcon = (incident: DbIncident) => {
    const { tier } = getPriorityTier(incident.priority_score);
    const isCritical = tier === 'Critical';

    let bgColor = '#14B8A6';
    let ringStyle = 'box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.4), 0 3px 6px rgba(0,0,0,0.3);';

    if (tier === 'Critical') {
      bgColor = '#EF4444';
      ringStyle = 'box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.45), 0 4px 8px rgba(0,0,0,0.35);';
    } else if (tier === 'High') {
      bgColor = '#F59E0B';
      ringStyle = 'box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.4), 0 3px 6px rgba(0,0,0,0.3);';
    } else if (tier === 'Medium') {
      bgColor = '#0284C7';
      ringStyle = 'box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.4), 0 3px 6px rgba(0,0,0,0.3);';
    }

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="width: 30px; height: 30px; border-radius: 9999px; background-color: ${bgColor}; border: 2px solid #ffffff; ${ringStyle} display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-family: monospace; font-size: 11px;">
          ${incident.people_count}p
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -16],
    });
  };

  const createTeamIcon = (team: DbRescueTeam) => {
    const isAvailable = team.status === 'available';
    const isBoat = team.team_type === 'boat';
    const isMedical = team.team_type === 'medical';

    const symbol = isBoat ? '⚓' : isMedical ? '✚' : '🚚';
    const bgColor = isAvailable ? '#0D9488' : '#64748B';

    return L.divIcon({
      className: 'custom-leaflet-team-marker',
      html: `
        <div style="width: 28px; height: 28px; border-radius: 8px; background-color: ${bgColor}; border: 2px solid #ffffff; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 13px;">
          ${symbol}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -15],
    });
  };

  const createShelterIcon = (shelter: DbShelter) => {
    const isFull = shelter.occupied >= shelter.capacity;
    const isNearFull = shelter.occupied / shelter.capacity >= 0.8;
    const bgColor = isFull ? '#DC2626' : isNearFull ? '#D97706' : '#2563EB';

    return L.divIcon({
      className: 'custom-leaflet-shelter-marker',
      html: `
        <div style="width: 26px; height: 26px; border-radius: 7px; background-color: ${bgColor}; border: 2px solid #ffffff; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 12px; font-weight: bold;">
          ⌂
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14],
    });
  };

  if (!isMounted) {
    return (
      <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] bg-[#0E1726] rounded-xl overflow-hidden border border-[#E2E8F0] shadow-subtle flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span>Loading Karachi Disaster Map Telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] bg-[#0E1726] rounded-xl overflow-hidden border border-[#E2E8F0] shadow-subtle flex flex-col">
      {/* Top Map Layer Filter Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Filter Pills */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200/90 shadow-md text-xs font-semibold pointer-events-auto">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2 py-1 rounded-md transition-colors ${
              activeLayer === 'all' ? 'bg-[#0B1423] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveLayer('incidents')}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
              activeLayer === 'incidents' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3 h-3 text-red-500" />
            <span>Incidents ({incidents.length})</span>
          </button>
          <button
            onClick={() => setActiveLayer('teams')}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
              activeLayer === 'teams' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LifeBuoy className="w-3 h-3 text-teal-500" />
            <span>Teams ({rescueTeams.length})</span>
          </button>
          <button
            onClick={() => setActiveLayer('zones')}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
              activeLayer === 'zones' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Waves className="w-3 h-3 text-amber-500" />
            <span>Zones ({zones.length})</span>
          </button>
          <button
            onClick={() => setActiveLayer('shelters')}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
              activeLayer === 'shelters' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3 h-3 text-blue-500" />
            <span>Shelters ({shelters.length})</span>
          </button>
        </div>

        {/* Karachi Basin Live OSM Tag */}
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-mono font-medium flex items-center gap-1.5 pointer-events-auto shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Karachi Basin</span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        key={`disaster-map-${initialCenter[0]}-${initialCenter[1]}`}
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#0B1423' }}
      >
        <MapController />

        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* 1. Zone Center Circles */}
        {(activeLayer === 'all' || activeLayer === 'zones') &&
          zones.map((zone) => {
            const simulatedMinutes = getSimulatedMinutesToImpact(zone.minutes_to_impact, simulationMinutes);
            const isImpacted = simulatedMinutes !== null && simulatedMinutes <= 0;

            let circleColor = '#0284C7';
            if (zone.flood_risk === 3) circleColor = '#DC2626';
            else if (zone.flood_risk === 2) circleColor = '#D97706';

            if (isImpacted) {
              circleColor = '#EF4444';
            }

            return (
              <React.Fragment key={zone.id}>
                <Circle
                  center={[zone.center_lat, zone.center_lng]}
                  radius={isImpacted ? 1200 : 900}
                  pathOptions={{
                    color: circleColor,
                    fillColor: circleColor,
                    fillOpacity: isImpacted ? 0.35 : 0.18,
                    weight: isImpacted ? 2.5 : 1.5,
                    dashArray: zone.reporting_coverage === 'low' ? '6, 6' : undefined,
                  }}
                >
                  <Popup className="firstreach-custom-popup">
                    <div className="p-1 space-y-1.5 text-xs text-slate-800 font-sans min-w-[200px]">
                      <div className="flex items-center justify-between border-b pb-1">
                        <strong className="text-sm font-bold text-slate-900">{zone.name}</strong>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          zone.flood_risk === 3 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Risk Tier {zone.flood_risk}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Reporting Coverage:</span>
                          <strong className="capitalize">{zone.reporting_coverage}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Surge ETA:</span>
                          <strong className="font-mono">
                            {simulatedMinutes !== null ? (isImpacted ? 'IMPACTED' : `${simulatedMinutes}m`) : 'Unknown'}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Monitored Homes:</span>
                          <strong>{zone.householdCount} ({zone.noPhoneCount} offline)</strong>
                        </div>
                      </div>

                      {zone.isBlindSpot && (
                        <div className="mt-1.5 p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[10px] flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>Flagged: {zone.blindSpotReason}</span>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Circle>
              </React.Fragment>
            );
          })}

        {/* 2. Emergency Incident Markers */}
        {(activeLayer === 'all' || activeLayer === 'incidents') &&
          incidents.map((inc) => {
            if (inc.lat === null || inc.lng === null) return null;
            const severityMeta = formatFloodSeverity(inc.flood_severity);

            return (
              <Marker
                key={inc.id}
                position={[inc.lat, inc.lng]}
                icon={createIncidentIcon(inc)}
              >
                <Popup className="firstreach-custom-popup">
                  <div className="p-1.5 space-y-2 text-xs text-slate-800 font-sans min-w-[220px]">
                    <div className="flex items-center justify-between border-b pb-1.5">
                      <div>
                        <span className="font-mono text-[10px] text-slate-400 block">
                          INC-{inc.id.slice(0, 8).toUpperCase()}
                        </span>
                        <strong className="text-sm font-bold text-slate-900">
                          {inc.zone_name || 'Emergency Call'}
                        </strong>
                      </div>
                      <PriorityBadge score={inc.priority_score} size="sm" />
                    </div>

                    {inc.details && (
                      <p className="text-slate-600 text-xs italic bg-slate-50 p-1.5 rounded border border-slate-100">
                        "{inc.details}"
                      </p>
                    )}

                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Affected Individuals:</span>
                        <strong className="text-slate-900">{inc.people_count}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Flood Ingress:</span>
                        <span className={severityMeta.colorClass}>{severityMeta.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Before Harm:</span>
                        <strong className="font-mono text-red-600">
                          {inc.minutes_to_harm !== null ? `${inc.minutes_to_harm} min` : 'Unknown'}
                        </strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-100">
                        <span>Verification:</span>
                        <StatusBadge status={inc.verification_status} size="sm" />
                      </div>
                    </div>

                    {onSelectIncident && (
                      <button
                        onClick={() => onSelectIncident(inc)}
                        className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 3. Rescue Team Markers */}
        {(activeLayer === 'all' || activeLayer === 'teams') &&
          rescueTeams.map((team) => {
            if (team.lat === null || team.lng === null) return null;

            return (
              <Marker
                key={team.id}
                position={[team.lat, team.lng]}
                icon={createTeamIcon(team)}
              >
                <Popup className="firstreach-custom-popup">
                  <div className="p-1 space-y-1 text-xs text-slate-800 font-sans min-w-[190px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <strong className="text-sm font-bold text-slate-900">{team.name}</strong>
                      <StatusBadge status={team.status} size="sm" />
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <strong className="capitalize">{team.team_type}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <strong>{team.capacity} persons</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Capabilities:</span>
                        <span>{team.capabilities?.join(', ') || 'Standard'}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 4. Shelter Markers */}
        {(activeLayer === 'all' || activeLayer === 'shelters') &&
          shelters.map((shelter) => (
            <Marker
              key={shelter.id}
              position={[shelter.lat, shelter.lng]}
              icon={createShelterIcon(shelter)}
            >
              <Popup className="firstreach-custom-popup">
                <div className="p-1 space-y-1 text-xs text-slate-800 font-sans min-w-[190px]">
                  <div className="flex items-center justify-between border-b pb-1">
                    <strong className="text-sm font-bold text-slate-900">{shelter.name}</strong>
                    <span className="text-[10px] font-mono text-slate-500">Shelter</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Occupancy:</span>
                      <strong className="font-mono text-slate-900">
                        {shelter.occupied} / {shelter.capacity} beds
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <strong className={shelter.capacity - shelter.occupied <= 5 ? 'text-red-600' : 'text-emerald-700'}>
                        {Math.max(0, shelter.capacity - shelter.occupied)} beds
                      </strong>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Compact Map Legend Bar */}
      <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-950/90 backdrop-blur-md rounded-lg border border-slate-800 text-[11px] text-slate-300 pointer-events-auto shadow-lg overflow-hidden max-w-[230px]">
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="w-full flex items-center justify-between p-2 font-bold text-white text-xs hover:bg-slate-900/60 transition-colors"
        >
          <span>Map Legend</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLegendOpen ? 'rotate-180' : ''}`} />
        </button>

        {isLegendOpen && (
          <div className="px-2.5 pb-2.5 space-y-1 text-[10px] border-t border-slate-800/80 pt-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] border border-white shrink-0" />
              <span>Critical Emergency (P80+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] border border-white shrink-0" />
              <span>High Priority (P60-79)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-[#0D9488] shrink-0" />
              <span>Rescue Unit (Boat/Medical)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-[#2563EB] shrink-0" />
              <span>Evacuation Shelter</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 pt-0.5 border-t border-slate-850">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-amber-400 shrink-0" />
              <span>Dashed: Verification Zone</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
