import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Train, 
  Bus, 
  Utensils, 
  Hotel, 
  CreditCard, 
  Star, 
  Navigation, 
  Clock, 
  Phone,
  Search,
  Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NearbyService {
  id: string;
  name: string;
  type: 'metro' | 'bus' | 'restaurant' | 'hotel' | 'atm' | 'hospital' | 'shopping' | 'attraction';
  distance: number; // in meters
  rating: number;
  address: string;
  coordinates: { lat: number; lng: number };
  operatingHours: string;
  contact?: string;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  features?: string[];
  isOpen?: boolean;
  estimatedTime?: number; // walking time in minutes
}

interface NearbyServicesMapProps {
  location: { lat: number; lng: number };
  locationName: string;
  onServiceSelect?: (service: NearbyService) => void;
}

const NearbyServicesMap: React.FC<NearbyServicesMapProps> = ({
  location,
  locationName,
  onServiceSelect
}) => {
  const [services, setServices] = useState<NearbyService[]>([]);
  const [filteredServices, setFilteredServices] = useState<NearbyService[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration - in real app, this would come from APIs like Google Places, Zomato, etc.
  useEffect(() => {
    const mockServices: NearbyService[] = [
      // Metro Stations
      {
        id: '1',
        name: 'Maidan Metro Station',
        type: 'metro',
        distance: 800,
        rating: 4.2,
        address: 'Maidan, Kolkata, West Bengal 700071',
        coordinates: { lat: 22.5448, lng: 88.3426 },
        operatingHours: '06:00 - 22:00',
        contact: '+91-33-2248-3271',
        features: ['Air Conditioned', 'Wheelchair Accessible', 'Security Check'],
        isOpen: true,
        estimatedTime: 10
      },
      {
        id: '2',
        name: 'Park Street Metro Station',
        type: 'metro',
        distance: 1200,
        rating: 4.3,
        address: 'Park Street, Kolkata, West Bengal 700016',
        coordinates: { lat: 22.5512, lng: 88.3579 },
        operatingHours: '06:00 - 22:00',
        contact: '+91-33-2249-8765',
        features: ['Air Conditioned', 'Escalator', 'Parking'],
        isOpen: true,
        estimatedTime: 15
      },
      
      // Bus Stops
      {
        id: '3',
        name: 'Esplanade Bus Terminus',
        type: 'bus',
        distance: 600,
        rating: 3.8,
        address: 'Esplanade, Kolkata, West Bengal 700069',
        coordinates: { lat: 22.5626, lng: 88.3476 },
        operatingHours: '05:00 - 23:00',
        features: ['Multiple Routes', 'AC Buses Available', 'Ticket Counter'],
        isOpen: true,
        estimatedTime: 8
      },
      
      // Restaurants
      {
        id: '4',
        name: 'Flurys',
        type: 'restaurant',
        distance: 1200,
        rating: 4.5,
        address: '18, Park St, Kolkata, West Bengal 700016',
        coordinates: { lat: 22.5512, lng: 88.3579 },
        operatingHours: '07:30 - 22:30',
        contact: '+91-33-2249-7664',
        priceRange: '$$$',
        features: ['Continental', 'Bakery', 'Historic', 'Air Conditioned'],
        isOpen: true,
        estimatedTime: 15
      },
      {
        id: '5',
        name: 'Indian Coffee House',
        type: 'restaurant',
        distance: 2000,
        rating: 4.3,
        address: '15, Bankim Chatterjee St, Kolkata, West Bengal 700073',
        coordinates: { lat: 22.5761, lng: 88.3628 },
        operatingHours: '08:00 - 22:00',
        contact: '+91-33-2241-8496',
        priceRange: '$',
        features: ['Bengali', 'Coffee', 'Historic', 'Adda Spot'],
        isOpen: true,
        estimatedTime: 25
      },
      {
        id: '6',
        name: 'Arsalan',
        type: 'restaurant',
        distance: 1800,
        rating: 4.6,
        address: '191, Park St, Kolkata, West Bengal 700017',
        coordinates: { lat: 22.5512, lng: 88.3579 },
        operatingHours: '12:00 - 23:30',
        contact: '+91-33-2229-4029',
        priceRange: '$$',
        features: ['Biryani', 'Mughlai', 'Takeaway', 'Home Delivery'],
        isOpen: true,
        estimatedTime: 22
      },
      
      // Hotels
      {
        id: '7',
        name: 'The Park Hotel',
        type: 'hotel',
        distance: 1500,
        rating: 4.4,
        address: '17, Park St, Kolkata, West Bengal 700016',
        coordinates: { lat: 22.5512, lng: 88.3579 },
        operatingHours: '24 hours',
        contact: '+91-33-2249-9000',
        priceRange: '$$$$',
        features: ['5 Star', 'Spa', 'Restaurant', 'Business Center'],
        isOpen: true,
        estimatedTime: 18
      },
      
      // ATMs
      {
        id: '8',
        name: 'SBI ATM',
        type: 'atm',
        distance: 400,
        rating: 3.9,
        address: 'Victoria Memorial Gate, Kolkata',
        coordinates: { lat: 22.5448, lng: 88.3426 },
        operatingHours: '24 hours',
        features: ['Cash Withdrawal', 'Balance Inquiry', 'Mini Statement'],
        isOpen: true,
        estimatedTime: 5
      },
      
      // Hospitals
      {
        id: '9',
        name: 'SSKM Hospital',
        type: 'hospital',
        distance: 2500,
        rating: 4.1,
        address: '244, AJC Bose Rd, Kolkata, West Bengal 700020',
        coordinates: { lat: 22.5448, lng: 88.3426 },
        operatingHours: '24 hours',
        contact: '+91-33-2223-3526',
        features: ['Emergency', 'Multi Specialty', 'Government Hospital'],
        isOpen: true,
        estimatedTime: 30
      },
      
      // Shopping
      {
        id: '10',
        name: 'New Market',
        type: 'shopping',
        distance: 1000,
        rating: 4.0,
        address: 'Lindsay St, New Market, Kolkata, West Bengal 700087',
        coordinates: { lat: 22.5626, lng: 88.3476 },
        operatingHours: '10:00 - 20:00',
        features: ['Traditional Market', 'Handicrafts', 'Clothing', 'Bargaining'],
        isOpen: true,
        estimatedTime: 12
      },
      
      // Attractions
      {
        id: '11',
        name: 'St. Paul\'s Cathedral',
        type: 'attraction',
        distance: 900,
        rating: 4.4,
        address: 'Cathedral Rd, Maidan, Kolkata, West Bengal 700071',
        coordinates: { lat: 22.5448, lng: 88.3426 },
        operatingHours: '09:00 - 18:00',
        features: ['Gothic Architecture', 'Historic', 'Photography', 'Peaceful'],
        isOpen: true,
        estimatedTime: 11
      }
    ];

    // Simulate API loading
    setTimeout(() => {
      setServices(mockServices);
      setFilteredServices(mockServices);
      setIsLoading(false);
    }, 1000);
  }, [location]);

  // Filter services based on type and search query
  useEffect(() => {
    let filtered = services;

    if (selectedType !== 'all') {
      filtered = filtered.filter(service => service.type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance);

    setFilteredServices(filtered);
  }, [services, selectedType, searchQuery]);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'metro': return <Train className="w-5 h-5" />;
      case 'bus': return <Bus className="w-5 h-5" />;
      case 'restaurant': return <Utensils className="w-5 h-5" />;
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'atm': return <CreditCard className="w-5 h-5" />;
      case 'hospital': return <MapPin className="w-5 h-5" />;
      case 'shopping': return <MapPin className="w-5 h-5" />;
      case 'attraction': return <Star className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'metro': return 'bg-blue-500';
      case 'bus': return 'bg-green-500';
      case 'restaurant': return 'bg-orange-500';
      case 'hotel': return 'bg-purple-500';
      case 'atm': return 'bg-red-500';
      case 'hospital': return 'bg-pink-500';
      case 'shopping': return 'bg-yellow-500';
      case 'attraction': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${distance}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const serviceTypes = [
    { id: 'all', label: 'All Services', icon: Layers },
    { id: 'metro', label: 'Metro', icon: Train },
    { id: 'bus', label: 'Bus', icon: Bus },
    { id: 'restaurant', label: 'Restaurants', icon: Utensils },
    { id: 'hotel', label: 'Hotels', icon: Hotel },
    { id: 'atm', label: 'ATMs', icon: CreditCard },
    { id: 'hospital', label: 'Hospitals', icon: MapPin },
    { id: 'shopping', label: 'Shopping', icon: MapPin },
    { id: 'attraction', label: 'Attractions', icon: Star }
  ];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Nearby Services
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Around {locationName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Navigation className="w-4 h-4" />
            <span>{filteredServices.length} places found</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search nearby services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-kolkata-yellow focus:border-transparent"
          />
        </div>

        {/* Service Type Filter */}
        <div className="flex flex-wrap gap-2">
          {serviceTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type.id
                    ? 'bg-kolkata-yellow text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredServices.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No services found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => {
                  onServiceSelect?.(service);
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Service Icon */}
                  <div className={`p-2 rounded-lg ${getServiceColor(service.type)} text-white flex-shrink-0`}>
                    {getServiceIcon(service.type)}
                  </div>

                  {/* Service Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {service.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {service.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {service.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {service.rating}
                            </span>
                          </div>
                        )}
                        {service.isOpen && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Open
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                      {service.address}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        {formatDistance(service.distance)}
                      </span>
                      {service.estimatedTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.estimatedTime} min walk
                        </span>
                      )}
                      {service.priceRange && (
                        <span className="flex items-center gap-1">
                          <span>{service.priceRange}</span>
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    {service.features && service.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                        {service.features.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{service.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Contact & Hours */}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{service.operatingHours}</span>
                      {service.contact && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{service.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyServicesMap;