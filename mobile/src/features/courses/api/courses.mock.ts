import type { Country, Course, Location } from '@/features/courses/types';

export type MockCountry = Omit<Country, 'courseCount' | 'locationCount'>;

export type MockLocation = Omit<Location, 'countryName'>;

export type MockCourse = Omit<Course, 'locations' | 'countryName' | 'unlockCost' | 'isUnlocked'> & {
  locationIds: string[];
};

export const MOCK_COUNTRIES: MockCountry[] = [
  {
    code: 'ES',
    name: 'Spain',
    blurb:
      'Spain links Atlantic marshes, Mediterranean sierras and Moorish palaces in one ' +
      'country. Its bullfighting rings and flamenco keep older rituals in everyday public ' +
      'life.',
  },
  {
    code: 'IT',
    name: 'Italy',
    blurb:
      'Italy holds more UNESCO World Heritage sites than almost any other country, from ' +
      'Roman concrete to the slopes of Mount Etna. Its food changes almost every valley.',
  },
  {
    code: 'GR',
    name: 'Greece',
    blurb:
      'Greece is the birthplace of the Olympic Games, Western theatre and democracy. Its ' +
      'coastline also hosts some of the most important loggerhead nesting beaches in the ' +
      'Mediterranean.',
  },
  {
    code: 'FR',
    name: 'France',
    blurb:
      'France mixes Mediterranean wetlands, Impressionist gardens and vineyards that ' +
      'define global wine styles. Regional cooking changes sharply from Provence to ' +
      'Champagne.',
  },
  {
    code: 'HR',
    name: 'Croatia',
    blurb:
      'Croatia has Roman-era palaces, medieval walled towns and islands with clear ' +
      'Adriatic water along its Dalmatian coast. Its klapa vocal tradition is listed by ' +
      'UNESCO.',
  },
  {
    code: 'ME',
    name: 'Montenegro',
    blurb:
      'Montenegro packs mountains, a deep bay and a large lake into a small territory. ' +
      'Venetian-era walled towns sit beside important pelican breeding grounds on Lake ' +
      'Skadar.',
  },
  {
    code: 'JP',
    name: 'Japan',
    blurb:
      'Japan pairs seasonal rituals such as cherry blossom viewing with Edo-era castles ' +
      'and temples. Its wild macaques and Kyoto gardens show how culture and nature meet.',
  },
  {
    code: 'EG',
    name: 'Egypt',
    blurb:
      'Egypt links the Giza plateau, New Kingdom tombs and the crocodile-filled waters of ' +
      'Lake Nasser. Ramadan in Cairo turns old streets into a nightly festival.',
  },
  {
    code: 'IN',
    name: 'India',
    blurb:
      'India combines Mughal monuments, Rajasthan palace towns and tiger reserves in one ' +
      'country. Festivals such as Holi show how color and faith shape daily life.',
  },
  {
    code: 'PE',
    name: 'Peru',
    blurb:
      'Peru spans Pacific deserts, Andean cloud forests and Inca stone cities. Its ' +
      'festivals keep Quechua traditions alive in Cusco and the Sacred Valley.',
  },
  {
    code: 'AU',
    name: 'Australia',
    blurb:
      'Australia marsupials and reef systems evolved in isolation for millions of years. ' +
      'Aboriginal songlines carry knowledge of the land that is tens of thousands of ' +
      'years old.',
  },
  {
    code: 'IS',
    name: 'Iceland',
    blurb:
      'Iceland sits on the Mid-Atlantic Ridge, where two plates pull apart, so geysers, ' +
      'lava fields and glacier lagoons lie close together. Midwinter feasts and old ' +
      'wrestling traditions remain popular.',
  },
];

