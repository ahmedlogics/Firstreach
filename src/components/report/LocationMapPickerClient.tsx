'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Check, AlertCircle, X, Loader2, Navigation, Compass } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/reports/i18n';
import { ZoneItem } from './types';

export interface GeocodeLocation {
  id: string;
  name: string;
  nameUr: string;
  nameSd: string;
  lat: number;
  lng: number;
  description: string;
  zoneHint?: string;
}

// Prominent Karachi Quick Chips
const QUICK_CHIPS = [
  { id: 'dha', name: 'Defence (DHA)', nameUr: 'ڈیفنس / ڈی ایچ اے', nameSd: 'ڊفينس / ڊي ايڇ اي', lat: 24.8150, lng: 67.0650, zoneHint: 'Demo Zone C' },
  { id: 'clifton', name: 'Clifton', nameUr: 'کلفٹن', nameSd: 'ڪلفٽن', lat: 24.8238, lng: 67.0315, zoneHint: 'Demo Zone C' },
  { id: 'gulshan', name: 'Gulshan-e-Iqbal', nameUr: 'گلشنِ اقبال', nameSd: 'گلشن اقبال', lat: 24.9180, lng: 67.0971, zoneHint: 'Demo Zone B' },
  { id: 'saddar', name: 'Saddar', nameUr: 'صدر', nameSd: 'صدر', lat: 24.8569, lng: 67.0264, zoneHint: 'Demo Zone A' },
  { id: 'nazimabad', name: 'North Nazimabad', nameUr: 'نارتھ ناظم آباد', nameSd: 'نارٿ ناظم آباد', lat: 24.9380, lng: 67.0370, zoneHint: 'Demo Zone B' },
  { id: 'pechs', name: 'PECHS', nameUr: 'پی ای سی ایچ ایس', nameSd: 'پي اي سي ايڇ ايس', lat: 24.8690, lng: 67.0610, zoneHint: 'Demo Zone B' },
];

// Approximate coordinates for known zones
const KNOWN_ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  'a9713523-1c3d-4b8e-a7b0-4435d0ac6ea9': { lat: 24.860, lng: 67.010 },
  '716db030-6814-4b24-aa14-20a14af2ee47': { lat: 24.877, lng: 67.030 },
  '52bcd15d-f7f8-4f4d-8c69-4ea4692fd0bc': { lat: 24.845, lng: 67.045 },
  'Demo Zone A': { lat: 24.860, lng: 67.010 },
  'Demo Zone B': { lat: 24.877, lng: 67.030 },
  'Demo Zone C': { lat: 24.845, lng: 67.045 },
  'Zone A': { lat: 24.860, lng: 67.010 },
  'Zone B': { lat: 24.877, lng: 67.030 },
  'Zone C': { lat: 24.845, lng: 67.045 },
};

// Custom Leaflet Emergency Pin icon
const createEmergencyPinIcon = () =>
  L.divIcon({
    className: 'custom-emergency-pin',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: rgba(239, 68, 68, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 28px; height: 28px; border-radius: 9999px; background: #DC2626; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 14px;">
          📍
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });

interface ExtendedZoneItem extends ZoneItem {
  center_lat?: number;
  center_lng?: number;
}

interface LocationMapPickerClientProps {
  lat: number | null;
  lng: number | null;
  zones: ExtendedZoneItem[];
  selectedZoneId?: string;
  onLocationSelect: (lat: number, lng: number, areaName?: string) => void;
  onZoneSelect?: (zoneId: string) => void;
  language?: Language;
  t: TranslationDictionary;
}

// Controller to safely invalidate map size after toggle or resize
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {
        // Safe fallback
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (center && map) {
      try {
        map.setView(center, Math.max(map.getZoom(), 13), { animate: true });
      } catch {
        // Safe fallback
      }
    }
  }, [center, map]);

  return null;
}

