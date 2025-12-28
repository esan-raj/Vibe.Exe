/**
 * Voice Service - ElevenLabs Integration
 * 
 * Provides text-to-speech capabilities using ElevenLabs AI voices.
 * 
 * Features:
 * - AI Chat voice responses
 * - Audio tour guides for destinations
 * - Multilingual voice support (English, Hindi)
 * - Voice caching for repeated content
 * - Usage tracking (10k chars free/month)
 * - Browser TTS fallback when ElevenLabs is unavailable
 * 
 * ElevenLabs API: https://api.elevenlabs.io/v1
 * Docs: https://docs.elevenlabs.io
 */

import { ServiceURLs, ServiceFlags, ServiceKeys, ElevenLabsConfig, isElevenLabsConfigured } from './config';
import { createServiceFetch } from '../debug';

// Create debug-enabled fetch for this service
const serviceFetch = createServiceFetch('VoiceService');

// Voice configuration interface
export interface VoiceConfig {
  voiceId: string;
  name: string;
  description?: string;
  language: string;
  accent?: string;
  gender: 'male' | 'female';
  category: 'chat' | 'guide' | 'alert' | 'general';
  previewUrl?: string;
}

// Speech result interface
export interface SpeechResult {
  audioUrl: string;
  audioBlob?: Blob;
  duration: number;
  charactersUsed: number;
  voiceId: string;
  cached: boolean;
}

// Voice settings for TTS
export interface VoiceSettings {
  stability?: number;      // 0-1, lower = more variable
  similarity_boost?: number; // 0-1, higher = closer to original voice
  style?: number;          // 0-1, style exaggeration
  use_speaker_boost?: boolean;
}

// Audio guide content
export interface AudioGuideContent {
  id: string;
  title: string;
  description: string;
  sections: AudioGuideSection[];
  language: string;
  duration: number;
  voiceId: string;
}

export interface AudioGuideSection {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  duration?: number;
}

// Pre-defined voices with ElevenLabs voice IDs
export const AVAILABLE_VOICES: VoiceConfig[] = [
  // English voices
  { 
    voiceId: 'pNInz6obpgDQGcFmaJgB', 
    name: 'Adam', 
    description: 'Warm and friendly male voice',
    language: 'en', 
    gender: 'male',
    category: 'chat'
  },
  { 
    voiceId: '21m00Tcm4TlvDq8ikWAM', 
    name: 'Rachel', 
    description: 'Clear and professional female voice',
    language: 'en', 
    gender: 'female',
    category: 'guide'
  },
  { 
    voiceId: 'AZnzlk1XvdvUeBnXmlld', 
    name: 'Domi', 
    description: 'Female voice with Indian accent - perfect for local guides',
    language: 'en', 
    accent: 'indian', 
    gender: 'female',
    category: 'guide'
  },
  { 
    voiceId: 'EXAVITQu4vr4xnSDxMaL', 
    name: 'Bella', 
    description: 'Soft and calming female voice',
    language: 'en', 
    gender: 'female',
    category: 'general'
  },
  { 
    voiceId: 'ErXwobaYiN019PkySvjV', 
    name: 'Antoni', 
    description: 'Well-rounded male voice',
    language: 'en', 
    gender: 'male',
    category: 'general'
  },
  // Multilingual voices (work well with Hindi)
  { 
    voiceId: 'ThT5KcBeYPX3keUQqHPh', 
    name: 'Dorothy', 
    description: 'Clear multilingual female voice - good for Hindi',
    language: 'hi', 
    gender: 'female',
    category: 'chat'
  },
  { 
    voiceId: 'VR6AewLTigWG4xSOukaG', 
    name: 'Arnold', 
    description: 'Deep multilingual male voice',
    language: 'hi', 
    gender: 'male',
    category: 'guide'
  },
];

// Audio cache to avoid re-generating same content
const audioCache = new Map<string, SpeechResult>();

// Usage tracking
interface UsageStats {
  charactersUsed: number;
  requestsCount: number;
  lastReset: Date;
}

class VoiceService {
  private baseUrl: string;
  private useMock: boolean;
  private apiKey: string;
  private usage: UsageStats;
  private monthlyLimit: number;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private onPlayStateChange?: (playing: boolean) => void;

