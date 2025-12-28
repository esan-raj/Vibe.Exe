import React, { useState } from 'react';
import { Star, MapPin, MessageCircle, Calendar, Shield, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { guides } from '../../../data/mockData';

const GuideLocator: React.FC = () => {
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const locations = ['all', 'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'];
  const specialties = ['all', 'Wildlife Tours', 'Cultural Tours', 'Adventure Sports', 'Photography', 'Trekking'];

  const filteredGuides = guides.filter(guide => {
    const matchesLocation = filterLocation === 'all' || guide.location === filterLocation;
    const matchesSpecialty = filterSpecialty === 'all' || guide.specialties.includes(filterSpecialty);
    return matchesLocation && matchesSpecialty;
  });

  const sortedGuides = [...filteredGuides].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'experience':
        return b.experience - a.experience;
      case 'price-low':
        return a.pricePerDay - b.pricePerDay;
      case 'price-high':
        return b.pricePerDay - a.pricePerDay;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Find Local Guides 👨‍🏫
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with verified local guides for authentic Kolkata experiences
          </p>
        </div>
        
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          Become a Guide
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Specialty
            </label>
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty === 'all' ? 'All Specialties' : specialty}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Guides List */}
        <div className="lg:col-span-2 space-y-6">
          {sortedGuides.map((guide, index) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => setSelectedGuide(guide)}
            >
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <img
                    src={guide.avatar}
                    alt={guide.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  {guide.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full">
                      <Shield className="w-3 h-3" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {guide.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {guide.location}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {guide.rating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {guide.experience} years exp.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Languages: {guide.languages.join(', ')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {guide.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{guide.pricePerDay.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">/day</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Book Now</span>
                      </button>
                      <button className="border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {sortedGuides.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No guides found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Selected Guide Details */}
        <div className="space-y-6">
          {selectedGuide ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="text-center mb-6">
                <img
                  src={selectedGuide.avatar}
                  alt={selectedGuide.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedGuide.name}
                </h3>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(selectedGuide.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    ({selectedGuide.rating})
                  </span>
                </div>
                {selectedGuide.isVerified && (
                  <div className="flex items-center justify-center space-x-1 text-green-600 dark:text-green-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Blockchain Verified</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Experience</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedGuide.experience} years of guiding experience in Kolkata
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Languages</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedGuide.languages.join(', ')}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuide.specialties.map((specialty: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pricing</h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{selectedGuide.pricePerDay.toLocaleString()}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/day</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                  Book This Guide
                </button>
                <button className="w-full border border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                  Send Message
                </button>
                <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  View Profile
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Guide
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Click on any guide to view their detailed profile and book their services.
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Guide Network Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Guides</span>
                <span className="font-medium text-gray-900 dark:text-white">{guides.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Verified Guides</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {guides.filter(g => g.isVerified).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Rating</span>
                <span className="font-medium text-gray-900 dark:text-white">4.8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Languages Supported</span>
                <span className="font-medium text-gray-900 dark:text-white">12+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideLocator;