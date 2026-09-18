export interface GeographyFact {
  id: string;
  topic: string;
  fact: string;
}

export const GEOGRAPHY_FACTS: GeographyFact[] = [
  {
    id: 'f1',
    topic: 'Equator',
    fact: 'The Equator is at 0° latitude and divides the Earth into two equal halves: Northern and Southern Hemispheres.',
  },
  {
    id: 'f2',
    topic: 'Prime Meridian',
    fact: 'The Prime Meridian passes directly through the Royal Observatory in Greenwich, England at 0° longitude.',
  },
  {
    id: 'f3',
    topic: 'Earth Tilt',
    fact: 'Earth’s rotational axis is tilted by 23.5 degrees, which causes our planet to experience different seasons!',
  },
  {
    id: 'f4',
    topic: 'Rotation & Time',
    fact: 'As Earth rotates 360° in 24 hours, it turns exactly 15° of longitude every hour (1° every 4 minutes).',
  },
  {
    id: 'f5',
    topic: 'Torrid Zone',
    fact: 'The area between the Tropic of Cancer (23½° N) and Tropic of Capricorn (23½° S) receives maximum sun heat!',
  },
  {
    id: 'f6',
    topic: 'Standard Meridian',
    fact: 'Indian Standard Time (IST) is calculated from 82°30’ E longitude and is 5 hours and 30 minutes ahead of GMT.',
  },
  {
    id: 'f7',
    topic: 'Compass Needles',
    fact: 'A magnetic compass needle always aligns with the magnetic field lines of the Earth to point towards North.',
  },
  {
    id: 'f8',
    topic: 'Graticule Grid',
    fact: 'The criss-cross pattern of latitudes and longitudes is called a graticule, allowing GPS to locate any spot on Earth!',
  },
];
