import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Heart,
  Car,
  Cloud,
  HelpCircle,
  X,
  Loader,
  Bot,
  Mic,
  MicOff
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { SOSService, type SOSAlert } from '../../../lib/services/sosService';

const SOSAgent: React.FC = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAlert, setActiveAlert] = useState<SOSAlert | null>(null);
  const [alertType, setAlertType] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number, address: string} | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'analyzing' | 'responding'>('idle');
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  // Don't render if user is not loaded
  if (!user) {
    return (
      <div className="relative">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-400 shadow-lg animate-pulse">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow-sm">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // Get user location
  useEffect(() => {
    SOSService.getCurrentLocation()
      .then(location => setUserLocation(location))
      .catch(error => {
        console.error('Error getting location:', error);
        // Fallback location is handled in the service
      });
  }, []);

  const createSOSAlert = async () => {
    if (!alertType || !alertMessage || !userLocation || !user) {
      console.warn('Missing required data for SOS alert:', {
        alertType: !!alertType,
        alertMessage: !!alertMessage,
        userLocation: !!userLocation,
        user: !!user
      });
      return;
    }

    setIsCreatingAlert(true);
    setAgentStatus('analyzing');

    try {
      const data = await SOSService.createAlert({
        userId: user.id,
        type: alertType,
        location: userLocation,
        message: alertMessage,
        userName: user.name || 'Unknown User'
      });

      if (data.success && data.alert) {
        setActiveAlert(data.alert);
        setAgentStatus('responding');
        
        // Auto-collapse after creating alert
        setTimeout(() => {
          setIsExpanded(false);
          setAgentStatus('idle');
        }, 5000);
      }
    } catch (error) {
      console.error('Error creating SOS alert:', error);
      setAgentStatus('idle');
    } finally {
      setIsCreatingAlert(false);
      setAlertMessage('');
      setAlertType('');
    }
  };

  const testNotification = async () => {
    setIsTestingNotification(true);
    try {
      const result = await SOSService.testNotification();
      // You could show a toast notification here
      console.log('Test notification result:', result);
    } catch (error) {
      console.error('Failed to send test notification:', error);
    } finally {
      setIsTestingNotification(false);
    }
  };

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAlertMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  // Emergency contact numbers for India
  const emergencyNumbers = [
    {
      id: 'police',
      name: 'Police',
      number: '100',
      icon: Shield,
      color: 'bg-blue-500',
      description: 'Police Emergency'
    },
    {
      id: 'fire',
      name: 'Fire Brigade',
      number: '101',
      icon: AlertTriangle,
      color: 'bg-red-500',
      description: 'Fire Emergency'
    },
    {
      id: 'ambulance',
      name: 'Ambulance',
      number: '108',
      icon: Heart,
      color: 'bg-green-500',
      description: 'Medical Emergency'
    },
    {
      id: 'disaster',
      name: 'Disaster Helpline',
      number: '1078',
      icon: Cloud,
      color: 'bg-orange-500',
      description: 'Natural Disasters'
    }
  ];

  const callEmergencyNumber = (number: string, name: string) => {
    if (typeof window !== 'undefined') {
      window.open(`tel:${number}`, '_self');
      console.log(`Calling ${name}: ${number}`);
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Heart className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'transport': return <Car className="w-4 h-4" />;
      case 'weather': return <Cloud className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getAgentStatusColor = () => {
    switch (agentStatus) {
      case 'analyzing': return 'bg-yellow-500';
      case 'responding': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="relative">
      {/* SOS Agent Avatar */}
      <motion.div
        className={`relative cursor-pointer transition-all duration-300 ${
          isExpanded ? 'scale-110' : 'hover:scale-105'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getAgentStatusColor()} shadow-lg`}>
            <Bot className="w-6 h-6 text-white" />
          </div>
          
          {/* Status indicator */}
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            activeAlert ? 'bg-red-500 animate-pulse' : 'bg-green-500'
          }`} />
          
          {/* Pulse animation for active alerts */}
          {activeAlert && (
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
          )}
        </div>
        
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full shadow-sm">
            Axicov
          </span>
        </div>
      </motion.div>

      {/* Expanded SOS Panel - Tooltip Style */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsExpanded(false)}
            />
            
            {/* Tooltip Container - Dynamic positioning */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="fixed top-16 left-4 right-4 w-auto max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-[calc(100vh-6rem)] sm:top-20 sm:left-6 sm:right-auto sm:w-96 lg:max-h-[calc(100vh-8rem)]"
              style={{ 
                transformOrigin: 'top left',
                maxHeight: 'calc(100vh - 6rem)'
              }}
            >
              {/* Tooltip Arrow - positioned for fixed placement */}
              <div className="absolute top-4 left-4 w-4 h-4 bg-red-500 transform rotate-45 z-10"></div>
              
              {/* Fixed Header */}
              <div className="bg-red-500 text-white p-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <div>
                      <h3 className="text-sm font-bold">SOS Emergency</h3>
                      <p className="text-xs opacity-90">Axicov Agent</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4 min-h-0" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
                {/* Quick Emergency Dial */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-700">
                  <h4 className="text-xs font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Quick Emergency Dial
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => callEmergencyNumber('100', 'Police')}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-2 rounded text-xs font-bold transition-colors flex flex-col items-center gap-0.5"
                    >
                      <Shield className="w-3 h-3" />
                      <span>Police</span>
                      <span className="text-xs opacity-90">100</span>
                    </button>
                    <button
                      onClick={() => callEmergencyNumber('101', 'Fire')}
                      className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-bold transition-colors flex flex-col items-center gap-0.5"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Fire</span>
                      <span className="text-xs opacity-90">101</span>
                    </button>
                    <button
                      onClick={() => callEmergencyNumber('108', 'Ambulance')}
                      className="bg-green-500 hover:bg-green-600 text-white py-1.5 px-2 rounded text-xs font-bold transition-colors flex flex-col items-center gap-0.5"
                    >
                      <Heart className="w-3 h-3" />
                      <span>Ambulance</span>
                      <span className="text-xs opacity-90">108</span>
                    </button>
                  </div>
                </div>

                {/* Active Alert Display */}
                {activeAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border-l-4 ${
                      activeAlert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                      activeAlert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                      'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm">
                        {getAlertTypeIcon(activeAlert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white capitalize">
                            {activeAlert.type} Alert
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${getSeverityColor(activeAlert.severity)}`}>
                            {activeAlert.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          Alert sent - Emergency services notified
                        </p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded p-2 mb-2">
                      <p className="text-gray-700 dark:text-gray-300 text-xs">
                        "{activeAlert.message}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>ETA: {activeAlert.estimatedResponseTime}min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>Location shared</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium">Active</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Alert Creation Form */}
                {!activeAlert && (
                  <div className="space-y-3">
                    {/* Alert Type Selection */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Emergency Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { type: 'medical', icon: Heart, label: 'Medical', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' },
                          { type: 'security', icon: Shield, label: 'Security', color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
                          { type: 'transport', icon: Car, label: 'Transport', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
                          { type: 'weather', icon: Cloud, label: 'Weather', color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-900/20' }
                        ].map(({ type, icon: Icon, label, color, bgColor }) => (
                          <button
                            key={type}
                            onClick={() => setAlertType(type)}
                            className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                              alertType === type
                                ? `border-red-500 ${bgColor} shadow-md scale-105`
                                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message Input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Describe the situation
                      </label>
                      <div className="relative">
                        <textarea
                          value={alertMessage}
                          onChange={(e) => setAlertMessage(e.target.value)}
                          placeholder="Describe your emergency situation..."
                          className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-xs"
                          rows={3}
                        />
                        <button
                          onClick={startVoiceRecording}
                          disabled={isListening}
                          className={`absolute bottom-1.5 right-1.5 p-1.5 rounded transition-colors ${
                            isListening
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                          }`}
                          title={isListening ? 'Recording...' : 'Voice input'}
                        >
                          {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                        </button>
                      </div>
                      {isListening && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                          <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                          Listening... Speak clearly
                        </p>
                      )}
                    </div>

                    {/* Location Display */}
                    {userLocation && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="p-1 bg-green-500 rounded">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-green-800 dark:text-green-200">
                            Location detected
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-300 truncate">
                            {userLocation.address}
                          </p>
                        </div>
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                      </div>
                    )}

                    {/* Create Alert Button */}
                    <button
                      onClick={createSOSAlert}
                      disabled={!alertType || !alertMessage || isCreatingAlert}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none text-xs"
                    >
                      {isCreatingAlert ? (
                        <>
                          <Loader className="w-3 h-3 animate-spin" />
                          Creating Alert...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          Send SOS Alert
                        </>
                      )}
                    </button>
                  </div>
                )}

              {/* Emergency Contacts */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" />
                  Emergency Contacts
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {emergencyNumbers.map((contact) => {
                    const IconComponent = contact.icon;
                    return (
                      <button
                        key={contact.id}
                        onClick={() => callEmergencyNumber(contact.number, contact.name)}
                        className={`${contact.color} hover:opacity-90 text-white p-2 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-xs font-bold">{contact.name}</span>
                        <span className="text-xs opacity-90">{contact.number}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Tap any button to call emergency services
                </p>
              </div>

              {/* Agent Status */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getAgentStatusColor()}`} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {agentStatus === 'idle' ? 'Ready' : agentStatus === 'analyzing' ? 'Analyzing...' : 'Responding'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Axicov v2.0
                  </div>
                </div>
                
                {/* Test Notification Button */}
                <button
                  onClick={testNotification}
                  disabled={isTestingNotification}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isTestingNotification ? (
                    <>
                      <Loader className="w-3 h-3 animate-spin" />
                      Sending Test...
                    </>
                  ) : (
                    <>
                      <Phone className="w-3 h-3" />
                      Test SMS Notification
                    </>
                  )}
                </button>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SOSAgent;