export const MOCK_LOCATIONS: MockLocation[] = [
  {
    id: 'l-real-maestranza-sevilla',
    name: 'Real Maestranza de Caballeria de Sevilla',
    kind: 'venue',
    city: 'Seville',
    countryCode: 'ES',
    lat: 37.3837,
    lng: -5.9869,
    imageUrl: 'https://picsum.photos/seed/l-real-maestranza-sevilla/400/400',
  },
  {
    id: 'l-plaza-de-toros-ronda',
    name: 'Plaza de Toros de Ronda',
    kind: 'venue',
    city: 'Ronda',
    countryCode: 'ES',
    lat: 36.7412,
    lng: -5.1607,
    imageUrl: 'https://picsum.photos/seed/l-plaza-de-toros-ronda/400/400',
  },
  {
    id: 'l-las-ventas-madrid',
    name: 'Las Ventas bullring',
    kind: 'venue',
    city: 'Madrid',
    countryCode: 'ES',
    lat: 40.4278,
    lng: -3.6778,
    imageUrl: 'https://picsum.photos/seed/l-las-ventas-madrid/400/400',
  },
  {
    id: 'l-alhambra',
    name: 'Alhambra',
    kind: 'monument',
    city: 'Granada',
    countryCode: 'ES',
    lat: 37.1761,
    lng: -3.5881,
    imageUrl: 'https://picsum.photos/seed/l-alhambra/400/400',
  },
  {
    id: 'l-mezquita-cathedral-cordoba',
    name: 'Mezquita-Cathedral of Cordoba',
    kind: 'monument',
    city: 'Cordoba',
    countryCode: 'ES',
    lat: 37.8789,
    lng: -4.7794,
    imageUrl: 'https://picsum.photos/seed/l-mezquita-cathedral-cordoba/400/400',
  },
  {
    id: 'l-real-alcazar-sevilla',
    name: 'Real Alcazar of Seville',
    kind: 'monument',
    city: 'Seville',
    countryCode: 'ES',
    lat: 37.3831,
    lng: -5.9909,
    imageUrl: 'https://picsum.photos/seed/l-real-alcazar-sevilla/400/400',
  },
  {
    id: 'l-plaza-de-espana-sevilla',
    name: 'Plaza de Espana',
    kind: 'monument',
    city: 'Seville',
    countryCode: 'ES',
    lat: 37.3772,
    lng: -5.9869,
    imageUrl: 'https://picsum.photos/seed/l-plaza-de-espana-sevilla/400/400',
  },
  {
    id: 'l-piazza-del-campo',
    name: 'Piazza del Campo',
    kind: 'site',
    city: 'Siena',
    countryCode: 'IT',
    lat: 43.3186,
    lng: 11.3307,
    imageUrl: 'https://picsum.photos/seed/l-piazza-del-campo/400/400',
  },
  {
    id: 'l-siena-cathedral',
    name: 'Siena Cathedral',
    kind: 'monument',
    city: 'Siena',
    countryCode: 'IT',
    lat: 43.3183,
    lng: 11.3311,
    imageUrl: 'https://picsum.photos/seed/l-siena-cathedral/400/400',
  },
  {
    id: 'l-colosseum',
    name: 'Colosseum',
    kind: 'monument',
    city: 'Rome',
    countryCode: 'IT',
    lat: 41.8902,
    lng: 12.4922,
    imageUrl: 'https://picsum.photos/seed/l-colosseum/400/400',
  },
  {
    id: 'l-pantheon',
    name: 'Pantheon',
    kind: 'monument',
    city: 'Rome',
    countryCode: 'IT',
    lat: 41.8986,
    lng: 12.4769,
    imageUrl: 'https://picsum.photos/seed/l-pantheon/400/400',
  },
  {
    id: 'l-roman-forum',
    name: 'Roman Forum',
    kind: 'site',
    city: 'Rome',
    countryCode: 'IT',
    lat: 41.8925,
    lng: 12.4853,
    imageUrl: 'https://picsum.photos/seed/l-roman-forum/400/400',
  },
  {
    id: 'l-pompeii',
    name: 'Pompeii',
    kind: 'site',
    city: 'Pompeii',
    countryCode: 'IT',
    lat: 40.751,
    lng: 14.4869,
    imageUrl: 'https://picsum.photos/seed/l-pompeii/400/400',
  },
  {
    id: 'l-mount-etna',
    name: 'Mount Etna',
    kind: 'nature',
    city: 'Nicolosi',
    countryCode: 'IT',
    lat: 37.751,
    lng: 14.9934,
    imageUrl: 'https://picsum.photos/seed/l-mount-etna/400/400',
  },
  {
    id: 'l-olympia',
    name: 'Ancient Olympia',
    kind: 'site',
    city: 'Olympia',
    countryCode: 'GR',
    lat: 37.6379,
    lng: 21.6301,
    imageUrl: 'https://picsum.photos/seed/l-olympia/400/400',
  },
  {
    id: 'l-delphi',
    name: 'Delphi',
    kind: 'site',
    city: 'Delphi',
    countryCode: 'GR',
    lat: 38.4822,
    lng: 22.5011,
    imageUrl: 'https://picsum.photos/seed/l-delphi/400/400',
  },
  {
    id: 'l-panathenaic-stadium',
    name: 'Panathenaic Stadium',
    kind: 'venue',
    city: 'Athens',
    countryCode: 'GR',
    lat: 37.9686,
    lng: 23.7411,
    imageUrl: 'https://picsum.photos/seed/l-panathenaic-stadium/400/400',
  },
  {
    id: 'l-acropolis-athens',
    name: 'Acropolis of Athens',
    kind: 'monument',
    city: 'Athens',
    countryCode: 'GR',
    lat: 37.9715,
    lng: 23.7267,
    imageUrl: 'https://picsum.photos/seed/l-acropolis-athens/400/400',
  },
  {
    id: 'l-giverny-monet-garden',
    name: 'Monet Garden',
    kind: 'museum',
    city: 'Giverny',
    countryCode: 'FR',
    lat: 49.076,
    lng: 1.5335,
    imageUrl: 'https://picsum.photos/seed/l-giverny-monet-garden/400/400',
  },
  {
    id: 'l-camargue-saintes-maries',
    name: 'Camargue wetlands',
    kind: 'nature',
    city: 'Saintes-Maries-de-la-Mer',
    countryCode: 'FR',
    lat: 43.452,
    lng: 4.4288,
    imageUrl: 'https://picsum.photos/seed/l-camargue-saintes-maries/400/400',
  },
  {
    id: 'l-reims-cathedral',
    name: 'Reims Cathedral',
    kind: 'monument',
    city: 'Reims',
    countryCode: 'FR',
    lat: 49.2531,
    lng: 4.0344,
    imageUrl: 'https://picsum.photos/seed/l-reims-cathedral/400/400',
  },
  {
    id: 'l-diocletian-palace-split',
    name: 'Diocletian Palace',
    kind: 'monument',
    city: 'Split',
    countryCode: 'HR',
    lat: 43.5064,
    lng: 16.44,
    imageUrl: 'https://picsum.photos/seed/l-diocletian-palace-split/400/400',
  },
  {
    id: 'l-trogir-old-town',
    name: 'Trogir Old Town',
    kind: 'site',
    city: 'Trogir',
    countryCode: 'HR',
    lat: 43.5165,
    lng: 16.251,
    imageUrl: 'https://picsum.photos/seed/l-trogir-old-town/400/400',
  },
  {
    id: 'l-dubrovnik-old-town',
    name: 'Dubrovnik Old Town',
    kind: 'site',
    city: 'Dubrovnik',
    countryCode: 'HR',
    lat: 42.641,
    lng: 18.109,
    imageUrl: 'https://picsum.photos/seed/l-dubrovnik-old-town/400/400',
  },
  {
    id: 'l-krka-national-park',
    name: 'Krka National Park',
    kind: 'nature',
    city: 'Skradin',
    countryCode: 'HR',
    lat: 43.8048,
    lng: 15.9539,
    imageUrl: 'https://picsum.photos/seed/l-krka-national-park/400/400',
  },
  {
    id: 'l-kotor-old-town',
    name: 'Kotor Old Town',
    kind: 'site',
    city: 'Kotor',
    countryCode: 'ME',
    lat: 42.4247,
    lng: 18.7712,
    imageUrl: 'https://picsum.photos/seed/l-kotor-old-town/400/400',
  },
  {
    id: 'l-st-johns-fortress-kotor',
    name: 'St John Fortress',
    kind: 'monument',
    city: 'Kotor',
    countryCode: 'ME',
    lat: 42.414,
    lng: 18.77,
    imageUrl: 'https://picsum.photos/seed/l-st-johns-fortress-kotor/400/400',
  },
  {
    id: 'l-our-lady-of-the-rocks',
    name: 'Our Lady of the Rocks',
    kind: 'monument',
    city: 'Perast',
    countryCode: 'ME',
    lat: 42.4806,
    lng: 18.6945,
    imageUrl: 'https://picsum.photos/seed/l-our-lady-of-the-rocks/400/400',
  },
  {
    id: 'l-skadar-lake',
    name: 'Lake Skadar',
    kind: 'nature',
    city: 'Virpazar',
    countryCode: 'ME',
    lat: 42.191,
    lng: 19.1,
    imageUrl: 'https://picsum.photos/seed/l-skadar-lake/400/400',
  },
  {
    id: 'l-tsukiji-outer-market',
    name: 'Tsukiji Outer Market',
    kind: 'site',
    city: 'Tokyo',
    countryCode: 'JP',
    lat: 35.6654,
    lng: 139.7707,
    imageUrl: 'https://picsum.photos/seed/l-tsukiji-outer-market/400/400',
  },
  {
    id: 'l-kinkaku-ji',
    name: 'Kinkaku-ji',
    kind: 'monument',
    city: 'Kyoto',
    countryCode: 'JP',
    lat: 35.0394,
    lng: 135.7292,
    imageUrl: 'https://picsum.photos/seed/l-kinkaku-ji/400/400',
  },
  {
    id: 'l-kiyomizu-dera',
    name: 'Kiyomizu-dera',
    kind: 'monument',
    city: 'Kyoto',
    countryCode: 'JP',
    lat: 34.9949,
    lng: 135.785,
    imageUrl: 'https://picsum.photos/seed/l-kiyomizu-dera/400/400',
  },
  {
    id: 'l-philosophers-path',
    name: 'Path of Philosophy',
    kind: 'site',
    city: 'Kyoto',
    countryCode: 'JP',
    lat: 35.027,
    lng: 135.795,
    imageUrl: 'https://picsum.photos/seed/l-philosophers-path/400/400',
  },
  {
    id: 'l-fushimi-inari-taisha',
    name: 'Fushimi Inari Taisha',
    kind: 'monument',
    city: 'Kyoto',
    countryCode: 'JP',
    lat: 34.9671,
    lng: 135.7727,
    imageUrl: 'https://picsum.photos/seed/l-fushimi-inari-taisha/400/400',
  },
  {
    id: 'l-nijo-castle',
    name: 'Nijo Castle',
    kind: 'monument',
    city: 'Kyoto',
    countryCode: 'JP',
    lat: 35.0142,
    lng: 135.7481,
    imageUrl: 'https://picsum.photos/seed/l-nijo-castle/400/400',
  },
  {
    id: 'l-jigokudani-snow-monkey-park',
    name: 'Jigokudani Snow Monkey Park',
    kind: 'nature',
    city: 'Yamanouchi',
    countryCode: 'JP',
    lat: 36.7252,
    lng: 138.4716,
    imageUrl: 'https://picsum.photos/seed/l-jigokudani-snow-monkey-park/400/400',
  },
  {
    id: 'l-giza-pyramids',
    name: 'Giza Pyramids',
    kind: 'monument',
    city: 'Giza',
    countryCode: 'EG',
    lat: 29.9792,
    lng: 31.1342,
    imageUrl: 'https://picsum.photos/seed/l-giza-pyramids/400/400',
  },
  {
    id: 'l-great-sphinx',
    name: 'Great Sphinx of Giza',
    kind: 'monument',
    city: 'Giza',
    countryCode: 'EG',
    lat: 29.9753,
    lng: 31.1376,
    imageUrl: 'https://picsum.photos/seed/l-great-sphinx/400/400',
  },
  {
    id: 'l-egyptian-museum-cairo',
    name: 'Egyptian Museum',
    kind: 'museum',
    city: 'Cairo',
    countryCode: 'EG',
    lat: 30.0478,
    lng: 31.2336,
    imageUrl: 'https://picsum.photos/seed/l-egyptian-museum-cairo/400/400',
  },
  {
    id: 'l-valley-of-the-kings',
    name: 'Valley of the Kings',
    kind: 'site',
    city: 'Luxor',
    countryCode: 'EG',
    lat: 25.7402,
    lng: 32.6014,
    imageUrl: 'https://picsum.photos/seed/l-valley-of-the-kings/400/400',
  },
  {
    id: 'l-karnak-temple',
    name: 'Karnak Temple',
    kind: 'monument',
    city: 'Luxor',
    countryCode: 'EG',
    lat: 25.7188,
    lng: 32.6573,
    imageUrl: 'https://picsum.photos/seed/l-karnak-temple/400/400',
  },
  {
    id: 'l-al-muizz-street',
    name: 'Al-Muizz Street',
    kind: 'site',
    city: 'Cairo',
    countryCode: 'EG',
    lat: 30.0501,
    lng: 31.2611,
    imageUrl: 'https://picsum.photos/seed/l-al-muizz-street/400/400',
  },
  {
    id: 'l-abu-simbel',
    name: 'Abu Simbel',
    kind: 'monument',
    city: 'Abu Simbel',
    countryCode: 'EG',
    lat: 22.3372,
    lng: 31.6258,
    imageUrl: 'https://picsum.photos/seed/l-abu-simbel/400/400',
  },
  {
    id: 'l-taj-mahal',
    name: 'Taj Mahal',
    kind: 'monument',
    city: 'Agra',
    countryCode: 'IN',
    lat: 27.1751,
    lng: 78.0421,
    imageUrl: 'https://picsum.photos/seed/l-taj-mahal/400/400',
  },
  {
    id: 'l-agra-fort',
    name: 'Agra Fort',
    kind: 'monument',
    city: 'Agra',
    countryCode: 'IN',
    lat: 27.1795,
    lng: 78.0211,
    imageUrl: 'https://picsum.photos/seed/l-agra-fort/400/400',
  },
  {
    id: 'l-city-palace-jaipur',
    name: 'City Palace',
    kind: 'museum',
    city: 'Jaipur',
    countryCode: 'IN',
    lat: 26.9258,
    lng: 75.8237,
    imageUrl: 'https://picsum.photos/seed/l-city-palace-jaipur/400/400',
  },
  {
    id: 'l-hawa-mahal-jaipur',
    name: 'Hawa Mahal',
    kind: 'monument',
    city: 'Jaipur',
    countryCode: 'IN',
    lat: 26.9239,
    lng: 75.8267,
    imageUrl: 'https://picsum.photos/seed/l-hawa-mahal-jaipur/400/400',
  },
  {
    id: 'l-amber-fort',
    name: 'Amber Fort',
    kind: 'monument',
    city: 'Jaipur',
    countryCode: 'IN',
    lat: 26.9855,
    lng: 75.8513,
    imageUrl: 'https://picsum.photos/seed/l-amber-fort/400/400',
  },
  {
    id: 'l-ranthambore-national-park',
    name: 'Ranthambore National Park',
    kind: 'nature',
    city: 'Sawai Madhopur',
    countryCode: 'IN',
    lat: 26.0173,
    lng: 76.5026,
    imageUrl: 'https://picsum.photos/seed/l-ranthambore-national-park/400/400',
  },
  {
    id: 'l-machu-picchu',
    name: 'Machu Picchu',
    kind: 'monument',
    city: 'Aguas Calientes',
    countryCode: 'PE',
    lat: -13.1631,
    lng: -72.545,
    imageUrl: 'https://picsum.photos/seed/l-machu-picchu/400/400',
  },
  {
    id: 'l-sacsayhuaman',
    name: 'Sacsayhuaman',
    kind: 'monument',
    city: 'Cusco',
    countryCode: 'PE',
    lat: -13.5087,
    lng: -71.9817,
    imageUrl: 'https://picsum.photos/seed/l-sacsayhuaman/400/400',
  },
  {
    id: 'l-qorikancha',
    name: 'Qorikancha',
    kind: 'monument',
    city: 'Cusco',
    countryCode: 'PE',
    lat: -13.5202,
    lng: -71.9755,
    imageUrl: 'https://picsum.photos/seed/l-qorikancha/400/400',
  },
  {
    id: 'l-cusco-plaza-de-armas',
    name: 'Plaza de Armas',
    kind: 'site',
    city: 'Cusco',
    countryCode: 'PE',
    lat: -13.5163,
    lng: -71.9785,
    imageUrl: 'https://picsum.photos/seed/l-cusco-plaza-de-armas/400/400',
  },
  {
    id: 'l-heron-island',
    name: 'Heron Island',
    kind: 'nature',
    city: 'Gladstone',
    countryCode: 'AU',
    lat: -23.4425,
    lng: 151.9141,
    imageUrl: 'https://picsum.photos/seed/l-heron-island/400/400',
  },
  {
    id: 'l-uluru',
    name: 'Uluru',
    kind: 'nature',
    city: 'Yulara',
    countryCode: 'AU',
    lat: -25.3444,
    lng: 131.0369,
    imageUrl: 'https://picsum.photos/seed/l-uluru/400/400',
  },
  {
    id: 'l-port-arthur-historic-site',
    name: 'Port Arthur Historic Site',
    kind: 'site',
    city: 'Port Arthur',
    countryCode: 'AU',
    lat: -43.1465,
    lng: 147.843,
    imageUrl: 'https://picsum.photos/seed/l-port-arthur-historic-site/400/400',
  },
  {
    id: 'l-melbourne-cricket-ground',
    name: 'Melbourne Cricket Ground',
    kind: 'venue',
    city: 'Melbourne',
    countryCode: 'AU',
    lat: -37.8199,
    lng: 144.9834,
    imageUrl: 'https://picsum.photos/seed/l-melbourne-cricket-ground/400/400',
  },
  {
    id: 'l-blue-lagoon',
    name: 'Blue Lagoon',
    kind: 'nature',
    city: 'Grindavik',
    countryCode: 'IS',
    lat: 63.8804,
    lng: -22.4495,
    imageUrl: 'https://picsum.photos/seed/l-blue-lagoon/400/400',
  },
  {
    id: 'l-strokkur-geysir',
    name: 'Strokkur geyser',
    kind: 'nature',
    city: 'Haukadalur',
    countryCode: 'IS',
    lat: 64.3106,
    lng: -20.3019,
    imageUrl: 'https://picsum.photos/seed/l-strokkur-geysir/400/400',
  },
  {
    id: 'l-thingvellir',
    name: 'Thingvellir National Park',
    kind: 'nature',
    city: 'Thingvellir',
    countryCode: 'IS',
    lat: 64.2559,
    lng: -21.13,
    imageUrl: 'https://picsum.photos/seed/l-thingvellir/400/400',
  },
  {
    id: 'l-jokulsarlon',
    name: 'Jokulsarlon glacier lagoon',
    kind: 'nature',
    city: 'Hofn',
    countryCode: 'IS',
    lat: 64.0784,
    lng: -16.2306,
    imageUrl: 'https://picsum.photos/seed/l-jokulsarlon/400/400',
  },
];