  constructor() {
    this.baseUrl = ServiceURLs.VOICE_API;
    this.useMock = ServiceFlags.USE_MOCK_VOICE;
    this.apiKey = ServiceKeys.ELEVENLABS_API_KEY;
    this.monthlyLimit = ElevenLabsConfig.MONTHLY_LIMIT;
    
    // Load usage from localStorage
    this.usage = this.loadUsage();
  }

  /**
   * Check if ElevenLabs is configured and available
   */
  isConfigured(): boolean {
    return isElevenLabsConfigured();
  }

  /**
   * Check if using browser TTS fallback
   */
  isUsingBrowserTTS(): boolean {
    return !this.isConfigured() && 'speechSynthesis' in window;
  }

  /**
   * Convert text to speech using ElevenLabs
   */
  async textToSpeech(
    text: string,
    options: {
      voiceId?: string;
      language?: string;
      category?: 'chat' | 'guide' | 'alert';
      settings?: VoiceSettings;
      useCache?: boolean;
    } = {}
  ): Promise<SpeechResult> {
    const {
      voiceId = this.getDefaultVoice(options.language || 'en', options.category || 'chat'),
      language = 'en',
      settings = {},
      useCache = true,
    } = options;

    // Check cache first
    const cacheKey = this.getCacheKey(text, voiceId);
    if (useCache && audioCache.has(cacheKey)) {
      console.log('🔊 Using cached audio');
      return { ...audioCache.get(cacheKey)!, cached: true };
    }

    // Check character limit
    if (this.usage.charactersUsed + text.length > this.monthlyLimit) {
      console.warn(`⚠️ ElevenLabs character limit approaching: ${this.usage.charactersUsed}/${this.monthlyLimit}`);
    }

    // Use ElevenLabs if configured
    if (this.isConfigured()) {
      try {
        const result = await this.callElevenLabs(text, voiceId, settings);
        if (useCache) {
          audioCache.set(cacheKey, result);
        }
        return result;
      } catch (error) {
        console.warn('ElevenLabs failed, falling back to browser TTS:', error);
      }
    }

    // Mock or browser TTS fallback
    return this.getMockSpeech(text, voiceId);
  }

  /**
   * Call ElevenLabs API
   */
  private async callElevenLabs(
    text: string,
    voiceId: string,
    settings: VoiceSettings
  ): Promise<SpeechResult> {
    const url = `${ElevenLabsConfig.API_URL}/text-to-speech/${voiceId}`;
    
    const voiceSettings = {
      stability: settings.stability ?? ElevenLabsConfig.DEFAULT_STABILITY,
      similarity_boost: settings.similarity_boost ?? ElevenLabsConfig.DEFAULT_SIMILARITY,
      style: settings.style ?? ElevenLabsConfig.DEFAULT_STYLE,
      use_speaker_boost: settings.use_speaker_boost ?? true,
    };

    console.log(`🎙️ Generating speech with ElevenLabs (${text.length} chars)...`);

    const response = await serviceFetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: ElevenLabsConfig.MODEL_ID,
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const duration = this.estimateDuration(text);

    // Update usage
    this.usage.charactersUsed += text.length;
    this.usage.requestsCount++;
    this.saveUsage();

    console.log(`✅ Speech generated successfully (${duration.toFixed(1)}s)`);

    return {
      audioUrl,
      audioBlob,
      duration,
      charactersUsed: text.length,
      voiceId,
      cached: false,
    };
  }

