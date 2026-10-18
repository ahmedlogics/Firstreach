export type Language = 'en' | 'ur' | 'sd';

export interface TranslationDictionary {
  dir: 'ltr' | 'rtl';
  langName: string;
  nativeName: string;
  header: {
    title: string;
    description: string;
    badge: string;
    breadcrumb: string;
  };
  sectionA: {
    num: string;
    title: string;
    subtitle: string;
    reportingForLabel: string;
    reportingForMyself: string;
    reportingForSomeoneElse: string;
    reporterNameLabel: string;
    reporterNamePlaceholder: string;
    reporterPhoneLabel: string;
    reporterPhonePlaceholder: string;
    reporterRoleLabel: string;
    roles: {
      resident: string;
      neighbor: string;
      volunteer: string;
      other: string;
    };
  };
  sectionB: {
    num: string;
    title: string;
    subtitle: string;
    zoneLabel: string;
    zoneLoading: string;
    zoneEmpty: string;
    locationDescLabel: string;
    locationDescPlaceholder: string;
    gpsTitle: string;
    gpsSubtitle: string;
    useGpsButton: string;
    acquiringGps: string;
    clearGps: string;
    latLabel: string;
    lngLabel: string;
    latPlaceholder: string;
    lngPlaceholder: string;
    mapPickerTitle: string;
    mapPickerSubtitle: string;
    toggleMapButtonOpen: string;
    toggleMapButtonClose: string;
    searchPlaceholder: string;
    pinInstruction: string;
    zoneAutoDetected: string;
    currentCoords: string;
  };
  sectionC: {
    num: string;
    title: string;
    subtitle: string;
    floodSeverityLabel: string;
    floodSeveritySubtitle: string;
    floodLevels: {
      0: { title: string; desc: string };
      1: { title: string; desc: string };
      2: { title: string; desc: string };
      3: { title: string; desc: string };
    };
    peopleCountLabel: string;
    peopleCountSubtitle: string;
    unknownPeopleCheckbox: string;
    triState: {
      yes: string;
      no: string;
      unknown: string;
    };
    trappedLabel: string;
    trappedDesc: string;
    medicalLabel: string;
    medicalDesc: string;
    mobilityLabel: string;
    mobilityDesc: string;
    notesLabel: string;
    notesPlaceholder: string;
  };
  sectionD: {
    num: string;
    title: string;
    subtitle: string;
    timingLabel: string;
    options: {
      now: string;
      '15m': string;
      '1h': string;
      '3h': string;
      '12h': string;
      '24h': string;
    };
  };
  actions: {
    algorithmNotice: string;
    submitButton: string;
    submittingButton: string;
  };
  successBanner: {
    title: string;
    incident: string;
    reportId: string;
    priorityScore: string;
    status: string;
    viewOnMap: string;
    dismiss: string;
  };
  guidelines: {
    title: string;
    tip1Title: string;
    tip1Desc: string;
    tip2Title: string;
    tip2Desc: string;
    tip3Title: string;
    tip3Desc: string;
    callout: string;
  };
  modal: {
    title: string;
    subtitle: string;
    confirmButton: string;
    cancelButton: string;
    zoneLabel: string;
    locationLabel: string;
    severityLabel: string;
    peopleLabel: string;
    trappedLabel: string;
    medicalLabel: string;
    mobilityLabel: string;
  };
  validationErrors: {
    zoneId: string;
    locationDescription: string;
    observedAt: string;
    reportingFor: string;
    reporterRole: string;
    floodSeverity: string;
    peopleCount: string;
    reporterName: string;
    reporterPhone: string;
    lat: string;
    lng: string;
    description: string;
    generalCorrection: string;
    rateLimit: string;
    serverError: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    dir: 'ltr',
    langName: 'English',
    nativeName: 'English',
    header: {
      title: 'Submit Emergency Report',
      description: 'Provide essential information so response coordinators can evaluate and prioritize assistance during active flood surges.',
      badge: 'Live intake (demo database)',
      breadcrumb: 'Report Emergency',
    },
    sectionA: {
      num: '1',
      title: 'Section A: Reporter Identity & Scope',
      subtitle: 'Identify whether you are affected yourself or reporting as a volunteer/neighbor.',
      reportingForLabel: 'Who are you reporting for?',
      reportingForMyself: 'Reporting for Myself / Family',
      reportingForSomeoneElse: 'Reporting for Someone Else',
      reporterNameLabel: 'Your Name',
      reporterNamePlaceholder: 'e.g. Tariq Mehmood',
      reporterPhoneLabel: 'Callback Phone',
      reporterPhonePlaceholder: '+92 300 1234567',
      reporterRoleLabel: 'Reporter Relationship',
      roles: {
        resident: 'Affected Resident',
        neighbor: 'Nearby Neighbor',
        volunteer: 'Field Volunteer',
        other: 'Public Passerby / Relative',
      },
    },
    sectionB: {
      num: '2',
      title: 'Section B: Incident Location & Coordinates',
      subtitle: 'Precise sector identification to dispatch nearest rescue unit.',
      zoneLabel: 'Select Sector / Zone',
      zoneLoading: 'Loading response zones...',
      zoneEmpty: 'No zones available',
      locationDescLabel: 'Detailed Street Address & Landmark',
      locationDescPlaceholder: 'e.g. House 42-B, St 6, behind submerged Jamia Mosque. Yellow gate, 2nd floor balcony.',
      gpsTitle: 'GPS Location Coordinates',
      gpsSubtitle: '(Optional • Enables precision mapping)',
      useGpsButton: 'Use My Location',
      acquiringGps: 'Acquiring GPS...',
      clearGps: 'Clear',
      latLabel: 'Latitude (Karachi: 24.6000 to 25.3000)',
      lngLabel: 'Longitude (Karachi: 66.7000 to 67.5000)',
      latPlaceholder: 'e.g. 24.86300 (or leave blank)',
      lngPlaceholder: 'e.g. 67.01400 (or leave blank)',
      mapPickerTitle: 'Interactive Location & Map Pin-Drop',
      mapPickerSubtitle: 'Search Karachi areas or click anywhere on the map to pinpoint location for someone else',
      toggleMapButtonOpen: 'Pick on Map',
      toggleMapButtonClose: 'Close Map',
      searchPlaceholder: 'Search Karachi area, landmark or street (e.g. Clifton, Gulshan, Nazimabad)...',
      pinInstruction: 'Click anywhere on the map or drag the emergency pin to set the exact coordinates.',
      zoneAutoDetected: 'Nearest Emergency Zone automatically selected',
      currentCoords: 'Selected Pin Coordinates',
    },
    sectionC: {
      num: '3',
      title: 'Section C: Vulnerability & Life Safety Assessment',
      subtitle: 'Every answer directly impacts triage ranking. Leave unknown if uncertain.',
      floodSeverityLabel: 'Current Flood Severity Level',
      floodSeveritySubtitle: 'Select the observed water level at the structure.',
      floodLevels: {
        0: { title: '0 — Minor Runoff', desc: 'Ankle deep, street passable on foot.' },
        1: { title: '1 — Moderate Water', desc: 'Knee deep, ground floor threatened.' },
        2: { title: '2 — Severe Inundation', desc: 'Waist deep, strong current, lower floor flooded.' },
        3: { title: '3 — Critical Surge', desc: 'Chest deep or higher, rooftop refuge, structural hazard.' },
      },
      peopleCountLabel: 'Estimated Number of People at Risk',
      peopleCountSubtitle: 'Total count requiring evacuation or medical support.',
      unknownPeopleCheckbox: 'Number of people is unknown',
      triState: {
        yes: 'Yes',
        no: 'No',
        unknown: 'Unknown',
      },
      trappedLabel: 'Trapped Occupants',
      trappedDesc: 'Unable to escape due to locked gates, rising water, or collapsed stairs.',
      medicalLabel: 'Urgent Medical Attention Required',
      medicalDesc: 'Severe injury, insulin/dialysis dependency, oxygen dependency, or hypothermia.',
      mobilityLabel: 'Mobility Assistance Needed',
      mobilityDesc: 'Bedridden, wheelchair, infant, or elderly unable to wade through water.',
      notesLabel: 'Additional Medical or Rescue Notes',
      notesPlaceholder: 'e.g. Diabetic needing insulin cooling; power disconnected; two elderly residents on second floor.',
    },
    sectionD: {
      num: '4',
      title: 'Section D: Observation Timing',
      subtitle: 'Help coordinators evaluate report freshness and decay rates.',
      timingLabel: 'When did you observe this situation?',
      options: {
        now: 'Observed just now / within last 5 minutes',
        '15m': 'Observed about 15 minutes ago',
        '1h': 'Observed 1 hour ago',
        '3h': 'Observed 2 to 4 hours ago',
        '12h': 'Observed earlier today (~12 hours ago)',
        '24h': 'Observed yesterday (~24 hours ago)',
      },
    },
    actions: {
      algorithmNotice: 'Reports are algorithmically ranked before dispatcher assignment.',
      submitButton: 'Review & Submit Report',
      submittingButton: 'Evaluating Triage...',
    },
    successBanner: {
      title: 'Emergency Report Lodged Successfully',
      incident: 'Incident',
      reportId: 'Report ID',
      priorityScore: 'Priority Score',
      status: 'Status',
      viewOnMap: 'View On Map',
      dismiss: 'Dismiss',
    },
    guidelines: {
      title: 'Reporting Guidelines',
      tip1Title: 'Life-Threatening Emergencies First',
      tip1Desc: 'Trapped individuals and critical medical cases take immediate allocation precedence.',
      tip2Title: 'Honest "Unknown" Values',
      tip2Desc: 'Do not guess! Selecting "Unknown" applies a safety bonus to protect unverified victims.',
      tip3Title: 'Proxy Reports Welcomed',
      tip3Desc: 'Report on behalf of neighbors who lack phones or internet connectivity.',
      callout: 'All reports are encrypted and strictly restricted to authorized emergency rescue dispatchers.',
    },
    modal: {
      title: 'Verify Emergency Information',
      subtitle: 'Please confirm these triage indicators before final submission.',
      confirmButton: 'Confirm & Transmit Report',
      cancelButton: 'Edit Information',
      zoneLabel: 'Assigned Zone',
      locationLabel: 'Location',
      severityLabel: 'Severity',
      peopleLabel: 'Affected Count',
      trappedLabel: 'Trapped',
      medicalLabel: 'Urgent Medical',
      mobilityLabel: 'Mobility Need',
    },
    validationErrors: {
      zoneId: 'Please select an emergency response zone',
      locationDescription: 'Location description must be at least 5 characters',
      observedAt: 'Observation time must be a valid time within the past 72 hours',
      reportingFor: 'Please specify who you are reporting for',
      reporterRole: 'Please select your relationship/role',
      floodSeverity: 'Flood severity must be between 0 and 3',
      peopleCount: 'People count must be between 1 and 500',
      reporterName: 'Reporter name must contain only letters and be at least 2 characters',
      reporterPhone: 'Phone number must be a valid number with 7 to 15 digits (e.g. +92 300 1234567)',
      lat: 'Latitude must be within Karachi bounds (24.6 to 25.3)',
      lng: 'Longitude must be within Karachi bounds (66.7 to 67.5)',
      description: 'Description cannot exceed 1000 characters',
      generalCorrection: 'Needs correction: please check the highlighted fields.',
      rateLimit: 'Too many reports, please wait a minute',
      serverError: 'Could not save report. Please try again.',
    },
  },

  ur: {
    dir: 'rtl',
    langName: 'Urdu',
    nativeName: 'اردو',
    header: {
      title: 'ہنگامی امدادی رپورٹ درج کریں',
      description: 'سیلاب سے متاثرہ افراد کی درست معلومات فراہم کریں تاکہ ریسکیو کوآرڈینیٹرز فوری امداد ترجیحی بنیادوں پر روانہ کر سکیں۔',
      badge: 'لائیو انٹیک (ڈیمو ڈیٹا بیس)',
      breadcrumb: 'ہنگامی رپورٹنگ',
    },
    sectionA: {
      num: '۱',
      title: 'حصہ اول: رپورٹ کنندہ کی شناخت اور دائرہ کار',
      subtitle: 'واضح کریں کہ آپ اپنے لیے رپورٹ کر رہے ہیں یا بطور رضاکار/پڑوسی کسی اور کے لیے۔',
      reportingForLabel: 'آپ کس کے لیے رپورٹ درج کر رہے ہیں؟',
      reportingForMyself: 'اپنے یا اپنے خاندان کے لیے',
      reportingForSomeoneElse: 'کسی دوسرے شخص / پڑوسی کے لیے',
      reporterNameLabel: 'آپ کا نام',
      reporterNamePlaceholder: 'مثال: طارق محمود',
      reporterPhoneLabel: 'رابطہ فون نمبر',
      reporterPhonePlaceholder: '+92 300 1234567',
      reporterRoleLabel: 'رپورٹ کنندہ کی حیثیت',
      roles: {
        resident: 'متاثرہ رہائشی',
        neighbor: 'قریبی پڑوسی',
        volunteer: 'فیلڈ رضاکار',
        other: 'عوامی راہگیر / رشتہ دار',
      },
    },
    sectionB: {
      num: '۲',
      title: 'حصہ دوم: جائے وقوعہ اور جغرافیائی کوآرڈینیٹس',
      subtitle: 'قریبی ریسکیو ٹیم کی فوری روانگی کے لیے درست سیکٹر کا انتخاب کریں۔',
      zoneLabel: 'سیلابی زون / سیکٹر منتخب کریں',
      zoneLoading: 'امدادی زونز لوڈ ہو رہے ہیں...',
      zoneEmpty: 'کوئی زون دستیاب نہیں',
      locationDescLabel: 'گلی کا پتہ اور قریبی مشہور نشانی (Landmark)',
      locationDescPlaceholder: 'مثال: مکان نمبر 42-B، گلی 6، زیرِ آب جامع مسجد کے پیچھے، پیلا گیٹ، دوسری منزل پر بالکونی۔',
      gpsTitle: 'جی پی ایس (GPS) لوکیشن کوآرڈینیٹس',
      gpsSubtitle: '(اختیاری • درست نقشہ بندی میں مددگار)',
      useGpsButton: 'میری موجودہ لوکیشن حاصل کریں',
      acquiringGps: 'جی پی ایس لوکیشن حاصل کی جا رہی ہے...',
      clearGps: 'صاف کریں',
      latLabel: 'عرض بلد (Latitude - کراچی: 24.6000 تا 25.3000)',
      lngLabel: 'طول بلد (Longitude - کراچی: 66.7000 تا 67.5000)',
      latPlaceholder: 'مثال: 24.86300 (یا خالی چھوڑیں)',
      lngPlaceholder: 'مثال: 67.01400 (یا خالی چھوڑیں)',
      mapPickerTitle: 'نقشے پر مقام کا درست انتخاب اور پن ڈراپ',
      mapPickerSubtitle: 'کسی دوسرے شخص کے لیے علاقہ تلاش کریں یا براہ راست نقشے پر کلک کر کے لوکیشن منتخب کریں۔',
      toggleMapButtonOpen: 'نقشے پر منتخب کریں',
      toggleMapButtonClose: 'نقشہ بند کریں',
      searchPlaceholder: 'کراچی کا علاقہ، نشانی یا گلی تلاش کریں (مثال: کلفٹن، گلشن، ناظم آباد، صدر)...',
      pinInstruction: 'نقشے پر کہیں بھی کلک کریں یا پن کو درست جگہ پر لے جائیں۔',
      zoneAutoDetected: 'قریبی ایمرجنسی زون خودکار طور پر منتخب ہو گیا ہے',
      currentCoords: 'منتخب کردہ کوآرڈینیٹس',
    },
    sectionC: {
      num: '۳',
      title: 'حصہ سوم: خطرے اور جانی تحفظ کا فوری تخمینہ',
      subtitle: 'ہر جواب ریسکیو ترجیح کا تعین کرتا ہے۔ اگر یقین نہ ہو تو "معلوم نہیں" منتخب کریں۔',
      floodSeverityLabel: 'سیلاب اور پانی کی موجودہ سطح',
      floodSeveritySubtitle: 'عمارت کے ارد گرد جمع پانی کی شدت منتخب کریں۔',
      floodLevels: {
        0: { title: '۰ — معمولی بہاؤ', desc: 'ٹخنوں تک پانی، گلی میں پیدل چلنا ممکن ہے۔' },
        1: { title: '۱ — درمیانہ سیلاب', desc: 'گھٹنوں تک پانی، نچلی منزل میں پانی داخل ہونے کا خطرہ۔' },
        2: { title: '۲ — شدید سیلاب', desc: 'کمر تک تیز بہاؤ، نچلی منزل مکمل ڈوب چکی ہے۔' },
        3: { title: '۳ — انتہائی جان لیوا', desc: 'سینے سے بلند پانی، چھت پر پناہ، عمارت گرنے کا خطرہ۔' },
      },
      peopleCountLabel: 'خطرے میں گھرے افراد کی متوقع تعداد',
      peopleCountSubtitle: 'فوری انخلاء یا طبی امداد کے منتظر کل افراد۔',
      unknownPeopleCheckbox: 'افراد کی صحیح تعداد معلوم نہیں ہے',
      triState: {
        yes: 'ہاں',
        no: 'نہیں',
        unknown: 'معلوم نہیں',
      },
      trappedLabel: 'پانی میں محصور / پھنسے ہوئے افراد',
      trappedDesc: 'بند دروازوں، تیز پانی، یا ٹوٹی سیڑھیوں کی وجہ سے خود نکلنے سے قاصر۔',
      medicalLabel: 'فوری طبی امداد کی ضرورت',
      medicalDesc: 'شدید چوٹ، شوگر/انسولین، گردوں کے امراض، آکسیجن کی ضرورت یا شدید سردی۔',
      mobilityLabel: 'حرکت و نقل و حمل میں معذوری',
      mobilityDesc: 'بستر تک محدود، وہیل چیئر، شیر خوار بچے یا ضعیف بزرگ جو خود نہیں چل سکتے۔',
      notesLabel: 'اضافی طبی یا ریسکیو ہدایات',
      notesPlaceholder: 'مثال: شوگر کے مریض کو انسولین چاہیے؛ بجلی منقطع ہے؛ دوسری منزل پر دو ضعیف بزرگ موجود ہیں۔',
    },
    sectionD: {
      num: '۴',
      title: 'حصہ چہارم: مشاہدے کا وقت',
      subtitle: 'کوآرڈینیٹرز کو رپورٹ کی تازہ ترین صورتحال سمجھنے میں مدد ملتی ہے۔',
      timingLabel: 'آپ نے یہ صورتحال کب دیکھی؟',
      options: {
        now: 'ابھی ابھی / پچھلے ۵ منٹ کے اندر',
        '15m': 'تقریباً ۱۵ منٹ پہلے',
        '1h': 'تقریباً ۱ گھنٹہ پہلے',
        '3h': 'تقریباً ۲ سے ۴ گھنٹے پہلے',
        '12h': 'آج صبح سویرے (~۱۲ گھنٹے پہلے)',
        '24h': 'کل دیکھی تھی (~۲۴ گھنٹے پہلے)',
      },
    },
    actions: {
      algorithmNotice: 'رپورٹس کا الگورتھم کے ذریعے تجزیہ کیا جاتا ہے تاکہ جان لیوا کیسز پہلے حل ہوں۔',
      submitButton: 'رپورٹ کا جائزہ لیں اور جمع کریں',
      submittingButton: 'ترجیحی اسکور کا جائزہ لیا جا رہا ہے...',
    },
    successBanner: {
      title: 'ہنگامی رپورٹ کامیابی کے ساتھ درج کر لی گئی ہے',
      incident: 'واقعہ نمبر (Incident)',
      reportId: 'رپورٹ آئی ڈی',
      priorityScore: 'ترجیحی اسکور',
      status: 'حالت',
      viewOnMap: 'نقشے پر دیکھیں',
      dismiss: 'بند کریں',
    },
    guidelines: {
      title: 'ہنگامی رپورٹنگ کی اہم ہدایات',
      tip1Title: 'جان لیوا ہنگامی حالات اولین ترجیح',
      tip1Desc: 'پانی میں محصور اور شدید طبی ضروریات والے کیسز کو ریسکیو ٹیمیں سب سے پہلے نکالتی ہیں۔',
      tip2Title: 'نامعلوم معلومات کا سچ بولیں',
      tip2Desc: 'اندازہ مت لگائیں! "معلوم نہیں" چننے پر سسٹم متاثرین کے تحفظ کے لیے سیفٹی بونس شامل کرتا ہے۔',
      tip3Title: 'پڑوسیوں کے لیے رپورٹ کریں',
      tip3Desc: 'ان نادار لوگوں کے لیے آواز اٹھائیں جن کے پاس اسمارٹ فون یا انٹرنیٹ کی سہولت موجود نہیں۔',
      callout: 'تمام رپورٹس کو خفیہ رکھا جاتا ہے اور صرف مجاز ریلیف افسران تک رسائی ہوتی ہے۔',
    },
    modal: {
      title: 'ہنگامی معلومات کی توثیق',
      subtitle: 'رپورٹ حتمی طور پر روانہ کرنے سے پہلے ان اہم نکات کی تصدیق کر لیں۔',
      confirmButton: 'توثیق کریں اور رپورٹ ارسال کریں',
      cancelButton: 'معلومات درست کریں',
      zoneLabel: 'منتخب کردہ زون',
      locationLabel: 'مقام و پتہ',
      severityLabel: 'سیلاب کی شدت',
      peopleLabel: 'افراد کی تعداد',
      trappedLabel: 'محصور افراد',
      medicalLabel: 'طبی ضرورت',
      mobilityLabel: 'چلنے پھرنے میں مدد',
    },
    validationErrors: {
      zoneId: 'براہ کرم سیلابی زون / سیکٹر منتخب کریں',
      locationDescription: 'گلی کا پتہ اور نشانی کم از کم ۵ حروف پر مشتمل ہونی چاہیے',
      observedAt: 'مشاہدے کا وقت پچھلے ۷۲ گھنٹوں کے اندر ہونا چاہیے',
      reportingFor: 'براہ کرم منتخب کریں کہ آپ کس کے لیے رپورٹ درج کر رہے ہیں',
      reporterRole: 'براہ کرم رپورٹ کنندہ کی حیثیت منتخب کریں',
      floodSeverity: 'سیلاب کی شدت کا درجہ ۰ سے ۳ کے درمیان منتخب کریں',
      peopleCount: 'افراد کی تعداد ۱ سے ۵۰۰ کے درمیان ہونی چاہیے',
      reporterName: 'نام میں صرف حروف ہونے چاہئیں (کم از کم ۲ حروف)',
      reporterPhone: 'فون نمبر میں ۷ سے ۱۵ ہندسے ہونے چاہئیں (مثال: +92 300 1234567)',
      lat: 'عرض بلد کراچی کی حدود (24.6 تا 25.3) کے اندر ہونا چاہیے',
      lng: 'طول بلد کراچی کی حدود (66.7 تا 67.5) کے اندر ہونا چاہیے',
      description: 'تفصیل ۱۰۰۰ حروف سے زیادہ نہیں ہو سکتی',
      generalCorrection: 'درستگی درکار ہے: براہ کرم سرخ نشان زدہ خانوں کو درست کریں۔',
      rateLimit: 'بہت زیادہ رپورٹس موصول ہو رہی ہیں، براہ کرم ایک منٹ بعد کوشش کریں۔',
      serverError: 'رپورٹ محفوظ نہ ہو سکی۔ براہ کرم دوبارہ کوشش کریں۔',
    },
  },

