import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Train, 
  Bus, 
  Utensils, 
  Star, 
  Navigation, 
  Users,
  DollarSign,
  CheckCircle,
  Zap
} from 'lucide-react';

const TravelPlanningDemo: React.FC = () => {
  const demoFeatures = [
    {
      icon: Calendar,
      title: 'Smart Itinerary Planning',
      description: 'Create detailed travel plans with dates, times, and duration for each destination',
      color: 'bg-blue-500'
    },
    {
      icon: MapPin,
      title: 'Location-Based Services',
      description: 'Discover nearby metro stations, bus stops, restaurants, and attractions',
      color: 'bg-green-500'
    },
    {
      icon: Train,
      title: 'Transport Integration',
      description: 'Real-time information about metro, bus, and other transport options',
      color: 'bg-purple-500'
    },
    {
      icon: Utensils,
      title: 'Restaurant Recommendations',
      description: 'Find highly-rated restaurants with pricing, hours, and contact information',
      color: 'bg-orange-500'
    },
    {
      icon: Star,
      title: 'Priority Management',
      description: 'Set priority levels for destinations and optimize your travel route',
      color: 'bg-yellow-500'
    },
    {
      icon: DollarSign,
      title: 'Budget Tracking',
      description: 'Track estimated costs for each destination and manage your travel budget',
      color: 'bg-red-500'
    }
  ];

  const samplePlan = {
    title: 'Kolkata Heritage Tour',
    duration: '3 days',
    budget: '₹15,000',
    destinations: 5,
    status: 'confirmed'
  };

  const nearbyServices = [
    { name: 'Maidan Metro Station', type: 'Metro', distance: '800m', rating: 4.2 },
    { name: 'Flurys Restaurant', type: 'Restaurant', distance: '1.2km', rating: 4.5 },
    { name: 'The Park Hotel', type: 'Hotel', distance: '1.5km', rating: 4.4 },
    { name: 'SBI ATM', type: 'ATM', distance: '400m', rating: 3.9 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-kolkata-yellow/10 text-kolkata-terracotta rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Travel Management Dashboard
            </span>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Plan Your Perfect Journey
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Create detailed travel itineraries with smart recommendations for nearby metro stations, 
              bus stops, restaurants, and attractions. Everything you need for a seamless travel experience.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {demoFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Demo Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sample Travel Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Sample Travel Plan
            </h3>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {samplePlan.title}
                </h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {samplePlan.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-kolkata-yellow" />
                  <span className="text-gray-600 dark:text-gray-400">{samplePlan.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-kolkata-yellow" />
                  <span className="text-gray-600 dark:text-gray-400">{samplePlan.budget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-kolkata-yellow" />
                  <span className="text-gray-600 dark:text-gray-400">{samplePlan.destinations} places</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="bg-kolkata-yellow text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white">Victoria Memorial</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jan 15, 09:00 - 3 hours</p>
                </div>
                <span className="px-2 py-1 bg-kolkata-gold text-white text-xs rounded-full">Heritage</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="bg-kolkata-yellow text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white">Howrah Bridge</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jan 15, 16:00 - 2 hours</p>
                </div>
                <span className="px-2 py-1 bg-kolkata-gold text-white text-xs rounded-full">Heritage</span>
              </div>
            </div>
          </motion.div>

          {/* Nearby Services */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Nearby Services
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Around Victoria Memorial
            </p>

            <div className="space-y-3">
              {nearbyServices.map((service, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    service.type === 'Metro' ? 'bg-blue-500' :
                    service.type === 'Restaurant' ? 'bg-orange-500' :
                    service.type === 'Hotel' ? 'bg-purple-500' :
                    'bg-red-500'
                  } text-white`}>
                    {service.type === 'Metro' && <Train className="w-4 h-4" />}
                    {service.type === 'Restaurant' && <Utensils className="w-4 h-4" />}
                    {service.type === 'Hotel' && <Users className="w-4 h-4" />}
                    {service.type === 'ATM' && <DollarSign className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">{service.name}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{service.type}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{service.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{service.distance}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-kolkata-yellow/10 rounded-lg">
              <div className="flex items-center gap-2 text-kolkata-terracotta">
                <Navigation className="w-4 h-4" />
                <span className="text-sm font-medium">4 services found within 2km</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Plan Your Journey?</h3>
            <p className="text-lg mb-6 opacity-90">
              Start creating detailed travel plans with smart recommendations and nearby service discovery.
            </p>
            <button className="bg-white text-kolkata-terracotta px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started Now
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TravelPlanningDemo;