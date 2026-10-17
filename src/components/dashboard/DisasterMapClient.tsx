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
  ZoomIn,
  ZoomOut,
  Crosshair,
  Flame,
  LifeBuoy,
  Home,
  Waves,
  EyeOff,
  AlertTriangle,
  HeartPulse,
  Users,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface DisasterMapClientProps {
  zones: ZoneAnalytics[];
  incidents: DbIncident[];
  rescueTeams: DbRescueTeam[];
  shelters: DbShelter[];
  simulationMinutes: number;
  onSelectIncident?: (incident: DbIncident) => void;
}

// Controller component to reset map view
function MapViewHandler({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
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
  const [mapZoom, setMapZoom] = useState(13);

  // Default center based on zones or Karachi center
  const initialCenter: [number, number] = useMemo(() => {
    if (zones.length > 0) {
      return [zones[0].center_lat, zones[0].center_lng];
    }
    return [24.86, 67.02];
  }, [zones]);

  // Create custom SVG DivIcons for Leaflet
  const createIncidentIcon = (incident: DbIncident) => {
    const { tier } = getPriorityTier(incident.priority_score);
    const isCritical = tier === 'Critical';

    let bgColor = '#14B8A6';
    let ringColor = 'rgba(20, 184, 166, 0.4)';

    if (tier === 'Critical') {
      bgColor = '#F16D70';
      ringColor = 'rgba(241, 109, 112, 0.5)';
    } else if (tier === 'High') {
      bgColor = '#F5B544';
      ringColor = 'rgba(245, 181, 68, 0.4)';
    } else if (tier === 'Medium') {
      bgColor = '#0284C7';
      ringColor = 'rgba(2, 132, 199, 0.4)';
    }

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          ${isCritical ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: ${ringColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
          <div style="width: 30px; height: 30px; border-radius: 9999px; background-color: ${bgColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-family: monospace; font-size: 11px;">
            ${incident.people_count}p
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });
  };

  const createTeamIcon = (team: DbRescueTeam) => {
    const isAvailable = team.status === 'available';
    const isBoat = team.team_type === 'boat';
    const isMedical = team.team_type === 'medical';

    const symbol = isBoat ? '⚓' : isMedical ? '✚' : '🚚';
    const bgColor = isAvailable ? '#0D9488' : '#475569';

    return L.divIcon({
      className: 'custom-leaflet-team-marker',
      html: `
        <div style="width: 30px; height: 30px; border-radius: 8px; background-color: ${bgColor}; border: 2px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 13px;">
          ${symbol}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -16],
    });
  };

  const createShelterIcon = (shelter: DbShelter) => {
    const isFull = shelter.occupied >= shelter.capacity;
    const isNearFull = shelter.occupied / shelter.capacity >= 0.8;
    const bgColor = isFull ? '#DC2626' : isNearFull ? '#D97706' : '#2563EB';

    return L.divIcon({
      className: 'custom-leaflet-shelter-marker',
      html: `
        <div style="width: 28px; height: 28px; border-radius: 8px; background-color: ${bgColor}; border: 2px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 12px; font-weight: bold;">
          ⌂
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -15],
    });
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] bg-[#0E1726] rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-subtle flex flex-col">
      {/* Top Map Controls Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Filter Pills */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-md text-xs font-semibold pointer-events-auto">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              activeLayer === 'all' ? 'bg-[#0B1423] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Layers
          </button>
          <button
            onClick={() => setActiveLayer('incidents')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              activeLayer === 'incidents' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3 h-3 text-red-500" /> Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setActiveLayer('teams')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              activeLayer === 'teams' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LifeBuoy className="w-3 h-3 text-teal-500" /> Teams ({rescueTeams.length})
          </button>
          <button
            onClick={() => setActiveLayer('zones')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              activeLayer === 'zones' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Waves className="w-3 h-3 text-amber-500" /> Flood Zones ({zones.length})
          </button>
          <button
            onClick={() => setActiveLayer('shelters')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              activeLayer === 'shelters' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3 h-3 text-blue-500" /> Shelters ({shelters.length})
          </button>
        </div>

        {/* Live Telemetry Tag */}
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono font-medium flex items-center gap-2 pointer-events-auto shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14B8A6] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14B8A6]" />
          </span>
          <span>OpenStreetMap • Karachi Basin</span>
        </div>
      </div>

      {/* Actual React-Leaflet Map Container */}
      <MapContainer
        center={initialCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#0B1423' }}
      >
        <MapViewHandler center={initialCenter} zoom={mapZoom} />

        {/* OpenStreetMap Tile Layer with Required Attribution */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* 1. Zone Center Circles (Approximate circular visualization per schema) */}
        {(activeLayer === 'all' || activeLayer === 'zones') &&
          zones.map((zone) => {
            const simulatedMinutes = getSimulatedMinutesToImpact(zone.minutes_to_impact, simulationMinutes);
            const isImpacted = simulatedMinutes !== null && simulatedMinutes <= 0;

            let circleColor = '#0284C7'; // Blue for risk 1
            if (zone.flood_risk === 3) circleColor = '#DC2626'; // Red for risk 3
            else if (zone.flood_risk === 2) circleColor = '#D97706'; // Amber for risk 2

            // Visual pulse if impacted during simulation
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
                    weight: isImpacted ? 3 : 1.5,
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
                          Risk Tier {zone.flood_risk}/3
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Reporting Coverage:</span>
                          <strong className="capitalize">{zone.reporting_coverage}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Baseline Impact ETA:</span>
                          <strong className="font-mono">{zone.minutes_to_impact !== null ? `${zone.minutes_to_impact} min` : 'Unknown'}</strong>
                        </div>
                        {simulationMinutes > 0 && (
                          <div className="flex justify-between text-red-600 font-semibold">
                            <span>Simulated ETA (T+{simulationMinutes}m):</span>
                            <span className="font-mono">{isImpacted ? 'IMPACTED' : `${simulatedMinutes} min remaining`}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Households Tracked:</span>
                          <strong>{zone.householdCount} ({zone.noPhoneCount} no-phone)</strong>
                        </div>
                      </div>

                      {zone.isBlindSpot && (
                        <div className="mt-2 p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[10px] flex items-start gap-1">
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
            const priorityMeta = getPriorityTier(inc.priority_score);
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
                        <span className="font-mono text-[10px] text-slate-400 block">ID: {inc.id.slice(0, 8)}...</span>
                        <strong className="text-sm font-bold text-slate-900">{inc.zone_name || 'Emergency Incident'}</strong>
                      </div>
                      <PriorityBadge score={inc.priority_score} size="sm" />
                    </div>

                    <p className="text-slate-600 text-xs italic">
                      "{inc.details || 'No caller details recorded'}"
                    </p>

                    <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="flex justify-between">
                        <span>Affected People:</span>
                        <strong className="text-slate-900">{inc.people_count} individuals</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Flood Ingress:</span>
                        <span className={severityMeta.colorClass}>{severityMeta.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical Urgent:</span>
                        <strong className={inc.medical_urgent ? 'text-red-600' : 'text-slate-600'}>
                          {inc.medical_urgent ? 'YES (Critical)' : 'No'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Before Harm:</span>
                        <strong className="font-mono text-red-600">
                          {inc.minutes_to_harm !== null ? `${inc.minutes_to_harm} min` : 'Unknown'}
                        </strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200/60">
                        <span>Verification:</span>
                        <StatusBadge status={inc.verification_status} size="sm" />
                      </div>
                    </div>

                    {onSelectIncident && (
                      <button
                        onClick={() => onSelectIncident(inc)}
                        className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>View Incident Drawer</span>
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
                  <div className="p-1 space-y-1.5 text-xs text-slate-800 font-sans min-w-[200px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <strong className="text-sm font-bold text-slate-900">{team.name}</strong>
                      <StatusBadge status={team.status} size="sm" />
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Asset Type:</span>
                        <strong className="capitalize">{team.team_type}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Rescue Capacity:</span>
                        <strong>{team.capacity} persons / trip</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Capabilities:</span>
                        <span>{team.capabilities?.join(', ') || 'Standard swiftwater'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fixed Cost:</span>
                        <span className="font-mono">PKR {team.fixed_cost}</span>
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
                <div className="p-1 space-y-1.5 text-xs text-slate-800 font-sans min-w-[190px]">
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
                      <strong className={shelter.capacity - shelter.occupied <= 5 ? 'text-red-600 font-bold' : 'text-emerald-700'}>
                        {Math.max(0, shelter.capacity - shelter.occupied)} beds
                      </strong>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Bottom Map Legend Bar */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1 max-w-[240px] pointer-events-auto shadow-lg">
        <div className="flex items-center justify-between font-bold text-white text-xs mb-1">
          <span>Map Legend</span>
          <span className="text-[10px] font-mono text-teal-400">T+{simulationMinutes}m</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F16D70] border border-white shrink-0" />
          <span>Critical Emergency (P80+)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F5B544] border border-white shrink-0" />
          <span>High Severity (P60-79)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#0D9488] shrink-0" />
          <span>Rescue Team (Boat / Medical)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#2563EB] shrink-0" />
          <span>Evacuation Shelter</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-amber-300 text-[10px]">
          <span className="w-3 h-1 border-b-2 border-dashed border-amber-400 shrink-0" />
          <span>Dashed: Low Coverage Blind-Spot</span>
        </div>
      </div>

      {/* Disclaimer on Bottom Right */}
      <div className="absolute bottom-3 right-3 z-10 bg-slate-900/80 backdrop-blur-xs text-slate-400 px-2.5 py-1 rounded-lg text-[10px] pointer-events-auto border border-slate-800">
        Coordinates are synthetic demo values
      </div>
    </div>
  );
}
