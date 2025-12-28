export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tourist' | 'admin' | 'guide' | 'seller';
  avatar?: string;
  preferences?: TravelPreferences;
  isVerified?: boolean;
}

export interface TravelPreferences {
  interests: string[];
  budget: 'budget' | 'mid-range' | 'luxury';
  travelStyle: 'solo' | 'couple' | 'family' | 'group';
  duration: number;
}

// Kolkata-specific destination categories
export type DestinationCategory = 
  | 'heritage' 
  | 'temples' 
  | 'culture' 
  | 'literature' 
  | 'food' 
  | 'markets' 
  | 'nature' 
  | 'cultural' 
  | 'adventure' 
  | 'spiritual';

export interface Destination {
  id: string;
  name: string;
  nameBengali?: string;
  description: string;
  image: string;
  category: DestinationCategory;
  rating: number;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Guide {
  id: string;
  name: string;
  nameBengali?: string;
  avatar: string;
  rating: number;
  experience: number;
  languages: string[];
  specialties: string[];
  pricePerDay: number;
  isVerified: boolean;
  location: string;
  bio?: string;
}

export interface Product {
  id: string;
  name: string;
  nameBengali?: string;
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

export interface Booking {
  id: string;
  type: 'guide' | 'accommodation' | 'package';
  title: string;
  titleBengali?: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
  blockchainHash?: string;
}

export interface Itinerary {
  id: string;
  title: string;
  titleBengali?: string;
  duration: number;
  destinations: Destination[];
  activities: string[];
  estimatedCost: number;
  createdAt: string;
}

// Kolkata-specific types
export interface PujoPandal {
  id: string;
  name: string;
  nameBengali?: string;
  location: string;
  theme: string;
  rating: number;
  crowdLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  bestVisitTime: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface TramRoute {
  id: string;
  routeNumber: string;
  from: string;
  to: string;
  stops: string[];
  heritage: string;
  frequency: string;
  operatingHours: string;
}

export interface Testimonial {
  id: string;
  name: string;
  nameBengali?: string;
  avatar: string;
  rating: number;
  comment: string;
  sentiment: string;
  location: string;
}

// Admin dashboard specific types
export type AdminUserStatus = 'Active' | 'Blocked';
export type AdminUserRole = 'tourist' | 'guide' | 'seller';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinDate: string;
  avatar: string;
}

// Guide Dashboard types
export type TourStatus = 'Active' | 'Draft' | 'Paused';
export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

export interface GuideTour {
  id: string;
  title: string;
  titleBengali?: string;
  description: string;
  image: string;
  status: TourStatus;
  duration: string;
  price: number;
  bookings: number;
}

export interface GuideBooking {
  id: string;
  tourName: string;
  touristName: string;
  touristEmail: string;
  date: string;
  status: BookingStatus;
  amount: number;
  participants: number;
}

// Marketplace types
export type ProductStatus = 'Active' | 'Out of Stock' | 'Draft';

export interface VendorProduct {
  id: string;
  name: string;
  nameBengali?: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  status: ProductStatus;
  sales: number;
}
