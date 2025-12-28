import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, User, Globe, Sparkles, Mic, Volume2, StopCircle, Headphones, Settings, Coins, Search, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BorderBeam } from '../../magicui/BorderBeam';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { VoiceButton, SoundWave } from '../../voice';
import { voiceService } from '../../../lib/services';
import {
  retrieveLocalContext,
  fetchWebContext,
  fetchWebBudgetSignals,
  buildLocalBudgetSignals,
  aggregateBudget,
  callGemini,
  craftAssistantReply,
  type BudgetEstimate,
  type RagSource
} from '../../../lib/services/rag.service';
import { hybridAIService } from '../../../lib/services/hybridAIService';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  language?: string;
  suggestions?: string[];
  isPlaying?: boolean;
  sources?: RagSource[];
  budget?: BudgetEstimate;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Namaste! I\'m your AI travel assistant for Kolkata. How can I help you plan your perfect trip today? 🌟',
      timestamp: new Date(),
      suggestions: ['Plan my trip', 'Find a guide', 'Explore destinations']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'sa', name: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🏛️' }
  ];

  const quickQuestions = [
    '🌴 Best time to visit?',
    '💧 Top waterfalls?',
    '🍛 Local food tips?',
    '🐅 Wildlife safari?',
    '🎭 Cultural festivals?',
    '💰 Budget travel?'
  ];

  // Voice status
  const voiceConfigured = voiceService.isConfigured();
  const usageStats = voiceService.getUsageStats();

  // Voice playback functions using voiceService
  const handleSpeak = useCallback(async (messageId: string, text: string) => {
    // If already playing this message, stop it
    if (currentPlayingId === messageId && isSpeaking) {
      voiceService.stopPlayback();
      setIsSpeaking(false);
      setCurrentPlayingId(null);
      return;
    }
    
    // Stop any current playback
    voiceService.stopPlayback();
    
    setIsSpeaking(true);
    setCurrentPlayingId(messageId);
    
    try {
      await voiceService.speakChatResponse(text, {
        language: selectedLanguage,
        onStart: () => {
          setIsSpeaking(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setCurrentPlayingId(null);
        },
        onError: (error) => {
          console.error('Voice error:', error);
          setIsSpeaking(false);
          setCurrentPlayingId(null);
        },
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      setCurrentPlayingId(null);
    }
  }, [currentPlayingId, isSpeaking, selectedLanguage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Use hybrid AI service (custom models + Gemini)
      // Fallback to original RAG pipeline if hybrid service fails
      let response: {
        text: string;
        context?: RagSource[];
        budget?: BudgetEstimate;
      };
      
      const startTime = performance.now();
      
      try {
        const hybridResponse = await hybridAIService.processQuery(currentInput);
        const duration = performance.now() - startTime;
        
        // Debug logging (enable with VITE_DEBUG_ML=true)
        if (import.meta.env.VITE_DEBUG_ML === 'true') {
          console.log('🔍 [ML DEBUG] Query:', currentInput);
          console.log('🔍 [ML DEBUG] Intent:', hybridResponse.intent.intent, `(${(hybridResponse.intent.confidence * 100).toFixed(1)}%)`);
          console.log('🔍 [ML DEBUG] Entities:', hybridResponse.entities);
          console.log('🔍 [ML DEBUG] Context results:', hybridResponse.context.length);
          console.log('🔍 [ML DEBUG] Used Gemini:', hybridResponse.shouldUseGemini);
          console.log('🔍 [ML DEBUG] Response time:', `${duration.toFixed(0)}ms`);
        }
        
        response = {
          text: hybridResponse.text,
          context: hybridResponse.context,
          budget: hybridResponse.budget ? {
            low: hybridResponse.budget.low,
            high: hybridResponse.budget.high,
            currency: hybridResponse.budget.currency,
            basis: hybridResponse.budget.basis,
            sources: []
          } : undefined,
        };
      } catch (hybridError) {
        console.warn('Hybrid service failed, using fallback:', hybridError);
        // Fallback to original RAG pipeline
        const [localContext] = await Promise.all([
          retrieveLocalContext(currentInput, true), // Use embeddings
        ]);
        const localSignals = buildLocalBudgetSignals();
        const budget = aggregateBudget([], localSignals);
        const llm = await callGemini(currentInput, localContext, [], budget);
        response = {
          text: llm?.text || 'AI synthesis unavailable; showing local context above.',
          context: localContext,
          budget: llm?.budget,
        };
      }

      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        type: 'bot',
        content: response.text,
        timestamp: new Date(),
        language: selectedLanguage,
        sources: response.context || [],
        budget: response.budget ? {
          low: response.budget.low,
          high: response.budget.high,
          currency: response.budget.currency,
          basis: response.budget.basis,
          sources: []
        } : undefined
      };

      setMessages(prev => [...prev, botMessage]);

      if (autoSpeak) {
        setTimeout(() => {
          handleSpeak(botMessageId, composed);
        }, 500);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment! 🙏',
        timestamp: new Date(),
        language: selectedLanguage
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question.replace(/^[^\s]+\s/, '')); // Remove emoji prefix
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-end p-4">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md h-[650px] flex flex-col overflow-hidden relative"
      >
        {/* Border Beam Effect */}
        <BorderBeam size={400} duration={20} colorFrom="#22c55e" colorTo="#f97316" />
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-500 p-4">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
              >
                <Bot className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  YatriAI Assistant
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                </h3>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span className="text-xs text-green-100">
                    {voiceConfigured ? 'ElevenLabs Voice' : 'Browser Voice'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Voice Settings Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                  showVoiceSettings 
                    ? 'bg-white/30 border-white/50' 
                    : 'bg-white/20 border-white/30 hover:bg-white/30'
                }`}
                title="Voice Settings"
              >
                <Headphones className="w-4 h-4 text-white" />
              </motion.button>

              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-xs bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-gray-900">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Voice Settings Panel */}
          <AnimatePresence>
            {showVoiceSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/80">Auto-speak responses</span>
                    <button
                      onClick={() => setAutoSpeak(!autoSpeak)}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        autoSpeak ? 'bg-white/40' : 'bg-white/20'
                      }`}
                    >
                      <motion.div
                        animate={{ x: autoSpeak ? 20 : 2 }}
                        className="w-4 h-4 bg-white rounded-full shadow"
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/80">Voice Status</span>
                    <span className="text-xs text-white/60">
                      {voiceConfigured 
                        ? `${usageStats.charactersRemaining.toLocaleString()} chars left`
                        : 'Browser TTS'
                      }
                    </span>
                  </div>

                  {voiceConfigured && (
                    <div className="mt-2">
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                        <div 
                          className="bg-white/60 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(usageStats.percentUsed, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-green-500 to-orange-500'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </motion.div>
                  
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {/* Budget window */}
                    {message.type === 'bot' && message.budget && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-100">
                        <div className="flex items-center gap-2 font-semibold">
                          <Coins className="w-4 h-4" />
                          <span>Budget window</span>
                        </div>
                        <div className="mt-1 text-gray-900 dark:text-white">
                          ₹{message.budget.low.toLocaleString('en-IN')} - ₹{message.budget.high.toLocaleString('en-IN')} / day
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{message.budget.basis}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {message.budget.sources.slice(0, 4).map((source) => (
                            <span
                              key={source.label}
                              className="text-xs px-2 py-1 rounded-full bg-white/80 dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 text-gray-700 dark:text-gray-200"
                            >
                              {source.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Sources */}
                    {message.type === 'bot' && message.sources && message.sources.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Search className="w-3.5 h-3.5" />
                          <span>Context used</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {message.sources.map((source, idx) => (
                            <span
                              key={`${source.title}-${idx}`}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                            >
                              {source.type === 'web' ? <Globe className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                              <span className="line-clamp-1">{source.title}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className={`flex items-center justify-between gap-2 mt-2 text-xs ${
                      message.type === 'user' ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.type === 'bot' && (
                        <div className="flex items-center gap-1">
                          {/* Sound wave when playing */}
                          {currentPlayingId === message.id && isSpeaking && (
                            <SoundWave isPlaying={true} className="mr-1" />
                          )}
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSpeak(message.id, message.content)}
                            className={`p-1 rounded-full transition-colors ${
                              currentPlayingId === message.id && isSpeaking
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            title={currentPlayingId === message.id && isSpeaking ? 'Stop speaking' : 'Listen to message'}
                          >
                            {currentPlayingId === message.id && isSpeaking ? (
                              <StopCircle className="w-3.5 h-3.5 text-red-500" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </motion.button>
                        </div>
                      )}
                    </div>
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
                        {message.suggestions.map((suggestion, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setInputMessage(suggestion)}
                            className="text-xs px-2 py-1 rounded-full bg-white/20 dark:bg-gray-600/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-green-500 to-orange-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {quickQuestions.map((question, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-full hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 hover:text-green-700 dark:hover:text-green-300 transition-all whitespace-nowrap border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700"
              >
                {question}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
              title="Voice input (coming soon)"
            >
              <Mic className="w-5 h-5" />
            </motion.button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about Kolkata..."
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2 flex items-center justify-center gap-1">
            Powered by <AnimatedGradientText className="text-xs font-medium">YatriAI</AnimatedGradientText>
            {voiceConfigured && (
              <span className="text-emerald-500">+ ElevenLabs</span>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AIChat;
