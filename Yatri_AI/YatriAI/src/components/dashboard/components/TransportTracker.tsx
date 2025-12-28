import React, { useState, useEffect, useCallback } from 'react';
import { 
  Train, Bus, Clock, Navigation, Info, Volume2, 
  Sparkles, RefreshCw, Zap, MapPin, IndianRupee, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MagicCard } from '../../magicui/MagicCard';
import { BorderBeam } from '../../magicui/BorderBeam';
import { ShimmerButton } from '../../magicui/ShimmerButton';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { BlurFade } from '../../magicui/BlurFade';
import { TramIcon, HowrahBridgeIcon } from '../../kolkata/KolkataIcons';
import { transportService } from '../../../lib/services/transport.service';
import TransportBookingModal from './TransportBookingModal';

// Kolkata Transport Data
const tramRoutes = [
  {
    id: 'tram-36',
    routeNumber: '36',
    name: 'Esplanade - Gariahat',
    from: 'Esplanade',
    to: 'Gariahat',
    stops: [
      { name: 'Esplanade', heritage: 'British-era commercial hub, near Victoria Memorial' },
      { name: 'Park Street', heritage: 'The party street of Kolkata, historic restaurants since 1800s' },
      { name: 'Hazra', heritage: 'Educational hub, near Presidency University' },
      { name: 'Kalighat', heritage: 'One of 51 Shakti Peethas, ancient Kali temple' },
      { name: 'Gariahat', heritage: 'Famous shopping district, traditional saree hub' }
    ],
    frequency: '15 min',
    status: 'running',
    nextArrival: 3,
    color: '#FFB800'
  },
  {
    id: 'tram-5',
    routeNumber: '5',
    name: 'Howrah Station - Esplanade',
    from: 'Howrah Station',
    to: 'Esplanade',
    stops: [
      { name: 'Howrah Station', heritage: 'Iconic railway terminus, built 1854, 23 platforms' },
      { name: 'Howrah Bridge', heritage: 'Cantilever bridge over Hooghly, no nuts & bolts used!' },
      { name: 'BBD Bagh', heritage: 'Writers\' Building, colonial-era administrative hub' },
      { name: 'Esplanade', heritage: 'Heart of Kolkata, near Victoria Memorial' }
    ],
    frequency: '20 min',
    status: 'running',
    nextArrival: 8,
    color: '#E23D28'
  },
  {
    id: 'tram-25',
    routeNumber: '25',
    name: 'Shyambazar - Tollygunge',
    from: 'Shyambazar',
    to: 'Tollygunge',
    stops: [
      { name: 'Shyambazar', heritage: 'Historic north Kolkata, famous Durga Puja pandals' },
      { name: 'Bagbazar', heritage: 'One of the oldest Durga Puja pandals (since 1919)' },
      { name: 'Sealdah', heritage: 'Major railway terminus, connects to entire Bengal' },
      { name: 'Park Circus', heritage: 'Multi-cultural area, famous for Biryani' },
      { name: 'Tollygunge', heritage: 'Tollywood film studios, Bengali cinema hub' }
    ],
    frequency: '12 min',
    status: 'delayed',
    nextArrival: 15,
    color: '#C45C26'
  },
  {
    id: 'tram-24',
    routeNumber: '24',
    name: 'Ballygunge - Khidirpur',
    from: 'Ballygunge',
    to: 'Khidirpur',
    stops: [
      { name: 'Ballygunge', heritage: 'Residential area, famous for Durga Puja' },
      { name: 'Park Circus', heritage: 'Multi-cultural area, famous for Biryani' },
      { name: 'Maidan', heritage: 'Largest urban park in India' },
      { name: 'Khidirpur', heritage: 'Historic dock area, maritime heritage' }
    ],
    frequency: '18 min',
    status: 'running',
    nextArrival: 6,
    color: '#FFB800'
  },
  {
    id: 'tram-29',
    routeNumber: '29',
    name: 'Rajabazar - Ballygunge',
    from: 'Rajabazar',
    to: 'Ballygunge',
    stops: [
      { name: 'Rajabazar', heritage: 'Historic area, near College Street' },
      { name: 'Sealdah', heritage: 'Major railway terminus' },
      { name: 'Park Circus', heritage: 'Multi-cultural hub' },
      { name: 'Ballygunge', heritage: 'Residential and cultural area' }
    ],
    frequency: '14 min',
    status: 'running',
    nextArrival: 4,
    color: '#E23D28'
  },
  {
    id: 'tram-30',
    routeNumber: '30',
    name: 'Tollygunge - Ballygunge',
    from: 'Tollygunge',
    to: 'Ballygunge',
    stops: [
      { name: 'Tollygunge', heritage: 'Tollywood film studios' },
      { name: 'Kalighat', heritage: 'Ancient Kali temple' },
      { name: 'Hazra', heritage: 'Educational hub' },
      { name: 'Ballygunge', heritage: 'Residential area' }
    ],
    frequency: '16 min',
    status: 'running',
    nextArrival: 7,
    color: '#C45C26'
  },
  {
    id: 'tram-37',
    routeNumber: '37',
    name: 'Esplanade - Khidirpur',
    from: 'Esplanade',
    to: 'Khidirpur',
    stops: [
      { name: 'Esplanade', heritage: 'Heart of Kolkata' },
      { name: 'Maidan', heritage: 'Largest urban park' },
      { name: 'Khidirpur', heritage: 'Historic dock area' }
    ],
    frequency: '22 min',
    status: 'running',
    nextArrival: 10,
    color: '#FFB800'
  },
  {
    id: 'tram-38',
    routeNumber: '38',
    name: 'Shyambazar - Esplanade',
    from: 'Shyambazar',
    to: 'Esplanade',
    stops: [
      { name: 'Shyambazar', heritage: 'Historic north Kolkata' },
      { name: 'Sovabazar', heritage: 'Raja Ram Mohan Roy\'s residence' },
      { name: 'Central', heritage: 'Central Kolkata hub' },
      { name: 'Esplanade', heritage: 'Heart of Kolkata' }
    ],
    frequency: '19 min',
    status: 'running',
    nextArrival: 9,
    color: '#E23D28'
  },
  {
    id: 'tram-39',
    routeNumber: '39',
    name: 'Gariahat - Howrah Station',
    from: 'Gariahat',
    to: 'Howrah Station',
    stops: [
      { name: 'Gariahat', heritage: 'Famous shopping district' },
      { name: 'Park Street', heritage: 'Historic restaurants' },
      { name: 'Esplanade', heritage: 'Heart of Kolkata' },
      { name: 'Howrah Bridge', heritage: 'Iconic bridge' },
      { name: 'Howrah Station', heritage: 'Railway terminus' }
    ],
    frequency: '25 min',
    status: 'running',
    nextArrival: 12,
    color: '#C45C26'
  },
  {
    id: 'tram-40',
    routeNumber: '40',
    name: 'Ballygunge - Sealdah',
    from: 'Ballygunge',
    to: 'Sealdah',
    stops: [
      { name: 'Ballygunge', heritage: 'Residential area' },
      { name: 'Park Circus', heritage: 'Multi-cultural hub' },
      { name: 'Sealdah', heritage: 'Major railway terminus' }
    ],
    frequency: '17 min',
    status: 'running',
    nextArrival: 5,
    color: '#FFB800'
  }
];

