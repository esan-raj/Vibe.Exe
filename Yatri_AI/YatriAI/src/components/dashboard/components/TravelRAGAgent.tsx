import React, { useMemo, useState } from 'react';
import { Bot, Coins, Compass, Database, Globe, Loader2, Search, Sparkles, User, MapPin, Navigation } from 'lucide-react';
import { MagicCard } from '../../magicui/MagicCard';
import { BorderBeam } from '../../magicui/BorderBeam';
import { ShimmerButton } from '../../magicui/ShimmerButton';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { BlurFade } from '../../magicui/BlurFade';
import { destinations, itineraries, guides } from '../../../data/mockData';
import { indianRailApiService } from '../../../lib/services/indianRailApi.service';

type RagSource = {
  title: string;
  snippet: string;
  score: number;
  type: 'destination' | 'itinerary' | 'guide' | 'web';
  url?: string;
};

type BudgetSource = {
  label: string;
  amount: number;
  sourceType: 'web' | 'local';
  url?: string;
  note?: string;
};

type BudgetEstimate = {
  low: number;
  high: number;
  currency: string;
  basis: string;
  sources: BudgetSource[];
};

type RagMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RagSource[];
  budget?: BudgetEstimate;
  transport?: TransportBundle;
  hotels?: HotelsByStation[];
  nearbyTransit?: NearbyTransit[];
};

type TravelParty = 'solo' | 'couple' | 'family' | 'friends';
type TravelMode = 'train' | 'flight' | 'cab' | 'mixed';

type DateRange = {
  fromDate: string;
  toDate: string;
  duration: number;
};

type TrainBooking = {
  fromCity: string;
  toCity: string;
  departureDate: string;
  returnDate?: string;
  class: 'SL' | '3A' | '2A' | '1A' | 'CC' | 'EC';
  passengers: number;
};

type TrainOption = {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  class: string;
  availability: string;
  trainNumber?: string;
  trainName?: string;
  price?: number;
};

type FlightOption = {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: number;
  airline: string;
};

type CabOption = {
  vendor: string;
  etaMinutes: number;
  estFare: number;
};

type HotelOption = {
  name: string;
  price?: number;
  currency?: string;
  source?: string;
};

type HotelsByStation = {
  station: string;
  city: string;
  hotels: HotelOption[];
};

type NearbyTransit = {
  station: string;
  buses: string[];
  metros: string[];
  taxis: string[];
};

type TransportBundle = {
  trains: TrainOption[];
  flights: FlightOption[];
  liveTrainStatus?: string;
  cabs: CabOption[];
};

const stationCityMap: Record<string, { city: string; slug: string }> = {
  HWH: { city: 'Howrah, Kolkata', slug: 'kolkata' },
  SLDH: { city: 'Sealdah, Kolkata', slug: 'kolkata' },
  KOAA: { city: 'Kolkata Chitpur', slug: 'kolkata' },
  SHM: { city: 'Shalimar, Howrah', slug: 'howrah' },
  SRC: { city: 'Santragachi, Howrah', slug: 'howrah' },
};

const nearbyTransitLookup: Record<string, NearbyTransit> = {
  HWH: {
    station: 'HWH',
    buses: ['Howrah Bus Stand', 'Rabindra Setu Bus Stop', 'Panchanantala Bus Stop'],
    metros: ['Howrah Metro (under construction)', 'Mahatma Gandhi Road Metro (~15 min via bus)'],
    taxis: ['Howrah Taxi Stand (Old Complex)', 'Prepaid Taxi Counter, Howrah Station'],
  },
  SLDH: {
    station: 'SLDH',
    buses: ['Sealdah Bus Stand', 'Moulali Bus Stop', 'Narkeldanga Bus Stop'],
    metros: ['Sealdah Metro (Green Line)', 'Phoolbagan Metro (~10 min)'],
    taxis: ['Sealdah Taxi Stand (North), RSV Lane', 'Prepaid Taxi Booth, Sealdah'],
  },
  KOAA: {
    station: 'KOAA',
    buses: ['Chitpur Bus Terminus', 'Ultadanga Hudco Bus Stop'],
    metros: ['Shyambazar Metro', 'Belgachia Metro'],
    taxis: ['Chitpur Taxi Stand', 'Ultadanga Taxi Stand'],
  },
  SHM: {
    station: 'SHM',
    buses: ['Shalimar Bus Depot', 'Chakrabera Bus Stop'],
    metros: ['Maidan Metro (via bus)', 'Park Street Metro (via bus)'],
    taxis: ['Shalimar Station Taxi Point', 'Kadamtala Taxi Stand'],
  },
  SRC: {
    station: 'SRC',
    buses: ['Santragachi Bus Stand (Kona Expway)', 'Ramrajatala Bus Stop'],
    metros: ['Taratala Metro (~15-20 min)', 'Rabindra Sadan Metro (via bus)'],
    taxis: ['Santragachi Taxi Stand', 'Kona Expressway Taxi Point'],
  },
};

