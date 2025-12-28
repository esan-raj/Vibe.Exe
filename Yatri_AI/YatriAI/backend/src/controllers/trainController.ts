import { Request, Response } from 'express';
import axios from 'axios';

interface TrainSearchQuery {
  from: string;
  to: string;
  date: string;
  class?: string;
  passengers?: number;
}

interface TrainResult {
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  class: string;
  availability: string;
  price?: number;
}

// Mock train data for fallback
const mockTrainData: TrainResult[] = [
  {
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express',
    from: 'Howrah',
    to: 'New Delhi',
    departure: '16:55',
    arrival: '10:05+1',
    duration: '17h 10m',
    class: '2A',
    availability: 'Available 45',
    price: 3500
  },
  {
    trainNumber: '12313',
    trainName: 'Sealdah Rajdhani Express',
    from: 'Sealdah',
    to: 'New Delhi',
    departure: '17:45',
    arrival: '09:55+1',
    duration: '16h 10m',
    class: '3A',
    availability: 'WL 12',
    price: 2800
  },
  {
    trainNumber: '12345',
    trainName: 'Saraighat Express',
    from: 'Howrah',
    to: 'Guwahati',
    departure: '15:50',
    arrival: '18:15+1',
    duration: '26h 25m',
    class: 'SL',
    availability: 'Available 156',
    price: 850
  },
  {
    trainNumber: '12259',
    trainName: 'Duronto Express',
    from: 'Sealdah',
    to: 'Mumbai Central',
    departure: '14:50',
    arrival: '18:30+1',
    duration: '27h 40m',
    class: '3A',
    availability: 'WL 25',
    price: 2950
  },
  {
    trainNumber: '12841',
    trainName: 'Coromandel Express',
    from: 'Howrah',
    to: 'Chennai Central',
    departure: '14:45',
    arrival: '17:00+1',
    duration: '26h 15m',
    class: '2A',
    availability: 'Available 78',
    price: 3200
  }
];

export const searchTrains = async (req: Request, res: Response) => {
  try {
    const { from, to, date, class: trainClass, passengers = 1 } = req.body as TrainSearchQuery;

    if (!from) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: from (station code)'
      });
    }

    const allowedToStations = ['HWH', 'SLDH', 'KOAA', 'SHM', 'SRC'];
    const fromCode = from.trim().toUpperCase();
    const requestedTo = (to || '').trim().toUpperCase();
    const targetToStations = requestedTo && allowedToStations.includes(requestedTo)
      ? [requestedTo]
      : allowedToStations;

    console.log(`🚂 Train search request: ${fromCode} → ${targetToStations.join(', ')} (requested: ${requestedTo || 'auto'}) Class: ${trainClass}, Pax: ${passengers}`);

    const apiBase = process.env.INDIAN_RAIL_API_BASE || 'http://localhost:3000/trains';
    const aggregated: TrainResult[] = [];

    for (const toStation of targetToStations) {
      try {
        const endpoint = `${apiBase}/betweenStations?from=${fromCode}&to=${toStation}`;
        const { data } = await axios.get(endpoint, { timeout: 10000 });

        if (!(data as any).success) {
          console.warn(`⚠️ Indian Rail API returned success=false for ${fromCode} → ${toStation}`);
          continue;
        }

        const trains = Array.isArray((data as any)?.data) ? (data as any).data : [];

        trains.slice(0, 6).forEach((t: any) => {
          const trainBase = t.train_base || {};
          aggregated.push({
            trainNumber: trainBase.train_no || trainBase.number || 'N/A',
            trainName: trainBase.train_name || trainBase.name || 'Train',
            from: trainBase.from_stn_name || trainBase.source_stn_name || fromCode,
            to: trainBase.to_stn_name || trainBase.dstn_stn_name || toStation,
            departure: trainBase.from_time || t.from_time || '—',
            arrival: trainBase.to_time || t.to_time || '—',
            duration: trainBase.travel_time || t.travel_time || 'N/A',
            class: trainClass || 'N/A',
            availability: 'Check IRCTC',
            price: undefined,
          });
        });
      } catch (err: any) {
        console.warn(`⚠️ Indian Rail API fetch failed for ${fromCode} → ${toStation}:`, err?.message || err);
      }
    }

    const uniqueTrains = aggregated.slice(0, 12);

    const returnMockData = (reason: string) => {
      console.log(`📦 Returning mock data: ${reason}`);
      return res.json({
        success: true,
        data: {
          trains: mockTrainData.slice(0, 5).map((t) => ({
            ...t,
            from: fromCode,
            to: requestedTo || allowedToStations[0],
            class: trainClass || t.class,
            price: (t.price || 1000) + Math.floor(Math.random() * 300) - 150
          })),
          searchQuery: { from: fromCode, to: requestedTo || allowedToStations[0], date, class: trainClass, passengers },
          source: 'mock_data',
          message: `${reason} — showing realistic Indian Railways options`
        }
      });
    };

    if (!uniqueTrains.length) {
      return returnMockData('No trains returned from Indian Rail API');
    }

    return res.json({
      success: true,
      data: {
        trains: uniqueTrains,
        searchQuery: { from: fromCode, to: targetToStations.join(', '), date, class: trainClass, passengers },
        source: 'indianrailapi.com',
        message: `Found ${uniqueTrains.length} train option(s) via Indian Rail API`
      }
    });

  } catch (error: any) {
    console.error('❌ Train search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching trains. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const searchStations = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter required'
      });
    }

    console.log(`🔍 Station search: "${query}"`);

    // Try multiple API endpoints for better coverage
    try {
      // Try v6.db-rest.de first (more reliable)
      const { data } = await axios.get<any[]>(
        'https://v6.db.transport.rest/locations',
        { params: { query, results: 10 }, timeout: 5000 }
      );

      if (Array.isArray(data) && data.length > 0) {
        const stations = data
          .filter((loc) => {
            const type = (loc.type || '').toLowerCase();
            return type.includes('stop') || type.includes('station');
          })
          .slice(0, 10)
          .map((loc) => ({
            id: loc.id,
            name: loc.name || 'Unknown',
            type: loc.type || 'station'
          }));

        if (stations.length > 0) {
          console.log(`✅ Found ${stations.length} stations from API`);
          return res.json({
            success: true,
            data: { stations }
          });
        }
      }
    } catch (apiError: any) {
      console.warn(`⚠️ Station search API failed: ${apiError.message || 'Unknown error'}`);
    }

    // Fallback to popular Indian cities
    const popularMatches = popularCities
      .filter((city) => city.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10)
      .map((city) => ({
        id: city.toLowerCase().replace(/\s+/g, '-'),
        name: city,
        type: 'city'
      }));

    console.log(`📦 Returning ${popularMatches.length} fallback city matches`);
    return res.json({
      success: true,
      data: { stations: popularMatches },
      source: 'fallback'
    });
  } catch (error: any) {
    console.error('❌ Station search error:', error);
    res.status(500).json({
      success: false,
      message: 'Station search failed'
    });
  }
};