// Metro Lines - 10 routes (2 per color: Blue, Green, Purple, Orange, Yellow)
const metroLines = [
  // 🔵 BLUE LINE (2)
  {
    id: 'metro-blue-1',
    name: 'Blue Line (Line 1)',
    from: 'Dakshineswar',
    to: 'Kavi Subhash',
    stops: [
      { name: 'Dakshineswar', heritage: 'Famous Kali Temple' },
      { name: 'Shyambazar', heritage: 'Historic North Kolkata' },
      { name: 'Central', heritage: 'Chandni Chowk area' },
      { name: 'Park Street', heritage: 'Iconic street' },
      { name: 'Kavi Subhash', heritage: 'Southern terminal' }
    ],
    status: 'running',
    frequency: '5 min',
    nextTrain: 2,
    color: '#1E3A5F'
  },
  {
    id: 'metro-blue-2',
    name: 'Blue Line Extension',
    from: 'Kavi Subhash',
    to: 'New Garia',
    stops: [
      { name: 'Kavi Subhash', heritage: 'Metro hub' },
      { name: 'Hemanta Mukhopadhyay', heritage: 'Legendary singer' },
      { name: 'New Garia', heritage: 'Southern suburb' }
    ],
    status: 'running',
    frequency: '7 min',
    nextTrain: 3,
    color: '#1E3A5F'
  },

  // 🟢 GREEN LINE (2)
  {
    id: 'metro-green-1',
    name: 'Green Line (East–West)',
    from: 'Howrah Maidan',
    to: 'Salt Lake Sector V',
    stops: [
      { name: 'Howrah Maidan', heritage: 'Under-river tunnel' },
      { name: 'Esplanade', heritage: 'Heart of Kolkata' },
      { name: 'Sealdah', heritage: 'Major railway station' },
      { name: 'Sector V', heritage: 'IT hub' }
    ],
    status: 'running',
    frequency: '8 min',
    nextTrain: 4,
    color: '#2D5A27'
  },
  {
    id: 'metro-green-2',
    name: 'Green Line Extension',
    from: 'Sector V',
    to: 'Sealdah',
    stops: [
      { name: 'Sector V', heritage: 'IT district' },
      { name: 'Phoolbagan', heritage: 'Residential area' },
      { name: 'Sealdah', heritage: 'Historic terminus' }
    ],
    status: 'running',
    frequency: '9 min',
    nextTrain: 5,
    color: '#2D5A27'
  },

  // 🟣 PURPLE LINE (2)
  {
    id: 'metro-purple-1',
    name: 'Purple Line',
    from: 'Joka',
    to: 'Majerhat',
    stops: [
      { name: 'Joka', heritage: 'Near IIM Calcutta' },
      { name: 'Behala', heritage: 'Dense residential zone' },
      { name: 'Majerhat', heritage: 'Railway interchange' }
    ],
    status: 'running',
    frequency: '10 min',
    nextTrain: 6,
    color: '#7B2CBF'
  },
  {
    id: 'metro-purple-2',
    name: 'Purple Line Extension',
    from: 'Majerhat',
    to: 'Esplanade',
    stops: [
      { name: 'Majerhat', heritage: 'Circular Railway' },
      { name: 'Park Circus', heritage: 'Cultural hub' },
      { name: 'Esplanade', heritage: 'Central Kolkata' }
    ],
    status: 'running',
    frequency: '12 min',
    nextTrain: 7,
    color: '#7B2CBF'
  },

  // 🟠 ORANGE LINE (2)
  {
    id: 'metro-orange-1',
    name: 'Orange Line',
    from: 'Kavi Subhash',
    to: 'Beleghata',
    stops: [
      { name: 'Kavi Subhash', heritage: 'Southern metro hub' },
      { name: 'EM Bypass', heritage: 'Eastern corridor' },
      { name: 'Beleghata', heritage: 'Eastern Kolkata' }
    ],
    status: 'running',
    frequency: '12 min',
    nextTrain: 8,
    color: '#FF6B35'
  },
  {
    id: 'metro-orange-2',
    name: 'Orange Line Extension',
    from: 'Beleghata',
    to: 'Dum Dum',
    stops: [
      { name: 'Beleghata', heritage: 'Residential area' },
      { name: 'Shyambazar', heritage: 'Historic junction' },
      { name: 'Dum Dum', heritage: 'Airport zone' }
    ],
    status: 'running',
    frequency: '14 min',
    nextTrain: 9,
    color: '#FF6B35'
  },

  // 🟡 YELLOW LINE (2)
  {
    id: 'metro-yellow-1',
    name: 'Yellow Line',
    from: 'Noapara',
    to: 'Jai Hind (Airport)',
    stops: [
      { name: 'Noapara', heritage: 'Northern suburb' },
      { name: 'Dum Dum', heritage: 'Airport access' },
      { name: 'Jai Hind', heritage: 'International Airport' }
    ],
    status: 'running',
    frequency: '15 min',
    nextTrain: 5,
    color: '#FFD700'
  },
  {
    id: 'metro-yellow-2',
    name: 'Yellow Line Extension',
    from: 'Jai Hind',
    to: 'Dakshineswar',
    stops: [
      { name: 'Jai Hind', heritage: 'Airport terminal' },
      { name: 'Baranagar', heritage: 'Residential area' },
      { name: 'Dakshineswar', heritage: 'Kali Temple' }
    ],
    status: 'running',
    frequency: '18 min',
    nextTrain: 10,
    color: '#FFD700'
  }
];

