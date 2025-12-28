/**
 * Transport Service for Real-Time Transport Data
 * 
 * This service provides methods to fetch real-time transport availability data
 * from various APIs. You can integrate with:
 * 
 * 1. Indian Railways APIs:
 *    - IRCTC API (requires authentication)
 *    - Railway API (https://railwayapi.com/)
 *    - Trainman API (https://www.trainman.in/api)
 * 
 * 2. Kolkata Metro APIs:
 *    - Kolkata Metro Rail Corporation (KMRC) - Check their official website
 *    - GTFS Realtime feeds if available
 * 
 * 3. General Transit APIs:
 *    - GTFS Realtime (General Transit Feed Specification)
 *    - Open Transit Data APIs
 * 
 * Example API Integration:
 */

export interface TransportRoute {
  id: string;
  routeNumber?: string;
  name: string;
  from: string;
  to: string;
  status: 'running' | 'delayed' | 'suspended';
  nextArrival?: number; // minutes
  nextTrain?: number; // minutes
  nextBus?: number; // minutes
  frequency: string;
  stops?: Array<{ name: string; heritage?: string }>;
  majorStops?: string[];
  color?: string;
  heritage?: string;
}

export interface TransportAPIResponse {
  success: boolean;
  data?: TransportRoute[];
  error?: string;
  lastUpdated?: string;
}

class TransportService {
  private baseUrl: string;
  private apiKey: string | null = null;
  private useMock: boolean;

  constructor() {
    // Use Beeceptor URL if available, otherwise fallback to mock
    const beceptorUrl = import.meta.env.VITE_BEECEPTOR_URL || 'https://yatriai.free.beeceptor.com';
    this.baseUrl = import.meta.env.VITE_TRANSPORT_API_URL || `${beceptorUrl}/api/transport`;
    this.apiKey = import.meta.env.VITE_TRANSPORT_API_KEY || null;
    this.useMock = import.meta.env.VITE_USE_MOCK_TRANSPORT !== 'false';
  }