const fallbackHotels: Record<string, HotelOption[]> = {
  HWH: [
    { name: 'The Oberoi Grand', price: 9200, currency: 'INR' },
    { name: 'The Park Kolkata', price: 6800, currency: 'INR' },
    { name: 'FabHotel De Sivalika', price: 2400, currency: 'INR' },
  ],
  SLDH: [
    { name: 'ITC Royal Bengal', price: 10500, currency: 'INR' },
    { name: 'JW Marriott Kolkata', price: 9800, currency: 'INR' },
    { name: 'FabHotel Sashi', price: 2100, currency: 'INR' },
  ],
  KOAA: [
    { name: 'Kenilworth Hotel', price: 6500, currency: 'INR' },
    { name: 'The Peerless Inn', price: 5200, currency: 'INR' },
    { name: 'Casa Fortuna', price: 3200, currency: 'INR' },
  ],
  SHM: [
    { name: 'Fortune Park Panchwati', price: 4300, currency: 'INR' },
    { name: 'Hotel Samrat Plaza', price: 1900, currency: 'INR' },
  ],
  SRC: [
    { name: 'Hotel Geetanjali', price: 2200, currency: 'INR' },
    { name: 'Hotel Avisha', price: 2600, currency: 'INR' },
  ],
};

const fetchTrainStatus = async (trainNumber: string): Promise<string | null> => {
  const base = import.meta.env.VITE_TRAIN_API_BASE;
  if (!base || !trainNumber) {
    console.log('Train status fetch skipped - base or trainNumber missing');
    return null;
  }

  try {
    console.log(`🚉 Fetching status for train ${trainNumber}`);
    const response = await fetch(`${base}/status/${trainNumber}`);
    if (!response.ok) {
      console.warn(`Train status API returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (data.success && data.data) {
      const status = data.data;
      const statusText = `${trainNumber}: ${status.currentStatus} • Current: ${status.currentStation} • Next: ${status.nextStation}${status.delay > 0 ? ` (Delayed by ${status.delay} mins)` : ''}`;
      console.log(`✅ Train status: ${statusText}`);
      return statusText;
    } else {
      console.warn('Train status response format invalid:', data);
    }
  } catch (error) {
    console.warn('Train status API unavailable:', error);
  }

  return null;
};

const fetchTrainAvailability = async (booking: TrainBooking): Promise<TrainOption[] | null> => {
  const preferredToStations = ['HWH', 'SLDH', 'KOAA', 'SHM', 'SRC'];

  const fromCode = (booking.fromCity || '').trim().toUpperCase();
  const requestedTo = (booking.toCity || '').trim().toUpperCase();
  const targetToStations = requestedTo && preferredToStations.includes(requestedTo)
    ? [requestedTo]
    : preferredToStations;

  if (!fromCode) {
    console.warn('Train search skipped: from station code is required.');
    return null;
  }

  const results: TrainOption[] = [];

  // Use indian-rail-api service
  for (const toStation of targetToStations) {
    try {
      let data;
      
      // If departure date is provided, use getTrainOnDate endpoint for more accurate results
      if (booking.departureDate) {
        const formattedDate = indianRailApiService.formatDateForApi(booking.departureDate);
        if (formattedDate) {
          console.log(`🚉 Fetching trains on ${formattedDate} from ${fromCode} to ${toStation}`);
          const response = await indianRailApiService.getTrainsOnDate(fromCode, toStation, formattedDate);
          data = response;
        } else {
          // Fallback to betweenStations if date formatting fails
          console.log(`🚉 Fetching trains from ${fromCode} to ${toStation}`);
          const response = await indianRailApiService.getTrainsBetweenStations(fromCode, toStation);
          data = response;
        }
      } else {
        // No date provided, use betweenStations endpoint
        console.log(`🚉 Fetching trains from ${fromCode} to ${toStation}`);
        const response = await indianRailApiService.getTrainsBetweenStations(fromCode, toStation);
        data = response;
      }

      if (!data.success) {
        console.warn(`Train API returned success=false for ${fromCode} -> ${toStation}`);
        continue;
      }

      const trains = Array.isArray(data?.data) ? data.data : [];

      trains.slice(0, 6).forEach((t: any) => {
        const trainInfo = indianRailApiService.convertToTrainInfo(t, fromCode, toStation, booking.class);
        results.push({
          from: trainInfo.from,
          to: trainInfo.to,
          departure: trainInfo.departure,
          arrival: trainInfo.arrival,
          class: trainInfo.class || booking.class,
          availability: trainInfo.availability || 'Check IRCTC',
          trainNumber: trainInfo.trainNumber,
          trainName: trainInfo.trainName,
          price: trainInfo.price,
        });
      });
    } catch (error) {
      console.warn(`Train API unavailable for ${fromCode} -> ${toStation}:`, error);
    }
  }

  if (results.length) {
    console.log(`✅ Found ${results.length} trains`);
    return results.slice(0, 6);
  }

  // Fallback to legacy backend if configured
  const base = import.meta.env.VITE_TRAIN_API_BASE;
  if (!base) {
    console.warn('No train results and VITE_TRAIN_API_BASE not configured.');
    return null;
  }

  try {
    const response = await fetch(`${base}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: booking.fromCity,
        to: booking.toCity || preferredToStations[0],
        date: booking.departureDate,
        class: booking.class,
        passengers: booking.passengers,
      }),
    });
    
    if (!response.ok) {
      console.warn(`Train fallback API response not ok: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.data?.trains)) {
      return data.data.trains.slice(0, 6).map((t: any) => ({
        from: t.from || booking.fromCity,
        to: t.to || booking.toCity || preferredToStations[0],
        departure: t.departure || '—',
        arrival: t.arrival || '—',
        class: t.class || booking.class,
        availability: t.availability || 'Unknown',
        trainNumber: t.trainNumber || 'N/A',
        trainName: t.trainName || 'Unknown Train',
        price: t.price || 0,
      }));
    } else {
      console.warn('Train fallback API response format invalid:', data);
    }
  } catch (error) {
    console.warn('Train fallback API unavailable:', error);
  }

  return null;
};

// Web budget baselines disabled; using Gemini-provided budget JSON

const formatINR = (value: number) => value.toLocaleString('en-IN', { maximumFractionDigits: 0 });

const formatPrice = (price?: number, currency?: string) => {
  if (!price) return 'Rate n/a';
  if (!currency || currency.toUpperCase() === 'INR') return `₹${formatINR(price)}`;
  return `${currency.toUpperCase()} ${Math.round(price).toLocaleString()}`;
};

const mapSearchUrl = (query: string) =>
  `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

const stationHotelsMapUrl = (station: string) => {
  const info = stationCityMap[station];
  const q = info ? `hotels near ${info.city}` : `hotels near ${station}`;
  return mapSearchUrl(q);
};

const stationTransitMapUrl = (station: string, type: 'bus' | 'metro' | 'taxi') => {
  const info = stationCityMap[station];
  const base = info ? info.city : station;
  const q = type === 'bus'
    ? `bus stand near ${base}`
    : type === 'metro'
    ? `metro station near ${base}`
    : `taxi stand near ${base}`;
  return mapSearchUrl(q);
};

const irctcTrainSearchUrl = () => 'https://www.irctc.co.in/nget/train-search';
const irctcSiteTrainSearchUrl = (trainNumber?: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`site:irctc.co.in ${trainNumber ? `"${trainNumber}"` : 'train booking'}`)}`;

const calculateDuration = (fromDate: string, toDate: string): number => {
  if (!fromDate || !toDate) return 1;
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

const scoreMatch = (text: string, query: string) => {
  const haystack = text.toLowerCase();
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return 0;
  const hits = tokens.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0);
  return hits / tokens.length;
};

const retrieveLocalContext = (query: string): RagSource[] => {
  const destinationHits: RagSource[] = destinations.map((d) => ({
    title: d.name,
    snippet: d.description,
    score: scoreMatch(`${d.name} ${d.description} ${d.category}`, query),
    type: 'destination',
  }));

  const itineraryHits: RagSource[] = itineraries.map((itinerary) => ({
    title: itinerary.title,
    snippet: `${itinerary.duration} day(s) • ₹${formatINR(itinerary.estimatedCost)} • ${itinerary.activities.slice(0, 2).join(', ')}`,
    score: scoreMatch(`${itinerary.title} ${itinerary.activities.join(' ')}`, query),
    type: 'itinerary',
  }));

  const guideHits: RagSource[] = guides.map((guide) => ({
    title: guide.name,
    snippet: `${guide.specialties.slice(0, 2).join(', ')} • ₹${formatINR(guide.pricePerDay)}/day • ${guide.languages.join(', ')}`,
    score: scoreMatch(`${guide.name} ${guide.specialties.join(' ')} ${guide.languages.join(' ')}`, query),
    type: 'guide',
  }));

  return [...destinationHits, ...itineraryHits, ...guideHits]
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
};

// Local budget signals aggregation disabled; Gemini handles breakdown

// Web context disabled; using Gemini synthesis only

// Web budget signals disabled; relying on local signals + static baseline

type LlmResult = { text: string; budget?: BudgetEstimate };
const callGemini = async (prompt: string, localContext: RagSource[], webContext: RagSource[], budget?: BudgetEstimate): Promise<LlmResult | null> => {
  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp';
  const proxyEndpoint = import.meta.env.VITE_GEMINI_PROXY;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Prefer a proxy endpoint if configured (can add auth, safety, etc.).
  if (proxyEndpoint) {
    try {
      const response = await fetch(proxyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, localContext, webContext, budget }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      const text: string = data.text || data.output || '';
      let parsedBudget: BudgetEstimate | undefined;
      if (typeof text === 'string' && text) {
        const match = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          try {
            const obj = JSON.parse(match[1]);
            if (obj && typeof obj.low === 'number' && typeof obj.high === 'number') {
              const categories = Array.isArray(obj.categories) ? obj.categories : [];
              parsedBudget = {
                low: obj.low,
                high: obj.high,
                currency: obj.currency || 'INR',
                basis: obj.basis || 'Gemini synthesis',
                sources: categories.map((c: any) => ({ label: String(c.label || 'Category'), amount: Number(c.amount) || 0, sourceType: 'web' })),
              };
            }
          } catch {}
        }
      }
      return { text, budget: parsedBudget };
    } catch (error) {
      console.warn('Gemini proxy unavailable:', error);
    }
  }

  // Direct Google Generative Language API fallback using API key.
  if (!apiKey) return null;

  try {
    const localContextText = localContext
      .map((c) => `LOCAL ${c.type}: ${c.title} — ${c.snippet}`)
      .slice(0, 6)
      .join('\n');

    // Budget planned by Gemini; do not pass existing budget

    const body = {
      contents: [
        {
          parts: [
            {
              text: [
                'You are an expert Indian travel planner specializing in Kolkata and West Bengal.',
                `User request: ${prompt}`,
                '',
                'LOCAL KNOWLEDGE (from curated database):',
                localContextText || 'No local matches found.',
                '',
                'INSTRUCTIONS:',
                '1. Produce a single concise combined answer: Overview, Sights, Suggested flow, Food, Value tip',
                '2. FIRST output a JSON fenced block with a BudgetEstimate object: { low, high, currency:"INR", basis, categories:[{label, percent, amount}] }',
                '3. THEN output human-readable bullets. Keep it realistic and current; synthesize any web context as needed',
                '3. Structure your response with: Overview, Key Attractions, Suggested Itinerary, Budget Breakdown, Local Tips',
                '4. Keep response concise but informative (4-6 bullet points max)',
                '5. Mention which sources informed each recommendation',
                '6. Include practical advice for the specified travel party and budget level',
              ].join('\n'),
            },
          ],
        },
      ],
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let parsedBudget: BudgetEstimate | undefined;
    if (typeof text === 'string' && text) {
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        try {
          const obj = JSON.parse(match[1]);
          if (obj && typeof obj.low === 'number' && typeof obj.high === 'number') {
            const categories = Array.isArray(obj.categories) ? obj.categories : [];
            parsedBudget = {
              low: obj.low,
              high: obj.high,
              currency: obj.currency || 'INR',
              basis: obj.basis || 'Gemini synthesis',
              sources: categories.map((c: any) => ({ label: String(c.label || 'Category'), amount: Number(c.amount) || 0, sourceType: 'web' })),
            };
          }
        } catch {}
      }
    }
    return { text, budget: parsedBudget };
  } catch (error) {
    console.warn('Gemini direct call failed:', error);
    return null;
  }
};

const travelProxyFetch = async <T,>(path: string, payload: Record<string, string>): Promise<T | null> => {
  const base = import.meta.env.VITE_TRAVEL_PROXY;
  if (!base) return null;

  try {
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.warn('Travel proxy unavailable:', error);
    return null;
  }
};

const fetchTransport = async (dateRange: DateRange, trainBooking?: TrainBooking): Promise<TransportBundle> => {
  const proxyResult = await travelProxyFetch<TransportBundle>('/search', { 
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    fromCity: trainBooking?.fromCity || '',
    toCity: trainBooking?.toCity || '',
  });
  if (proxyResult) return proxyResult;

  // Try direct train availability API if train booking details provided
  const directTrains = trainBooking ? await fetchTrainAvailability(trainBooking) : null;
  
  // Try to get live train status for the first train if available
  let liveStatus = null;
  if (directTrains && directTrains.length > 0 && directTrains[0].trainNumber) {
    liveStatus = await fetchTrainStatus(directTrains[0].trainNumber);
  }

  // Enhanced fallback mocks based on provided cities
  const fromCity = trainBooking?.fromCity || 'Howrah';
  const toCity = trainBooking?.toCity || 'New Jalpaiguri';
  
  return {
    trains:
      directTrains || [
        { from: fromCity, to: toCity, departure: '06:00', arrival: '13:30', class: trainBooking?.class || '2A', availability: 'WL 12 → RAC', trainNumber: '12301', trainName: 'Howrah Rajdhani', price: 3500 },
        { from: fromCity, to: toCity, departure: '08:30', arrival: '15:45', class: trainBooking?.class || 'SL', availability: 'Available 42', trainNumber: '12313', trainName: 'Sealdah Express', price: 850 },
        { from: fromCity, to: toCity, departure: '14:20', arrival: '21:10', class: trainBooking?.class || '3A', availability: 'WL 8', trainNumber: '12345', trainName: 'Saraighat Express', price: 2200 },
        { from: fromCity, to: toCity, departure: '22:15', arrival: '05:30+1', class: trainBooking?.class || 'SL', availability: 'Available 156', trainNumber: '12367', trainName: 'Vikramshila Express', price: 750 },
      ],
    flights: [
      { from: 'CCU', to: 'DEL', departure: '09:45', arrival: '12:05', price: 6200, airline: 'IndiGo' },
      { from: 'CCU', to: 'BLR', departure: '14:10', arrival: '16:45', price: 7100, airline: 'Vistara' },
      { from: 'CCU', to: 'BOM', departure: '18:30', arrival: '20:50', price: 5800, airline: 'Air India' },
    ],
    liveTrainStatus: liveStatus || `12345 ${fromCity}-${toCity} Express: On time • Next: Intermediate station in 18 mins`,
    cabs: [
      { vendor: 'Ola', etaMinutes: 6, estFare: 320 },
      { vendor: 'Uber', etaMinutes: 5, estFare: 340 },
      { vendor: 'Rapido', etaMinutes: 8, estFare: 280 },
    ],
  };
};

const fetchHotelsForStations = async (stations: string[]): Promise<HotelsByStation[]> => {
  const token =
    import.meta.env.VITE_MAKCORPS_TOKEN ||
    import.meta.env.VITE_MAKCORPS_JWT ||
    import.meta.env.VITE_MAKCORPS_API_TOKEN ||
    '';

  const uniqueStations = Array.from(new Set(stations.filter((s) => stationCityMap[s])));
  if (!uniqueStations.length) return [];

  const fetchSingle = async (station: string): Promise<HotelsByStation> => {
    const { city, slug } = stationCityMap[station];
    if (!token) {
      console.warn('Makcorps token missing; using fallback hotels.');
      return { station, city, hotels: fallbackHotels[station] || [] };
  }

    try {
      const response = await fetch(`https://api.makcorps.com/free/${slug.toLowerCase()}`, {
        method: 'GET',
        headers: { Authorization: `JWT ${token}` },
      });

      if (!response.ok) {
        console.warn(`Makcorps API returned ${response.status} for ${station}`);
        return { station, city, hotels: fallbackHotels[station] || [] };
      }

      const data = await response.json();
      let hotels: HotelOption[] = [];

      const sourceArray = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.hotels)
        ? data.hotels
        : null;

      if (sourceArray) {
        hotels = sourceArray
          .map((h: any) => ({
            name: h?.hotel_name || h?.hotelName || h?.name || 'Hotel',
            price: Number(h?.price || h?.min_rate || h?.avg_price || h?.rate) || undefined,
            currency: h?.currency || 'INR',
            source: h?.source || h?.url,
          }))
          .filter((h: HotelOption) => !!h.name)
          .slice(0, 5);
      } else if (data?.data && typeof data.data === 'object') {
        hotels = Object.entries(data.data)
          .map(([name, val]: [string, any]) => ({
            name,
            price: Number((val as any)?.price || val) || undefined,
            currency: (val as any)?.currency || 'INR',
          }))
          .slice(0, 5);
  }

      if (!hotels.length && fallbackHotels[station]) {
        hotels = fallbackHotels[station];
      }

      return { station, city, hotels };
    } catch (error) {
      console.warn(`Makcorps API unavailable for ${station}:`, error);
      return { station, city, hotels: fallbackHotels[station] || [] };
  }
  };

  const results = await Promise.all(uniqueStations.map(fetchSingle));
  return results.filter((entry) => entry.hotels.length > 0);
};

const getNearbyTransitForStations = (stations: string[]): NearbyTransit[] => {
  const uniqueStations = Array.from(new Set(stations));
  return uniqueStations
    .map((code) => nearbyTransitLookup[code])
    .filter((v): v is NearbyTransit => Boolean(v));
};

const filterHotelsByBudget = (bundles: HotelsByStation[], min: number, max: number): HotelsByStation[] => {
  const safeMin = Math.max(0, min);
  const safeMax = max > 0 ? max : Number.POSITIVE_INFINITY;

  return bundles
    .map((bundle) => ({
      ...bundle,
      hotels: (bundle.hotels || []).filter((h) =>
        typeof h.price === 'number'
          ? h.price >= safeMin && h.price <= safeMax
          : false
      ),
    }))
    .filter((bundle) => bundle.hotels.length > 0);
};

// Budget aggregation disabled; Gemini provides budget breakdown via JSON

// Assistant reply crafting is handled directly via Gemini text

const TravelRAGAgent: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedBudgetId, setExpandedBudgetId] = useState<string | null>(null);
  const [planner, setPlanner] = useState({
    fromDate: '',
    toDate: '',
    fromCity: '',
    toCity: 'Kolkata',
    party: 'family' as TravelParty,
    mode: 'mixed' as TravelMode,
    budget: 'mid-range',
    budgetMin: 3000,
    budgetMax: 7000,
    trainClass: '3A' as TrainBooking['class'],
    passengers: 2,
  });
  const [messages, setMessages] = useState<RagMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi! Let’s plan your Kolkata trip. First, tell me: 1) Travel date, 2) From which city to Kolkata, 3) Preferred mode (train/flight/cab/mixed), 4) Budget (budget/mid-range/luxury), 5) Party type (solo/couple/family/friends). I’ll pull trains, flights, cabs, budget bands, and guides.',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  

  // Station autocomplete state

  const latestAssistant = useMemo(() => messages.filter((m) => m.role === 'assistant').slice(-1)[0], [messages]);

  

  const buildPrompt = () => {
    const duration = calculateDuration(planner.fromDate, planner.toDate);
    const pieces = [
      planner.fromCity && planner.toCity && `From ${planner.fromCity} to ${planner.toCity}`,
      planner.fromDate && planner.toDate && `from ${planner.fromDate} to ${planner.toDate} (${duration} days)`,
      planner.party && `${planner.party} travel`,
      planner.mode && `prefer ${planner.mode}`,
      planner.mode === 'train' && `${planner.trainClass} class, ${planner.passengers} passengers`,
      (planner.budgetMin || planner.budgetMax) && `budget ₹${planner.budgetMin}-₹${planner.budgetMax} per day`,
      prompt || '',
    ].filter(Boolean);
    return pieces.join(', ').trim();
  };

  const sendMessage = async () => {
    let composed = buildPrompt();
    if (!composed) {
      composed = 'Plan a Kolkata trip with family, mid-range budget.';
      setErrorMsg('No inputs provided. Using a sensible default query.');
    } else {
      setErrorMsg(null);
    }

    const userMessage: RagMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: composed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    // Fetch local context and transport; use Gemini for synthesis (no web fetch)
    const dateRange: DateRange = {
      fromDate: planner.fromDate,
      toDate: planner.toDate,
      duration: calculateDuration(planner.fromDate, planner.toDate),
    };

    const targetStations = ['HWH', 'SLDH', 'KOAA', 'SHM', 'SRC'];

    const trainBooking: TrainBooking | undefined = planner.fromCity && planner.toCity ? {
      fromCity: planner.fromCity,
      toCity: planner.toCity,
      departureDate: planner.fromDate,
      returnDate: planner.toDate,
      class: planner.trainClass,
      passengers: planner.passengers,
    } : undefined;

    const [localContext, transport, hotels, nearbyTransit] = await Promise.all([
      retrieveLocalContext(composed),
      fetchTransport(dateRange, trainBooking),
      fetchHotelsForStations(targetStations),
      Promise.resolve(getNearbyTransitForStations(targetStations)),
    ]);

    const budgetMin = planner.budgetMin || 0;
    const budgetMax = planner.budgetMax || 0;
    const filteredHotels = filterHotelsByBudget(hotels, budgetMin, budgetMax);

    // Budget will be planned by Gemini; do not aggregate locally
    
    // Combine contexts and pass both to LLM
    const llm = await callGemini(composed, localContext, [], undefined);

    const assistantMessage: RagMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: (llm?.text || '') || 'AI synthesis unavailable; showing local data above.',
      sources: localContext,
      budget: llm?.budget,
      transport,
      hotels: filteredHotels,
      nearbyTransit,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsThinking(false);
  };

  return (
    <MagicCard gradientColor="#22c55e" gradientOpacity={0.08} className="w-full">
      <BorderBeam size={240} duration={14} colorFrom="#16a34a" colorTo="#f97316" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                RAG Travel Agent
                <AnimatedGradientText className="text-base">(retrieval-first)</AnimatedGradientText>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Plans using local templates + guide matches + Gemini synthesis.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Bot className="w-4 h-4" />
            <span>Gemini</span>
            <Database className="w-4 h-4" />
            <span>Local RAG</span>
          </div>
        </div>

        <div className="space-y-3">
            {errorMsg && (
              <div className="rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-100">
                {errorMsg}
              </div>
            )}
            <div className="h-80 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 overflow-y-auto p-4 custom-scrollbar">
              {messages.map((message) => (
                <div key={message.id} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                        : 'bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide font-semibold mb-2 opacity-80">
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      <span>{message.role === 'user' ? 'You' : 'RAG Agent'}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>

                    {message.budget && (
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={() => setExpandedBudgetId(expandedBudgetId === message.id ? null : message.id)}
                          className="w-full p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition text-left"
                        >
                          <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold">
                          <Coins className="w-4 h-4" />
                              <span>Budget: ₹{formatINR(message.budget.low)} - ₹{formatINR(message.budget.high)} / day</span>
                        </div>
                            <span className="text-xs">{expandedBudgetId === message.id ? '▼' : '▶'}</span>
                        </div>
                        </button>

                        {expandedBudgetId === message.id && (
                          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
                            <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 mb-2">Breakdown:</div>
                            <div className="text-xs text-emerald-800 dark:text-emerald-100 space-y-1">
                              <div className="flex justify-between">
                                <span>Accommodation (40%):</span>
                                <span>₹{formatINR(Math.round(message.budget.low * 0.4))} - ₹{formatINR(Math.round(message.budget.high * 0.4))}</span>
                        </div>
                              <div className="flex justify-between">
                                <span>Food & Dining (25%):</span>
                                <span>₹{formatINR(Math.round(message.budget.low * 0.25))} - ₹{formatINR(Math.round(message.budget.high * 0.25))}</span>
                                </div>
                              <div className="flex justify-between">
                                <span>Transport (20%):</span>
                                <span>₹{formatINR(Math.round(message.budget.low * 0.2))} - ₹{formatINR(Math.round(message.budget.high * 0.2))}</span>
                                </div>
                              <div className="flex justify-between">
                                <span>Activities & Misc (15%):</span>
                                <span>₹{formatINR(Math.round(message.budget.low * 0.15))} - ₹{formatINR(Math.round(message.budget.high * 0.15))}</span>
                                </div>
                                </div>
                            {message.budget.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                                <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 mb-1">Sources:</div>
                                <div className="flex flex-wrap gap-1">
                                  {message.budget.sources.map((source) => (
                                    <span key={source.label} className="text-xs px-2 py-0.5 rounded bg-white/50 dark:bg-gray-800/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200">
                                      {source.label}
                                    </span>
                                  ))}
                              </div>
                                </div>
                            )}
                              </div>
                        )}
                      </div>
                    )}

                    {message.transport && message.transport.trains && message.transport.trains.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <span>Available trains</span>
                      </div>
                        {message.transport.trains.slice(0, 4).map((t, idx) => (
                          <div key={`${t.trainNumber}-${idx}`} className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-xs">
                            <div className="text-gray-900 dark:text-white flex-1">
                              <div className="font-semibold">{t.trainNumber || 'N/A'} • {t.trainName || 'Train'}</div>
                              <div className="text-gray-600 dark:text-gray-300">{t.from} → {t.to}</div>
                            </div>
                            <div className="text-gray-900 dark:text-white text-right flex-1">
                              <div>{t.departure} → {t.arrival}</div>
                              <div className="text-gray-600 dark:text-gray-300">{t.class} • {t.availability}</div>
                            </div>
                            <div className="text-emerald-700 dark:text-emerald-400 font-semibold text-right min-w-fit pl-2">
                              {typeof t.price === 'number' && t.price > 0 ? `₹${formatINR(t.price)}` : '—'}
                              <div className="mt-1 flex gap-1 justify-end">
                                <a
                                  href={irctcTrainSearchUrl()}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700"
                                >IRCTC</a>
                                <a
                                  href={irctcSiteTrainSearchUrl(t.trainNumber)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
                                >Search</a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}

                    {message.hotels && message.hotels.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <span>Nearby hotels (Makcorps)</span>
                          </div>
                        {message.hotels.map((bundle) => (
                          <div key={bundle.station} className="p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                            <div className="flex items-center justify-between text-gray-900 dark:text-white">
                              <span className="font-semibold">{bundle.station}</span>
                              <span className="text-[11px] text-gray-600 dark:text-gray-300">{bundle.city}</span>
                              </div>
                            <div className="flex justify-end">
                              <a
                                href={stationHotelsMapUrl(bundle.station)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                              >
                                Open hotels map
                              </a>
                              </div>
                            {bundle.hotels.slice(0, 3).map((hotel, idx) => (
                              <div key={`${bundle.station}-${idx}-${hotel.name}`} className="flex items-center justify-between text-gray-800 dark:text-gray-200">
                                <span className="truncate pr-2">{hotel.name}</span>
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatPrice(hotel.price, hotel.currency)}</span>
                              </div>
                            ))}
                            {bundle.hotels.length === 0 && (
                              <div className="text-gray-500 dark:text-gray-400">No hotels found.</div>
                            )}
                              </div>
                        ))}
                            </div>
                    )}

                    {message.nearbyTransit && message.nearbyTransit.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <span>Nearby transit</span>
                        </div>
                        {message.nearbyTransit.map((entry) => (
                          <div key={entry.station} className="p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs space-y-2">
                            <div className="flex items-center justify-between text-gray-900 dark:text-white">
                              <span className="font-semibold">{entry.station}</span>
                              <div className="flex items-center gap-1">
                                <a
                                  href={stationTransitMapUrl(entry.station, 'bus')}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/40"
                                >
                                  <Navigation className="w-3 h-3" /> Bus Map
                                </a>
                                <a
                                  href={stationTransitMapUrl(entry.station, 'metro')}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/40"
                                >
                                  <MapPin className="w-3 h-3" /> Metro Map
                                </a>
                                <a
                                  href={stationTransitMapUrl(entry.station, 'taxi')}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/40"
                                >
                                  <MapPin className="w-3 h-3" /> Taxi Map
                                </a>
                              </div>
                            </div>
                            <div className="text-gray-700 dark:text-gray-200">
                              <span className="font-semibold">Bus: </span>
                              <span>{entry.buses.join(' • ')}</span>
                            </div>
                            <div className="text-gray-700 dark:text-gray-200">
                              <span className="font-semibold">Metro: </span>
                              <span>{entry.metros.join(' • ')}</span>
                            </div>
                            <div className="text-gray-700 dark:text-gray-200">
                              <span className="font-semibold">Taxi: </span>
                              <span>{entry.taxis.join(' • ')}</span>
                            </div>
                          </div>
                        ))}
                            </div>
                    )}

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Search className="w-3.5 h-3.5" />
                          <span>Context used</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {message.sources.map((source, idx) => (
                            <span
                              key={`${source.title}-${idx}`}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                            >
                              {source.type === 'web' ? <Globe className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                              <span className="line-clamp-1">{source.title}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching trains, fetching Makcorps hotels, and combining local knowledge...</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">From Date</label>
                  <input
                    type="date"
                    value={planner.fromDate}
                    onChange={(e) => setPlanner((p) => ({ ...p, fromDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Budget Min (₹/day)</label>
                  <input
                    type="number"
                    value={planner.budgetMin}
                    onChange={(e) => setPlanner((p) => ({ ...p, budgetMin: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Budget Max (₹/day)</label>
                  <input
                    type="number"
                    value={planner.budgetMax}
                    onChange={(e) => setPlanner((p) => ({ ...p, budgetMax: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">From Station Code</label>
                  <input
                    type="text"
                    value={planner.fromCity}
                    onChange={(e) => setPlanner((p) => ({ ...p, fromCity: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter station code (e.g., NDLS)"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">To Station</label>
                  <select
                    value={planner.toCity}
                    onChange={(e) => setPlanner((p) => ({ ...p, toCity: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select destination</option>
                    <option value="HWH">Howrah (HWH)</option>
                    <option value="SLDH">Sealdah (SLDH)</option>
                    <option value="KOAA">Kolkata (KOAA)</option>
                    <option value="SHM">Shyampur (SHM)</option>
                    <option value="SRC">Santragachi (SRC)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <select
                  value={planner.mode}
                  onChange={(e) => setPlanner((p) => ({ ...p, mode: e.target.value as TravelMode }))}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="mixed">Mixed Transport</option>
                  <option value="train">Train Only</option>
                  <option value="flight">Flight Only</option>
                  <option value="cab">Cab Only</option>
                </select>
                <select
                  value={planner.budget}
                  onChange={(e) => setPlanner((p) => ({ ...p, budget: e.target.value }))}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="budget">Budget</option>
                  <option value="mid-range">Mid-range</option>
                  <option value="luxury">Luxury</option>
                </select>
                <select
                  value={planner.party}
                  onChange={(e) => setPlanner((p) => ({ ...p, party: e.target.value as TravelParty }))}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="solo">Solo</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                </select>
                {planner.mode === 'train' && (
                  <>
                    <select
                      value={planner.trainClass}
                      onChange={(e) => setPlanner((p) => ({ ...p, trainClass: e.target.value as TrainBooking['class'] }))}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="SL">Sleeper (SL)</option>
                      <option value="3A">AC 3 Tier (3A)</option>
                      <option value="2A">AC 2 Tier (2A)</option>
                      <option value="1A">AC First (1A)</option>
                      <option value="CC">Chair Car (CC)</option>
                      <option value="EC">Executive (EC)</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={planner.passengers}
                      onChange={(e) => setPlanner((p) => ({ ...p, passengers: parseInt(e.target.value) || 1 }))}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="Passengers"
                    />
                  </>
                )}
              </div>

              {planner.fromDate && planner.toDate && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                  <Compass className="w-4 h-4" />
                  <span>Trip Duration: {calculateDuration(planner.fromDate, planner.toDate)} days</span>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Additional asks (optional)..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <ShimmerButton onClick={sendMessage} disabled={isThinking}>
                  {isThinking ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      <span>Plan</span>
                    </div>
                  )}
                </ShimmerButton>
              </div>

              {/* Retrieval Summary and How to Use Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    Retrieval summary
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Intelligently combines curated local knowledge (destinations, itineraries, guides) with real-time web insights and budget analysis to provide comprehensive, up-to-date travel recommendations.
                  </p>
                  {latestAssistant?.budget && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <Coins className="w-4 h-4" />
                        Active budget window
                      </div>
                      <div className="text-gray-900 dark:text-white mt-1">
                        ₹{formatINR(latestAssistant.budget.low)} - ₹{formatINR(latestAssistant.budget.high)} / day
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{latestAssistant.budget.basis}</p>
                    </div>
                  )}
                </div>

                <BlurFade delay={0.05} inView>
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-orange-50 dark:from-emerald-900/20 dark:to-orange-900/20 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      <Compass className="w-4 h-4 text-orange-500" />
                      How to use
                    </div>
                    <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li>Specify your travel details: city, dates, party type (solo/couple/family/friends), and budget level.</li>
                      <li>The system combines local curated knowledge with current web insights for comprehensive planning.</li>
                      <li>Get integrated recommendations covering attractions, itineraries, budget analysis, and transport options.</li>
                      <li>Ask follow-ups like "swap to luxury", "add waterfalls", or "show train-friendly plan".</li>
                    </ul>
                  </div>
                </BlurFade>
              </div>
            </div>
        </div>
      </div>
    </MagicCard>
  );
};

export default TravelRAGAgent;
