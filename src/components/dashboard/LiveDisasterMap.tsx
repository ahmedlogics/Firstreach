'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  LifeBuoy,
  Home,
  AlertTriangle,
  Info,
  Flame,
  Shield,
  Eye,
  Crosshair,
} from 'lucide-react';
import { MOCK_ZONES, MOCK_INCIDENTS, MOCK_RESCUE_TEAMS, MOCK_SHELTERS } from '@/lib/mock-data';
import { EmergencyIncident, RescueTeam, Shelter, Zone } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';

interface LiveDisasterMapProps {
  simulationHour?: number;
  onSelectIncident?: (incident: EmergencyIncident) => void;
  className?: string;
}

export function LiveDisasterMap({
  simulationHour = 0,
  onSelectIncident,
  className = '',
}: LiveDisasterMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeLayer, setActiveLayer] = useState<'all' | 'incidents' | 'teams' | 'shelters'>('all');
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'incident' | 'team' | 'shelter' | 'zone';
    data: any;
  } | null>(null);

  // Karachi coordinate bounding box transformation for interactive canvas SVG
  // Lat: 24.75 to 25.10, Lng: 66.95 to 67.25
  const getCoordinates = (lat: number, lng: number) => {
    const minLat = 24.75;
    const maxLat = 25.08;
    const minLng = 66.95;
    const maxLng = 67.25;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(1.6, Math.max(0.8, prev + delta)));
  };

  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle overflow-hidden flex flex-col ${className}`}>
      {/* Map Header Bar */}
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 text-teal-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Live Disaster Risk Map
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                Karachi Operational Grid
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Geospatial telemetry overlaying flood water polygons, rescue assets, and critical callers.
            </p>
          </div>
        </div>

        {/* Map Layer Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-medium">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              activeLayer === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Layers
          </button>
          <button
            onClick={() => setActiveLayer('incidents')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              activeLayer === 'incidents'
                ? 'bg-red-600 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3 h-3" /> Incidents
          </button>
          <button
            onClick={() => setActiveLayer('teams')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              activeLayer === 'teams'
                ? 'bg-teal-600 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LifeBuoy className="w-3 h-3" /> Rescue Teams
          </button>
          <button
            onClick={() => setActiveLayer('shelters')}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              activeLayer === 'shelters'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3 h-3" /> Shelters
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[440px] sm:h-[480px] bg-[#0E1726] overflow-hidden select-none">
        {/* Synthetic Map Background Grid & Water Bodies */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Subtle Grid Lines representing GPS sectors */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748B" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Arabian Sea / Coastline Indicator (Bottom) */}
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-cyan-950/70 to-transparent border-t border-cyan-800/30 flex items-end p-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60 font-semibold">
              Arabian Sea / Tidal Coastline
            </span>
          </div>

          {/* Malir River Surge Corridor Polygon (Simulated Vector) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d="M 85 10 Q 70 40 55 60 T 40 95"
              fill="none"
              stroke="#0284C7"
              strokeWidth={8 + simulationHour * 3}
              strokeOpacity="0.4"
              strokeDasharray="4 2"
            />
            {/* Lyari River Surge Corridor */}
            <path
              d="M 30 15 Q 32 45 28 80 T 25 95"
              fill="none"
              stroke="#0284C7"
              strokeWidth={6 + simulationHour * 2.5}
              strokeOpacity="0.45"
            />
          </svg>

          {/* Zone Flood Polygons */}
          {MOCK_ZONES.map((zone) => {
            const { x, y } = getCoordinates(zone.coordinates[0], zone.coordinates[1]);
            const isCritical = zone.floodExposureLevel === 'critical' || simulationHour >= 3;
            const isBlindSpot = zone.reportingCoverage < 20;

            return (
              <div
                key={zone.id}
                onClick={() => setSelectedEntity({ type: 'zone', data: zone })}
                className="absolute cursor-pointer group"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {/* Flood Hazard Inundation Circle */}
                <div
                  className={`rounded-full transition-all duration-500 flex items-center justify-center ${
                    isCritical
                      ? 'w-28 h-28 bg-red-500/15 border-2 border-red-500/40 group-hover:bg-red-500/25 animate-pulse'
                      : 'w-20 h-20 bg-amber-500/15 border border-amber-500/40 group-hover:bg-amber-500/25'
                  }`}
                >
                  <div className="text-center px-2 pointer-events-none">
                    <span className="text-[10px] font-mono font-bold text-white/90 drop-shadow-sm block truncate max-w-[100px]">
                      {zone.name.split(' ')[0]}
                    </span>
                    {isBlindSpot && (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-1 py-0.5 rounded border border-amber-600/50 mt-0.5 inline-block">
                        Blind Spot ({zone.reportingCoverage}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Shelters Markers Layer */}
          {(activeLayer === 'all' || activeLayer === 'shelters') &&
            MOCK_SHELTERS.map((shelter) => {
              const { x, y } = getCoordinates(shelter.coordinates[0], shelter.coordinates[1]);
              const isFull = shelter.availableSpaces <= 20;

              return (
                <button
                  key={shelter.id}
                  onClick={() => setSelectedEntity({ type: 'shelter', data: shelter })}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={`${shelter.name}: ${shelter.availableSpaces} spots available`}
                >
                  <div className={`p-1.5 rounded-lg border shadow-lg flex items-center justify-center transition-transform group-hover:scale-125 ${
                    isFull
                      ? 'bg-amber-600 text-white border-amber-300'
                      : 'bg-blue-600 text-white border-blue-300'
                  }`}>
                    <Home className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}

          {/* Rescue Teams Markers Layer */}
          {(activeLayer === 'all' || activeLayer === 'teams') &&
            MOCK_RESCUE_TEAMS.map((team) => {
              const { x, y } = getCoordinates(team.coordinates[0], team.coordinates[1]);
              const isBusy = team.status === 'busy';

              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedEntity({ type: 'team', data: team })}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={`${team.name} (${team.status.toUpperCase()})`}
                >
                  <div className={`p-1.5 rounded-lg border shadow-lg flex items-center justify-center transition-transform group-hover:scale-125 ${
                    isBusy
                      ? 'bg-slate-700 text-slate-300 border-slate-500 opacity-80'
                      : 'bg-[#14B8A6] text-[#0B1423] font-bold border-teal-200 ring-2 ring-[#14B8A6]/40'
                  }`}>
                    <LifeBuoy className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}

          {/* Emergency Incidents Markers Layer */}
          {(activeLayer === 'all' || activeLayer === 'incidents') &&
            MOCK_INCIDENTS.map((inc) => {
              const { x, y } = getCoordinates(inc.coordinates[0], inc.coordinates[1]);
              const isCritical = inc.severity === 'critical';

              return (
                <button
                  key={inc.id}
                  onClick={() => {
                    setSelectedEntity({ type: 'incident', data: inc });
                    onSelectIncident?.(inc);
                  }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="relative">
                    {isCritical && (
                      <span className="absolute -inset-1 rounded-full bg-red-500 animate-ping opacity-60" />
                    )}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-mono text-[10px] font-bold border-2 shadow-xl transition-transform group-hover:scale-130 ${
                        isCritical
                          ? 'bg-[#F16D70] border-white ring-2 ring-red-400'
                          : inc.severity === 'high'
                          ? 'bg-[#F5B544] border-white ring-2 ring-amber-400'
                          : 'bg-blue-500 border-white'
                      }`}
                    >
                      {inc.affectedPeople}p
                    </div>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Map Control Tools (Zoom, Reset) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700 backdrop-blur-xs text-white">
          <button
            onClick={() => handleZoom(0.2)}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors border-t border-slate-700 text-[10px] font-mono text-center"
            title="Reset view"
          >
            1x
          </button>
        </div>

        {/* Map Legend Overlay (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5 max-w-[220px]">
          <div className="font-bold text-white text-xs mb-1 flex items-center justify-between">
            <span>Map Legend</span>
            <span className="text-[9px] text-teal-400 font-mono">Sim T+{simulationHour}h</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F16D70] border border-white shrink-0" />
            <span>Critical Emergency (P90+)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F5B544] border border-white shrink-0" />
            <span>High Severity / Evacuation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-[#14B8A6] shrink-0" />
            <span>Available Rescue Boat / Vehicle</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-blue-600 shrink-0" />
            <span>Active Evacuation Shelter</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-amber-300 text-[10px]">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>Hatched: High-Risk Blind Spot</span>
          </div>
        </div>

        {/* Selected Location / Entity Popover Details (Bottom Right) */}
        {selectedEntity && (
          <div className="absolute bottom-4 right-4 z-20 bg-white p-4 rounded-xl border border-slate-200 shadow-2xl max-w-xs text-xs text-[#0F172A] animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="font-bold text-sm text-[#0F172A] truncate">
                {selectedEntity.type === 'incident' && selectedEntity.data.id}
                {selectedEntity.type === 'team' && selectedEntity.data.name}
                {selectedEntity.type === 'shelter' && selectedEntity.data.name}
                {selectedEntity.type === 'zone' && selectedEntity.data.name}
              </span>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-600 font-bold px-1"
              >
                ✕
              </button>
            </div>

            {selectedEntity.type === 'incident' && (
              <div className="space-y-2">
                <p className="text-slate-600 text-[11px]">{selectedEntity.data.locationDescription}</p>
                <div className="flex items-center justify-between">
                  <PriorityBadge score={selectedEntity.data.priorityScore} size="sm" />
                  <span className="font-bold text-red-600">{selectedEntity.data.affectedPeople} trapped</span>
                </div>
                {onSelectIncident && (
                  <button
                    onClick={() => onSelectIncident(selectedEntity.data)}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors"
                  >
                    View Incident Details
                  </button>
                )}
              </div>
            )}

            {selectedEntity.type === 'team' && (
              <div className="space-y-1.5">
                <p className="text-slate-600 text-[11px]">Base: {selectedEntity.data.location}</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Capacity: {selectedEntity.data.capacity} persons</span>
                  <StatusBadge status={selectedEntity.data.status} size="sm" />
                </div>
                <div className="text-[10px] text-teal-700 font-mono">
                  ETA to Surjani: ~{selectedEntity.data.etaMinutes} min
                </div>
              </div>
            )}

            {selectedEntity.type === 'shelter' && (
              <div className="space-y-1.5">
                <p className="text-slate-600 text-[11px]">{selectedEntity.data.zone}</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Capacity: {selectedEntity.data.occupiedSpaces}/{selectedEntity.data.totalCapacity}</span>
                  <span className={`font-bold ${selectedEntity.data.availableSpaces <= 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedEntity.data.availableSpaces} open
                  </span>
                </div>
              </div>
            )}

            {selectedEntity.type === 'zone' && (
              <div className="space-y-1.5">
                <p className="text-slate-600 text-[11px]">{selectedEntity.data.area}</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Reporting: {selectedEntity.data.reportingCoverage}%</span>
                  <span className="text-amber-600 font-bold">{selectedEntity.data.unreachableHouseholds} silent</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
