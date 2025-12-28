import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Camera, 
  Loader2, 
  FileImage, 
  X, 
  Sparkles, 
  BookOpen,
  MapPin,
  Clock,
  Star,
  Volume2,
  Play,
  Pause
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';

interface MonumentStory {
  story: string;
  audio?: string | null;
  audioAvailable?: boolean;
  audioError?: string;
  imageSize: number;
  imageType: string;
  timestamp: string;
}

const PictureDeck: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [monumentStory, setMonumentStory] = useState<MonumentStory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleImageSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    setSelectedImage(file);
    setError(null);
    setMonumentStory(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const analyzeMonument = async () => {
    if (!selectedImage || !isAuthenticated) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1]; // Remove data URL prefix
          
          console.log('🚀 Sending request to backend...');
          console.log('🔐 Token being sent:', api.getToken() ? 'Token available' : 'No token');
          
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/picture-deck/analyze`,
            {
              imageBase64: base64Data
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${api.getToken()}`,
              },
            }
          );

          console.log('📦 Response received:', response.data);

          if (response.data.success) {
            setMonumentStory(response.data.data);
            
            if (response.data.data.audioError) {
              console.warn('⚠️ Audio generation warning:', response.data.data.audioError);
            }
            
            if (response.data.warning) {
              console.warn('⚠️ Warning:', response.data.warning);
            }
          } else {
            setError(response.data.message || 'Failed to analyze monument');
          }
        } catch (err: any) {
          console.error('❌ Analysis error:', err);
          if (err.response?.status === 401) {
            setError('Authentication failed. Please login again.');
          } else if (err.response?.status === 500) {
            setError('Server error. Please check if the Gemini API key is configured correctly.');
          } else {
            setError(err.response?.data?.message || 'Failed to analyze monument. Please try again.');
          }
        } finally {
          setIsAnalyzing(false);
        }
      };
      
      reader.readAsDataURL(selectedImage);
    } catch (err: any) {
      console.error('❌ File reading error:', err);
      setError('Failed to process image file.');
      setIsAnalyzing(false);
    }
  };

  const resetComponent = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setMonumentStory(null);
    setError(null);
    setIsPlaying(false);
    
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Stop browser speech synthesis
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const playAudio = () => {
    if (!monumentStory?.story) return;

    if (monumentStory.audio && audioRef.current) {
      // Server-generated audio (VIBE.EXE approach)
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // Browser TTS fallback (VIBE.EXE approach)
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(monumentStory.story);
        
        // Try to find an Indian English voice
        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find(voice => 
          voice.lang.includes('en-IN') || 
          voice.name.toLowerCase().includes('indian') ||
          voice.name.toLowerCase().includes('hindi')
        );
        
        if (indianVoice) {
          utterance.voice = indianVoice;
        } else {
          // Fallback to any English female voice
          const femaleVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
          );
          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }
        }
        
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <div className="p-3 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-full">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heritage">
            Picture Deck
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Upload a photo of any historic monument and discover its fascinating story told in the warm, 
          expressive style of Bengali storytelling.
        </p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
      >
        {!selectedImage ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-kolkata-yellow/50 rounded-xl p-12 text-center hover:border-kolkata-yellow transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-kolkata-yellow/10 rounded-full">
                  <Upload className="w-12 h-12 text-kolkata-terracotta" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Upload Monument Photo
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Drag and drop your image here, or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports JPEG, PNG, WebP • Max 10MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={imagePreview!}
                alt="Selected monument"
                className="w-full max-h-96 object-contain rounded-lg shadow-md"
              />
              <button
                onClick={resetComponent}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Info */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <FileImage className="w-4 h-4" />
                <span>{selectedImage.name}</span>
              </div>
              <span>{formatFileSize(selectedImage.size)}</span>
            </div>

            {/* Analyze Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={analyzeMonument}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Monument...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Discover the Story</span>
                </>
              )}
            </motion.button>

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-2">
                API URL: {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}<br/>
                Token: {api.getToken() ? 'Available' : 'Missing'}
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <p className="text-red-700 dark:text-red-300 text-center">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monument Story */}
      <AnimatePresence>
        {monumentStory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-kolkata-cream to-white dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-8 border border-kolkata-gold/20"
          >
            <div className="space-y-6">
              {/* Story Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-full">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heritage">
                      Monument Story
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Told in Bengali storytelling style
                    </p>
                  </div>
                </div>
                
                {/* Audio Controls */}
                {monumentStory.story && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={playAudio}
                      className="flex items-center space-x-2 px-4 py-2 bg-kolkata-yellow text-white rounded-lg hover:bg-kolkata-terracotta transition-colors"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Play Story</span>
                        </>
                      )}
                    </button>
                    <Volume2 className="w-5 h-5 text-kolkata-terracotta" />
                    <span className="text-xs text-gray-500">
                      {monumentStory.audio ? "🎵 Server audio" : "🗣️ Browser TTS"}
                    </span>
                  </div>
                )}
              </div>

              {/* Hidden Audio Element */}
              {monumentStory.audio && (
                <audio
                  ref={audioRef}
                  src={`data:audio/mpeg;base64,${monumentStory.audio}`}
                  onEnded={handleAudioEnded}
                  onError={(e) => console.error('Audio error:', e)}
                  style={{ display: 'none' }}
                />
              )}

              {/* Story Content */}
              <div className="prose prose-lg max-w-none">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-inner border border-kolkata-gold/10">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                    {monumentStory.story}
                  </p>
                </div>
              </div>

              {/* Story Metadata */}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 pt-4 border-t border-kolkata-gold/20">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(monumentStory.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileImage className="w-4 h-4" />
                    <span>{formatFileSize(monumentStory.imageSize)}</span>
                  </div>
                  {monumentStory.story && (
                    <div className="flex items-center space-x-1">
                      <Volume2 className="w-4 h-4" />
                      <span>{monumentStory.audioAvailable ? "Audio Available" : "Browser TTS"}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-kolkata-yellow fill-current" />
                  <span>AI Generated Story</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
          <div className="p-3 bg-kolkata-yellow/10 rounded-full w-fit mx-auto mb-4">
            <Camera className="w-8 h-8 text-kolkata-terracotta" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Recognition</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Advanced AI identifies monuments from your photos with high accuracy
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
          <div className="p-3 bg-kolkata-terracotta/10 rounded-full w-fit mx-auto mb-4">
            <Volume2 className="w-8 h-8 text-kolkata-terracotta" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Audio Narration</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Listen to stories with AI-generated audio in Bengali storytelling style
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center">
          <div className="p-3 bg-kolkata-gold/10 rounded-full w-fit mx-auto mb-4">
            <MapPin className="w-8 h-8 text-kolkata-terracotta" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rich History</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Discover architectural features, cultural significance, and historical background
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PictureDeck;