import { NextRequest, NextResponse } from 'next/server';

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

// Comprehensive local Karachi areas & landmarks dictionary
const KARACHI_PLACES: GeocodeLocation[] = [
  // Defence & Clifton Area
  {
    id: 'dha-main',
    name: 'Defence / DHA (Phase 1 to 8)',
    nameUr: 'ڈی ایچ اے / ڈیفنس (فیز ۱ تا ۸)',
    nameSd: 'ڊي ايڇ اي / ڊفينس (فيز ۱ کان ۸)',
    lat: 24.8150,
    lng: 67.0650,
    description: 'DHA Karachi, South District',
    zoneHint: 'Demo Zone C',
  },
  {
    id: 'dha-phase-5',
    name: 'DHA Phase 5 / Khayaban-e-Shamsheer',
    nameUr: 'ڈی ایچ اے فیز ۵ / خیابان شمشیر',
    nameSd: 'ڊي ايڇ اي فيز ۵',
    lat: 24.8090,
    lng: 67.0480,
    description: 'Phase 5, DHA Karachi',
    zoneHint: 'Demo Zone C',
  },
  {
    id: 'dha-phase-6',
    name: 'DHA Phase 6 / Khayaban-e-Ittehad',
    nameUr: 'ڈی ایچ اے فیز ۶ / خیابان اتحاد',
    nameSd: 'ڊي ايڇ اي فيز ۶',
    lat: 24.8010,
    lng: 67.0680,
    description: 'Phase 6, DHA Karachi',
    zoneHint: 'Demo Zone C',
  },
  {
    id: 'dha-phase-8',
    name: 'DHA Phase 8 / Emaar / Creek',
    nameUr: 'ڈی ایچ اے فیز ۸ / اعمار',
    nameSd: 'ڊي ايڇ اي فيز ۸',
    lat: 24.7820,
    lng: 67.0980,
    description: 'Phase 8, Waterfront DHA',
    zoneHint: 'Demo Zone C',
  },
  {
    id: 'defence-view',
    name: 'Defence View Housing Society',
    nameUr: 'ڈیفنس ویو سوسائٹی',
    nameSd: 'ڊفينس ويو سوسائٽي',
    lat: 24.8420,
    lng: 67.0780,
    description: 'Near KPT Interchange & Expressway',
    zoneHint: 'Demo Zone C',
  },
  {
    id: 'clifton-main',
    name: 'Clifton (Block 1 - 9 / Sea View)',
    nameUr: 'کلفٹن (بلاک ۱ تا ۹ / سی ویو)',
    nameSd: 'ڪلفٽن (بلاڪ ۱ کان ۹)',
    lat: 24.8238,
    lng: 67.0315,
    description: 'Clifton Beach & Bilawal House Area',
    zoneHint: 'Demo Zone C',
  },
  {
    id: 'boat-basin',
    name: 'Boat Basin / Clifton Block 5',
    nameUr: 'بوٹ بیسن / کلفٹن',
    nameSd: 'بوٽ بيسن / ڪلفٽن',
    lat: 24.8285,
    lng: 67.0255,
    description: 'Food Street, Clifton',
    zoneHint: 'Demo Zone C',
  },
  {
    id: 'zamzama',
    name: 'Zamzama Commercial / DHA Phase 5',
    nameUr: 'زمزمہ کمرشل / ڈی ایچ اے',
    nameSd: 'زمزمه ڪمرشل / ڊي ايڇ اي',
    lat: 24.8210,
    lng: 67.0420,
    description: 'Commercial Avenue, Defence',
    zoneHint: 'Demo Zone C',
  },

  // Central / Jamshed / PECHS
  {
    id: 'pechs-tariq-road',
    name: 'PECHS / Tariq Road',
    nameUr: 'پی ای سی ایچ ایس / طارق روڈ',
    nameSd: 'پي اي سي ايڇ ايس / طارق روڊ',
    lat: 24.8690,
    lng: 67.0610,
    description: 'Jamshed Town, Central Karachi',
    zoneHint: 'Demo Zone B',
  },
  {
    id: 'gulshan-iqbal',
    name: 'Gulshan-e-Iqbal (Block 1 - 19)',
    nameUr: 'گلشنِ اقبال',
    nameSd: 'گلشن اقبال',
    lat: 24.9180,
    lng: 67.0971,
    description: 'University Road / NIPA area',
    zoneHint: 'Demo Zone B',
  },
  {
    id: 'bahadurabad',
    name: 'Bahadurabad / Char Minar Chowrangi',
    nameUr: 'بہادرآباد / چار مینار چورنگی',
    nameSd: 'بهادرآباد',
    lat: 24.8820,
    lng: 67.0670,
    description: 'Bahadur Yar Jang Society',
    zoneHint: 'Demo Zone B',
  },
  {
    id: 'north-nazimabad',
    name: 'North Nazimabad (Block A - T)',
    nameUr: 'نارتھ ناظم آباد',
    nameSd: 'نارٿ ناظم آباد',
    lat: 24.9380,
    lng: 67.0370,
    description: 'Hyderi / Sakhi Hassan area',
    zoneHint: 'Demo Zone B',
  },
  {
    id: 'fb-area',
    name: 'Federal B Area / Gulberg',
    nameUr: 'فیڈرل بی ایریا / گلبرگ',
    nameSd: 'فيڊرل بي ايريا / گلبرگ',
    lat: 24.9300,
    lng: 67.0650,
    description: 'Water Pump / Ayesha Manzil',
    zoneHint: 'Demo Zone B',
  },
  {
    id: 'nazimabad-1',
    name: 'Nazimabad / Golimar / Inquiry Office',
    nameUr: 'ناظم آباد / گولیمار',
    nameSd: 'ناظم آباد / گوليمار',
    lat: 24.9080,
    lng: 67.0250,
    description: 'Central Karachi District',
    zoneHint: 'Demo Zone A',
  },
  {
    id: 'liaquatabad',
    name: 'Liaquatabad / Super Market',
    nameUr: 'لیاقت آباد / سپر مارکیٹ',
    nameSd: 'لياقت آباد',
    lat: 24.9050,
    lng: 67.0420,
    description: 'Liaquatabad No. 10 / Dak Khana',
    zoneHint: 'Demo Zone B',
  },

  // South / Saddar / Old City
  {
    id: 'saddar-empress',
    name: 'Saddar / Empress Market',
    nameUr: 'صدر / ایمپریس مارکیٹ',
    nameSd: 'صدر / ايمپريس مارڪيٽ',
    lat: 24.8569,
    lng: 67.0264,
    description: 'Downtown / Saddar Bazaar',
    zoneHint: 'Demo Zone A',
  },
  {
    id: 'ii-chundrigar',
    name: 'I.I. Chundrigar Road / Merewether Tower',
    nameUr: 'آئی آئی چندریگر روڈ / ٹاور',
    nameSd: 'آءِ آءِ چندريگر روڊ / ٽاور',
    lat: 24.8510,
    lng: 67.0050,
    description: 'Financial District, South Karachi',
    zoneHint: 'Demo Zone A',
  },
  {
    id: 'kharadar-mithadar',
    name: 'Kharadar / Mithadar / Bolton Market',
    nameUr: 'کھارادر / میٹھادر / بولٹن مارکیٹ',
    nameSd: 'کهاڙادر / ميٺادر',
    lat: 24.8580,
    lng: 66.9980,
    description: 'Old City, Port area',
    zoneHint: 'Demo Zone A',
  },
  {
    id: 'lyari',
    name: 'Lyari / Lea Market / Cheel Chowk',
    nameUr: 'لیاری / لی مارکیٹ / چیل چوک',
    nameSd: 'لياري / لي مارڪيٽ',
    lat: 24.8710,
    lng: 66.9985,
    description: 'South Lyari, dense neighborhood',
    zoneHint: 'Demo Zone A',
  },

  // East / Malir / Korangi
  {
    id: 'korangi',
    name: 'Korangi / Korangi Crossing',
    nameUr: 'کورنگی / کورنگی کراسنگ',
    nameSd: 'ڪورنگي',
    lat: 24.8250,
    lng: 67.1250,
    description: 'Korangi Industrial / Creek area',
    zoneHint: 'Demo Zone C',
  },
  {
    id: 'landhi',
    name: 'Landhi / Babar Market',
    nameUr: 'لانڈھی / بابر مارکیٹ',
    nameSd: 'لانڍي',
    lat: 24.8450,
    lng: 67.1850,
    description: 'East Karachi, Landhi Township',
    zoneHint: 'Demo Zone C',
  },
  {
    id: 'malir-cantt',
    name: 'Malir / Malir Cantt / Check Post 5',
    nameUr: 'ملیر / ملیر کینٹ',
    nameSd: 'ملير / ملير ڪينٽ',
    lat: 24.8950,
    lng: 67.1950,
    description: 'Malir District, East Karachi',
    zoneHint: 'Demo Zone B',
  },
  {
    id: 'shah-faisal',
    name: 'Shah Faisal Colony / Drigh Road',
    nameUr: 'شاہ فیصل کالونی / ڈرگ روڈ',
    nameSd: 'شاهه فيصل ڪالوني',
    lat: 24.8800,
    lng: 67.1450,
    description: 'Near Star Gate & Airport',
    zoneHint: 'Demo Zone B',
  },

  // West & North
  {
    id: 'orangi',
    name: 'Orangi Town / Banaras Chowk',
    nameUr: 'اورنگی ٹاؤن / بنارس چوک',
    nameSd: 'اورنگي ٽائون / بنارس',
    lat: 24.9450,
    lng: 66.9850,
    description: 'West District, Orangi',
    zoneHint: 'Demo Zone A',
  },
  {
    id: 'surjani',
    name: 'Surjani Town / 4K Chowrangi',
    nameUr: 'سرجانی ٹاؤن / 4K چورنگی',
    nameSd: 'سرجاني ٽائون',
    lat: 25.0250,
    lng: 67.0600,
    description: 'Northern Karachi, Sector 4 & 7',
    zoneHint: 'Demo Zone B',
  },
  {
    id: 'kemari',
    name: 'Kemari / Jackson Market / Port',
    nameUr: 'کیماڑی / جیکسن مارکیٹ / بندرگاہ',
    nameSd: 'ڪيماڙي / پورٽ',
    lat: 24.8150,
    lng: 66.9750,
    description: 'Karachi Port Trust, Kemari',
    zoneHint: 'Demo Zone A',
  },
  {
    id: 'baldia',
    name: 'Baldia Town / Saeedabad',
    nameUr: 'بلدیہ ٹاؤن / سعید آباد',
    nameSd: 'بلديه ٽائون / سعيد آباد',
    lat: 24.9150,
    lng: 66.9550,
    description: 'West District, Hub River Road',
    zoneHint: 'Demo Zone A',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q) {
    // Return top 8 prominent Karachi hubs by default
    return NextResponse.json({
      success: true,
      results: KARACHI_PLACES.slice(0, 8),
    });
  }

  // 1. Filter curated Karachi places first
  const localMatches = KARACHI_PLACES.filter((p) => {
    const haystack = `${p.name} ${p.nameUr} ${p.nameSd} ${p.description} ${p.id}`.toLowerCase();
    return haystack.includes(q);
  });

  // 2. If we already have strong local matches, return them immediately
  if (localMatches.length >= 3) {
    return NextResponse.json({
      success: true,
      results: localMatches.slice(0, 8),
    });
  }

  // 3. Optional online geocoding via OpenStreetMap Nominatim for specific unlisted streets
  let onlineMatches: GeocodeLocation[] = [];
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q + ', Karachi, Pakistan'
    )}&countrycodes=pk&viewbox=66.7,25.3,67.5,24.6&bounded=1&limit=5&addressdetails=1`;

    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Firstreach-DisasterResponsePlatform/1.0 (relief@firstreach.local)',
      },
      // Cache results for 10 minutes to be polite to OSM
      next: { revalidate: 600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        onlineMatches = data
          .map((item: any, idx: number) => {
            const lat = Number(parseFloat(item.lat).toFixed(5));
            const lng = Number(parseFloat(item.lon).toFixed(5));
            const primaryName = item.display_name.split(',')[0];
            const secondary = item.display_name.split(',').slice(1, 3).join(',').trim();

            return {
              id: `osm-${item.place_id || idx}`,
              name: primaryName,
              nameUr: primaryName,
              nameSd: primaryName,
              lat,
              lng,
              description: secondary || 'Karachi, Pakistan',
              zoneHint: lat < 24.84 ? 'Demo Zone C' : lat > 24.88 ? 'Demo Zone B' : 'Demo Zone A',
            };
          })
          .filter(
            (item) =>
              item.lat >= 24.6 &&
              item.lat <= 25.3 &&
              item.lng >= 66.7 &&
              item.lng <= 67.5
          );
      }
    }
  } catch {
    // Graceful fallback to local matches
  }

  // Combine and deduplicate
  const combined = [...localMatches];
  for (const item of onlineMatches) {
    if (!combined.some((c) => Math.hypot(c.lat - item.lat, c.lng - item.lng) < 0.005)) {
      combined.push(item);
    }
  }

  return NextResponse.json({
    success: true,
    results: combined.slice(0, 8),
  });
}