  /**
   * Fetch real-time tram routes data from Beeceptor API
   */
  async getTramRoutes(): Promise<TransportAPIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/trams`, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.routes || data.data || [],
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching tram routes:', error);
      if (this.useMock) {
        return this.getMockTramRoutes();
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getMockTramRoutes(): TransportAPIResponse {
    // Generate dynamic arrival times (simulating real-time updates)
    const baseTime = Date.now();
    return {
      success: true,
      data: [
        {
          id: 'tram-36',
          routeNumber: '36',
          name: 'Esplanade - Gariahat',
          from: 'Esplanade',
          to: 'Gariahat',
          status: 'running' as const,
          nextArrival: Math.max(1, Math.floor(Math.random() * 5) + 2),
          frequency: '15 min',
          color: '#FFB800',
        },
        {
          id: 'tram-5',
          routeNumber: '5',
          name: 'Howrah Station - Esplanade',
          from: 'Howrah Station',
          to: 'Esplanade',
          status: 'running' as const,
          nextArrival: Math.max(1, Math.floor(Math.random() * 10) + 5),
          frequency: '20 min',
          color: '#E23D28',
        },
        {
          id: 'tram-25',
          routeNumber: '25',
          name: 'Shyambazar - Tollygunge',
          from: 'Shyambazar',
          to: 'Tollygunge',
          status: Math.random() > 0.8 ? 'delayed' as const : 'running' as const,
          nextArrival: Math.max(1, Math.floor(Math.random() * 8) + 10),
          frequency: '12 min',
          color: '#C45C26',
        },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Fetch real-time metro lines data from Beeceptor API
   */
  async getMetroLines(): Promise<TransportAPIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/metro`, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.lines || data.data || [],
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching metro lines:', error);
      if (this.useMock) {
        return this.getMockMetroLines();
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getMockMetroLines(): TransportAPIResponse {
    return {
      success: true,
      data: [
        {
          id: 'metro-blue',
          name: 'Blue Line (North-South)',
          from: 'Dakshineswar',
          to: 'Kavi Subhash',
          status: 'running' as const,
          nextTrain: Math.max(1, Math.floor(Math.random() * 3) + 1),
          frequency: '5 min',
          color: '#1E3A5F',
        },
        {
          id: 'metro-green',
          name: 'Green Line (East-West)',
          from: 'Salt Lake Sector V',
          to: 'Howrah Maidan',
          status: 'running' as const,
          nextTrain: Math.max(1, Math.floor(Math.random() * 5) + 2),
          frequency: '8 min',
          color: '#2D5A27',
        },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Fetch real-time local train data from Beeceptor API
   */
  async getLocalTrains(): Promise<TransportAPIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/trains`, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.trains || data.data || [],
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching local trains:', error);
      if (this.useMock) {
        return this.getMockLocalTrains();
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getMockLocalTrains(): TransportAPIResponse {
    return {
      success: true,
      data: [
        {
          id: 'sealdah-main',
          name: 'Sealdah Main Line',
          from: 'Sealdah',
          to: 'Ranaghat',
          status: 'running' as const,
          nextTrain: Math.max(1, Math.floor(Math.random() * 6) + 3),
          frequency: '10 min',
          color: '#C45C26',
        },
        {
          id: 'howrah-main',
          name: 'Howrah Main Line',
          from: 'Howrah',
          to: 'Bardhaman',
          status: 'running' as const,
          nextTrain: Math.max(1, Math.floor(Math.random() * 8) + 5),
          frequency: '15 min',
          color: '#C45C26',
        },
        {
          id: 'circular',
          name: 'Kolkata Circular Railway',
          from: 'Majerhat',
          to: 'Dum Dum',
          status: Math.random() > 0.85 ? 'delayed' as const : 'running' as const,
          nextTrain: Math.max(1, Math.floor(Math.random() * 10) + 8),
          frequency: '20 min',
          color: '#C45C26',
        },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Fetch real-time bus routes data from Beeceptor API
   */
  async getBusRoutes(): Promise<TransportAPIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/buses`, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.routes || data.data || [],
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching bus routes:', error);
      if (this.useMock) {
        return this.getMockBusRoutes();
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getMockBusRoutes(): TransportAPIResponse {
    return {
      success: true,
      data: [
        {
          id: 'bus-s12',
          routeNumber: 'S12',
          name: 'Airport - Howrah',
          from: 'Airport',
          to: 'Howrah',
          status: 'running' as const,
          nextBus: Math.max(1, Math.floor(Math.random() * 8) + 4),
          frequency: '20 min',
          color: '#2D5A27',
        },
        {
          id: 'bus-230',
          routeNumber: '230',
          name: 'Garia - Esplanade',
          from: 'Garia',
          to: 'Esplanade',
          status: 'running' as const,
          nextBus: Math.max(1, Math.floor(Math.random() * 4) + 1),
          frequency: '10 min',
          color: '#2D5A27',
        },
        {
          id: 'bus-heritage',
          routeNumber: 'H1',
          name: 'Heritage Special',
          from: 'Victoria Memorial',
          to: 'Howrah Bridge',
          status: 'running' as const,
          nextBus: Math.max(1, Math.floor(Math.random() * 12) + 10),
          frequency: '30 min',
          color: '#2D5A27',
        },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Fetch all transport data at once
   */
  async getAllTransportData(): Promise<{
    trams: TransportAPIResponse;
    metro: TransportAPIResponse;
    trains: TransportAPIResponse;
    buses: TransportAPIResponse;
  }> {
    const [trams, metro, trains, buses] = await Promise.all([
      this.getTramRoutes(),
      this.getMetroLines(),
      this.getLocalTrains(),
      this.getBusRoutes(),
    ]);

    return { trams, metro, trains, buses };
  }
}

export const transportService = new TransportService();

/**
 * API INTEGRATION GUIDE:
 * 
 * 1. SETUP ENVIRONMENT VARIABLES:
 *    Create a .env file in your project root:
 *    VITE_TRANSPORT_API_URL=https://your-api-url.com
 *    VITE_TRANSPORT_API_KEY=your-api-key-here
 * 
 * 2. AVAILABLE APIs FOR INDIA:
 * 
 *    A. Railway API (https://railwayapi.com/):
 *       - Provides train schedules, live status, PNR status
 *       - Requires API key registration
 *       - Endpoint: https://api.railwayapi.com/v2/
 * 
 *    B. Trainman API:
 *       - Real-time train tracking
 *       - Requires API key
 * 
 *    C. IRCTC APIs:
 *       - Official Indian Railways APIs
 *       - Requires IRCTC account and API access
 * 
 *    D. GTFS Realtime:
 *       - Standard format for public transit data
 *       - Check if Kolkata Metro/Bus services provide GTFS feeds
 *       - Format: protobuf or JSON
 * 
 * 3. EXAMPLE INTEGRATION WITH RAILWAY API:
 * 
 *    async getLocalTrains(): Promise<TransportAPIResponse> {
 *      const response = await fetch(
 *        `https://api.railwayapi.com/v2/live/train/${trainNumber}/date/${date}/apikey/${this.apiKey}/`
 *      );
 *      const data = await response.json();
 *      
 *      return {
 *        success: true,
 *        data: data.trains.map(train => ({
 *           id: train.number,
 *           name: train.name,
 *           status: train.live_status === 'LATE' ? 'delayed' : 'running',
 *           nextTrain: train.current_station.arrival_time,
 *           // ... map other fields
 *         })),
 *      };
 *    }
 * 
 * 4. EXAMPLE INTEGRATION WITH GTFS REALTIME:
 * 
 *    async getMetroLines(): Promise<TransportAPIResponse> {
 *      // GTFS Realtime uses Protocol Buffers
 *      // You'll need @gtfs-realtime-bindings package
 *      const response = await fetch('https://metro-api.example.com/gtfs-rt/vehiclepositions');
 *      const buffer = await response.arrayBuffer();
 *      const feed = GtfsRealtimeBindings.FeedMessage.decode(new Uint8Array(buffer));
 *      
 *      return {
 *        success: true,
 *        data: feed.entity.map(entity => ({
 *           id: entity.id,
 *           // ... map GTFS data to your format
 *         })),
 *      };
 *    }
 * 
 * 5. UPDATE FREQUENCY:
 *    - Set up polling interval (every 30-60 seconds recommended)
 *    - Use WebSockets if API supports it for real-time updates
 *    - Cache responses to reduce API calls
 * 
 * 6. ERROR HANDLING:
 *    - Always handle API failures gracefully
 *    - Fall back to cached data if available
 *    - Show user-friendly error messages
 */