  /**
   * Generate audio guide for a destination
   */
  async generateAudioGuide(
    destination: string,
    content: {
      introduction: string;
      history: string;
      highlights: string[];
      tips: string[];
    },
    options: {
      language?: string;
      voiceId?: string;
    } = {}
  ): Promise<AudioGuideContent> {
    const { language = 'en', voiceId = this.getDefaultVoice(language, 'guide') } = options;

    const sections: AudioGuideSection[] = [];
    let totalDuration = 0;

    // Introduction
    const intro = await this.textToSpeech(
      `Welcome to ${destination}. ${content.introduction}`,
      { voiceId, language, category: 'guide' }
    );
    sections.push({
      id: 'intro',
      title: 'Introduction',
      content: content.introduction,
      audioUrl: intro.audioUrl,
      duration: intro.duration,
    });
    totalDuration += intro.duration;

    // History
    const history = await this.textToSpeech(
      `Let me tell you about the history. ${content.history}`,
      { voiceId, language, category: 'guide' }
    );
    sections.push({
      id: 'history',
      title: 'History & Background',
      content: content.history,
      audioUrl: history.audioUrl,
      duration: history.duration,
    });
    totalDuration += history.duration;

    // Highlights
    for (let i = 0; i < content.highlights.length; i++) {
      const highlight = await this.textToSpeech(
        content.highlights[i],
        { voiceId, language, category: 'guide' }
      );
      sections.push({
        id: `highlight-${i}`,
        title: `Highlight ${i + 1}`,
        content: content.highlights[i],
        audioUrl: highlight.audioUrl,
        duration: highlight.duration,
      });
      totalDuration += highlight.duration;
    }

    // Tips
    const tipsText = `Here are some tips for your visit. ${content.tips.join('. ')}`;
    const tips = await this.textToSpeech(tipsText, { voiceId, language, category: 'guide' });
    sections.push({
      id: 'tips',
      title: 'Visitor Tips',
      content: tipsText,
      audioUrl: tips.audioUrl,
      duration: tips.duration,
    });
    totalDuration += tips.duration;

    return {
      id: `guide-${destination.toLowerCase().replace(/\s+/g, '-')}`,
      title: `Audio Guide: ${destination}`,
      description: `A comprehensive audio guide for ${destination}`,
      sections,
      language,
      duration: totalDuration,
      voiceId,
    };
  }

  /**
   * Speak a chat response with voice
   */
  async speakChatResponse(
    message: string,
    options: {
      language?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<void> {
    const { language = 'en', onStart, onEnd, onError } = options;

    try {
      // Stop any current playback
      this.stopPlayback();

      // Get the voice for chat
      const voiceId = this.getDefaultVoice(language, 'chat');

      if (this.isConfigured()) {
        const result = await this.textToSpeech(message, { voiceId, language, category: 'chat' });
        onStart?.();
        await this.playAudio(result.audioUrl);
        onEnd?.();
      } else if (this.isUsingBrowserTTS()) {
        onStart?.();
        await this.speakWithBrowserTTS(message, language);
        onEnd?.();
      } else {
        console.log('📢 Voice not available:', message);
        onEnd?.();
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }

  /**
   * Play audio URL
   */
  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.onplay = () => {
        this.isPlaying = true;
        this.onPlayStateChange?.(true);
      };
      this.currentAudio.onended = () => {
        this.isPlaying = false;
        this.onPlayStateChange?.(false);
        resolve();
      };
      this.currentAudio.onerror = (e) => {
        this.isPlaying = false;
        this.onPlayStateChange?.(false);
        reject(new Error('Audio playback failed'));
      };
      this.currentAudio.play().catch(reject);
    });
  }

  /**
   * Stop current audio playback
   */
  stopPlayback(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.stopBrowserTTS();
    this.isPlaying = false;
    this.onPlayStateChange?.(false);
  }

  /**
   * Pause current audio playback
   */
  pausePlayback(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.isPlaying = false;
      this.onPlayStateChange?.(false);
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.pause();
    }
  }

  /**
   * Resume current audio playback
   */
  resumePlayback(): void {
    if (this.currentAudio) {
      this.currentAudio.play();
      this.isPlaying = true;
      this.onPlayStateChange?.(true);
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.resume();
    }
  }

  /**
   * Check if audio is playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Set play state change callback
   */
  setOnPlayStateChange(callback: (playing: boolean) => void): void {
    this.onPlayStateChange = callback;
  }

  /**
   * Use browser's built-in TTS as fallback
   */
  speakWithBrowserTTS(text: string, language: string = 'en'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Browser TTS not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        this.isPlaying = false;
        this.onPlayStateChange?.(false);
        resolve();
      };
      utterance.onerror = (e) => {
        this.isPlaying = false;
        this.onPlayStateChange?.(false);
        reject(new Error(`Browser TTS error: ${e.error}`));
      };

