import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import BeaconNodeHead from './BeaconNodeHead';
import BeaconNode from './BeaconNode';
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  AlertCircle, 
  Star, 
  Clock, 
  Route,
  RefreshCw,
  Camera,
  Eye,
  MapIcon,
  Radio,
  Smartphone
} from 'lucide-react';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface TouristPlace {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  distance: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  image?: string;
  openingHours?: string;
  estimatedVisitTime?: string;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

// Custom icons for different categories
const createCustomIcon = (category: string, index: number) => {
  const categoryColors = {
    'Historical Monument': '#d97706', // amber-600
    'Religious Site': '#9333ea',      // purple-600
    'Museum': '#2563eb',              // blue-600
    'Landmark': '#16a34a',            // green-600
    'Educational': '#4f46e5',         // indigo-600
    'Shopping Mall': '#dc2626',       // red-600
    'Restaurant': '#ea580c',          // orange-600
    'Park': '#059669',                // emerald-600
    'Sports Venue': '#ca8a04',        // yellow-600
    'Transit Hub': '#7c3aed',         // violet-600
    'Metro Station': '#0891b2',       // cyan-600
    'Bus Stop': '#65a30d',            // lime-600
    'Heritage': '#92400e',            // amber-800 for heritage sites
  };

  const color = categoryColors[category as keyof typeof categoryColors] || '#f97316'; // orange-500

  // Different icons for transit types
  let iconSymbol: string | number = index + 1;
  if (category === 'Metro Station') iconSymbol = 'M';
  if (category === 'Bus Stop') iconSymbol = 'B';
  if (category === 'Transit Hub') iconSymbol = 'T';
  if (['Historical Monument', 'Religious Site', 'Museum'].includes(category)) iconSymbol = 'H';

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${typeof iconSymbol === 'string' ? '12px' : '14px'};
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        animation: bounce 2s infinite;
        animation-delay: ${index * 0.1}s;
      ">
        ${iconSymbol}
      </div>
      <style>
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      </style>
    `,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// User location icon
const userLocationIcon = L.divIcon({
  html: `
    <div style="
      background-color: #ef4444;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }
    </style>
  `,
  className: 'user-location-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Component to fit map bounds
const MapBounds: React.FC<{ userLocation: UserLocation; places: TouristPlace[] }> = ({ userLocation, places }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation && places.length > 0) {
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng] as [number, number],
        ...places.map(place => [place.coordinates.lat, place.coordinates.lng] as [number, number])
      ]);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [map, userLocation, places]);

  return null;
};

const GPSSuggestions: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<TouristPlace[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<TouristPlace | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default
  const [activeTab, setActiveTab] = useState<'all' | 'restaurants' | 'shopping' | 'transit' | 'metro' | 'bus' | 'heritage' | 'beacon-head' | 'beacon-node' | 'ai'>('all');

  // Mock tourist places data for Kolkata area
  const mockTouristPlaces: TouristPlace[] = [
    {
      id: '1',
      name: 'Victoria Memorial',
      description: 'Iconic marble monument dedicated to Queen Victoria, showcasing Indo-Saracenic architecture.',
      category: 'Historical Monument',
      rating: 4.5,
      distance: 0,
      coordinates: { lat: 22.5448, lng: 88.3426 },
      openingHours: '10:00 AM - 6:00 PM',
      estimatedVisitTime: '2-3 hours'
    },
    {
      id: '11',
      name: 'Kolkata Maidan',
      description: 'Large urban park in the heart of Kolkata, perfect for morning walks and recreational activities.',
      category: 'Park',
      rating: 4.1,
      distance: 0,
      coordinates: { lat: 22.5726, lng: 88.3539 },
      openingHours: '24 hours',
      estimatedVisitTime: '1-2 hours'
    },
    {
      id: '14',
      name: 'Peter Cat',
      description: 'Famous restaurant known for its Chelo Kebabs and continental cuisine in Park Street.',
      category: 'Restaurant',
      rating: 4.3,
      distance: 0,
      coordinates: { lat: 22.5519, lng: 88.3617 },
      openingHours: '12:00 PM - 11:30 PM',
      estimatedVisitTime: '1-2 hours'
    },
    {
      id: '18',
      name: 'South City Mall',
      description: 'One of the largest shopping malls in Eastern India with multiple brands and entertainment.',
      category: 'Shopping Mall',
      rating: 4.2,
      distance: 0,
      coordinates: { lat: 22.5067, lng: 88.3689 },
      openingHours: '11:00 AM - 10:00 PM',
      estimatedVisitTime: '2-4 hours'
    },
    {
      id: '22',
      name: 'Sealdah Railway Station',
      description: 'Major railway terminus connecting Kolkata to North and East Bengal.',
      category: 'Transit Hub',
      rating: 3.8,
      distance: 0,
      coordinates: { lat: 22.5689, lng: 88.3694 },
      openingHours: '24 hours',
      estimatedVisitTime: '30 minutes'
    }
  ];

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Format distance for display
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  // Calculate walking time
  const calculateWalkingTime = (distance: number): string => {
    const walkingSpeedKmh = 5;
    const timeInHours = (distance / 1000) / walkingSpeedKmh;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    if (timeInMinutes < 1) return '< 1 min walk';
    if (timeInMinutes < 60) return `${timeInMinutes} min walk`;
    
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return `${hours}h ${minutes}m walk`;
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'historical monument':
        return <Camera className="w-4 h-4" />;
      case 'religious site':
        return <Star className="w-4 h-4" />;
      case 'museum':
        return <Eye className="w-4 h-4" />;
      case 'landmark':
        return <MapIcon className="w-4 h-4" />;
      case 'park':
        return <MapPin className="w-4 h-4" />;
      case 'sports venue':
        return <Route className="w-4 h-4" />;
      case 'restaurant':
        return <Camera className="w-4 h-4" />;
      case 'shopping mall':
        return <Eye className="w-4 h-4" />;
      case 'transit hub':
        return <Navigation className="w-4 h-4" />;
      case 'metro station':
        return <Navigation className="w-4 h-4" />;
      case 'bus stop':
        return <Navigation className="w-4 h-4" />;
      case 'heritage':
        return <Star className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'historical monument':
        return 'from-amber-500 to-amber-600';
      case 'religious site':
        return 'from-purple-500 to-purple-600';
      case 'museum':
        return 'from-blue-500 to-blue-600';
      case 'landmark':
        return 'from-green-500 to-green-600';
      case 'park':
        return 'from-emerald-500 to-emerald-600';
      case 'sports venue':
        return 'from-orange-500 to-orange-600';
      case 'restaurant':
        return 'from-red-500 to-red-600';
      case 'shopping mall':
        return 'from-pink-500 to-pink-600';
      case 'transit hub':
        return 'from-violet-500 to-violet-600';
      case 'metro station':
        return 'from-cyan-500 to-cyan-600';
      case 'bus stop':
        return 'from-lime-500 to-lime-600';
      case 'heritage':
        return 'from-amber-600 to-amber-700';
      default:
        return 'from-kolkata-yellow to-kolkata-terracotta';
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setError(null);

    console.log('🌍 Requesting user location...');

    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser';
      console.error('❌', errorMsg);
      setError(errorMsg);
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        console.log('✅ Location obtained:', location);
        setUserLocation(location);
        setIsLoadingLocation(false);
        findNearbyPlaces(location);
      },
      (error) => {
        console.error('❌ Location error:', error);
        setError('Location access denied. Using default Kolkata location for demo.');
        setIsLoadingLocation(false);
        
        // Use default Kolkata location
        const defaultLocation: UserLocation = {
          lat: 22.5726,
          lng: 88.3639,
          accuracy: 100
        };
        console.log('🔄 Using default location:', defaultLocation);
        setUserLocation(defaultLocation);
        findNearbyPlaces(defaultLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Find nearby tourist places
  const findNearbyPlaces = async (location: UserLocation) => {
    setIsLoadingPlaces(true);
    
    console.log('🔍 Finding nearby places for location:', location);
    
    try {
      const token = localStorage.getItem('token') || `mock-token-user123-${Date.now()}`;
      
      const response = await fetch('/api/places/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          radius: searchRadius
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📡 API response:', result);
      
      if (result.success && result.data.places.length > 0) {
        console.log(`✅ Found ${result.data.count} places from API`);
        setNearbyPlaces(result.data.places);
      } else {
        throw new Error('No places found from API');
      }
    } catch (error) {
      console.error('❌ Error fetching nearby places:', error);
      console.log('🔄 Using fallback mock data');
      
      // Fallback to mock data
      const placesWithDistance = mockTouristPlaces.map(place => ({
        ...place,
        distance: calculateDistance(
          location.lat,
          location.lng,
          place.coordinates.lat,
          place.coordinates.lng
        )
      })).filter(place => place.distance <= searchRadius)
        .sort((a, b) => a.distance - b.distance);

      console.log(`🔄 Fallback found ${placesWithDistance.length} places`);
      console.log('🔄 Fallback places:', placesWithDistance);
      setNearbyPlaces(placesWithDistance);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // Get AI-powered suggestions
  const getAISuggestions = async (location: UserLocation, preferences: string[] = []) => {
    setIsLoadingAI(true);
    
    try {
      const token = localStorage.getItem('token') || `mock-token-user123-${Date.now()}`;
      
      const response = await fetch('/api/places/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          radius: searchRadius,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🤖 AI suggestions response:', result);
      
      if (result.success) {
        setAiSuggestions(result.data);
        console.log(`✅ AI generated suggestions for ${preferences.join(', ')}`);
      } else {
        throw new Error(result.message || 'Failed to get AI suggestions');
      }
    } catch (error) {
      console.error('❌ Error fetching AI suggestions:', error);
      // Generate fallback AI suggestions
      const fallbackSuggestions = {
        suggestions: {
          restaurants: nearbyPlaces.filter(p => p.category === 'Restaurant').slice(0, 3),
          shopping: nearbyPlaces.filter(p => p.category === 'Shopping Mall').slice(0, 3),
          transit: nearbyPlaces.filter(p => p.category === 'Transit Hub').slice(0, 3),
          metroStations: nearbyPlaces.filter(p => p.category === 'Metro Station').slice(0, 3),
          busStops: nearbyPlaces.filter(p => p.category === 'Bus Stop').slice(0, 3),
          heritage: nearbyPlaces.filter(p => 
            ['Historical Monument', 'Religious Site', 'Museum'].includes(p.category)
          ).slice(0, 3),
          recommended: nearbyPlaces.filter(p => p.rating >= 4.2).slice(0, 5)
        },
        insights: {
          totalPlaces: nearbyPlaces.length,
          nearestHeritage: nearbyPlaces.filter(p => 
            ['Historical Monument', 'Religious Site', 'Museum'].includes(p.category)
          )[0]?.name || 'None found',
          nearestRestaurant: nearbyPlaces.filter(p => p.category === 'Restaurant')[0]?.name || 'None found',
          nearestMall: nearbyPlaces.filter(p => p.category === 'Shopping Mall')[0]?.name || 'None found',
          nearestTransit: nearbyPlaces.filter(p => p.category === 'Transit Hub')[0]?.name || 'None found',
          nearestMetro: nearbyPlaces.filter(p => p.category === 'Metro Station')[0]?.name || 'None found',
          nearestBusStop: nearbyPlaces.filter(p => p.category === 'Bus Stop')[0]?.name || 'None found',
          recommendation: "Explore the nearby attractions and enjoy your visit to Kolkata!"
        }
      };
      setAiSuggestions(fallbackSuggestions);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      getAISuggestions(userLocation, ['restaurants', 'shopping', 'transit', 'heritage']);
    }
  }, [userLocation, searchRadius]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-full">
            <Navigation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heritage">
            Nearby Attractions
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover amazing places within 5km of your current location with AI-powered suggestions and beacon node storytelling
        </p>
      </motion.div>

      {/* Location Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Location
          </h2>
          <button
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="flex items-center space-x-2 px-4 py-2 bg-kolkata-yellow text-white rounded-lg hover:bg-kolkata-terracotta transition-colors disabled:opacity-50"
          >
            {isLoadingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </button>
        </div>

        {isLoadingLocation && (
          <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Getting your location...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-3 text-orange-600 dark:text-orange-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {userLocation && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-green-600 dark:text-green-400">
              <MapPin className="w-5 h-5" />
              <span>Location found with {userLocation.accuracy}m accuracy</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-gray-600 dark:text-gray-300 mb-1">Coordinates</div>
                <div className="font-mono text-gray-900 dark:text-white">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-gray-600 dark:text-gray-300 mb-1">Accuracy</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  ±{Math.round(userLocation.accuracy)}m
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-gray-600 dark:text-gray-300 mb-1">Places Found</div>
                <div className="font-semibold text-kolkata-terracotta">
                  {nearbyPlaces.length} within {searchRadius/1000}km
                </div>
              </div>
            </div>
            
            {/* Search Radius Selector */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Radius
              </label>
              <div className="flex space-x-2">
                {[1000, 2000, 3000, 5000].map((radius) => (
                  <button
                    key={radius}
                    onClick={() => {
                      setSearchRadius(radius);
                      if (userLocation) {
                        findNearbyPlaces(userLocation);
                        getAISuggestions(userLocation, ['restaurants', 'shopping', 'transit', 'heritage']);
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      searchRadius === radius
                        ? 'bg-kolkata-yellow text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {radius/1000}km
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Interactive Leaflet Map */}
      {userLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Interactive Map - {searchRadius/1000}km Radius
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              {isLoadingPlaces ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading places...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>{nearbyPlaces.length} places found</span>
                </>
              )}
            </div>
          </div>
          
          <div className="h-96 relative">
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              className="rounded-b-xl"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User location marker */}
              <Marker 
                position={[userLocation.lat, userLocation.lng]} 
                icon={userLocationIcon}
              >
                <Popup>
                  <div className="text-center">
                    <strong>You are here</strong><br/>
                    <small>Accuracy: ±{Math.round(userLocation.accuracy)}m</small>
                  </div>
                </Popup>
              </Marker>

              {/* Search radius circle */}
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={searchRadius}
                pathOptions={{
                  color: '#fbbf24',
                  fillColor: '#fbbf24',
                  fillOpacity: 0.1,
                  weight: 3,
                  dashArray: '10, 10'
                }}
              />

              {/* Additional translucent circle around user location */}
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={500} // 500m inner circle
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />

              {/* Tourist place markers */}
              {nearbyPlaces.map((place, index) => (
                <Marker
                  key={place.id}
                  position={[place.coordinates.lat, place.coordinates.lng]}
                  icon={createCustomIcon(place.category, index)}
                  eventHandlers={{
                    click: () => setSelectedPlace(place)
                  }}
                >
                  <Popup>
                    <div className="min-w-64">
                      <h4 className="font-bold text-lg mb-2">{place.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{place.category}</p>
                      <p className="text-sm mb-3">{place.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{place.rating}</span>
                        </span>
                        <span className="text-kolkata-terracotta font-medium">
                          {formatDistance(place.distance)}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <div>🚶 {calculateWalkingTime(place.distance)}</div>
                        {place.openingHours && <div>🕒 {place.openingHours}</div>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Auto-fit bounds */}
              <MapBounds userLocation={userLocation} places={nearbyPlaces} />
            </MapContainer>
          </div>
        </motion.div>
      )}

      {/* AI Suggestions Panel */}
      {userLocation && aiSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-kolkata-yellow/10 to-kolkata-terracotta/10 rounded-xl shadow-lg p-6 border border-kolkata-yellow/20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI-Powered Suggestions
            </h3>
            {isLoadingAI && <Loader2 className="w-5 h-5 animate-spin text-kolkata-terracotta" />}
          </div>

          {aiSuggestions.insights && (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-gray-300 italic">
                "{aiSuggestions.insights.recommendation}"
              </p>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-3 text-sm">
                <div>
                  <span className="text-gray-500">Total Places:</span>
                  <span className="ml-1 font-semibold">{aiSuggestions.insights.totalPlaces}</span>
                </div>
                <div>
                  <span className="text-gray-500">Nearest Heritage:</span>
                  <span className="ml-1 font-semibold text-amber-700">{aiSuggestions.insights.nearestHeritage}</span>
                </div>
                <div>
                  <span className="text-gray-500">Nearest Restaurant:</span>
                  <span className="ml-1 font-semibold text-red-600">{aiSuggestions.insights.nearestRestaurant}</span>
                </div>
                <div>
                  <span className="text-gray-500">Nearest Mall:</span>
                  <span className="ml-1 font-semibold text-pink-600">{aiSuggestions.insights.nearestMall}</span>
                </div>
                <div>
                  <span className="text-gray-500">Nearest Metro:</span>
                  <span className="ml-1 font-semibold text-cyan-600">{aiSuggestions.insights.nearestMetro}</span>
                </div>
                <div>
                  <span className="text-gray-500">Nearest Bus:</span>
                  <span className="ml-1 font-semibold text-lime-600">{aiSuggestions.insights.nearestBusStop}</span>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: 'all', label: 'All Places', icon: MapPin },
              { key: 'ai', label: 'AI Recommended', icon: Star },
              { key: 'heritage', label: 'Heritage Sites', icon: Camera },
              { key: 'restaurants', label: 'Restaurants', icon: Camera },
              { key: 'shopping', label: 'Shopping', icon: Eye },
              { key: 'transit', label: 'All Transit', icon: Navigation },
              { key: 'metro', label: 'Metro Stations', icon: Navigation },
              { key: 'bus', label: 'Bus Stops', icon: Navigation },
              { key: 'beacon-head', label: 'Node Head', icon: Radio },
              { key: 'beacon-node', label: 'Beacon Node', icon: Smartphone }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === key
                    ? 'bg-kolkata-yellow text-white'
                    : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {key !== 'all' && aiSuggestions.suggestions[
                  key === 'metro' ? 'metroStations' : 
                  key === 'bus' ? 'busStops' : 
                  key === 'heritage' ? 'heritage' : 
                  key
                ] && (
                  <span className="bg-kolkata-terracotta text-white text-xs px-2 py-0.5 rounded-full">
                    {aiSuggestions.suggestions[
                      key === 'metro' ? 'metroStations' : 
                      key === 'bus' ? 'busStops' : 
                      key === 'heritage' ? 'heritage' : 
                      key
                    ].length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick AI Recommendations */}
          {activeTab === 'ai' && aiSuggestions.suggestions.recommended && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiSuggestions.suggestions.recommended.map((place: TouristPlace) => (
                <div
                  key={place.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedPlace(place)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(place.category)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                      {getCategoryIcon(place.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {place.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {place.category}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{place.rating}</span>
                        <span className="text-sm text-kolkata-terracotta">
                          {formatDistance(place.distance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Beacon Node Head */}
          {activeTab === 'beacon-head' && (
            <BeaconNodeHead />
          )}

          {/* Beacon Node */}
          {activeTab === 'beacon-node' && (
            <BeaconNode />
          )}
        </motion.div>
      )}

      {/* Places List */}
      {userLocation && !['beacon-head', 'beacon-node'].includes(activeTab) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {activeTab === 'all' ? `Places Within ${searchRadius/1000}km` :
               activeTab === 'ai' ? 'AI Recommendations' :
               activeTab === 'restaurants' ? 'Restaurants' :
               activeTab === 'shopping' ? 'Shopping Malls' :
               activeTab === 'transit' ? 'All Transit Options' :
               activeTab === 'metro' ? 'Metro Stations' :
               activeTab === 'bus' ? 'Bus Stops' :
               activeTab === 'heritage' ? 'Heritage Sites' : 'Places'}
              {(() => {
                let count = 0;
                if (activeTab === 'all') count = nearbyPlaces.length;
                else if (activeTab === 'ai' && aiSuggestions?.suggestions?.recommended) count = aiSuggestions.suggestions.recommended.length;
                else if (activeTab === 'restaurants' && aiSuggestions?.suggestions?.restaurants) count = aiSuggestions.suggestions.restaurants.length;
                else if (activeTab === 'shopping' && aiSuggestions?.suggestions?.shopping) count = aiSuggestions.suggestions.shopping.length;
                else if (activeTab === 'transit' && aiSuggestions?.suggestions?.transit) count = aiSuggestions.suggestions.transit.length;
                else if (activeTab === 'metro' && aiSuggestions?.suggestions?.metroStations) count = aiSuggestions.suggestions.metroStations.length;
                else if (activeTab === 'bus' && aiSuggestions?.suggestions?.busStops) count = aiSuggestions.suggestions.busStops.length;
                else if (activeTab === 'heritage' && aiSuggestions?.suggestions?.heritage) count = aiSuggestions.suggestions.heritage.length;
                
                return count > 0 ? ` (${count})` : '';
              })()}
            </h3>
            {(isLoadingPlaces || isLoadingAI) && (
              <Loader2 className="w-5 h-5 animate-spin text-kolkata-terracotta" />
            )}
          </div>

          {(() => {
            let displayPlaces = nearbyPlaces;
            
            if (activeTab === 'ai' && aiSuggestions?.suggestions?.recommended) {
              displayPlaces = aiSuggestions.suggestions.recommended;
            } else if (activeTab === 'restaurants' && aiSuggestions?.suggestions?.restaurants) {
              displayPlaces = aiSuggestions.suggestions.restaurants;
            } else if (activeTab === 'shopping' && aiSuggestions?.suggestions?.shopping) {
              displayPlaces = aiSuggestions.suggestions.shopping;
            } else if (activeTab === 'transit' && aiSuggestions?.suggestions?.transit) {
              displayPlaces = aiSuggestions.suggestions.transit;
            } else if (activeTab === 'heritage' && aiSuggestions?.suggestions?.heritage) {
              displayPlaces = aiSuggestions.suggestions.heritage;
            } else if (activeTab === 'metro' && aiSuggestions?.suggestions?.metroStations) {
              displayPlaces = aiSuggestions.suggestions.metroStations;
            } else if (activeTab === 'bus' && aiSuggestions?.suggestions?.busStops) {
              displayPlaces = aiSuggestions.suggestions.busStops;
            }

            return displayPlaces.length > 0 ? (
              <div className="space-y-4">
                {displayPlaces.map((place, index) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-kolkata-yellow transition-colors cursor-pointer"
                    onClick={() => setSelectedPlace(place)}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${getCategoryColor(place.category)} rounded-lg flex items-center justify-center text-white shadow-lg`}>
                      {getCategoryIcon(place.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {place.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {place.category}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-medium text-kolkata-terracotta">
                            {formatDistance(place.distance)}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {place.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                        {place.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Navigation className="w-3 h-3" />
                          <span>{calculateWalkingTime(place.distance)}</span>
                        </div>
                        {place.openingHours && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{place.openingHours}</span>
                          </div>
                        )}
                        {place.estimatedVisitTime && (
                          <div className="flex items-center space-x-1">
                            <Route className="w-3 h-3" />
                            <span>{place.estimatedVisitTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  No places found in this category within {searchRadius/1000}km of your location
                </p>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Selected Place Modal */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPlace(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedPlace.name}
                  </h3>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-kolkata-terracotta">
                      {selectedPlace.category}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDistance(selectedPlace.distance)} away
                    </span>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedPlace.description}
                  </p>
                  
                  {selectedPlace.openingHours && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedPlace.openingHours}
                      </span>
                    </div>
                  )}
                  
                  {selectedPlace.estimatedVisitTime && (
                    <div className="flex items-center space-x-2">
                      <Route className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Visit time: {selectedPlace.estimatedVisitTime}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button className="flex-1 bg-kolkata-yellow text-white py-2 px-4 rounded-lg hover:bg-kolkata-terracotta transition-colors">
                    Get Directions
                  </button>
                  <button className="flex-1 border border-kolkata-yellow text-kolkata-terracotta py-2 px-4 rounded-lg hover:bg-kolkata-yellow hover:text-white transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GPSSuggestions;