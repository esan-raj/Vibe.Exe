/**
 * Weather Service
 * 
 * Provides weather data for destinations.
 * Uses Beeceptor mock in development, can switch to real weather API in production.
 * Enhanced with Requestly debug support.
 */

import { ServiceURLs, ServiceFlags, ServiceKeys } from './config';
import { createServiceFetch } from '../debug';

// Create debug-enabled fetch for this service
const serviceFetch = createServiceFetch('WeatherService');

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  conditions: string;
  icon: string;
  forecast: ForecastDay[];
  lastUpdated: string;
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  conditions: string;
  icon: string;
  precipitation: number;
}

// Mock weather data for fallback
const mockWeatherData: Record<string, WeatherData> = {
  'ranchi': {
    location: 'Ranchi, Jharkhand',
    temperature: 28,
    feelsLike: 30,
    humidity: 65,
    conditions: 'Partly Cloudy',
    icon: '⛅',
    forecast: [
      { date: 'Today', high: 32, low: 24, conditions: 'Partly Cloudy', icon: '⛅', precipitation: 10 },
      { date: 'Tomorrow', high: 30, low: 23, conditions: 'Sunny', icon: '☀️', precipitation: 0 },
      { date: 'Day 3', high: 29, low: 22, conditions: 'Light Rain', icon: '🌧️', precipitation: 60 },
    ],
    lastUpdated: new Date().toISOString(),
  },
  'hundru-falls': {
    location: 'Hundru Falls, Jharkhand',
    temperature: 26,
    feelsLike: 27,
    humidity: 80,
    conditions: 'Misty',
    icon: '🌫️',
    forecast: [
      { date: 'Today', high: 28, low: 22, conditions: 'Misty', icon: '🌫️', precipitation: 30 },
      { date: 'Tomorrow', high: 27, low: 21, conditions: 'Light Rain', icon: '🌧️', precipitation: 70 },
      { date: 'Day 3', high: 29, low: 22, conditions: 'Cloudy', icon: '☁️', precipitation: 40 },
    ],
    lastUpdated: new Date().toISOString(),
  },
  'sundarbans': {
    location: 'Sundarbans, West Bengal',
    temperature: 25,
    feelsLike: 26,
    humidity: 75,
    conditions: 'Sunny',
    icon: '☀️',
    forecast: [
      { date: 'Today', high: 30, low: 20, conditions: 'Sunny', icon: '☀️', precipitation: 5 },
      { date: 'Tomorrow', high: 31, low: 21, conditions: 'Sunny', icon: '☀️', precipitation: 0 },
      { date: 'Day 3', high: 29, low: 20, conditions: 'Partly Cloudy', icon: '⛅', precipitation: 15 },
    ],
    lastUpdated: new Date().toISOString(),
  },
  'default': {
    location: 'Jharkhand',
    temperature: 27,
    feelsLike: 28,
    humidity: 70,
    conditions: 'Pleasant',
    icon: '🌤️',
    forecast: [
      { date: 'Today', high: 30, low: 22, conditions: 'Pleasant', icon: '🌤️', precipitation: 20 },
      { date: 'Tomorrow', high: 29, low: 21, conditions: 'Sunny', icon: '☀️', precipitation: 10 },
      { date: 'Day 3', high: 28, low: 20, conditions: 'Cloudy', icon: '☁️', precipitation: 35 },
    ],
    lastUpdated: new Date().toISOString(),
  },
};

class WeatherService {
  private baseUrl: string;
  private useMock: boolean;

  constructor() {
    this.baseUrl = ServiceURLs.WEATHER_API;
    this.useMock = ServiceFlags.USE_MOCK_WEATHER;
  }

  /**
   * Get weather for a location
   * Uses Beeceptor mock or falls back to local mock data
   */
  async getWeather(location: string): Promise<WeatherData> {
    const locationKey = location.toLowerCase().replace(/\s+/g, '-');

    // If using local mock (Beeceptor not configured or offline)
    if (this.useMock && !import.meta.env.VITE_BEECEPTOR_URL) {
      return this.getLocalMock(locationKey);
    }

    try {
      // Use debug-enabled fetch
      const response = await serviceFetch(`${this.baseUrl}/${encodeURIComponent(location)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(ServiceKeys.WEATHER_API_KEY && { 'X-API-Key': ServiceKeys.WEATHER_API_KEY }),
        },
      });

      if (!response.ok) {
        console.warn(`Weather API returned ${response.status}, using fallback`);
        return this.getLocalMock(locationKey);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Weather API unavailable, using local mock:', error);
      return this.getLocalMock(locationKey);
    }
  }

  /**
   * Get weather for multiple locations
   */
  async getBatchWeather(locations: string[]): Promise<Record<string, WeatherData>> {
    const results: Record<string, WeatherData> = {};
    
    await Promise.all(
      locations.map(async (location) => {
        results[location] = await this.getWeather(location);
      })
    );

    return results;
  }

  /**
   * Get travel recommendation based on weather
   */
  async getTravelRecommendation(location: string): Promise<{
    recommendation: string;
    bestTime: string;
    packingTips: string[];
  }> {
    const weather = await this.getWeather(location);
    
    // Generate recommendation based on conditions
    let recommendation = '';
    let bestTime = '';
    const packingTips: string[] = [];

    if (weather.temperature > 30) {
      recommendation = 'Hot weather expected. Plan outdoor activities for early morning or evening.';
      bestTime = '6 AM - 9 AM or 4 PM - 7 PM';
      packingTips.push('Sunscreen', 'Hat', 'Light cotton clothes', 'Water bottle');
    } else if (weather.conditions.toLowerCase().includes('rain')) {
      recommendation = 'Rain expected. Waterfalls will be spectacular! Carry rain gear.';
      bestTime = 'Morning visits recommended';
      packingTips.push('Raincoat/Umbrella', 'Waterproof bag', 'Quick-dry clothes', 'Extra footwear');
    } else {
      recommendation = 'Perfect weather for sightseeing and outdoor activities!';
      bestTime = 'Anytime during the day';
      packingTips.push('Comfortable walking shoes', 'Light layers', 'Camera', 'Snacks');
    }

    return { recommendation, bestTime, packingTips };
  }

  private getLocalMock(locationKey: string): WeatherData {
    return mockWeatherData[locationKey] || mockWeatherData['default'];
  }
}

export const weatherService = new WeatherService();
export default weatherService;
