'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Language, TranslationDictionary } from '@/lib/reports/i18n';

const LocationMapPickerClient = dynamic(() => import('./LocationMapPickerClient'), {
  ssr: false,
  loading: () => (
    <LoadingSkeleton
      variant="map"
      className="h-[280px] sm:h-[320px] rounded-xl"
    />
  ),
});

import { ZoneItem } from './types';

export interface LocationMapPickerProps {
  lat: number | null;
  lng: number | null;
  zones: ZoneItem[];
  selectedZoneId?: string;
  onLocationSelect: (lat: number, lng: number, areaName?: string) => void;
  onZoneSelect?: (zoneId: string) => void;
  language?: Language;
  t: TranslationDictionary;
}

export function LocationMapPicker(props: LocationMapPickerProps) {
  return <LocationMapPickerClient {...props} />;
}