  sd: {
    dir: 'rtl',
    langName: 'Sindhi',
    nativeName: 'سنڌي',
    header: {
      title: 'هنگامي امدادي رپورٽ داخل ڪريو',
      description: 'ٻوڏ ۾ ڦاٿل ماڻهن جي صحيح ڄاڻ ڏيو ته جيئن ريسڪيو ٽيمون پهرين فرصت ۾ مدد لاءِ پهچي سگهن.',
      badge: 'لائيو انٽيڪ (ڊيمو ڊيٽابيس)',
      breadcrumb: 'هنگامي رپورٽنگ',
    },
    sectionA: {
      num: '۱',
      title: 'حصو الف: رپورٽ ڪندڙ جي سڃاڻپ ۽ دائرو',
      subtitle: 'واضح ڪريو ته ڇا اوهان پنهنجي لاءِ يا پاڙيسري/رضاڪار طور ٻين لاءِ رپورٽ ڪري رهيا آهيو.',
      reportingForLabel: 'اوهان ڪنهن جي لاءِ رپورٽ داخل ڪري رهيا آهيو؟',
      reportingForMyself: 'پنهنجي يا پنهنجي خاندان لاءِ',
      reportingForSomeoneElse: 'ٻئي ڪنهن ماڻهو / پاڙيسري لاءِ',
      reporterNameLabel: 'اوهان جو نالو',
      reporterNamePlaceholder: 'مثال: طارق محمود / علي نواز',
      reporterPhoneLabel: 'رابطي لاءِ فون نمبر',
      reporterPhonePlaceholder: '+92 300 1234567',
      reporterRoleLabel: 'رپورٽ ڪندڙ جي حيثيت',
      roles: {
        resident: 'متاثر رهواسي',
        neighbor: 'ويجهو پاڙيسري',
        volunteer: 'ميداني رضاڪار',
        other: 'عام ماڻهو / مائٽ',
      },
    },
    sectionB: {
      num: '۲',
      title: 'حصو ب: واقعي جو هنڌ ۽ جاگرافيائي ڪوآرڊينيٽس',
      subtitle: 'ويجهي ريسڪيو ٽيم جلد اماڻڻ لاءِ صحيح علائقي/سيڪٽر جي چونڊ ڪريو.',
      zoneLabel: 'ٻوڏ وارو علائقو / سيڪٽر چونڊيو',
      zoneLoading: 'علائقا لوڊ ٿي رهيا آهن...',
      zoneEmpty: 'ڪو به علائقو موجود ناهي',
      locationDescLabel: 'گهٽي جو پتو ۽ ويجهي مشهور نشاني (Landmark)',
      locationDescPlaceholder: 'مثال: گهر نمبر 42-B، گهٽي 6، پاڻيءَ ۾ ٻڏل جامع مسجد جي پٺيان، پيلو در، ٻئي ماڙ تي گيلري.',
      gpsTitle: 'جي پي ايس (GPS) لوڪيشن ڪوآرڊينيٽس',
      gpsSubtitle: '(اختياري • صحيح نقشي سازي لاءِ مددگار)',
      useGpsButton: 'منهنجي موجوده لوڪيشن وٺو',
      acquiringGps: 'جي پي ايس لوڪيشن معلوم ٿي رهي آهي...',
      clearGps: 'صاف ڪريو',
      latLabel: 'ويڪرائي ڦاڪ (Latitude - ڪراچي: 24.6000 کان 25.3000)',
      lngLabel: 'ڊگھائي ڦاڪ (Longitude - ڪراچي: 66.7000 کان 67.5000)',
      latPlaceholder: 'مثال: 24.86300 (يا خالي ڇڏيو)',
      lngPlaceholder: 'مثال: 67.01400 (يا خالي ڇڏيو)',
      mapPickerTitle: 'نقشي تي هنڌ جي صحيح چونڊ ۽ پن ڊراپ',
      mapPickerSubtitle: 'ٻئي ڪنهن ماڻهو لاءِ علائقو ڳوليو يا نقشي تي ڪلڪ ڪري لوڪيشن طئي ڪريو.',
      toggleMapButtonOpen: 'نقشي تي چونڊيو',
      toggleMapButtonClose: 'نقشو بند ڪريو',
      searchPlaceholder: 'ڪراچي جو علائقو، نشاني يا گهٽي ڳوليو (مثال: ڪلفٽن، گلشن، ناظم آباد، صدر)...',
      pinInstruction: 'نقشي تي ڪٿي به ڪلڪ ڪريو يا پن کي صحيح هنڌ تي وٺي وڃو.',
      zoneAutoDetected: 'ويجهو هنگامي علائقو پاڻمرادو چونڊجي ويو آهي',
      currentCoords: 'چونڊيل ڪوآرڊينيٽس',
    },
    sectionC: {
      num: '۳',
      title: 'حصو ج: جاني تحفظ ۽ خطري جو تخمينو',
      subtitle: 'هر جواب ريسڪيو جي اوليت طئي ڪري ٿو. شڪ هجي ته "اڻڄاتل" چونڊيو.',
      floodSeverityLabel: 'ٻوڏ ۽ پاڻيءَ جي موجوده سطح',
      floodSeveritySubtitle: 'عمارت جي چوڌاري بيٺل پاڻيءَ جي شدت چونڊيو.',
      floodLevels: {
        0: { title: '۰ — معمولي وهڪرو', desc: 'ڳچين تائين پاڻي، گهٽيءَ مان پيدل لنگهڻ ممڪن آهي.' },
        1: { title: '۱ — وچولي ٻوڏ', desc: 'گوڏن تائين پاڻي، هيٺين ماڙ ۾ پاڻي داخل ٿيڻ جو خطرو.' },
        2: { title: '۲ — سخت ٻوڏ', desc: 'چيلھ تائين تکو پاڻي، هيٺين ماڙ مڪمل ٻڏي چڪي آهي.' },
        3: { title: '۳ — انتهائي خطرو / جان ليوا', desc: 'ڇاتيءَ کان مٿي پاڻي، ڇت تي پناهه، عمارت ڪرڻ جو خطرو.' },
      },
      peopleCountLabel: 'خطري ۾ گهيريل ماڻهن جو متوقع انگ',
      peopleCountSubtitle: 'فوري نجات يا طبي امداد جا منتظر ڪل ماڻهو.',
      unknownPeopleCheckbox: 'ماڻهن جو پڪو انگ معلوم ناهي',
      triState: {
        yes: 'ها',
        no: 'نه',
        unknown: 'اڻڄاتل',
      },
      trappedLabel: 'پاڻيءَ ۾ ڦاٿل ماڻهو',
      trappedDesc: 'ٻاهران بند دروازن، تيز وهڪري، يا ٽٽل ڏاڪڻين سبب پاڻ نڪرڻ کان قاصر.',
      medicalLabel: 'فوري طبي امداد جي سخت ضرورت',
      medicalDesc: 'سخت ڦٽ، شوگر/انسولين، بڪين جا مريض، آڪسيجن جي ضرورت يا سخت سردي.',
      mobilityLabel: 'هلڻ ڦرڻ ۾ معذوري يا مدد جي ضرورت',
      mobilityDesc: 'بستري تي پيل، ويل چيئر، ننڍڙا معصوم ٻار يا بزرگ جيڪي هلي نٿا سگهن.',
      notesLabel: 'اضافي طبي يا ريسڪيو هدايتون',
      notesPlaceholder: 'مثال: شوگر جي مريض لاءِ انسولين کپي؛ بجلي بند آهي؛ ٻئي ماڙ تي ٻه پيرسن بزرگ آهن.',
    },
    sectionD: {
      num: '۴',
      title: 'حصو د: ڏسڻ جو وقت (Observation Timing)',
      subtitle: 'ڪوآرڊينيٽرز کي تازي صورتحال سمجهڻ ۾ مدد ڏيو.',
      timingLabel: 'اوهان اها صورتحال ڪڏهن ڏٺي؟',
      options: {
        now: 'هاڻي ئي / گذريل ۵ منٽن اندر',
        '15m': 'لڳ ڀڳ ۱۵ منٽ اڳ',
        '1h': 'لڳ ڀڳ ۱ ڪلاڪ اڳ',
        '3h': 'لڳ ڀڳ ۲ کان ۴ ڪلاڪ اڳ',
        '12h': 'اڄ صبح سوير (~۱۲ ڪلاڪ اڳ)',
        '24h': 'ڪالهه ڏٺي هئي (~۲۴ ڪلاڪ اڳ)',
      },
    },
    actions: {
      algorithmNotice: 'رپورٽن جو تجزيو پاڻمرادو الگورٿم ذريعي ٿئي ٿو ته جيئن ڦاٿل ماڻهو پهرين بچن.',
      submitButton: 'رپورٽ جي نظرثاني ڪريو ۽ جمع ڪريو',
      submittingButton: 'امدادي اسڪور جو جائزو ورتو پيو وڃي...',
    },
    successBanner: {
      title: 'هنگامي رپورٽ ڪاميابيءَ سان داخل ٿي چڪي آهي',
      incident: 'واقعو نمبر (Incident)',
      reportId: 'رپورٽ آءِ ڊي',
      priorityScore: 'امدادي ترجيح اسڪور',
      status: 'حالت',
      viewOnMap: 'نقشي تي ڏسو',
      dismiss: 'بند ڪريو',
    },
    guidelines: {
      title: 'هنگامي رپورٽنگ جون اهم هدايتون',
      tip1Title: 'جان ليوا ڪيس پهرين اوليت',
      tip1Desc: 'پاڻيءَ ۾ ڦاٿل ماڻهن ۽ سخت بيمار مريضن کي ريسڪيو ٽيمون پهرين ڪڍنديون.',
      tip2Title: 'اڻڄاتل معلومات بابت سچ ٻڌايو',
      tip2Desc: 'اندازا نه لڳايو! "اڻڄاتل" چونڊڻ سان سسٽم متاثرن جي حفاظت لاءِ بونس شامل ڪندو.',
      tip3Title: 'پاڙيسرين لاءِ پڻ رپورٽ ڪريو',
      tip3Desc: 'انهن بي وس ماڻهن جو آواز بڻجو جن وٽ اسمارٽ فون يا انٽرنيٽ جي سهولت ناهي.',
      callout: 'سڀ رپورٽون راز ۾ رکيون وينديون آهن ۽ صرف بااختيار امدادي آفيسرن تائين پهچن ٿيون.',
    },
    modal: {
      title: 'هنگامي معلومات جي تصديق',
      subtitle: 'رپورٽ حتمي طور موڪلڻ کان اڳ انهن اهم نقطن جي پڪ ڪري وٺو.',
      confirmButton: 'تصديق ڪريو ۽ رپورٽ اماڻيو',
      cancelButton: 'معلومات درست ڪريو',
      zoneLabel: 'چونڊيل علائقو',
      locationLabel: 'هنڌ ۽ پتو',
      severityLabel: 'ٻوڏ جي شدت',
      peopleLabel: 'ماڻهن جو انگ',
      trappedLabel: 'ڦاٿل ماڻهو',
      medicalLabel: 'طبي ضرورت',
      mobilityLabel: 'هلڻ ڦرڻ ۾ مدد',
    },
    validationErrors: {
      zoneId: 'مهرباني ڪري ٻوڏ جو علائقو / سيڪٽر چونڊيو',
      locationDescription: 'گهٽي جو پتو ۽ نشاني گهٽ ۾ گهٽ ۵ اکر هجڻ کپي',
      observedAt: 'ڏسڻ جو وقت گذريل ۷۲ ڪلاڪن اندر هجڻ کپي',
      reportingFor: 'مهرباني ڪري چونڊيو ته اوهان ڪنهن لاءِ رپورٽ ڪري رهيا آهيو',
      reporterRole: 'مهرباني ڪري رپورٽ ڪندڙ جي حيثيت چونڊيو',
      floodSeverity: 'ٻوڏ جي شدت ۰ کان ۳ جي وچ ۾ هجڻ کپي',
      peopleCount: 'ماڻهن جو انگ ۱ کان ۵۰۰ جي وچ ۾ هجڻ کپي',
      reporterName: 'نالي ۾ صرف اکر هجڻ کپن (گهٽ ۾ گهٽ ۲ اکر)',
      reporterPhone: 'فون نمبر ۾ ۷ کان ۱۵ انگ هجڻ کپن (مثال: +92 300 1234567)',
      lat: 'ويڪرائي ڦاڪ ڪراچي جي حدن (24.6 کان 25.3) اندر هجڻ کپي',
      lng: 'ڊگهائي ڦاڪ ڪراچي جي حدن (66.7 کان 67.5) اندر هجڻ کپي',
      description: 'تفصيل ۱۰۰۰ اکرن کان وڌيڪ نه هئڻ کپي',
      generalCorrection: 'درستي گهربل: مهرباني ڪري ڳاڙهي نشان لڳل خانن کي درست ڪريو.',
      rateLimit: 'گهڻيون رپورٽون اچي رهيون آهن، مهرباني ڪري هڪ منٽ ترسو.',
      serverError: 'رپورٽ محفوظ نه ٿي سگهي. مهرباني ڪري ٻيهر ڪوشش ڪريو.',
    },
  },
};
