/**
 * API Client for YatriAI Mobile
 * 
 * Single Axios client that:
 * - Uses existing backend API base URL
 * - Automatically injects JWT token from AsyncStorage
 * - Handles 401 globally
 * - Authorization: Bearer <token>
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL Configuration:
// - Android Emulator: use 10.0.2.2 (special IP that maps to host's localhost)
// - iOS Simulator: use localhost
// - Android Emulator: use http://10.0.2.2:3001/api (maps to host localhost)
// Default: Android emulator (10.0.2.2)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Inject token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (!this.token) {
          this.token = await AsyncStorage.getItem('token');
        }
        
        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle 401 globally
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          await this.setToken(null);
          // Navigation will be handled by auth store
        }
        return Promise.reject(error);
      }
    );
  }

  async setToken(token: string | null): Promise<void> {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem('token', token);
    } else {
      await AsyncStorage.removeItem('token');
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('token');
    }
    return this.token;
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<ApiResponse<T>>({
        method,
        url: endpoint,
        data,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse<T>>;
        throw new Error(
          axiosError.response?.data?.message || 
          axiosError.message || 
          'Network error'
        );
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string, role?: string): Promise<ApiResponse<{ user: unknown; token: string }>> {
    const response = await this.request<{ user: unknown; token: string }>(
      'POST',
      '/auth/login',
      { email, password, role }
    );
    if (response.data?.token) {
      await this.setToken(response.data.token);
    }
    return response;
  }

  async register(email: string, password: string, name: string, role: string = 'tourist'): Promise<ApiResponse<{ user: unknown; token: string }>> {
    const response = await this.request<{ user: unknown; token: string }>(
      'POST',
      '/auth/register',
      { email, password, name, role }
    );
    if (response.data?.token) {
      await this.setToken(response.data.token);
    }
    return response;
  }

  async getMe(): Promise<ApiResponse<unknown>> {
    return this.request('GET', '/auth/me');
  }

  async updateProfile(data: { name?: string; avatar?: string; preferences?: unknown }): Promise<ApiResponse<unknown>> {
    return this.request('PUT', '/auth/profile', data);
  }

  logout(): Promise<void> {
    return this.setToken(null);
  }

  // Destinations
  async getDestinations(category?: string): Promise<ApiResponse<unknown[]>> {
    const query = category ? `?category=${category}` : '';
    return this.request('GET', `/destinations${query}`);
  }

  async getDestination(id: string): Promise<ApiResponse<unknown>> {
    return this.request('GET', `/destinations/${id}`);
  }

  // Guides
  async getGuides(): Promise<ApiResponse<unknown[]>> {
    return this.request('GET', '/guides');
  }

  async getGuide(id: string): Promise<ApiResponse<unknown>> {
    return this.request('GET', `/guides/${id}`);
  }

  // Products
  async getProducts(category?: string): Promise<ApiResponse<unknown[]>> {
    const query = category ? `?category=${category}` : '';
    return this.request('GET', `/products${query}`);
  }

  async getProduct(id: string): Promise<ApiResponse<unknown>> {
    return this.request('GET', `/products/${id}`);
  }

  // Bookings
  async getMyBookings(): Promise<ApiResponse<unknown[]>> {
    return this.request('GET', '/bookings/my');
  }

  async getBooking(id: string): Promise<ApiResponse<unknown>> {
    return this.request('GET', `/bookings/${id}`);
  }

  async createBooking(data: { type: string; title: string; date: string; amount: number }): Promise<ApiResponse<unknown>> {
    return this.request('POST', '/bookings', data);
  }

  async cancelBooking(id: string): Promise<ApiResponse<unknown>> {
    return this.request('PATCH', `/bookings/${id}/cancel`);
  }

  // Itineraries
  async getMyItineraries(): Promise<ApiResponse<unknown[]>> {
    return this.request('GET', '/itineraries/my');
  }

  async getItinerary(id: string): Promise<ApiResponse<unknown>> {
    return this.request('GET', `/itineraries/${id}`);
  }

  async createItinerary(data: unknown): Promise<ApiResponse<unknown>> {
    return this.request('POST', '/itineraries', data);
  }

  async generateAIItinerary(data: { preferences?: unknown; duration?: number; budget?: string }): Promise<ApiResponse<unknown>> {
    return this.request('POST', '/itineraries/generate', data);
  }

  // Testimonials
  async getTestimonials(): Promise<ApiResponse<unknown[]>> {
    return this.request('GET', '/testimonials');
  }

  async submitFeedback(data: { rating: number; comment: string; sentiment?: string }): Promise<ApiResponse<unknown>> {
    return this.request('POST', '/testimonials/feedback', data);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