const localTrains = [
  {
    id: 'sealdah-main',
    name: 'Sealdah Main Line',
    from: 'Sealdah',
    to: 'Ranaghat',
    majorStops: ['Sealdah', 'Dum Dum Jn', 'Barrackpore', 'Naihati', 'Ranaghat'],
    frequency: '10 min',
    status: 'running',
    nextTrain: 5,
    heritage: 'Connects to Krishnanagar, the clay idol hub'
  },
  {
    id: 'howrah-main',
    name: 'Howrah Main Line',
    from: 'Howrah',
    to: 'Bardhaman',
    majorStops: ['Howrah', 'Liluah', 'Bandel', 'Hooghly', 'Bardhaman'],
    frequency: '15 min',
    status: 'running',
    nextTrain: 8,
    heritage: 'Passes through historic Bandel Church area'
  },
  {
    id: 'circular',
    name: 'Kolkata Circular Railway',
    from: 'Majerhat',
    to: 'Dum Dum',
    majorStops: ['Majerhat', 'Park Circus', 'Ballygunge', 'Bidhannagar', 'Dum Dum'],
    frequency: '20 min',
    status: 'delayed',
    nextTrain: 12,
    heritage: 'Historic circular route, British-era infrastructure'
  },
  {
    id: 'sealdah-south',
    name: 'Sealdah South Line',
    from: 'Sealdah',
    to: 'Diamond Harbour',
    majorStops: ['Sealdah', 'Budge Budge', 'Diamond Harbour'],
    frequency: '12 min',
    status: 'running',
    nextTrain: 6,
    heritage: 'Connects to historic port area'
  },
  {
    id: 'howrah-kharagpur',
    name: 'Howrah-Kharagpur Line',
    from: 'Howrah',
    to: 'Kharagpur',
    majorStops: ['Howrah', 'Santragachi', 'Kharagpur'],
    frequency: '18 min',
    status: 'running',
    nextTrain: 9,
    heritage: 'Connects to IIT Kharagpur area'
  },
  {
    id: 'sealdah-canning',
    name: 'Sealdah-Canning Line',
    from: 'Sealdah',
    to: 'Canning',
    majorStops: ['Sealdah', 'Sonarpur', 'Canning'],
    frequency: '14 min',
    status: 'running',
    nextTrain: 7,
    heritage: 'Sundarbans gateway route'
  },
  {
    id: 'howrah-ampata',
    name: 'Howrah-Ampata Line',
    from: 'Howrah',
    to: 'Ampata',
    majorStops: ['Howrah', 'Uluberia', 'Ampata'],
    frequency: '16 min',
    status: 'running',
    nextTrain: 8,
    heritage: 'Industrial area connection'
  },
  {
    id: 'sealdah-bongaon',
    name: 'Sealdah-Bongaon Line',
    from: 'Sealdah',
    to: 'Bongaon',
    majorStops: ['Sealdah', 'Barasat', 'Bongaon'],
    frequency: '13 min',
    status: 'running',
    nextTrain: 6,
    heritage: 'Border area connection'
  },
  {
    id: 'howrah-medinipur',
    name: 'Howrah-Medinipur Line',
    from: 'Howrah',
    to: 'Medinipur',
    majorStops: ['Howrah', 'Kharagpur', 'Medinipur'],
    frequency: '20 min',
    status: 'running',
    nextTrain: 11,
    heritage: 'Historic town connection'
  },
  {
    id: 'sealdah-krishnanagar',
    name: 'Sealdah-Krishnanagar Line',
    from: 'Sealdah',
    to: 'Krishnanagar',
    majorStops: ['Sealdah', 'Ranaghat', 'Krishnanagar'],
    frequency: '11 min',
    status: 'running',
    nextTrain: 5,
    heritage: 'Clay idol hub connection'
  },
  {
    id: 'howrah-serampore',
    name: 'Howrah-Serampore Line',
    from: 'Howrah',
    to: 'Serampore',
    majorStops: ['Howrah', 'Bandel', 'Serampore'],
    frequency: '17 min',
    status: 'running',
    nextTrain: 9,
    heritage: 'Historic Danish settlement area'
  },
  {
    id: 'sealdah-hasnabad',
    name: 'Sealdah-Hasnabad Line',
    from: 'Sealdah',
    to: 'Hasnabad',
    majorStops: ['Sealdah', 'Barasat', 'Hasnabad'],
    frequency: '19 min',
    status: 'delayed',
    nextTrain: 15,
    heritage: 'Rural Bengal connection'
  }
];

