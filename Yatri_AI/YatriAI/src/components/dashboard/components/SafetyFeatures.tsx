import React, { useState } from 'react';
import { Shield, Phone, MapPin, AlertTriangle, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const SafetyFeatures: React.FC = () => {
  const [sosActive, setSosActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'Police', number: '100', type: 'police' },
    { name: 'Medical Emergency', number: '108', type: 'medical' },
    { name: 'Fire Department', number: '101', type: 'fire' },
    { name: 'Tourist Helpline', number: '1363', type: 'tourist' }
  ]);

  const safetyTips = [
    {
      title: 'Wildlife Safety',
      tips: [
        'Maintain safe distance from wild animals',
        'Follow guide instructions during safaris',
        'Avoid feeding animals',
        'Stay in designated areas'
      ],
      icon: '🐅'
    },
    {
      title: 'Trekking Safety',
      tips: [
        'Inform someone about your trekking plans',
        'Carry sufficient water and snacks',
        'Wear appropriate footwear',
        'Check weather conditions'
      ],
      icon: '🥾'
    },
    {
      title: 'Cultural Sensitivity',
      tips: [
        'Respect local customs and traditions',
        'Dress modestly at religious sites',
        'Ask permission before photographing people',
        'Learn basic local greetings'
      ],
      icon: '🙏'
    },
    {
      title: 'Health Precautions',
      tips: [
        'Carry basic first aid kit',
        'Drink bottled or purified water',
        'Use insect repellent',
        'Keep emergency medications handy'
      ],
      icon: '🏥'
    }
  ];

  const handleSOS = () => {
    setSosActive(true);
    // Simulate SOS activation
    setTimeout(() => {
      setSosActive(false);
      alert('SOS Alert sent! Emergency services have been notified with your location.');
    }, 3000);
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          alert(`Location shared: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        (error) => {
          alert('Unable to get location. Please enable location services.');
        }
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Safety Features 🛡️
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your safety is our priority. Access emergency services and safety information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Emergency Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* SOS Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Emergency SOS</span>
            </h3>
            
            <div className="text-center">
              <motion.button
                whileHover={{ scale: sosActive ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSOS}
                disabled={sosActive}
                className={`w-32 h-32 rounded-full text-white font-bold text-xl shadow-lg transition-all duration-300 ${
                  sosActive 
                    ? 'bg-red-600 animate-pulse cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
                }`}
              >
                {sosActive ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                    <span className="text-sm">Sending...</span>
                  </div>
                ) : (
                  'SOS'
                )}
              </motion.button>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Press and hold for 3 seconds to send emergency alert with your location
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={shareLocation}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Share My Location</span>
              </button>
              
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Contact My Guide</span>
              </button>
              
              <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Check-in Status</span>
              </button>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Emergency Contacts
            </h3>
            
            <div className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      contact.type === 'police' ? 'bg-blue-100 dark:bg-blue-900' :
                      contact.type === 'medical' ? 'bg-red-100 dark:bg-red-900' :
                      contact.type === 'fire' ? 'bg-orange-100 dark:bg-orange-900' :
                      'bg-green-100 dark:bg-green-900'
                    }`}>
                      <Phone className={`w-4 h-4 ${
                        contact.type === 'police' ? 'text-blue-600 dark:text-blue-400' :
                        contact.type === 'medical' ? 'text-red-600 dark:text-red-400' :
                        contact.type === 'fire' ? 'text-orange-600 dark:text-orange-400' :
                        'text-green-600 dark:text-green-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{contact.number}</p>
                    </div>
                  </div>
                  
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                    Call
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Safety Guidelines & Tips
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safetyTips.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{category.icon}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {category.title}
                    </h4>
                  </div>
                  
                  <ul className="space-y-2">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Safety Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Safety Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-700 dark:text-green-300">Weather</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">Clear skies, safe for outdoor activities</p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-blue-700 dark:text-blue-300">Location</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">GPS tracking active, location shared</p>
              </div>
              
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium text-orange-700 dark:text-orange-300">Connectivity</span>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Good network coverage in area</p>
              </div>
            </div>
          </div>

          {/* Recent Safety Updates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Safety Updates
            </h3>
            
            <div className="space-y-4">
              {[
                {
                  type: 'info',
                  title: 'Wildlife Activity Alert',
                  message: 'Increased wildlife activity reported near Sundarbans. Maintain safe distance.',
                  time: '2 hours ago'
                },
                {
                  type: 'warning',
                  title: 'Weather Advisory',
                  message: 'Light rainfall expected in Ranchi region. Carry rain gear for outdoor activities.',
                  time: '5 hours ago'
                },
                {
                  type: 'success',
                  title: 'Route Update',
                  message: 'Road to Hundru Falls has been cleared and is now safe for travel.',
                  time: '1 day ago'
                }
              ].map((update, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    update.type === 'info' ? 'bg-blue-500' :
                    update.type === 'warning' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {update.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {update.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {update.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyFeatures;