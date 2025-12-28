import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Send, Bot, User, Globe, Sparkles, Volume2, VolumeX, 
  Coffee, MapPin, Utensils, Camera, Bus, Star, Heart,
  Loader2, MessageSquare, Settings, Coins, Search, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BorderBeam } from '../../magicui/BorderBeam';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { voiceService, isElevenLabsConfigured } from '../../../lib/services';
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
import { AddaTeaIcon, TramIcon, DurgaIcon } from '../../kolkata/KolkataIcons';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  language?: 'en' | 'bn';
  sources?: RagSource[];
  budget?: BudgetEstimate;
}

interface AddaBotProps {
  isOpen: boolean;
  onClose: () => void;
}

// RAG-based greetings
const greetings = {
  en: "Nomoshkar! 🙏 I’m your Kolkata RAG companion — I mix local curated knowledge, web insights, and budget signals to answer your queries. Ask me anything about Kolkata!",
  bn: "নমস্কার! 🙏 আমি আপনার কলকাতা RAG সঙ্গী — কিউরেটেড লোকাল জ্ঞান, ওয়েব ইনসাইটস আর বাজেট সিগন্যাল মিলিয়ে উত্তর দিই। কলকাতা নিয়ে যা জানতে চান জিজ্ঞেস করুন!"
};

// Quick suggestions for Adda chat
const quickTopics = {
  en: [
    { icon: Utensils, label: "Best Food Spots", topic: "food" },
    { icon: MapPin, label: "Must-Visit Places", topic: "places" },
    { icon: Bus, label: "Getting Around", topic: "transport" },
    { icon: Star, label: "Culture & Arts", topic: "culture" },
    { icon: DurgaIcon, label: "Durga Puja", topic: "puja" }
  ],
  bn: [
    { icon: Utensils, label: "সেরা খাবার", topic: "food" },
    { icon: MapPin, label: "দর্শনীয় স্থান", topic: "places" },
    { icon: Bus, label: "যাতায়াত", topic: "transport" },
    { icon: Star, label: "সংস্কৃতি ও শিল্প", topic: "culture" },
    { icon: DurgaIcon, label: "দুর্গাপূজা", topic: "puja" }
  ]
};

