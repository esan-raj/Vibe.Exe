import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { 
  Wifi, 
  Radio, 
  Send, 
  MapPin, 
  Volume2, 
  Play, 
  Pause,
  Smartphone,
  Zap,
  BookOpen,
  Clock
} from 'lucide-react';

interface GeneratedNarrative {
  id: string;
  originalMessage: string;
  narrative: string;
  timestamp: Date;
}

const BeaconNode: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [narratives, setNarratives] = useState<GeneratedNarrative[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Predefined location messages for quick testing
  const quickMessages = [
    "This is Victoria Memorial",
    "This is Howrah Bridge", 
    "This is Dakshineswar Temple",
    "This is Indian Museum",
    "This is Park Street",
    "This is Salt Lake Stadium",
    "This is Kalighat Temple",
    "This is Belur Math"
  ];

  useEffect(() => {
    // Generate random device name
    const randomId = Math.random().toString(36).substr(2, 6);
    setDeviceName(`Beacon-${randomId}`);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
          // Use default Kolkata location
          setLocation({ lat: 22.5726, lng: 88.3639 });
        }
      );
    }

    // Initialize socket connection
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔗 Connected to beacon service');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from beacon service');
      setIsConnected(false);
      setIsRegistered(false);
    });

    newSocket.on('beacon-registered', (data) => {
      console.log('🔵 Registered as Beacon Node:', data);
      setIsRegistered(true);
    });

    newSocket.on('narrative-generated', (narrative: GeneratedNarrative) => {
      console.log('📖 Narrative received:', narrative);
      setNarratives(prev => [narrative, ...prev].slice(0, 5)); // Keep last 5
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const registerAsBeacon = () => {
    if (socket && isConnected && deviceName.trim()) {
      socket.emit('register-beacon', { 
        deviceName: deviceName.trim(),
        location 
      });
    }
  };

  const sendBeaconMessage = () => {
    if (socket && isRegistered && message.trim()) {
      setIsSending(true);
      socket.emit('beacon-message', { 
        message: message.trim(),
        location 
      });
      
      setTimeout(() => {
        setIsSending(false);
        setMessage('');
      }, 1000);
    }
  };

  const sendQuickMessage = (quickMsg: string) => {
    if (socket && isRegistered) {
      setIsSending(true);
      socket.emit('beacon-message', { 
        message: quickMsg,
        location 
      });
      
      setTimeout(() => {
        setIsSending(false);
      }, 1000);
    }
  };

  const playNarrative = (narrativeId: string, text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      if (isPlaying === narrativeId) {
        setIsPlaying(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(voice => 
        voice.lang.includes('en-IN') || 
        voice.name.toLowerCase().includes('indian')
      );
      
      if (indianVoice) {
        utterance.voice = indianVoice;
      }

      utterance.onstart = () => setIsPlaying(narrativeId);
      utterance.onend = () => setIsPlaying(null);
      utterance.onerror = () => setIsPlaying(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heritage">
            Beacon Node
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Send location messages to the node head and receive Bengali-accented narratives
        </p>
      </motion.div>

      {/* Device Setup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Device Setup
          </h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            <Wifi className="w-4 h-4" />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {isConnected && !isRegistered && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Device Name
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter device name"
              />
            </div>
            {location && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={registerAsBeacon}
              disabled={!deviceName.trim()}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Radio className="w-4 h-4" />
              <span>Register as Beacon Node</span>
            </button>
          </div>
        )}

        {isRegistered && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Registered as Beacon Node</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-300 mt-1">
              Device: {deviceName} | Ready to send beacon messages
            </p>
          </div>
        )}
      </motion.div>

      {/* Send Message */}
      {isRegistered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Send Beacon Message
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location Message
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendBeaconMessage()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., This is Victoria Memorial"
                />
                <button
                  onClick={sendBeaconMessage}
                  disabled={!message.trim() || isSending}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Messages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Messages
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {quickMessages.map((quickMsg, index) => (
                  <button
                    key={index}
                    onClick={() => sendQuickMessage(quickMsg)}
                    disabled={isSending}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    {quickMsg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Received Narratives */}
      {narratives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Generated Narratives ({narratives.length})</span>
          </h3>

          <div className="space-y-4">
            {narratives.map((narrative) => (
              <motion.div
                key={narrative.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
                    "{narrative.originalMessage}"
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-amber-600 dark:text-amber-300 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(narrative.timestamp).toLocaleTimeString()}</span>
                    </span>
                    <button
                      onClick={() => playNarrative(narrative.id, narrative.narrative)}
                      className={`p-2 rounded-full transition-colors ${
                        isPlaying === narrative.id
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
                    >
                      {isPlaying === narrative.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {narrative.narrative}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BeaconNode;