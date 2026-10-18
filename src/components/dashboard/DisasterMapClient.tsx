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
  Flame,
  LifeBuoy,
  Home,
  Waves,
  ArrowRight,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface DisasterMapClientProps {
  zones: ZoneAnalytics[];
  incidents: DbIncident[];
  rescueTeams: DbRescueTeam[];
  shelters: DbShelter[];
  simulationMinutes: number;
  onSelectIncident?: (incident: DbIncident) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// Controller component to safely invalidate map size after render, resize, and center updates
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Initial resize trigger
    map.invalidateSize();

    // Responsive resize observer to prevent empty whitespace on sidebar collapse/expand
    const container = map.getContainer();
    if (container && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        try {
          map.invalidateSize();
        } catch {
          // safe fallback
        }
      });
      ro.observe(container);
      return () => ro.disconnect();
    }
  }, [map]);

  useEffect(() => {
    if (!map || !center) return;
    try {
      const current = map.getCenter();
      const dist = Math.abs(current.lat - center[0]) + Math.abs(current.lng - center[1]);
      if (dist > 0.001) {
        map.setView(center, map.getZoom(), { animate: true });
      }
    } catch {
      // Safe fallback
    }
  }, [map, center[0], center[1]]);

  return null;
}

export default function DisasterMapClient({
  zones,
  incidents,
  rescueTeams,
  shelters,
  simulationMinutes,
  onSelectIncident,
  isExpanded: externalIsExpanded,
  onToggleExpand,
}: DisasterMapClientProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalExpanded;

  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const [activeLayer, setActiveLayer] = useState<'all' | 'incidents' | 'teams' | 'zones' | 'shelters'>('all');
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Default center based on zones or Karachi center
  const initialCenter: [number, number] = useMemo(() => {
    if (zones.length > 0 && typeof zones[0].center_lat === 'number') {
      return [zones[0].center_lat, zones[0].center_lng];
    }
    return [24.86, 67.02];
  }, [zones.length > 0 ? zones[0].id : 'default']);

  // Custom DivIcons for Leaflet
  const createIncidentIcon = (incident: DbIncident) => {
    const { tier } = getPriorityTier(incident.priority_score);

    let bgColor = '#375A6B';
    let ringStyle = 'box-shadow: 0 0 0 2px rgba(55, 90, 107, 0.4), 0 3px 6px rgba(0,0,0,0.3);';

    if (tier === 'Critical') {
      bgColor = '#BC414A';
      ringStyle = 'box-shadow: 0 0 0 3px rgba(188, 65, 74, 0.45), 0 4px 8px rgba(0,0,0,0.35);';
    } else if (tier === 'High') {
      bgColor = '#A87528';
      ringStyle = 'box-shadow: 0 0 0 2px rgba(168, 117, 40, 0.4), 0 3px 6px rgba(0,0,0,0.3);';
    }

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: ${bgColor}; border: 2px solid #ffffff; ${ringStyle} display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-family: monospace; font-size: 11px;">
          ${incident.people_count}p
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -15],
    });
  };

  const createTeamIcon = (team: DbRescueTeam) => {
    const isAvailable = team.status === 'available';
    const isBoat = team.team_type === 'boat';
    const isMedical = team.team_type === 'medical';

    const symbol = isBoat ? '⚓' : isMedical ? '✚' : '🚚';
    const bgColor = isAvailable ? '#258167' : '#5F6B7A';

    return L.divIcon({
      className: 'custom-leaflet-team-marker',
      html: `
        <div style="width: 26px; height: 26px; border-radius: 8px; background-color: ${bgColor}; border: 2px solid #ffffff; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 12px;">
          ${symbol}
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14],
    });
  };

  const createShelterIcon = (shelter: DbShelter) => {
    const isFull = shelter.occupied >= shelter.capacity;
    const isNearFull = shelter.occupied / shelter.capacity >= 0.8;
    const bgColor = isFull ? '#BC414A' : isNearFull ? '#A87528' : '#375A6B';

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

  const containerHeightClass = isExpanded
    ? 'h-[520px] sm:h-[580px] lg:h-[620px]'
    : 'h-[320px] sm:h-[350px] lg:h-[380px]';

  if (!isMounted) {
    return (
      <div
        className={`relative w-full ${containerHeightClass} bg-[#18232D] rounded-xl overflow-hidden border border-[#E4E8EC] shadow-xs flex items-center justify-center`}
        style={{ isolation: 'isolate', zIndex: 0 }}
      >
        <div className="flex items-center gap-2 text-[#5F6B7A] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#375A6B] animate-ping" />
          <span>Loading Karachi Disaster Map...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${containerHeightClass} bg-[#18232D] rounded-xl overflow-hidden border border-[#E4E8EC] shadow-xs flex flex-col transition-all duration-300`}
      style={{ isolation: 'isolate', zIndex: 0 }}
    >
      {/* Top Map Layer Filter & Control Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Filter Pills */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-[#E4E8EC] shadow-xs text-xs font-semibold pointer-events-auto">
          <button
            type="button"
            onClick={() => setActiveLayer('all')}
            className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
              activeLayer === 'all' ? 'bg-[#18232D] text-white' : 'text-[#5F6B7A] hover:bg-[#F0F4F8] hover:text-[#18232D]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('incidents')}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              activeLayer === 'incidents' ? 'bg-[#BC414A] text-white' : 'text-[#5F6B7A] hover:bg-[#F0F4F8] hover:text-[#18232D]'
            }`}
          >
            <Flame className="w-3 h-3 text-[#BC414A]" />
            <span>Incidents ({incidents.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('teams')}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              activeLayer === 'teams' ? 'bg-[#258167] text-white' : 'text-[#5F6B7A] hover:bg-[#F0F4F8] hover:text-[#18232D]'
            }`}
          >
            <LifeBuoy className="w-3 h-3 text-[#258167]" />
            <span>Teams ({rescueTeams.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('zones')}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              activeLayer === 'zones' ? 'bg-[#A87528] text-white' : 'text-[#5F6B7A] hover:bg-[#F0F4F8] hover:text-[#18232D]'
            }`}
          >
            <Waves className="w-3 h-3 text-[#A87528]" />
            <span>Zones ({zones.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('shelters')}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              activeLayer === 'shelters' ? 'bg-[#375A6B] text-white' : 'text-[#5F6B7A] hover:bg-[#F0F4F8] hover:text-[#18232D]'
            }`}
          >
            <Home className="w-3 h-3 text-[#375A6B]" />
            <span>Shelters ({shelters.length})</span>
          </button>
        </div>

        {/* Right Action: Expand/Collapse Map + Basin Tag */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={toggleExpand}
            className="bg-white/95 backdrop-blur-md text-[#18232D] hover:bg-white px-2.5 py-1 rounded-lg border border-[#E4E8EC] shadow-xs text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse to compact view' : 'Expand map view'}
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[#5F6B7A]" />
                <span className="hidden sm:inline">Compact</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#5F6B7A]" />
                <span className="hidden sm:inline">Expand</span>
              </>
            )}
          </button>

          <div className="bg-[#18232D]/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg border border-[#273642] text-[11px] font-mono font-medium flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#258167]" />
            <span className="hidden sm:inline">Karachi Basin</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        key="firstreach-disaster-map-canvas"
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#0B1423' }}
      >
        <MapController center={initialCenter} />

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
                        <strong className="font-bold text-slate-900">{zone.name}</strong>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 font-bold">
                          Tier {zone.flood_risk} Risk
                        </span>
                      </div>
                      <div className="space-y-0.5 text-[11px] text-slate-600">
                        <div>Surge Impact: <strong className="font-mono text-slate-900">{simulatedMinutes !== null ? (isImpacted ? 'Surge Impacted' : `${simulatedMinutes}m remaining`) : 'Not forecast'}</strong></div>
                        <div>Reporting Coverage: <strong className="capitalize text-slate-900">{zone.reporting_coverage}</strong></div>
                        <div>Offline Households: <strong className="font-mono text-slate-900">{zone.noPhoneCount} homes</strong></div>
                        <div>Active Calls: <strong className="font-mono text-slate-900">{zone.incidentCount} incidents</strong></div>
                      </div>
                    </div>
                  </Popup>
                </Circle>
              </React.Fragment>
            );
          })}

        {/* 2. Incidents Markers */}
        {(activeLayer === 'all' || activeLayer === 'incidents') &&
          incidents.map((incident) => {
            if (typeof incident.lat !== 'number' || typeof incident.lng !== 'number') return null;

            return (
              <Marker
                key={incident.id}
                position={[incident.lat, incident.lng]}
                icon={createIncidentIcon(incident)}
              >
                <Popup className="firstreach-custom-popup">
                  <div className="p-1 space-y-2 text-xs text-slate-800 font-sans min-w-[220px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-mono font-bold text-slate-900">
                        INC-{incident.id.slice(0, 8).toUpperCase()}
                      </span>
                      <PriorityBadge score={incident.priority_score} size="sm" />
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {incident.priority_reason || incident.details || 'Emergency assistance requested.'}
                    </p>

                    <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-50 p-1.5 rounded font-mono">
                      <div>People: <strong>{incident.people_count}</strong></div>
                      <div>Surge: <strong>{incident.minutes_to_harm !== null ? `${incident.minutes_to_harm}m` : '—'}</strong></div>
                      <div>Flood: <strong>{formatFloodSeverity(incident.flood_severity).label}</strong></div>
                      <div>Status: <strong className="capitalize">{incident.status}</strong></div>
                    </div>

                    {onSelectIncident && (
                      <button
                        type="button"
                        onClick={() => onSelectIncident(incident)}
                        className="w-full py-1 px-2 rounded bg-[#375A6B] hover:bg-[#2C4855] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Dispatch Rescue Unit</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 3. Rescue Teams Markers */}
        {(activeLayer === 'all' || activeLayer === 'teams') &&
          rescueTeams.map((team) => {
            if (typeof team.lat !== 'number' || typeof team.lng !== 'number') return null;

            return (
              <Marker
                key={team.id}
                position={[team.lat, team.lng]}
                icon={createTeamIcon(team)}
              >
                <Popup className="firstreach-custom-popup">
                  <div className="p-1 space-y-1.5 text-xs text-slate-800 font-sans min-w-[200px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <strong className="font-bold text-slate-900">{team.name}</strong>
                      <StatusBadge status={team.status} size="sm" />
                    </div>
                    <div className="space-y-0.5 text-[11px] text-slate-600">
                      <div>Type: <strong className="capitalize">{team.team_type}</strong></div>
                      <div>Capacity: <strong className="font-mono">{team.capacity} pax</strong></div>
                      <div>Capabilities: <span className="text-[10px]">{team.capabilities.join(', ')}</span></div>
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
                <div className="p-1 space-y-1.5 text-xs text-slate-800 font-sans min-w-[200px]">
                  <div className="flex items-center justify-between border-b pb-1">
                    <strong className="font-bold text-slate-900">{shelter.name}</strong>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 font-bold">
                      {Math.round((shelter.occupied / shelter.capacity) * 100)}% Full
                    </span>
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
                      <strong className={shelter.capacity - shelter.occupied <= 5 ? 'text-[#BC414A]' : 'text-[#258167]'}>
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
      <div className="absolute bottom-2.5 left-2.5 z-10 bg-[#18232D]/95 backdrop-blur-md rounded-lg border border-[#273642] text-[11px] text-slate-300 pointer-events-auto shadow-lg overflow-hidden max-w-[230px]">
        <button
          type="button"
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="w-full flex items-center justify-between p-2 font-bold text-white text-xs hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <span>Map Legend</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLegendOpen ? 'rotate-180' : ''}`} />
        </button>

        {isLegendOpen && (
          <div className="px-2.5 pb-2.5 space-y-1 text-[10px] border-t border-[#273642] pt-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BC414A] border border-white shrink-0" />
              <span>Critical Emergency (P80+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A87528] border border-white shrink-0" />
              <span>High Priority (P60-79)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-[#375A6B] shrink-0" />
              <span>Rescue Unit (Boat/Medical)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-[#258167] border border-slate-600 shrink-0" />
              <span>Evacuation Shelter</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 pt-0.5 border-t border-[#273642]">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-[#A87528] shrink-0" />
              <span>Dashed: Verification Zone</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