const busRoutes = [
  {
    id: 'bus-s12',
    routeNumber: 'S12',
    name: 'Airport - Howrah',
    from: 'Airport',
    to: 'Howrah',
    type: 'AC Volvo',
    frequency: '20 min',
    status: 'running',
    nextBus: 7,
    heritage: 'Passes through Salt Lake IT hub and BBD Bagh'
  },
  {
    id: 'bus-230',
    routeNumber: '230',
    name: 'Garia - Esplanade',
    from: 'Garia',
    to: 'Esplanade',
    type: 'Non-AC',
    frequency: '10 min',
    status: 'running',
    nextBus: 3,
    heritage: 'Historic South Kolkata to Central route'
  },
  {
    id: 'bus-heritage',
    routeNumber: 'H1',
    name: 'Heritage Special',
    from: 'Victoria Memorial',
    to: 'Howrah Bridge',
    type: 'Heritage Bus',
    frequency: '30 min',
    status: 'running',
    nextBus: 15,
    heritage: 'Special heritage route with audio guide onboard!'
  },
  {
    id: 'bus-101',
    routeNumber: '101',
    name: 'Esplanade - Salt Lake',
    from: 'Esplanade',
    to: 'Salt Lake Sector V',
    type: 'AC',
    frequency: '12 min',
    status: 'running',
    nextBus: 4,
    heritage: 'IT hub connection route'
  },
  {
    id: 'bus-202',
    routeNumber: '202',
    name: 'Howrah - Sealdah',
    from: 'Howrah',
    to: 'Sealdah',
    type: 'Non-AC',
    frequency: '8 min',
    status: 'running',
    nextBus: 2,
    heritage: 'Major station connection'
  },
  {
    id: 'bus-303',
    routeNumber: '303',
    name: 'Park Street - Gariahat',
    from: 'Park Street',
    to: 'Gariahat',
    type: 'AC',
    frequency: '15 min',
    status: 'running',
    nextBus: 6,
    heritage: 'Shopping and dining route'
  },
  {
    id: 'bus-404',
    routeNumber: '404',
    name: 'Dum Dum - Tollygunge',
    from: 'Dum Dum',
    to: 'Tollygunge',
    type: 'Non-AC',
    frequency: '18 min',
    status: 'running',
    nextBus: 8,
    heritage: 'North to South connection'
  },
  {
    id: 'bus-505',
    routeNumber: '505',
    name: 'Ballygunge - Howrah',
    from: 'Ballygunge',
    to: 'Howrah',
    type: 'AC Volvo',
    frequency: '22 min',
    status: 'running',
    nextBus: 10,
    heritage: 'Residential to station route'
  },
  {
    id: 'bus-606',
    routeNumber: '606',
    name: 'Kalighat - Shyambazar',
    from: 'Kalighat',
    to: 'Shyambazar',
    type: 'Non-AC',
    frequency: '14 min',
    status: 'running',
    nextBus: 5,
    heritage: 'Temple to historic area route'
  },
  {
    id: 'bus-707',
    routeNumber: '707',
    name: 'Esplanade - New Market',
    from: 'Esplanade',
    to: 'New Market',
    type: 'AC',
    frequency: '9 min',
    status: 'running',
    nextBus: 3,
    heritage: 'Shopping hub connection'
  },
  {
    id: 'bus-808',
    routeNumber: '808',
    name: 'Park Circus - Airport',
    from: 'Park Circus',
    to: 'Airport',
    type: 'AC Volvo',
    frequency: '25 min',
    status: 'running',
    nextBus: 12,
    heritage: 'Airport express route'
  },
  {
    id: 'bus-909',
    routeNumber: '909',
    name: 'Sealdah - Garia',
    from: 'Sealdah',
    to: 'Garia',
    type: 'Non-AC',
    frequency: '16 min',
    status: 'running',
    nextBus: 7,
    heritage: 'Station to residential route'
  },
  {
    id: 'bus-1010',
    routeNumber: '1010',
    name: 'Howrah - Park Street',
    from: 'Howrah',
    to: 'Park Street',
    type: 'AC',
    frequency: '11 min',
    status: 'running',
    nextBus: 4,
    heritage: 'Historic street connection'
  },
  {
    id: 'bus-heritage2',
    routeNumber: 'H2',
    name: 'Heritage Route 2',
    from: 'Victoria Memorial',
    to: 'College Street',
    type: 'Heritage Bus',
    frequency: '35 min',
    status: 'running',
    nextBus: 18,
    heritage: 'Cultural heritage route with guided tour'
  }
];

// Debug: Log metro lines at module load
console.log('📋 TransportTracker module loaded. metroLines count:', metroLines.length);
console.log('📋 Metro line names:', metroLines.map(m => m.name));

// Helper function to parse frequency string to minutes
const parseFrequency = (frequency: string): number => {
  if (!frequency) return 10;
  const match = frequency.match(/\d+/);
  return match ? parseInt(match[0], 10) : 10;
};

// Initialize routes with timestamps for real-time tracking
const initializeRoutesWithTimestamps = (routes: any[]) => {
  const now = Date.now();
  return routes.map(route => ({
    ...route,
    baseArrival: route.baseArrival ?? route.nextArrival ?? route.nextTrain ?? route.nextBus ?? Math.floor(Math.random() * 10) + 3,
    lastUpdated: now,
    status: route.status ?? 'running',
  }));
};

// Add extra routes to ensure minimum count per category
const addExtraRoutes = (routes: any[], count: number, type: string) => {
  const now = Date.now();
  
  // If we already have enough routes, return as is
  if (routes.length >= count) {
    return routes;
  }
  
  const needed = count - routes.length;
  
  return [
    ...routes,
    ...Array.from({ length: needed }).map((_, index) => {
      const base = routes[index % routes.length];
      
      return {
        ...base,
        id: `${type}-extra-${now}-${index}`,
        name: `${base.name || type.toUpperCase()} Extra ${index + 1}`,
        baseArrival: Math.floor(Math.random() * 10) + 3,
        lastUpdated: now,
        status: 'running' as const,
      };
    }),
  ];
};

