/**
 * Indian Rail API Service
 * 
 * Service to interact with the indian-rail-api for train information
 * API Documentation: https://github.com/AniCrad/indian-rail-api
 */

// Try backend proxy first, then direct API
const BACKEND_API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const DIRECT_API_BASE = import.meta.env.VITE_INDIAN_RAIL_API_BASE || 'http://localhost:3000';
const DEFAULT_API_BASE = `${BACKEND_API_BASE}/api/trains`; // Use backend proxy by default

export interface TrainInfo {
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration?: string;
  class?: string;
  availability?: string;
  price?: number;
}

export interface TrainBetweenStationsResponse {
  success: boolean;
  time_stamp?: number;
  data?: Array<{
    train_base: {
      number?: string;
      train_no?: string;
      name?: string;
      train_name?: string;
      running_days?: Record<string, number>;
    };
    from_stn_name?: string;
    to_stn_name?: string;
    from_time?: string;
    to_time?: string;
    from_stn_code?: string;
    to_stn_code?: string;
  }>;
}

export interface TrainOnDateResponse {
  success: boolean;
  time_stamp?: number;
  data?: Array<{
    train_base: {
      number?: string;
      train_no?: string;
      name?: string;
      train_name?: string;
      running_days?: Record<string, number>;
    };
    from_stn_name?: string;
    to_stn_name?: string;
    from_time?: string;
    to_time?: string;
  }>;
}

export interface TrainRouteResponse {
  success: boolean;
  data?: {
    train_number?: string;
    train_name?: string;
    stations?: Array<{
      station_name?: string;
      station_code?: string;
      arrival_time?: string;
      departure_time?: string;
      halt_time?: string;
      distance?: number;
      day?: number;
    }>;
  };
}

class IndianRailApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = DEFAULT_API_BASE;
  }

  /**
   * Get trains between two stations
   */
  async getTrainsBetweenStations(
    from: string,
    to: string
  ): Promise<TrainBetweenStationsResponse> {
    try {
      // Try backend proxy first (which will proxy to indian-rail-api)
      const response = await fetch(
        `${this.baseUrl}/betweenStations?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error fetching trains between stations:', error);
      // Return empty result instead of throwing
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get trains between stations on a specific date
   * Date format: DD-MM-YYYY
   */
  async getTrainsOnDate(
    from: string,
    to: string,
    date: string
  ): Promise<TrainOnDateResponse> {
    try {
      // Try backend proxy first (which will proxy to indian-rail-api)
      const response = await fetch(
        `${this.baseUrl}/getTrainOn?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`
      );

      if (!response.ok) {
        // If backend proxy fails, try direct API as fallback
        const directUrl = `${this.directApiBase}/trains/getTrainOn?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
        try {
          const directResponse = await fetch(directUrl);
          if (directResponse.ok) {
            return await directResponse.json();
          }
        } catch (directError) {
          // Direct API also failed, continue to throw original error
        }
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error fetching trains on date:', error);
      // Return empty result instead of throwing
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get train information by train number
   */
  async getTrainInfo(trainNo: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/trains/getTrain?trainNo=${encodeURIComponent(trainNo)}`
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching train info:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get train route by train number
   */
  async getTrainRoute(trainNo: string): Promise<TrainRouteResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/trains/getRoute?trainNo=${encodeURIComponent(trainNo)}`
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching train route:', error);
      return {
        success: false,
        data: undefined,
      };
    }
  }

  /**
   * Get live station information
   */
  async getStationLive(stationCode: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/trains/stationLive?code=${encodeURIComponent(stationCode)}`
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching station live info:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get PNR status
   */
  async getPnrStatus(pnr: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/trains/pnrstatus?pnr=${encodeURIComponent(pnr)}`
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching PNR status:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Format date to DD-MM-YYYY format required by the API
   */
  formatDateForApi(date: string): string {
    try {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  /**
   * Convert API response to TrainInfo format
   */
  convertToTrainInfo(
    trainData: any,
    fromCode: string,
    toCode: string,
    trainClass?: string
  ): TrainInfo {
    const trainBase = trainData.train_base || {};
    return {
      trainNumber: trainBase.number || trainBase.train_no || 'N/A',
      trainName: trainBase.name || trainBase.train_name || 'Train',
      from: trainData.from_stn_name || fromCode,
      to: trainData.to_stn_name || toCode,
      departure: trainData.from_time || '—',
      arrival: trainData.to_time || '—',
      class: trainClass || '3A',
      availability: 'Check IRCTC',
      price: undefined,
    };
  }
}

export const indianRailApiService = new IndianRailApiService();
export default indianRailApiService;