export const MOCK_COURSES: MockCourse[] = [
  {
    id: 'c1',
    title: 'Bull riding & the corrida tradition',
    imageUrl: 'https://picsum.photos/seed/bull-riding-the-corrida-tradition/800/1000',
    subject: 'Culture & Traditions',
    countryCode: 'ES',
    description:
      'The corrida grew from Andalusian horsemanship into a ritual with set stages: ' +
      'picadors, banderillas and a final faena. Compare the 1785 ring at Ronda with ' +
      'Seville Maestranza and Las Ventas in Madrid, which opened in 1931.',
    locationIds: ['l-real-maestranza-sevilla', 'l-plaza-de-toros-ronda', 'l-las-ventas-madrid'],
    learnerCount: 33100,
    estimatedMinutes: 90,
    difficulty: 'intermediate',
    progress: 0.45,
  },
  {
    id: 'c2',
    title: 'Doñana wetlands & the Iberian lynx',
    imageUrl: 'https://picsum.photos/seed/donana-wetlands-the-iberian-lynx/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'ES',
    description:
      'Doñana marshes, dunes and pine forests shelter the Iberian lynx, one of the most ' +
      'endangered wild cats on Earth. Learn how seasonal floods drive bird migrations and ' +
      'why water management shapes the wetlands.',
    locationIds: [],
    learnerCount: 9800,
    estimatedMinutes: 75,
    difficulty: 'intermediate',
  },
  {
    id: 'c3',
    title: 'Alhambra and Moorish geometry',
    imageUrl: 'https://picsum.photos/seed/alhambra-and-moorish-geometry/800/1000',
    subject: 'Monuments & Architecture',
    countryCode: 'ES',
    description:
      'The Alhambra is covered in geometric tilework of stars and polygons, cut and ' +
      'fitted by hand. Compare it with the Mezquita in Cordoba and the Real Alcazar in ' +
      'Seville, built by Moorish and Christian hands.',
    locationIds: ['l-alhambra', 'l-mezquita-cathedral-cordoba', 'l-real-alcazar-sevilla'],
    learnerCount: 21500,
    estimatedMinutes: 120,
    difficulty: 'intermediate',
  },
  {
    id: 'c4',
    title: 'Flamenco rhythm & Andalusian guitar',
    imageUrl: 'https://picsum.photos/seed/flamenco-rhythm-andalusian-guitar/800/1000',
    subject: 'Arts & Music',
    countryCode: 'ES',
    description:
      'Flamenco mixes song, guitar and handclapping in palos, each with its own rhythmic ' +
      'cycle called compas. Learn the patterns of alegrias and bulerias, then trace how ' +
      'Triana in Seville shaped the style.',
    locationIds: ['l-plaza-de-espana-sevilla'],
    learnerCount: 14200,
    estimatedMinutes: 60,
    difficulty: 'beginner',
  },
  {
    id: 'c5',
    title: 'Jamón ibérico & acorn-fed pigs',
    imageUrl: 'https://picsum.photos/seed/jamon-iberico-acorn-fed-pigs/800/1000',
    subject: 'Food & Drink',
    countryCode: 'ES',
    description:
      'Iberian pigs that forage on acorns in oak dehesas produce jamón ibérico de ' +
      'bellota, cured for years. Learn how breed, diet and curing time set the grades and ' +
      'why the fat softens at low temperatures.',
    locationIds: [],
    learnerCount: 6700,
    estimatedMinutes: 45,
    difficulty: 'beginner',
  },
  {
    id: 'c6',
    title: 'Palio di Siena: the horse race',
    imageUrl: 'https://picsum.photos/seed/palio-di-siena-the-horse-race/800/1000',
    subject: 'Culture & Traditions',
    countryCode: 'IT',
    description:
      'Twice a year, ten of the seventeen contrade race bareback horses around the Piazza ' +
      'del Campo. Learn how contrade loyalty and the blessing of horses turn one race ' +
      'into a year-long city event.',
    locationIds: ['l-piazza-del-campo', 'l-siena-cathedral'],
    learnerCount: 11800,
    estimatedMinutes: 60,
    difficulty: 'beginner',
  },
  {
    id: 'c7',
    title: 'Roman concrete and the Pantheon',
    imageUrl: 'https://picsum.photos/seed/roman-concrete-and-the-pantheon/800/1000',
    subject: 'Monuments & Architecture',
    countryCode: 'IT',
    description:
      'Roman builders mixed volcanic ash with lime to make concrete that still holds the ' +
      'Pantheon dome. Compare the Pantheon with Pompeii, where Roman walls and mortar ' +
      'were preserved under ash after the eruption of 79 AD.',
    locationIds: ['l-pantheon', 'l-colosseum', 'l-roman-forum', 'l-pompeii'],
    learnerCount: 27600,
    estimatedMinutes: 150,
    difficulty: 'advanced',
  },
  {
    id: 'c8',
    title: 'Mount Etna volcanic ecosystems',
    imageUrl: 'https://picsum.photos/seed/mount-etna-volcanic-ecosystems/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'IT',
    description:
      'Mount Etna is one of the most active volcanoes on Earth, and new lava fields are ' +
      'colonized by pioneer plants. Study how ash soils, altitude zones and frequent ' +
      'eruptions shape this rare ecosystem.',
    locationIds: ['l-mount-etna'],
    learnerCount: 8300,
    estimatedMinutes: 90,
    difficulty: 'intermediate',
  },
  {
    id: 'c9',
    title: 'Parmigiano-Reggiano and dairy craft',
    imageUrl: 'https://picsum.photos/seed/parmigiano-reggiano-and-dairy-craft/800/1000',
    subject: 'Food & Drink',
    countryCode: 'IT',
    description:
      'Parmigiano-Reggiano is made only in a defined area of northern Italy from cow ' +
      'milk, salt and rennet, with no additives. Learn why wheels age for at least twelve ' +
      'months and how graders judge them by tapping.',
    locationIds: [],
    learnerCount: 5400,
    estimatedMinutes: 40,
    difficulty: 'beginner',
  },
  {
    id: 'c10',
    title: 'Olympia and the ancient Games',
    imageUrl: 'https://picsum.photos/seed/olympia-and-the-ancient-games/800/1000',
    subject: 'Sport & Games',
    countryCode: 'GR',
    description:
      'The Olympic Games began at Olympia in 776 BC according to tradition, with a single ' +
      'footrace as the first event. Trace how the Pythian and Panathenaic festivals ' +
      'spread athletic contests across the Greek world.',
    locationIds: ['l-olympia', 'l-delphi', 'l-panathenaic-stadium'],
    learnerCount: 12900,
    estimatedMinutes: 60,
    difficulty: 'beginner',
  },
  {
    id: 'c11',
    title: 'Delphi, the oracle and city-states',
    imageUrl: 'https://picsum.photos/seed/delphi-the-oracle-and-city-states/800/1000',
    subject: 'History',
    countryCode: 'GR',
    description:
      'The oracle of Apollo at Delphi was consulted by city-states and rulers across the ' +
      'Mediterranean for centuries. Read the treasury inscriptions, then compare its ' +
      'politics with the Acropolis of Athens.',
    locationIds: ['l-delphi', 'l-acropolis-athens'],
    learnerCount: 7600,
    estimatedMinutes: 105,
    difficulty: 'intermediate',
  },
  {
    id: 'c12',
    title: 'Loggerhead turtles of Zakynthos',
    imageUrl: 'https://picsum.photos/seed/loggerhead-turtles-of-zakynthos/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'GR',
    description:
      'Loggerhead sea turtles nest on Zakynthos beaches and often return to the shores ' +
      'where they hatched. Learn how nest protection, beach lighting and boat traffic ' +
      'affect how many hatchlings reach the sea.',
    locationIds: [],
    learnerCount: 10300,
    estimatedMinutes: 75,
    difficulty: 'beginner',
    progress: 0.2,
  },
  {
    id: 'c13',
    title: 'Petanque and Provence village games',
    imageUrl: 'https://picsum.photos/seed/petanque-and-provence-village-games/800/1000',
    subject: 'Sport & Games',
    countryCode: 'FR',
    description:
      'Petanque was developed in La Ciotat in 1907, when a player with rheumatism ' +
      'invented a standing-still throw. Learn the rules of boules, how the cochonnet is ' +
      'placed and why the game suits village squares.',
    locationIds: [],
    learnerCount: 4600,
    estimatedMinutes: 30,
    difficulty: 'beginner',
  },
  {
    id: 'c14',
    title: 'Monet gardens at Giverny',
    imageUrl: 'https://picsum.photos/seed/monet-gardens-at-giverny/800/1000',
    subject: 'Arts & Music',
    countryCode: 'FR',
    description:
      'Claude Monet reworked his Giverny garden into a painting subject, with a water ' +
      'garden and a Japanese footbridge. Compare his water lily series with how light and ' +
      'colour change across a single summer.',
    locationIds: ['l-giverny-monet-garden'],
    learnerCount: 15600,
    estimatedMinutes: 75,
    difficulty: 'beginner',
  },
  {
    id: 'c15',
    title: 'Camargue flamingos and salt marshes',
    imageUrl: 'https://picsum.photos/seed/camargue-flamingos-and-salt-marshes/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'FR',
    description:
      'The Camargue delta hosts large numbers of greater flamingos, which feed in shallow ' +
      'lagoons and salt pans. Learn how river sediment, tides and salinity create bird ' +
      'habitats and why grazing bulls shape the land.',
    locationIds: ['l-camargue-saintes-maries'],
    learnerCount: 9100,
    estimatedMinutes: 90,
    difficulty: 'intermediate',
  },
  {
    id: 'c16',
    title: 'Champagne and the Marne valley',
    imageUrl: 'https://picsum.photos/seed/champagne-and-the-marne-valley/800/1000',
    subject: 'Food & Drink',
    countryCode: 'FR',
    description:
      'Champagne is sparkling wine made only in its namesake region of France, fermented ' +
      'a second time in the bottle. Learn the traditional method, from blending base ' +
      'wines to riddling, and why chalk soils matter.',
    locationIds: ['l-reims-cathedral'],
    learnerCount: 13400,
    estimatedMinutes: 60,
    difficulty: 'intermediate',
  },
  {
    id: 'c17',
    title: 'Diocletian Palace & Dalmatian stone',
    imageUrl: 'https://picsum.photos/seed/diocletian-palace-dalmatian-stone/800/1000',
    subject: 'Monuments & Architecture',
    countryCode: 'HR',
    description:
      'Emperor Diocletian built his retirement palace in Split around 300 AD using local ' +
      'limestone and Roman planning. Compare it with the stone squares of Trogir and ' +
      'Dubrovnik, built from the same Dalmatian stone.',
    locationIds: ['l-diocletian-palace-split', 'l-trogir-old-town', 'l-dubrovnik-old-town'],
    learnerCount: 18300,
    estimatedMinutes: 120,
    difficulty: 'intermediate',
    progress: 0.7,
  },
  {
    id: 'c18',
    title: 'Krka waterfalls and travertine',
    imageUrl: 'https://picsum.photos/seed/krka-waterfalls-and-travertine/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'HR',
    description:
      'Krka waterfalls form where river water deposits travertine, a porous rock built up ' +
      'by moss and algae. Learn how the freshwater ecosystem, from fish to aquatic ' +
      'insects, depends on clean flow and carbonate chemistry.',
    locationIds: ['l-krka-national-park'],
    learnerCount: 6900,
    estimatedMinutes: 90,
    difficulty: 'intermediate',
  },
  {
    id: 'c19',
    title: 'Klapa singing of Dalmatia',
    imageUrl: 'https://picsum.photos/seed/klapa-singing-of-dalmatia/800/1000',
    subject: 'Arts & Music',
    countryCode: 'HR',
    description:
      'Klapa is an unaccompanied male vocal style from Dalmatia, sung in close harmony by ' +
      'groups who often sing without scores. UNESCO added klapa singing to its intangible ' +
      'heritage list in 2012.',
    locationIds: ['l-diocletian-palace-split', 'l-trogir-old-town', 'l-dubrovnik-old-town'],
    learnerCount: 3800,
    estimatedMinutes: 30,
    difficulty: 'beginner',
  },
  {
    id: 'c20',
    title: 'Pelicans of Lake Skadar',
    imageUrl: 'https://picsum.photos/seed/pelicans-of-lake-skadar/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'ME',
    description:
      'Lake Skadar is a key breeding site for Dalmatian pelicans, which nest on rocky ' +
      'islets and reed-fringed shores. Learn how water levels, fishing and reed beds ' +
      'decide whether the colony succeeds each year.',
    locationIds: ['l-skadar-lake'],
    learnerCount: 2950,
    estimatedMinutes: 45,
    difficulty: 'beginner',
  },
  {
    id: 'c21',
    title: 'Kotor walls and the Bay of Kotor',
    imageUrl: 'https://picsum.photos/seed/kotor-walls-and-the-bay-of-kotor/800/1000',
    subject: 'Monuments & Architecture',
    countryCode: 'ME',
    description:
      'Kotor Old Town is enclosed by walls that climb the mountain behind it, linking the ' +
      'town to St John fortress. Learn how Venetian engineers designed the defenses and ' +
      'how the walls survived earthquakes and sieges.',
    locationIds: ['l-kotor-old-town', 'l-st-johns-fortress-kotor'],
    learnerCount: 17800,
    estimatedMinutes: 120,
    difficulty: 'intermediate',
    progress: 0.6,
  },
  {
    id: 'c22',
    title: 'Boka Bay fishing traditions',
    imageUrl: 'https://picsum.photos/seed/boka-bay-fishing-traditions/800/1000',
    subject: 'Culture & Traditions',
    countryCode: 'ME',
    description:
      'According to local legend, sailors from Perast built the island of Our Lady of the ' +
      'Rocks stone by stone. Learn how boats, nets and calm bay water shaped village ' +
      'life, and how the rite is still marked.',
    locationIds: ['l-our-lady-of-the-rocks', 'l-kotor-old-town'],
    learnerCount: 3400,
    estimatedMinutes: 45,
    difficulty: 'beginner',
  },
  {
    id: 'c23',
    title: 'Hanami: cherry blossom viewing',
    imageUrl: 'https://picsum.photos/seed/hanami-cherry-blossom-viewing/800/1000',
    subject: 'Culture & Traditions',
    countryCode: 'JP',
    description:
      'Hanami is the seasonal custom of picnicking under blossoming cherry trees, ' +
      'practiced across Japan for centuries. Learn how the Japan Meteorological Agency ' +
      'forecasts bloom dates and why parks fill fast in spring.',
    locationIds: ['l-philosophers-path', 'l-kiyomizu-dera'],
    learnerCount: 46200,
    estimatedMinutes: 60,
    difficulty: 'beginner',
  },
  {
    id: 'c24',
    title: 'Kyoto golden and zen temples',
    imageUrl: 'https://picsum.photos/seed/kyoto-golden-and-zen-temples/800/1000',
    subject: 'Monuments & Architecture',
    countryCode: 'JP',
    description:
      'Kinkaku-ji is covered in gold leaf and sits on a pond, while Kiyomizu-dera is ' +
      'built on wooden stilts over a hillside. Walk the Path of Philosophy and the torii ' +
      'of Fushimi Inari to see how temples fit into the city.',
    locationIds: [
      'l-kinkaku-ji',
      'l-kiyomizu-dera',
      'l-philosophers-path',
      'l-fushimi-inari-taisha',
    ],
    learnerCount: 24800,
    estimatedMinutes: 120,
    difficulty: 'intermediate',
  },
  {
    id: 'c25',
    title: 'Snow monkeys and hot springs',
    imageUrl: 'https://picsum.photos/seed/snow-monkeys-and-hot-springs/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'JP',
    description:
      'Japanese macaques at Jigokudani are among the northernmost wild monkeys on Earth ' +
      'and bathe in hot springs in winter. Learn how snow, food supply and social rank ' +
      'shape their behavior across a Nagano valley.',
    locationIds: ['l-jigokudani-snow-monkey-park'],
    learnerCount: 8800,
    estimatedMinutes: 60,
    difficulty: 'beginner',
  },
  {
    id: 'c26',
    title: 'Samurai and the Tokugawa shogunate',
    imageUrl: 'https://picsum.photos/seed/samurai-and-the-tokugawa-shogunate/800/1000',
    subject: 'History',
    countryCode: 'JP',
    description:
      'The Tokugawa shogunate ruled Japan from 1603 to 1868, a long era of strict class ' +
      'rules and peace. Study Nijo Castle, built in 1603 in Kyoto for Tokugawa Ieyasu, ' +
      'and how samurai served the state.',
    locationIds: ['l-nijo-castle'],
    learnerCount: 9700,
    estimatedMinutes: 150,
    difficulty: 'intermediate',
  },
  {
    id: 'c27',
    title: 'Tsukiji fish markets and sushi',
    imageUrl: 'https://picsum.photos/seed/tsukiji-fish-markets-and-sushi/800/1000',
    subject: 'Food & Drink',
    countryCode: 'JP',
    description:
      'The old Tsukiji fish market moved to Toyosu in 2018, but its outer market kept the ' +
      'shops that sell fresh seafood. Learn how sushi chefs judge tuna and why knife work ' +
      'matters before you taste a single piece.',
    locationIds: ['l-tsukiji-outer-market'],
    learnerCount: 7100,
    estimatedMinutes: 45,
    difficulty: 'beginner',
  },
  {
    id: 'c28',
    title: 'Pyramids of Giza engineering',
    imageUrl: 'https://picsum.photos/seed/pyramids-of-giza-engineering/800/1000',
    subject: 'Monuments & Architecture',
    countryCode: 'EG',
    description:
      'The Great Pyramid of Khufu was the tallest human-made structure for nearly four ' +
      'thousand years. Compare how its builders aligned the base to the compass and moved ' +
      'blocks with ramps and sledges.',
    locationIds: ['l-giza-pyramids', 'l-great-sphinx', 'l-egyptian-museum-cairo'],
    learnerCount: 41300,
    estimatedMinutes: 150,
    difficulty: 'intermediate',
  },
  {
    id: 'c29',
    title: 'Ramadan lanterns & iftar in Cairo',
    imageUrl: 'https://picsum.photos/seed/ramadan-lanterns-iftar-in-cairo/800/1000',
    subject: 'Culture & Traditions',
    countryCode: 'EG',
    description:
      'During Ramadan, Cairo streets hang with fanous lanterns, and families break the ' +
      'fast at sunset. Learn the customs of Al-Muizz Street, a medieval Fatimid ' +
      'thoroughfare that fills with night markets.',
    locationIds: ['l-al-muizz-street'],
    learnerCount: 5200,
    estimatedMinutes: 45,
    difficulty: 'beginner',
  },
  {
    id: 'c30',
    title: 'Valley of the Kings & New Kingdom',
    imageUrl: 'https://picsum.photos/seed/valley-of-the-kings-new-kingdom/800/1000',
    subject: 'History',
    countryCode: 'EG',
    description:
      'New Kingdom pharaohs were buried in rock-cut tombs in the Valley of the Kings near ' +
      'Luxor, hidden from tomb robbers. Compare the tomb of Tutankhamun, found in 1922, ' +
      'with Karnak temple and the Egyptian Museum.',
    locationIds: ['l-valley-of-the-kings', 'l-karnak-temple', 'l-egyptian-museum-cairo'],
    learnerCount: 19600,
    estimatedMinutes: 120,
    difficulty: 'intermediate',
  },
  {
    id: 'c31',
    title: 'Nile crocodiles of Lake Nasser',
    imageUrl: 'https://picsum.photos/seed/nile-crocodiles-of-lake-nasser/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'EG',
    description:
      'Lake Nasser, created by the Aswan High Dam, is home to Nile crocodiles that ' +
      'adapted to new shores. Learn how Abu Simbel and the lake fish stocks link to ' +
      'crocodile feeding ecology.',
    locationIds: ['l-abu-simbel'],
    learnerCount: 4300,
    estimatedMinutes: 60,
    difficulty: 'intermediate',
  },
  {
    id: 'c32',
    title: 'Taj Mahal and Mughal symmetry',
    imageUrl: 'https://picsum.photos/seed/taj-mahal-and-mughal-symmetry/800/1000',
    subject: 'Monuments & Architecture',
    countryCode: 'IN',
    description:
      'The Taj Mahal, completed around 1653, was built by Shah Jahan as a tomb for his ' +
      'wife Mumtaz Mahal. Study its symmetry, inlay work and gardens, then compare them ' +
      'with the red walls of Agra Fort.',
    locationIds: ['l-taj-mahal', 'l-agra-fort'],
    learnerCount: 22400,
    estimatedMinutes: 90,
    difficulty: 'intermediate',
  },
  {
    id: 'c33',
    title: 'Holi, the festival of colours',
    imageUrl: 'https://picsum.photos/seed/holi-the-festival-of-colours/800/1000',
    subject: 'Culture & Traditions',
    countryCode: 'IN',
    description:
      'Holi marks the arrival of spring and is celebrated with colored powder and water ' +
      'across India and abroad. Learn how stories, bonfires and street customs differ ' +
      'between northern and southern regions.',
    locationIds: [],
    learnerCount: 14700,
    estimatedMinutes: 30,
    difficulty: 'beginner',
  },
  {
    id: 'c34',
    title: 'Tigers of Ranthambore',
    imageUrl: 'https://picsum.photos/seed/tigers-of-ranthambore/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'IN',
    description:
      'Ranthambore, once a royal hunting ground, has one of the best-studied wild tiger ' +
      'populations in India. Learn how tigers use ruins and lakes, and how camera traps ' +
      'track individuals by stripe patterns.',
    locationIds: ['l-ranthambore-national-park'],
    learnerCount: 10600,
    estimatedMinutes: 90,
    difficulty: 'intermediate',
  },
  {
    id: 'c35',
    title: 'Rajasthani miniature painting',
    imageUrl: 'https://picsum.photos/seed/rajasthani-miniature-painting/800/1000',
    subject: 'Arts & Music',
    countryCode: 'IN',
    description:
      'Rajasthani miniatures were painted with fine brushes on paper and cloth, using ' +
      'mineral pigments and gold. Compare the palace painting of Jaipur City Palace and ' +
      'Amber Fort with the work of modern local painters.',
    locationIds: ['l-city-palace-jaipur', 'l-hawa-mahal-jaipur', 'l-amber-fort'],
    learnerCount: 5900,
    estimatedMinutes: 90,
    difficulty: 'intermediate',
  },
  {
    id: 'c36',
    title: 'Machu Picchu: Inca terraces',
    imageUrl: 'https://picsum.photos/seed/machu-picchu-inca-terraces/800/1000',
    subject: 'Monuments & Architecture',
    countryCode: 'PE',
    description:
      'Machu Picchu was built in the mid-1400s as a royal estate with terraces, temples ' +
      'and water channels. Learn how Inca stonework was fitted without mortar, and ' +
      'compare it with Sacsayhuaman in Cusco.',
    locationIds: ['l-machu-picchu', 'l-sacsayhuaman'],
    learnerCount: 39700,
    estimatedMinutes: 150,
    difficulty: 'intermediate',
  },
  {
    id: 'c37',
    title: 'Inti Raymi and the Inca calendar',
    imageUrl: 'https://picsum.photos/seed/inti-raymi-and-the-inca-calendar/800/1000',
    subject: 'Culture & Traditions',
    countryCode: 'PE',
    description:
      'Inti Raymi, the Festival of the Sun, is held in Cusco each June 24 and recreates a ' +
      'ritual of Inca times. Learn how solar alignments, Qorikancha and the Plaza de ' +
      'Armas tie the festival to the Inca calendar.',
    locationIds: ['l-sacsayhuaman', 'l-qorikancha', 'l-cusco-plaza-de-armas'],
    learnerCount: 8600,
    estimatedMinutes: 60,
    difficulty: 'intermediate',
  },
  {
    id: 'c38',
    title: 'Andean cloud forest hummingbirds',
    imageUrl: 'https://picsum.photos/seed/andean-cloud-forest-hummingbirds/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'PE',
    description:
      'Hummingbirds in the Andean cloud forest feed on nectar from flowers shaped to fit ' +
      'their long bills. Learn why these birds need a steady supply of flowers through ' +
      'the year and how cloud forest rain shapes their habitat.',
    locationIds: ['l-machu-picchu'],
    learnerCount: 3100,
    estimatedMinutes: 60,
    difficulty: 'beginner',
  },
  {
    id: 'c39',
    title: 'Great Barrier Reef coral bleaching',
    imageUrl: 'https://picsum.photos/seed/great-barrier-reef-coral-bleaching/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'AU',
    description:
      'Mass bleaching happens when water stays too warm for weeks, making corals expel ' +
      'the algae that feed them. Study the 2016 and 2017 bleaching events and how Heron ' +
      'Island supports recovery research.',
    locationIds: ['l-heron-island'],
    learnerCount: 48000,
    estimatedMinutes: 180,
    difficulty: 'advanced',
  },
  {
    id: 'c40',
    title: 'Songlines and Uluru Dreaming',
    imageUrl: 'https://picsum.photos/seed/songlines-and-uluru-dreaming/800/1000',
    subject: 'Culture & Traditions',
    countryCode: 'AU',
    description:
      'Songlines are paths across Australia that carry Dreaming stories and laws of ' +
      'Aboriginal peoples. Uluru is sacred to the Anangu people, who share management of ' +
      'the park, so its stories are told with care.',
    locationIds: ['l-uluru'],
    learnerCount: 12100,
    estimatedMinutes: 60,
    difficulty: 'intermediate',
  },
  {
    id: 'c41',
    title: 'Convict Australia: Port Arthur',
    imageUrl: 'https://picsum.photos/seed/convict-australia-port-arthur/800/1000',
    subject: 'History',
    countryCode: 'AU',
    description:
      'Port Arthur in Tasmania held convicts from the 1830s until 1877 as a major penal ' +
      'settlement. Study the separate prison system, convict workshops and the stone ' +
      'buildings of the town.',
    locationIds: ['l-port-arthur-historic-site'],
    learnerCount: 6200,
    estimatedMinutes: 90,
    difficulty: 'intermediate',
  },
  {
    id: 'c42',
    title: 'Australian rules football at the MCG',
    imageUrl: 'https://picsum.photos/seed/australian-rules-football-at-the-mcg/800/1000',
    subject: 'Sport & Games',
    countryCode: 'AU',
    description:
      'Australian rules football was codified in Melbourne in 1859 and is played on large ' +
      'ovals with four goal posts. Learn how the MCG, opened in 1853, hosts the AFL Grand ' +
      'Final and how scoring works.',
    locationIds: ['l-melbourne-cricket-ground'],
    learnerCount: 9400,
    estimatedMinutes: 60,
    difficulty: 'beginner',
  },
  {
    id: 'c43',
    title: 'Iceland hot springs & microbes',
    imageUrl: 'https://picsum.photos/seed/iceland-hot-springs-microbes/800/1000',
    subject: 'Nature & Wildlife',
    countryCode: 'IS',
    description:
      'The hot springs of Iceland host heat-loving microbes that thrive where few other ' +
      'organisms can survive. Compare the Blue Lagoon with the geyser Strokkur and ' +
      'Thingvellir, where two tectonic plates separate.',
    locationIds: ['l-blue-lagoon', 'l-strokkur-geysir', 'l-thingvellir', 'l-jokulsarlon'],
    learnerCount: 14500,
    estimatedMinutes: 120,
    difficulty: 'intermediate',
  },
  {
    id: 'c44',
    title: 'Glima: the ancient wrestling of Iceland',
    imageUrl: 'https://picsum.photos/seed/glima-the-ancient-wrestling-of-iceland/800/1000',
    subject: 'Sport & Games',
    countryCode: 'IS',
    description:
      'Glima is the traditional wrestling style of Iceland, with throws that use a belt, ' +
      'balance and leg work. Learn its main holds and how Icelandic clubs still teach it ' +
      'to children and adults.',
    locationIds: [],
    learnerCount: 1900,
    estimatedMinutes: 30,
    difficulty: 'beginner',
  },
  {
    id: 'c45',
    title: 'Thorrablot: Iceland midwinter feast',
    imageUrl: 'https://picsum.photos/seed/thorrablot-iceland-midwinter-feast/800/1000',
    subject: 'Culture & Traditions',
    countryCode: 'IS',
    description:
      'Thorrablot is an Icelandic midwinter feast held in January and February, centered ' +
      'on preserved foods. Learn how the 19th-century revival shaped its menu, from ' +
      'fermented shark to singed sheep head.',
    locationIds: [],
    learnerCount: 2700,
    estimatedMinutes: 30,
    difficulty: 'beginner',
  },
];

export const MOCK_SECTION_IDS: { continue: string[]; recommended: string[] } = {
  continue: ['c1', 'c12', 'c17', 'c21'],
  recommended: ['c6', 'c14', 'c23', 'c34', 'c40'],
};

export const MOCK_FEED_IDS: string[] = [
  'c2',
  'c8',
  'c10',
  'c15',
  'c20',
  'c25',
  'c31',
  'c36',
  'c39',
  'c44',
];
