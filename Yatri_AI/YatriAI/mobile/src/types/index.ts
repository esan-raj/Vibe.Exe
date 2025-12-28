/**
 * Type definitions for mobile app
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tourist' | 'admin' | 'guide' | 'seller';
  avatar?: string;
  preferences?: {
    interests: string[];
    budget: 'budget' | 'mid-range' | 'luxury';
    travelStyle: 'solo' | 'couple' | 'family' | 'group';
    duration: number;
  };
  isVerified?: boolean;
}

export interface Booking {
  id: string;
  type: string;
  title: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Guide {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  experience: number;
  languages: string[];
  specialties: string[];
  pricePerDay: number;
  isVerified: boolean;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  seller: {
    name: string;
    rating: number;
    isVerified: boolean;
  };
  inStock: boolean;
}

















