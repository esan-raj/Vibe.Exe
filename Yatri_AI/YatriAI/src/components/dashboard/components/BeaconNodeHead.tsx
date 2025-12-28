import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { 
  Wifi, 
  Radio, 
  MessageSquare, 
  Users, 
  Volume2, 
  Play, 
  Pause,
  RefreshCw,
  MapPin,
  Clock,
  Zap,
  BookOpen
} from 'lucide-react';

interface BeaconNode {
  id: string;
  deviceName: string;
  ipAddress: string;
  lastSeen: Date;
  isActive: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

interface BeaconMessage {
  nodeId: string;
  deviceName: string;
  message: string;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
}

interface GeneratedNarrative {
  id: string;
  originalMessage: string;
  narrative: string;
  timestamp: Date;
  deviceName: string;
}

const BeaconNodeHead: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeBeacons, setActiveBeacons] = useState<BeaconNode[]>([]);
  const [messages, setMessages] = useState<BeaconMessage[]>([]);
  const [narratives, setNarratives] = useState<GeneratedNarrative[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState('Node Head Device');

  useEffect(() => {
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

    newSocket.on('node-head-registered', (data) => {
      console.log('👑 Registered as Node Head:', data);
      setIsRegistered(true);
      setActiveBeacons(data.activeBeacons || []);
    });

    newSocket.on('beacon-registered', (beacon: BeaconNode) => {
      console.log('🔵 New beacon registered:', beacon);
      setActiveBeacons(prev => [...prev, beacon]);
    });

    newSocket.on('beacon-disconnected', (data) => {
      console.log('🔴 Beacon disconnected:', data.nodeId);
      setActiveBeacons(prev => prev.filter(b => b.id !== data.nodeId));
    });

    newSocket.on('beacon-message-received', (message: BeaconMessage) => {
      console.log('📨 Beacon message received:', message);
      setMessages(prev => [message, ...prev].slice(0, 20)); // Keep last 20 messages
    });

    newSocket.on('narrative-generated', (narrative: GeneratedNarrative) => {
      console.log('📖 Narrative generated:', narrative);
      setNarratives(prev => [narrative, ...prev].slice(0, 10)); // Keep last 10 narratives
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const registerAsNodeHead = () => {
    if (socket && isConnected) {
      socket.emit('register-node-head', { deviceName });
    }
  };

  const playNarrative = (narrativeId: string, text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      if (isPlaying === narrativeId) {
        setIsPlaying(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Try to find a voice that sounds more Bengali/Indian
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(voice => 
        voice.lang.includes('en-IN') || 
        voice.name.toLowerCase().includes('indian') ||
        voice.name.toLowerCase().includes('ravi') ||
        voice.name.toLowerCase().includes('veena')
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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heritage">
            Beacon Node Head
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Central hub for beacon nodes - receive location messages and generate Bengali-accented narratives
        </p>
      </motion.div>

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Connection Status
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter device name"
              />
            </div>
            <button
              onClick={registerAsNodeHead}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Register as Node Head</span>
            </button>
          </div>
        )}

        {isRegistered && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Registered as Node Head</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-300 mt-1">
              Device: {deviceName} | Ready to receive beacon messages
            </p>
          </div>
        )}
      </motion.div>

      {/* Active Beacons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Active Beacon Nodes ({activeBeacons.length})</span>
          </h3>
        </div>

        {activeBeacons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBeacons.map((beacon) => (
              <div
                key={beacon.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {beacon.deviceName}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <div>ID: {beacon.id.substring(0, 8)}...</div>
                  <div>IP: {beacon.ipAddress}</div>
                  {beacon.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{beacon.location.lat.toFixed(4)}, {beacon.location.lng.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Radio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No beacon nodes connected. Waiting for devices to join the network...
            </p>
          </div>
        )}
      </motion.div>

      {/* Recent Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Recent Beacon Messages ({messages.length})</span>
          </h3>
        </div>

        {messages.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.map((message, index) => (
              <motion.div
                key={`${message.nodeId}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-500"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    {message.deviceName}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-300 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(message.timestamp)}</span>
                  </span>
                </div>
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  "{message.message}"
                </p>
                {message.location && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{message.location.lat.toFixed(4)}, {message.location.lng.toFixed(4)}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No messages received yet. Beacon nodes will send location messages here.
            </p>
          </div>
        )}
      </motion.div>

      {/* Generated Narratives */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Generated Narratives ({narratives.length})</span>
          </h3>
        </div>

        {narratives.length > 0 ? (
          <div className="space-y-4">
            {narratives.map((narrative) => (
              <motion.div
                key={narrative.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-amber-800 dark:text-amber-200">
                      {narrative.deviceName}
                    </span>
                    <span className="text-xs bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
                      "{narrative.originalMessage}"
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-amber-600 dark:text-amber-300 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(narrative.timestamp)}</span>
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
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No narratives generated yet. Stories will appear here when beacon nodes send messages.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BeaconNodeHead;