const popularCities = [
  'Kolkata', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Patna', 'Kanpur',
  'Nagpur', 'Indore', 'Bhopal', 'Varanasi', 'Agra', 'Surat',
  'Howrah', 'New Delhi', 'Sealdah', 'Mumbai Central',
  'Bangalore City', 'Chennai Central', 'Hyderabad Deccan',
  'Pune Junction', 'Ahmedabad Junction', 'Jaipur Junction',
  'Lucknow Junction', 'Kanpur Central', 'Patna Junction',
  'Nagpur Junction', 'Bhopal Junction', 'Varanasi Junction',
  'Agra Cantt', 'Surat Railway Station', 'Guwahati',
  'Bokaro', 'Bokaro Steel City', 'Dhanbad', 'Ranchi',
  'Asansol', 'Durgapur', 'Siliguri', 'Jalpaiguri',
  'New Jalpaiguri', 'Malda', 'Bardhaman', 'Kharagpur'
];

export const getTrainStatus = async (req: Request, res: Response) => {
  try {
    const { trainNumber } = req.params;

    if (!trainNumber) {
      return res.status(400).json({
        success: false,
        message: 'Train number is required'
      });
    }

    console.log(`📍 Returning mock status for train: ${trainNumber}`);

    // Mock train status data only (no external API)
    const stationSequence = [
      'Howrah Junction',
      'Serampore',
      'Asansol Junction',
      'Durgapur',
      'Bardhaman',
      'Adra Junction',
      'Gomoh Junction',
      'Gaya Junction',
      'Mughal Sarai'
    ];

    const currentIndex = Math.floor(Math.random() * (stationSequence.length - 1));
    const mockStatus = {
      trainNumber,
      currentStatus: Math.random() > 0.2 ? 'On Time' : ('Delayed by ' + (Math.floor(Math.random() * 45) + 5) + ' mins'),
      currentStation: stationSequence[currentIndex],
      nextStation: stationSequence[currentIndex + 1] || 'Final Destination',
      delay: Math.random() > 0.2 ? 0 : Math.floor(Math.random() * 60) + 5,
      lastUpdated: new Date(Date.now() - Math.random() * 5 * 60000).toISOString(), // Within last 5 mins
      platform: Math.floor(Math.random() * 10) + 1,
      source: 'mock'
    };

    console.log('📦 Mock train status generated');

    res.json({
      success: true,
      data: mockStatus
    });

  } catch (error: any) {
    console.error('❌ Train status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating train status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};