// Interactive Marker with click & drag handlers
function ClickAndDragMarker({
  position,
  onPositionChange,
}: {
  position: [number, number] | null;
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      const lat = Number(e.latlng.lat.toFixed(5));
      const lng = Number(e.latlng.lng.toFixed(5));
      // Validate Karachi bounds (24.6 to 25.3, 66.7 to 67.5)
      if (lat >= 24.6 && lat <= 25.3 && lng >= 66.7 && lng <= 67.5) {
        onPositionChange(lat, lng);
      }
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latlng = marker.getLatLng();
          const lat = Number(latlng.lat.toFixed(5));
          const lng = Number(latlng.lng.toFixed(5));
          if (lat >= 24.6 && lat <= 25.3 && lng >= 66.7 && lng <= 67.5) {
            onPositionChange(lat, lng);
          }
        }
      },
    }),
    [onPositionChange]
  );

  const icon = useMemo(() => createEmergencyPinIcon(), []);

  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
      icon={icon}
    >
      <Popup>
        <div className="text-xs font-sans text-slate-800 p-1">
          <p className="font-bold text-red-600 flex items-center gap-1">
            <span>🚨</span>
            <span>Emergency Location</span>
          </p>
          <p className="font-mono text-[11px] mt-1 text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
            {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 italic">
            Drag marker or click map to reposition
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function LocationMapPickerClient({
  lat,
  lng,
  zones,
  selectedZoneId,
  onLocationSelect,
  onZoneSelect,
  language = 'en',
  t,
}: LocationMapPickerClientProps) {
  const isRtl = language === 'ur' || language === 'sd';
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Local pin position state
  const [pinPosition, setPinPosition] = useState<[number, number] | null>(() => {
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }
    return null;
  });

  // Search input & results state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodeLocation[]>([]);
  const [autoDetectedZoneName, setAutoDetectedZoneName] = useState<string | null>(null);

  // Sync external lat/lng changes
  useEffect(() => {
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      setPinPosition([lat, lng]);
    }
  }, [lat, lng]);

  // Determine initial map center
  const mapCenter: [number, number] = useMemo(() => {
    if (pinPosition) return pinPosition;
    if (selectedZoneId) {
      const known = KNOWN_ZONE_COORDS[selectedZoneId];
      if (known) return [known.lat, known.lng];
      const z = zones.find((item) => item.id === selectedZoneId);
      if (z && typeof z.center_lat === 'number') return [z.center_lat, z.center_lng!];
    }
    return [24.86, 67.02]; // Karachi center fallback
  }, [pinPosition, selectedZoneId, zones]);

  // Find nearest zone based on coordinates
  const findClosestZone = useCallback(
    (targetLat: number, targetLng: number): ExtendedZoneItem | null => {
      if (zones.length === 0) return null;

      let closestZone: ExtendedZoneItem | null = null;
      let minDistance = Infinity;

      for (const z of zones) {
        let zLat = z.center_lat;
        let zLng = z.center_lng;

        if (zLat === undefined || zLng === undefined) {
          const known = KNOWN_ZONE_COORDS[z.id] || KNOWN_ZONE_COORDS[z.name];
          if (known) {
            zLat = known.lat;
            zLng = known.lng;
          }
        }

        if (zLat !== undefined && zLng !== undefined) {
          // Euclidean distance approx for local Karachi bounds (~30km)
          const dist = Math.hypot(targetLat - zLat, targetLng - zLng);
          if (dist < minDistance) {
            minDistance = dist;
            closestZone = z;
          }
        }
      }

      return closestZone;
    },
    [zones]
  );

  // Handle position change from click, drag, or search selection
  const handlePositionUpdate = useCallback(
    (newLat: number, newLng: number, areaName?: string) => {
      setPinPosition([newLat, newLng]);
      onLocationSelect(newLat, newLng, areaName);

      // Auto-detect closest zone
      if (onZoneSelect) {
        const closest = findClosestZone(newLat, newLng);
        if (closest && closest.id !== selectedZoneId) {
          onZoneSelect(closest.id);
          setAutoDetectedZoneName(closest.name);
          const timer = setTimeout(() => setAutoDetectedZoneName(null), 4000);
          return () => clearTimeout(timer);
        }
      }
    },
    [findClosestZone, onLocationSelect, onZoneSelect, selectedZoneId]
  );

  // Fetch search results from our robust server-side geocoding endpoint
  const fetchGeocodeResults = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/reports/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setSearchResults(data.results);
        }
      }
    } catch {
      // Safe fallback
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search on input change
  useEffect(() => {
    const q = searchQuery.trim();
    const timer = setTimeout(() => {
      fetchGeocodeResults(q);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchGeocodeResults]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3 pt-1 animate-in fade-in duration-200">
      {/* 1. SEARCH BAR & FLOATING AUTOCOMPLETE */}
      <div ref={searchContainerRef} className="relative z-[1050]">
        <div className="relative flex items-center">
          <Search
            className={`w-4 h-4 text-slate-400 absolute ${
              isRtl ? 'right-3' : 'left-3'
            } pointer-events-none`}
          />
          <input
            type="text"
            dir={isRtl ? 'rtl' : 'ltr'}
            value={searchQuery}
            onFocus={() => {
              setIsDropdownOpen(true);
              if (searchResults.length === 0) {
                fetchGeocodeResults(searchQuery);
              }
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (searchResults.length > 0) {
                  const top = searchResults[0];
                  const displayName =
                    language === 'ur'
                      ? top.nameUr
                      : language === 'sd'
                      ? top.nameSd
                      : top.name;
                  handlePositionUpdate(top.lat, top.lng, displayName);
                  setSearchQuery(displayName);
                  setIsDropdownOpen(false);
                }
              }
            }}
            placeholder={t.sectionB.searchPlaceholder}
            className={`w-full ${
              isRtl ? 'pr-9 pl-9 text-right' : 'pl-9 pr-9'
            } py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-teal-500 shadow-xs transition-all`}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsDropdownOpen(false);
              }}
              className={`absolute ${
                isRtl ? 'left-2.5' : 'right-2.5'
              } p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors`}
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : isSearching ? (
            <Loader2
              className={`w-3.5 h-3.5 text-teal-600 animate-spin absolute ${
                isRtl ? 'left-2.5' : 'right-2.5'
              }`}
            />
          ) : null}
        </div>

        {/* Quick Location Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Compass className="w-3 h-3 text-teal-600" />
            <span>{language === 'ur' ? 'اہم علاقے:' : language === 'sd' ? 'اهم علائقا:' : 'Popular:'}</span>
          </span>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                const displayName =
                  language === 'ur'
                    ? chip.nameUr
                    : language === 'sd'
                    ? chip.nameSd
                    : chip.name;
                handlePositionUpdate(chip.lat, chip.lng, displayName);
                setSearchQuery(displayName);
                setIsDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 shadow-2xs transition-all cursor-pointer"
            >
              <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
              <span>{language === 'ur' ? chip.nameUr : language === 'sd' ? chip.nameSd : chip.name}</span>
            </button>
          ))}
        </div>

        {/* Search Results Dropdown (High z-index: renders floating on top of map) */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 z-[1051] mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50 duration-150">
            {isSearching && searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                <span>{language === 'ur' ? 'تلاش جاری ہے...' : language === 'sd' ? 'ڳولا جاري آهي...' : 'Searching Karachi locations...'}</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((item) => {
                const displayName =
                  language === 'ur'
                    ? item.nameUr || item.name
                    : language === 'sd'
                    ? item.nameSd || item.name
                    : item.name;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      handlePositionUpdate(item.lat, item.lng, displayName);
                      setSearchQuery(displayName);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-teal-50/90 transition-colors flex items-center justify-between group cursor-pointer ${
                      isRtl ? 'flex-row-reverse text-right' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-teal-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right ml-2">
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-center text-xs text-slate-500">
                {language === 'ur'
                  ? 'کوئی مخصوص نتیجہ نہیں ملا۔ آپ نیچے نقشے پر کہیں بھی کلک کر کے پن لگا سکتے ہیں۔'
                  : language === 'sd'
                  ? 'ڪو به نتيجو نه مليو. اوهان نقشي تي ڪلڪ ڪري پن رکي سگهو ٿا.'
                  : 'No specific areas found. You can click directly on the map below to drop the pin.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. INTERACTIVE MAP CONTAINER */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-xs h-[280px] sm:h-[320px] bg-slate-100 z-[1]">
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />
          <ClickAndDragMarker
            position={pinPosition}
            onPositionChange={handlePositionUpdate}
          />
        </MapContainer>

        {/* Floating Instruction Banner at Top of Map */}
        <div className="absolute top-2 left-2 right-2 z-[400] pointer-events-none flex justify-center">
          <div className="bg-slate-900/85 backdrop-blur-xs text-white text-[11px] px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 pointer-events-auto border border-white/10">
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className={isRtl ? 'text-right' : ''}>{t.sectionB.pinInstruction}</span>
          </div>
        </div>

        {/* Floating Auto-Detected Zone Notification */}
        {autoDetectedZoneName && (
          <div className="absolute bottom-2 left-2 right-2 z-[400] flex justify-center animate-in slide-in-from-bottom-2 duration-200">
            <div className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>
                {t.sectionB.zoneAutoDetected}: <strong>{autoDetectedZoneName}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. COORDINATE SUMMARY BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          {pinPosition ? (
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-[11px]">{t.sectionB.currentCoords}:</span>
              <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {pinPosition[0].toFixed(5)}, {pinPosition[1].toFixed(5)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                {language === 'ur'
                  ? 'نقشے پر کہیں بھی کلک کریں یا اوپر سرچ کر کے پن لگائیں۔'
                  : language === 'sd'
                  ? 'نقشي تي ڪلڪ ڪريو يا مٿي ڳولا ڪري پن رکو.'
                  : 'Click on the map or search above to place the emergency pin.'}
              </span>
            </div>
          )}
        </div>

        {pinPosition && (
          <button
            type="button"
            onClick={() => {
              setPinPosition(null);
              onLocationSelect(null as any, null as any);
            }}
            className="text-[11px] font-semibold text-slate-600 hover:text-red-600 underline cursor-pointer self-end sm:self-auto"
          >
            {t.sectionB.clearGps}
          </button>
        )}
      </div>
    </div>
  );
}