      this.isPlaying = true;
      this.onPlayStateChange?.(true);
      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop browser TTS
   */
  stopBrowserTTS(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    charactersUsed: number;
    charactersRemaining: number;
    percentUsed: number;
    requestsCount: number;
    lastReset: Date;
  } {
    return {
      charactersUsed: this.usage.charactersUsed,
      charactersRemaining: Math.max(0, this.monthlyLimit - this.usage.charactersUsed),
      percentUsed: (this.usage.charactersUsed / this.monthlyLimit) * 100,
      requestsCount: this.usage.requestsCount,
      lastReset: this.usage.lastReset,
    };
  }

  /**
   * Reset usage (for testing or new month)
   */
  resetUsage(): void {
    this.usage = {
      charactersUsed: 0,
      requestsCount: 0,
      lastReset: new Date(),
    };
    this.saveUsage();
  }

  /**
   * Get available voices for a language
   */
  getVoicesForLanguage(language: string): VoiceConfig[] {
    return AVAILABLE_VOICES.filter((v) => v.language === language);
  }

  /**
   * Get voices for a specific category
   */
  getVoicesForCategory(category: 'chat' | 'guide' | 'alert' | 'general'): VoiceConfig[] {
    return AVAILABLE_VOICES.filter((v) => v.category === category);
  }

  /**
   * Get voice by ID
   */
  getVoiceById(voiceId: string): VoiceConfig | undefined {
    return AVAILABLE_VOICES.find((v) => v.voiceId === voiceId);
  }

  /**
   * Get all available voices
   */
  getAllVoices(): VoiceConfig[] {
    return AVAILABLE_VOICES;
  }

  /**
   * Get default voice for language and category
   */
  private getDefaultVoice(language: string, category: 'chat' | 'guide' | 'alert'): string {
    const configVoices = ElevenLabsConfig.VOICES;
    
    if (category === 'chat') {
      return language === 'hi' ? configVoices.CHAT_HINDI : configVoices.CHAT_ENGLISH;
    } else if (category === 'guide') {
      return language === 'hi' ? configVoices.GUIDE_HINDI : configVoices.GUIDE_ENGLISH;
    } else if (category === 'alert') {
      return configVoices.ALERT;
    }
    
    return configVoices.CHAT_ENGLISH;
  }

  /**
   * Generate cache key for audio
   */
  private getCacheKey(text: string, voiceId: string): string {
    return `${voiceId}:${text.substring(0, 100)}:${text.length}`;
  }

  /**
   * Get mock speech result
   */
  private getMockSpeech(text: string, voiceId: string): SpeechResult {
    return {
      audioUrl: '',
      duration: this.estimateDuration(text),
      charactersUsed: text.length,
      voiceId,
      cached: false,
    };
  }

  /**
   * Estimate speech duration based on text length
   */
  private estimateDuration(text: string): number {
    // Estimate ~150 words per minute speaking rate
    const words = text.split(/\s+/).length;
    return (words / 150) * 60;
  }

  /**
   * Load usage from localStorage
   */
  private loadUsage(): UsageStats {
    try {
      const stored = localStorage.getItem('elevenlabs_usage');
      if (stored) {
        const usage = JSON.parse(stored);
        const lastReset = new Date(usage.lastReset);
        
        // Reset if it's a new month
        const now = new Date();
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
          return {
            charactersUsed: 0,
            requestsCount: 0,
            lastReset: now,
          };
        }
        
        return {
          ...usage,
          lastReset,
        };
      }
    } catch {
      // Ignore errors
    }
    
    return {
      charactersUsed: 0,
      requestsCount: 0,
      lastReset: new Date(),
    };
  }

  /**
   * Save usage to localStorage
   */
  private saveUsage(): void {
    try {
      localStorage.setItem('elevenlabs_usage', JSON.stringify(this.usage));
    } catch {
      // Ignore errors
    }
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    audioCache.clear();
    console.log('🗑️ Voice cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return audioCache.size;
  }
}

export const voiceService = new VoiceService();
export default voiceService;
