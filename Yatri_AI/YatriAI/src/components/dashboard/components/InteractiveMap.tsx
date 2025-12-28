import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Bus, Train, Car, Headphones, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { destinations } from '../../../data/mockData';
import { AudioGuide } from '../../voice';
import { VoiceButton } from '../../voice';

const InteractiveMap: React.FC = () => {
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [userLocation, setUserLocation] = useState({ lat: 22.5726, lng: 88.3639 }); // Kolkata
  const [transportMode, setTransportMode] = useState<'bus' | 'train' | 'car'>('car');
  const [showAudioGuide, setShowAudioGuide] = useState(false);

  // Generate audio guide content from destination
  const getAudioGuideContent = (destination: any) => ({
    introduction: destination.description || `${destination.name} is one of Kolkata's most treasured destinations, offering visitors a unique blend of cultural heritage and historical significance.`,
    history: `${destination.name} has been an important landmark in Kolkata's history, attracting visitors from across India and abroad. The area is known for its rich Bengali heritage and connection to the city's colonial past and cultural traditions.`,
    highlights: [
      `The main attraction at ${destination.name} offers breathtaking views and unique photo opportunities.`,
      `Local artisans near ${destination.name} create beautiful handicrafts that make perfect souvenirs.`,
      `The surrounding area features pristine nature trails perfect for eco-tourism enthusiasts.`,
    ],
    tips: [
      'Best time to visit is during early morning or late afternoon for optimal lighting',
      'Carry water and snacks as facilities may be limited',
      'Hire a local guide to learn about the cultural significance of the area',
      'Respect the local customs and dress modestly when visiting tribal areas',
    ],
  });

  const transportOptions = [
    { id: 'bus', label: 'Bus', icon: Bus, color: 'text-blue-600' },
    { id: 'train', label: 'Train', icon: Train, color: 'text-green-600' },
    { id: 'car', label: 'Car', icon: Car, color: 'text-orange-600' }
  ];

  const liveTransportData = [
    { type: 'bus', route: 'Kolkata - Sundarbans', time: '2:30 PM', status: 'On Time', delay: 0 },
    { type: 'train', route: 'Ranchi - Jamshedpur', time: '3:15 PM', status: 'Delayed', delay: 15 },
    { type: 'bus', route: 'Dhanbad - Hundru Falls', time: '4:00 PM', status: 'On Time', delay: 0 },
    { type: 'train', route: 'Bokaro - Ranchi', time: '5:45 PM', status: 'On Time', delay: 0 }
  ];

  const nearbyAttractions = [
    { name: 'Rock Garden', distance: '2.3 km', type: 'Park' },
    { name: 'Tagore Hill', distance: '3.1 km', type: 'Viewpoint' },
    { name: 'Kanke Dam', distance: '5.7 km', type: 'Lake' },
    { name: 'Birsa Zoological Park', distance: '8.2 km', type: 'Zoo' }
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Interactive Maps & Navigation 🗺️
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore Kolkata with real-time location tracking and transport information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Container */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 to-blue-900 relative">
              {/* Mock Map Interface */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Interactive Map View
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your current location: Kolkata, West Bengal
                  </p>
                  <button
                    onClick={getCurrentLocation}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Get Current Location</span>
                  </button>
                </div>
              </div>

              {/* Destination Markers */}
              {destinations.map((destination, index) => (
                <button
                  key={destination.id}
                  onClick={() => setSelectedDestination(destination)}
                  className="absolute bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors transform hover:scale-110"
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${30 + index * 10}%`
                  }}
                >
                  <MapPin className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Map Controls */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {transportOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setTransportMode(option.id as any)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          transportMode === option.id
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 ${option.color}`} />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Destination Info */}
          {selectedDestination && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedDestination.name}
                    </h3>
                    {/* Quick Voice Button */}
                    <VoiceButton
                      text={`${selectedDestination.name}. ${selectedDestination.description}`}
                      size="sm"
                      variant="ghost"
                    />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedDestination.description}
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        12.5 km away
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        25 min drive
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Get Directions
                  </button>
                  <button 
                    onClick={() => setShowAudioGuide(true)}
                    className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    <Headphones className="w-4 h-4" />
                    Audio Guide
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Audio Guide Modal */}
          <AnimatePresence>
            {showAudioGuide && selectedDestination && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowAudioGuide(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedDestination.image}
                        alt={selectedDestination.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {selectedDestination.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Powered by ElevenLabs AI Voice
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAudioGuide(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Audio Guide Component */}
                  <AudioGuide
                    destination={selectedDestination.name}
                    content={getAudioGuideContent(selectedDestination)}
                    className="border-none shadow-none"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Transport Updates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Transport</span>
            </h3>
            
            <div className="space-y-3">
              {liveTransportData.map((transport, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {transport.type === 'bus' ? (
                        <Bus className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Train className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {transport.route}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      transport.status === 'On Time'
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    }`}>
                      {transport.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{transport.time}</span>
                    {transport.delay > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        +{transport.delay} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Attractions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nearby Attractions
            </h3>
            
            <div className="space-y-3">
              {nearbyAttractions.map((attraction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {attraction.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {attraction.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {attraction.distance}
                    </p>
                    <button className="text-xs text-green-600 hover:text-green-700 transition-colors">
                      Navigate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Download Offline Map
              </button>
              <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Share Location
              </button>
              <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;