const AddaBot: React.FC<AddaBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const elevenLabsConfigured = isElevenLabsConfigured();

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = greetings[language];
      setMessages([{
        id: 'initial',
        type: 'bot',
        content: greeting,
        timestamp: new Date(),
        language
      }]);
    }
  }, [isOpen, language]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAddaResponse = async (userMessage: string): Promise<{ text: string; sources: RagSource[]; budget?: BudgetEstimate }> => {
    const query = userMessage.trim();

    const [localContext] = await Promise.all([
      retrieveLocalContext(query),
    ]);

    const localSignals = buildLocalBudgetSignals();
    const budget = aggregateBudget([], localSignals);
    const llm = await callGemini(query, localContext, [], budget);
    const text = (llm?.text || '') || 'AI synthesis unavailable; showing local context above.';
    return { text, sources: [...localContext], budget: llm?.budget };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      language
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // RAG pipeline
    const result = await getAddaResponse(inputMessage);
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: result.text,
      timestamp: new Date(),
      language,
      sources: result.sources,
      budget: result.budget
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    // Auto-speak if enabled
    if (autoSpeak) {
      handleSpeak(result.text);
    }
  };

  const handleTopicClick = (topic: string) => {
    const topicMessages: Record<string, Record<'en' | 'bn', string>> = {
      food: { en: "What are the best places to eat in Kolkata?", bn: "কলকাতায় খাওয়ার সেরা জায়গা কোথায়?" },
      places: { en: "What places should I visit in Kolkata?", bn: "কলকাতায় কোন জায়গাগুলো দেখা উচিত?" },
      transport: { en: "How do I get around in Kolkata?", bn: "কলকাতায় কীভাবে যাতায়াত করব?" },
      culture: { en: "Tell me about Kolkata's culture and arts", bn: "কলকাতার সংস্কৃতি ও শিল্প সম্পর্কে বলুন" },
      puja: { en: "Tell me about Durga Puja in Kolkata!", bn: "কলকাতায় দুর্গাপূজা সম্পর্কে বলুন!" }
    };

    setInputMessage(topicMessages[topic][language]);
    // Auto-send after a brief delay
    setTimeout(() => {
      const input = topicMessages[topic][language];
      setInputMessage('');
      
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: input,
        timestamp: new Date(),
        language
      };

      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      setTimeout(async () => {
        const result = await getAddaResponse(input);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: result.text,
          timestamp: new Date(),
          language,
          sources: result.sources,
          budget: result.budget
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);

        if (autoSpeak) {
          handleSpeak(result.text);
        }
      }, 1500);
    }, 300);
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      voiceService.stopPlayback();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      if (elevenLabsConfigured) {
        const result = await voiceService.textToSpeech(text, {
          language: language === 'bn' ? 'hi' : 'en'
        });
        if (result.audioUrl) {
          await voiceService.playAudio(result.audioUrl);
        }
      } else {
        await voiceService.speakWithBrowserTTS(text, language === 'bn' ? 'hi' : 'en');
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(false);
  };

  const handleLanguageSwitch = () => {
    const newLang = language === 'en' ? 'bn' : 'en';
    setLanguage(newLang);
    
    // Add language switch message
    const switchMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: newLang === 'bn' 
        ? "বাংলায় স্বাগতম! 🪔 এখন আমি বাংলায় কথা বলব। কী জানতে চান?"
        : "Switching to English! 🇬🇧 Now I'll respond in English. What would you like to know?",
      timestamp: new Date(),
      language: newLang
    };
    setMessages(prev => [...prev, switchMessage]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-end p-4">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg h-[700px] flex flex-col overflow-hidden relative"
      >
        <BorderBeam size={400} duration={20} colorFrom="#FFB800" colorTo="#E23D28" />

        {/* Header - Kolkata themed */}
        <div className="relative bg-gradient-to-r from-kolkata-yellow via-kolkata-terracotta to-durga-500 p-5">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 tram-tracks" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30"
              >
                <AddaTeaIcon className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2 font-heritage">
                  Adda Bot
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ☕
                  </motion.span>
                </h2>
                <p className="text-white/80 text-sm font-bengali">
                  {language === 'bn' ? 'আপনার কলকাতা গাইড' : 'Your Kolkata Companion'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLanguageSwitch}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
                title="Switch Language"
              >
                <Globe className="w-5 h-5 text-white" />
              </motion.button>

              {/* Settings */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-white" />
              </motion.button>

              {/* Close */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Language Indicator */}
          <div className="flex items-center justify-center mt-3">
            <div className={`px-4 py-1 rounded-full text-xs font-medium ${
              language === 'bn' 
                ? 'bg-durga-600 text-white' 
                : 'bg-white/20 text-white'
            }`}>
              {language === 'bn' ? '🪔 বাংলায় আড্ডা' : '🇬🇧 English Adda'}
            </div>
          </div>
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
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      : 'bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <AddaTeaIcon className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                  }`}>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${message.language === 'bn' ? 'font-bengali' : ''}`}>
                      {message.content}
                    </p>
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
                    
                    <div className={`flex items-center justify-between gap-3 mt-2 text-xs ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      
                      {message.type === 'bot' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSpeak(message.content)}
                          className={`p-1.5 rounded-full transition-colors ${
                            isSpeaking 
                              ? 'bg-kolkata-yellow text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-kolkata-yellow hover:text-white'
                          }`}
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3 h-3" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-xl flex items-center justify-center">
                  <AddaTeaIcon className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-kolkata-yellow rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-kolkata-terracotta rounded-full"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-durga-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Topics */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {quickTopics[language].map((topic, index) => {
              const IconComponent = topic.icon;
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTopicClick(topic.topic)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:from-kolkata-yellow/20 hover:to-kolkata-terracotta/20 transition-all whitespace-nowrap border border-gray-200 dark:border-gray-600"
                >
                  <IconComponent className="w-4 h-4 text-kolkata-terracotta" />
                  <span className={language === 'bn' ? 'font-bengali' : ''}>{topic.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={language === 'bn' ? 'কলকাতা নিয়ে কিছু জিজ্ঞেস করুন...' : 'Ask about Kolkata...'}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-kolkata-yellow focus:border-transparent transition-all ${language === 'bn' ? 'font-bengali' : ''}`}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="w-12 h-12 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-xl flex items-center justify-center text-white shadow-lg shadow-kolkata-yellow/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl w-full max-w-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-kolkata-yellow" />
                  Adda Settings
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-kolkata-yellow" />
                      Auto-speak responses
                    </span>
                    <button
                      onClick={() => setAutoSpeak(!autoSpeak)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        autoSpeak ? 'bg-kolkata-yellow' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: autoSpeak ? 24 : 2 }}
                        className="w-5 h-5 bg-white rounded-full shadow"
                      />
                    </button>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-500" />
                    Voice AI Status
                  </p>
                  <div className={`px-3 py-2 rounded-lg text-sm ${
                    elevenLabsConfigured 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {elevenLabsConfigured 
                      ? '✓ ElevenLabs AI Voice Active'
                      : '⚠ Using Browser TTS (Add API key for premium voice)'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddaBot;