const TransportTracker: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'tram' | 'metro' | 'train' | 'bus'>('tram');
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [bookingRoute, setBookingRoute] = useState<any>(null);
  const [isLive, setIsLive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Live transport data state - initialized with fallback data, will be updated by API fetch
  const [liveTramRoutes, setLiveTramRoutes] = useState<any[]>([]);
  const [liveMetroLines, setLiveMetroLines] = useState<any[]>([]);
  const [liveLocalTrains, setLiveLocalTrains] = useState<any[]>([]);
  const [liveBusRoutes, setLiveBusRoutes] = useState<any[]>([]);

  // Real-time update function with status changes
  const updateTransportData = useCallback(() => {
    const now = Date.now();
    
    // Update tram routes
    setLiveTramRoutes(prev => prev.map(route => {
      const frequency = parseFrequency(route.frequency);
      const timeSinceUpdate = Math.floor((now - route.lastUpdated) / 60000); // minutes
      let newArrival = route.baseArrival - timeSinceUpdate;
      
      // If arrival time reaches 0 or below, reset to frequency
      if (newArrival <= 0) {
        newArrival = frequency + Math.floor(Math.random() * 3); // Add some randomness
      }
      
      // Randomly change status (5% chance to become delayed, 1% chance to become suspended)
      let newStatus = route.status;
      if (Math.random() < 0.05 && route.status === 'running') {
        newStatus = 'delayed';
      } else if (Math.random() < 0.01 && route.status === 'delayed') {
        newStatus = 'suspended';
      } else if (Math.random() < 0.1 && route.status !== 'running') {
        newStatus = 'running';
      }
      
      // If delayed, add extra minutes
      if (newStatus === 'delayed' && route.status === 'running') {
        newArrival += Math.floor(Math.random() * 5) + 2;
      }
      
      return {
        ...route,
        nextArrival: Math.max(0, newArrival),
        status: newStatus,
        lastUpdated: now,
        baseArrival: newArrival,
      };
    }));

    // Update metro lines
    setLiveMetroLines(prev => prev.map(route => {
      const frequency = parseFrequency(route.frequency);
      const timeSinceUpdate = Math.floor((now - route.lastUpdated) / 60000);
      let newArrival = route.baseArrival - timeSinceUpdate;
      
      if (newArrival <= 0) {
        newArrival = frequency + Math.floor(Math.random() * 2);
      }
      
      let newStatus = route.status;
      if (Math.random() < 0.03 && route.status === 'running') {
        newStatus = 'delayed';
      } else if (Math.random() < 0.15 && route.status !== 'running') {
        newStatus = 'running';
      }
      
      if (newStatus === 'delayed' && route.status === 'running') {
        newArrival += Math.floor(Math.random() * 3) + 1;
      }
      
      return {
        ...route,
        nextTrain: Math.max(0, newArrival),
        status: newStatus,
        lastUpdated: now,
        baseArrival: newArrival,
      };
    }));

    // Update local trains
    setLiveLocalTrains(prev => prev.map(route => {
      const frequency = parseFrequency(route.frequency);
      const timeSinceUpdate = Math.floor((now - route.lastUpdated) / 60000);
      let newArrival = route.baseArrival - timeSinceUpdate;
      
      if (newArrival <= 0) {
        newArrival = frequency + Math.floor(Math.random() * 4);
      }
      
      let newStatus = route.status;
      if (Math.random() < 0.06 && route.status === 'running') {
        newStatus = 'delayed';
      } else if (Math.random() < 0.12 && route.status !== 'running') {
        newStatus = 'running';
      }
      
      if (newStatus === 'delayed' && route.status === 'running') {
        newArrival += Math.floor(Math.random() * 4) + 2;
      }
      
      return {
        ...route,
        nextTrain: Math.max(0, newArrival),
        status: newStatus,
        lastUpdated: now,
        baseArrival: newArrival,
      };
    }));

    // Update bus routes
    setLiveBusRoutes(prev => prev.map(route => {
      const frequency = parseFrequency(route.frequency);
      const timeSinceUpdate = Math.floor((now - route.lastUpdated) / 60000);
      let newArrival = route.baseArrival - timeSinceUpdate;
      
      if (newArrival <= 0) {
        newArrival = frequency + Math.floor(Math.random() * 5);
      }
      
      let newStatus = route.status;
      if (Math.random() < 0.08 && route.status === 'running') {
        newStatus = 'delayed';
      } else if (Math.random() < 0.1 && route.status !== 'running') {
        newStatus = 'running';
      }
      
      if (newStatus === 'delayed' && route.status === 'running') {
        newArrival += Math.floor(Math.random() * 6) + 3;
      }
      
      return {
        ...route,
        nextBus: Math.max(0, newArrival),
        status: newStatus,
        lastUpdated: now,
        baseArrival: newArrival,
      };
    }));
  }, []);

  // Fetch initial data from API on mount (+ ensure 10 routes per category)
  useEffect(() => {
    const fetchInitialData = async () => {
      console.log('🚀 TransportTracker: Initializing with metroLines:', metroLines.length, 'routes');
      console.log('🚀 Metro line names:', metroLines.map(m => m.name));
      
      try {
        const transportData = await transportService.getAllTransportData();
        
        // Trams - ensure at least 10 routes
        if (transportData.trams?.success && transportData.trams.data) {
          const base = initializeRoutesWithTimestamps(transportData.trams.data);
          setLiveTramRoutes(addExtraRoutes(base, 10, 'tram'));
        } else {
          // Fallback to local data and ensure 10 routes
          const base = initializeRoutesWithTimestamps(tramRoutes);
          setLiveTramRoutes(addExtraRoutes(base, 10, 'tram'));
        }
        
        // Metro - Always use local metroLines (has all 10 routes: 2 per color)
        // API data might have incomplete routes, so we always use local data
        console.log('✅ Using local metroLines data (10 routes: 2 Blue, 2 Green, 2 Purple, 2 Orange, 2 Yellow)');
        const metroBase = initializeRoutesWithTimestamps(metroLines);
        // metroLines already has 10 routes, so addExtraRoutes will just return them as-is
        const metroRoutes = addExtraRoutes(metroBase, 10, 'metro');
        console.log(`✅ Loaded ${metroRoutes.length} metro lines:`, metroRoutes.map(r => r.name));
        setLiveMetroLines(metroRoutes);
        
        // Local Trains - ensure at least 10 routes
        if (transportData.trains?.success && transportData.trains.data) {
          const base = initializeRoutesWithTimestamps(transportData.trains.data);
          setLiveLocalTrains(addExtraRoutes(base, 10, 'train'));
        } else {
          // Fallback to local data and ensure 10 routes
          const base = initializeRoutesWithTimestamps(localTrains);
          setLiveLocalTrains(addExtraRoutes(base, 10, 'train'));
        }
        
        // Buses - ensure at least 10 routes
        if (transportData.buses?.success && transportData.buses.data) {
          const base = initializeRoutesWithTimestamps(transportData.buses.data);
          setLiveBusRoutes(addExtraRoutes(base, 10, 'bus'));
        } else {
          // Fallback to local data and ensure 10 routes
          const base = initializeRoutesWithTimestamps(busRoutes);
          setLiveBusRoutes(addExtraRoutes(base, 10, 'bus'));
        }
      } catch (error) {
        console.error('Error fetching initial transport data:', error);
        // Fallback to local data with 10+ routes each
        const tramBase = initializeRoutesWithTimestamps(tramRoutes);
        const metroBase = initializeRoutesWithTimestamps(metroLines);
        const trainBase = initializeRoutesWithTimestamps(localTrains);
        const busBase = initializeRoutesWithTimestamps(busRoutes);
        
        setLiveTramRoutes(addExtraRoutes(tramBase, 10, 'tram'));
        const metroRoutes = addExtraRoutes(metroBase, 10, 'metro');
        console.log(`✅ Error fallback: Loaded ${metroRoutes.length} metro lines:`, metroRoutes.map(r => r.name));
        setLiveMetroLines(metroRoutes);
        setLiveLocalTrains(addExtraRoutes(trainBase, 10, 'train'));
        setLiveBusRoutes(addExtraRoutes(busBase, 10, 'bus'));
      }
    };
    
    fetchInitialData();
  }, []);

  // Real-time countdown updates every 10 seconds for smooth display
  useEffect(() => {
    if (!isLive) return;
    
    // Update immediately
    updateTransportData();
    
    // Update countdown every 10 seconds for smooth display
    const countdownInterval = setInterval(() => {
      const now = Date.now();
      
      // Update countdowns without changing status
      setLiveTramRoutes(prev => prev.map(route => {
        const timeSinceUpdate = Math.floor((now - route.lastUpdated) / 60000);
        let newArrival = route.baseArrival - timeSinceUpdate;
        const frequency = parseFrequency(route.frequency);
        
        if (newArrival <= 0) {
          newArrival = frequency + Math.floor(Math.random() * 3);
          return { ...route, nextArrival: newArrival, baseArrival: newArrival, lastUpdated: now };
        }
        
        return { ...route, nextArrival: Math.max(0, newArrival) };
      }));
      
      setLiveMetroLines(prev => prev.map(route => {
        const timeSinceUpdate = Math.floor((now - route.lastUpdated) / 60000);
        let newArrival = route.baseArrival - timeSinceUpdate;
        const frequency = parseFrequency(route.frequency);
        
        if (newArrival <= 0) {
          newArrival = frequency + Math.floor(Math.random() * 2);
          return { ...route, nextTrain: newArrival, baseArrival: newArrival, lastUpdated: now };
        }
        
        return { ...route, nextTrain: Math.max(0, newArrival) };
      }));
      
      setLiveLocalTrains(prev => prev.map(route => {
        const timeSinceUpdate = Math.floor((now - route.lastUpdated) / 60000);
        let newArrival = route.baseArrival - timeSinceUpdate;
        const frequency = parseFrequency(route.frequency);
        
        if (newArrival <= 0) {
          newArrival = frequency + Math.floor(Math.random() * 4);
          return { ...route, nextTrain: newArrival, baseArrival: newArrival, lastUpdated: now };
        }
        
        return { ...route, nextTrain: Math.max(0, newArrival) };
      }));
      
      setLiveBusRoutes(prev => prev.map(route => {
        const timeSinceUpdate = Math.floor((now - route.lastUpdated) / 60000);
        let newArrival = route.baseArrival - timeSinceUpdate;
        const frequency = parseFrequency(route.frequency);
        
        if (newArrival <= 0) {
          newArrival = frequency + Math.floor(Math.random() * 5);
          return { ...route, nextBus: newArrival, baseArrival: newArrival, lastUpdated: now };
        }
        
        return { ...route, nextBus: Math.max(0, newArrival) };
      }));
    }, 10000); // Update every 10 seconds
    
    // Full update with status changes every minute
    const fullUpdateInterval = setInterval(() => {
      updateTransportData();
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 500);
    }, 60000); // Full update every minute

    return () => {
      clearInterval(countdownInterval);
      clearInterval(fullUpdateInterval);
    };
  }, [isLive, updateTransportData]);

  // Update selected route when live data changes
  useEffect(() => {
    if (!selectedRoute) return;
    
    let updatedRoute = null;
    switch (activeTab) {
      case 'tram':
        updatedRoute = liveTramRoutes.find(r => r.id === selectedRoute.id);
        break;
      case 'metro':
        updatedRoute = liveMetroLines.find(r => r.id === selectedRoute.id);
        break;
      case 'train':
        updatedRoute = liveLocalTrains.find(r => r.id === selectedRoute.id);
        break;
      case 'bus':
        updatedRoute = liveBusRoutes.find(r => r.id === selectedRoute.id);
        break;
    }
    
    if (updatedRoute) {
      setSelectedRoute(updatedRoute);
    }
  }, [liveTramRoutes, liveMetroLines, liveLocalTrains, liveBusRoutes, activeTab, selectedRoute?.id]);


  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      console.log('🔄 Fetching real-time transport data from API...');
      const transportData = await transportService.getAllTransportData();
      
      // Trams - ensure at least 10 routes
      if (transportData.trams?.success && transportData.trams.data) {
        const base = initializeRoutesWithTimestamps(transportData.trams.data);
        const routes = addExtraRoutes(base, 10, 'tram');
        console.log(`✅ Loaded ${routes.length} tram routes`);
        setLiveTramRoutes(routes);
      } else {
        const base = initializeRoutesWithTimestamps(tramRoutes);
        setLiveTramRoutes(addExtraRoutes(base, 10, 'tram'));
      }
      
      // Metro - Always use local metroLines (has all 10 routes: 2 per color)
      // API data might have incomplete routes, so we always use local data
      console.log('✅ Refresh: Using local metroLines data (10 routes)');
      const metroBase = initializeRoutesWithTimestamps(metroLines);
      const metroRoutes = addExtraRoutes(metroBase, 10, 'metro');
      console.log(`✅ Loaded ${metroRoutes.length} metro lines:`, metroRoutes.map(r => r.name));
      setLiveMetroLines(metroRoutes);
      
      // Local Trains - ensure at least 10 routes
      if (transportData.trains?.success && transportData.trains.data) {
        const base = initializeRoutesWithTimestamps(transportData.trains.data);
        const routes = addExtraRoutes(base, 10, 'train');
        console.log(`✅ Loaded ${routes.length} local trains`);
        setLiveLocalTrains(routes);
      } else {
        const base = initializeRoutesWithTimestamps(localTrains);
        setLiveLocalTrains(addExtraRoutes(base, 10, 'train'));
      }
      
      // Buses - ensure at least 10 routes
      if (transportData.buses?.success && transportData.buses.data) {
        const base = initializeRoutesWithTimestamps(transportData.buses.data);
        const routes = addExtraRoutes(base, 10, 'bus');
        console.log(`✅ Loaded ${routes.length} bus routes`);
        setLiveBusRoutes(routes);
      } else {
        const base = initializeRoutesWithTimestamps(busRoutes);
        setLiveBusRoutes(addExtraRoutes(base, 10, 'bus'));
      }
    } catch (error) {
      console.error('❌ Error fetching transport data:', error);
      // Fallback to local data with 10+ routes each
      const tramBase = initializeRoutesWithTimestamps(tramRoutes);
      const metroBase = initializeRoutesWithTimestamps(metroLines);
      const trainBase = initializeRoutesWithTimestamps(localTrains);
      const busBase = initializeRoutesWithTimestamps(busRoutes);
      
      setLiveTramRoutes(addExtraRoutes(tramBase, 10, 'tram'));
      const metroRoutes = addExtraRoutes(metroBase, 10, 'metro');
      console.log(`✅ Refresh error fallback: Loaded ${metroRoutes.length} metro lines:`, metroRoutes.map(r => r.name));
      setLiveMetroLines(metroRoutes);
      setLiveLocalTrains(addExtraRoutes(trainBase, 10, 'train'));
      setLiveBusRoutes(addExtraRoutes(busBase, 10, 'bus'));
    }
    
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getRouteIcon = (type: string) => {
    switch (type) {
      case 'tram': return TramIcon;
      case 'metro': return Train;
      case 'train': return Train;
      case 'bus': return Bus;
      default: return Train;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case 'delayed': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'suspended': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const renderRouteCard = (route: any, index: number) => {
    const RouteIcon = getRouteIcon(route.type);
    const arrivalTime = route.nextArrival || route.nextTrain || route.nextBus || 0;
    
    return (
      <BlurFade key={route.id} delay={0.03 * index} inView>
        <MagicCard
          gradientColor={route.color || '#FFB800'}
          gradientOpacity={0.1}
          className="hover:shadow-xl transition-all duration-300"
        >
          <div className="p-5 relative">
            <BorderBeam size={200} duration={15} colorFrom={route.color} colorTo="#FFB800" />
            
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Left Section - Route Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-3">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
                    style={{ backgroundColor: route.color }}
                  >
                    <RouteIcon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {route.name}
                      </h3>
                      {route.routeNumber && (
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs font-semibold rounded">
                          {route.routeNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{route.from}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="font-medium">{route.to}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-kolkata-yellow" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Next: <span className="font-semibold text-gray-900 dark:text-white">{arrivalTime} min</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-kolkata-terracotta" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {route.stops?.length || route.majorStops?.length || 0} stops
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                        {route.status === 'running' ? '● Running' : route.status}
                      </span>
                    </div>
                  </div>
                </div>

                {route.heritage && (
                  <div className="mt-3 p-2.5 bg-kolkata-yellow/10 dark:bg-kolkata-gold/10 rounded-lg border border-kolkata-yellow/20">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-kolkata-yellow flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-kolkata-terracotta dark:text-kolkata-gold">
                        {route.heritage}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Section - Price & Booking */}
              <div className="flex flex-col items-end justify-between lg:w-48">
                <div className="text-right mb-3">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <IndianRupee className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {route.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">per person</p>
                </div>
                
                <div className="flex flex-col gap-2 w-full">
                  <ShimmerButton
                    onClick={() => setSelectedRoute(route)}
                    className="w-full text-sm"
                    background="linear-gradient(135deg, #1E3A5F 0%, #2D5A27 100%)"
                  >
                    <Info className="w-4 h-4" />
                    <span>View Details</span>
                  </ShimmerButton>
                  <ShimmerButton
                    onClick={() => setBookingRoute(route)}
                    className="w-full text-sm"
                    background="linear-gradient(135deg, #FFB800 0%, #C45C26 100%)"
                  >
                    <IndianRupee className="w-4 h-4" />
                    <span>Book Now</span>
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </div>
        </MagicCard>
      </BlurFade>
    );
  };

  const renderRoutesForTab = () => {
    let routes: any[] = [];
    
    switch (activeTab) {
      case 'tram':
        routes = liveTramRoutes.map(r => ({ ...r, type: 'tram', price: r.price || 20 }));
        break;
      case 'metro':
        routes = liveMetroLines.map(r => ({ ...r, type: 'metro', price: r.price || 15 }));
        console.log('🎯 Rendering metro tab with', routes.length, 'routes:', routes.map(r => r.name));
        break;
      case 'train':
        routes = liveLocalTrains.map(r => ({ ...r, type: 'train', price: r.price || 25 }));
        break;
      case 'bus':
        routes = liveBusRoutes.map(r => ({ ...r, type: 'bus', price: r.price || 30 }));
        break;
    }

    return (
      <div className="space-y-4">
        {routes.map((route, index) => renderRouteCard(route, index))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BlurFade delay={0.1} inView>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-2xl flex items-center justify-center shadow-lg">
              <TramIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heritage">
                {t('brand.name')}{' '}
                <AnimatedGradientText className="text-3xl">Transport Tracker</AnimatedGradientText>
                {' '}🚃
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Live Transport Tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isLive ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className={`text-sm font-medium ${isLive ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                {isLive ? 'Live' : 'Paused'}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>

            <ShimmerButton
              background="linear-gradient(135deg, #FFB800 0%, #C45C26 100%)"
              onClick={() => setIsLive(!isLive)}
            >
              <Zap className="w-4 h-4" />
              <span>{isLive ? 'Pause' : 'Resume'}</span>
            </ShimmerButton>
          </div>
        </div>
      </BlurFade>

      {/* Transport Type Tabs */}
      <BlurFade delay={0.2} inView>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'tram', label: 'Tram', icon: TramIcon, color: '#FFB800', count: liveTramRoutes.length },
            { id: 'metro', label: 'Metro', icon: Train, color: '#1E3A5F', count: liveMetroLines.length },
            { id: 'train', label: 'Local Train', icon: Train, color: '#C45C26', count: liveLocalTrains.length },
            { id: 'bus', label: 'Bus', icon: Bus, color: '#2D5A27', count: liveBusRoutes.length }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedRoute(null);
                }}
                className={`relative p-5 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-white dark:bg-gray-800 shadow-lg' 
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                }`}
                style={{ 
                  borderColor: isActive ? tab.color : 'transparent',
                  boxShadow: isActive ? `0 0 0 3px ${tab.color}33` : undefined
                }}
              >
                {isActive && (
                  <BorderBeam size={150} duration={10} colorFrom={tab.color} colorTo="#FFB800" />
                )}
                
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${tab.color}20` }}
                  >
                    <IconComponent 
                      className="w-6 h-6" 
                      style={{ color: tab.color }}
                    />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{tab.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tab.count} routes</p>
                  </div>
                  <div 
                    className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: tab.color }}
                  >
                    {tab.count}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </BlurFade>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Routes List for Active Tab */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BlurFade delay={0.3} inView>
                {renderRoutesForTab()}
              </BlurFade>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Route Details / Heritage Info */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <MagicCard gradientColor="#D4A015" gradientOpacity={0.1}>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-heritage flex items-center gap-2">
                  <Info className="w-5 h-5 text-kolkata-yellow" />
                  {selectedRoute ? 'Route Details' : 'Heritage Highlights'}
                </h3>

                {selectedRoute ? (
                  <div className="space-y-4">
                    <div 
                      className="w-full h-20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                      style={{ backgroundColor: selectedRoute.color }}
                    >
                      {selectedRoute.routeNumber || selectedRoute.name}
                    </div>

                    <div className="space-y-3">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedRoute.from} → {selectedRoute.to}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-kolkata-yellow" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Every {selectedRoute.frequency}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRoute.status)}`}>
                          {selectedRoute.status === 'running' ? '● Running' : selectedRoute.status}
                        </span>
                      </div>
                    </div>

                    {/* Stops with Heritage Info */}
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Stops & Heritage</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                        {(selectedRoute.stops || selectedRoute.majorStops || []).map((stop: any, index: number) => {
                          const stopName = typeof stop === 'string' ? stop : stop.name;
                          const heritage = typeof stop === 'object' ? stop.heritage : null;
                          
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="relative pl-6 pb-3 border-l-2 border-kolkata-yellow/30 last:border-l-0"
                            >
                              <div 
                                className="absolute left-0 top-0 w-3 h-3 rounded-full transform -translate-x-1/2"
                                style={{ backgroundColor: selectedRoute.color }}
                              />
                              <p className="font-medium text-gray-900 dark:text-white text-sm">{stopName}</p>
                              {heritage && (
                                <p className="text-xs text-kolkata-terracotta dark:text-kolkata-gold mt-1">
                                  {heritage}
                                </p>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      <ShimmerButton
                        onClick={() => setBookingRoute(selectedRoute)}
                        className="w-full"
                        background="linear-gradient(135deg, #FFB800 0%, #C45C26 100%)"
                      >
                        <IndianRupee className="w-4 h-4" />
                        <span>Book Now - ₹{selectedRoute.price || (selectedRoute.type === 'tram' ? 20 : selectedRoute.type === 'metro' ? 15 : selectedRoute.type === 'train' ? 25 : 30)}</span>
                      </ShimmerButton>
                      <ShimmerButton
                        className="w-full"
                        background="linear-gradient(135deg, #1E3A5F 0%, #2D5A27 100%)"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Audio Guide</span>
                      </ShimmerButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-kolkata-yellow/10 to-kolkata-terracotta/10 rounded-xl border border-kolkata-yellow/20">
                      <div className="flex items-center gap-3 mb-2">
                        <TramIcon className="w-6 h-6 text-kolkata-yellow" />
                        <span className="font-semibold text-gray-900 dark:text-white">Asia's Oldest Tram</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Kolkata's tram network started in 1873 - the only operating tram system in India!
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-durga-500/10 to-kolkata-vermillion/10 rounded-xl border border-durga-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Train className="w-6 h-6 text-durga-500" />
                        <span className="font-semibold text-gray-900 dark:text-white">India's First Metro</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Kolkata Metro opened in 1984 - India's first underground rail system!
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-heritage-500/10 to-kolkata-sepia/10 rounded-xl border border-heritage-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <HowrahBridgeIcon className="w-6 h-6 text-kolkata-terracotta" />
                        <span className="font-semibold text-gray-900 dark:text-white">Howrah Bridge</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Carries 100,000+ vehicles daily - no nuts or bolts used in construction!
                      </p>
                    </div>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Select a route to see heritage details
                    </p>
                  </div>
                )}
              </div>
            </MagicCard>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <BlurFade delay={0.4} inView>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tram Routes', value: liveTramRoutes.length.toString(), icon: '🚃', color: 'from-kolkata-yellow to-kolkata-gold' },
            { label: 'Metro Lines', value: liveMetroLines.length.toString(), icon: '🚇', color: 'from-blue-500 to-blue-600' },
            { label: 'Local Trains', value: liveLocalTrains.length.toString(), icon: '🚆', color: 'from-kolkata-terracotta to-kolkata-maroon' },
            { label: 'Bus Routes', value: liveBusRoutes.length.toString(), icon: '🚌', color: 'from-green-500 to-green-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{stat.icon}</span>
                <div>
                  <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </BlurFade>

      {/* Booking Modal */}
      {bookingRoute && (
        <TransportBookingModal
          route={bookingRoute}
          isOpen={!!bookingRoute}
          onClose={() => setBookingRoute(null)}
        />
      )}
    </div>
  );
};

export default TransportTracker;


