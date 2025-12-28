/**
 * AudioGuide Component
 * 
 * An audio tour guide for destinations using ElevenLabs TTS.
 * Features:
 * - Section-by-section playback
 * - Progress tracking
 * - Download audio option
 * - Language selection
 * - Voice selection
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Globe,
} from 'lucide-react';
import { voiceService, AudioGuideContent, AudioGuideSection, AVAILABLE_VOICES } from '../../lib/services/voice.service';
import { MagicCard } from '../magicui/MagicCard';
import { BorderBeam } from '../magicui/BorderBeam';
import { cn } from '../../lib/utils';

interface AudioGuideProps {
  destination: string;
  content: {
    introduction: string;
    history: string;
    highlights: string[];
    tips: string[];
  };
  className?: string;
}

const AudioGuide: React.FC<AudioGuideProps> = ({
  destination,
  content,
  className,
}) => {
  const [guide, setGuide] = useState<AudioGuideContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [error, setError] = useState<string | null>(null);

  const isConfigured = voiceService.isConfigured();

  // Generate audio guide
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const audioGuide = await voiceService.generateAudioGuide(
        destination,
        content,
        { language }
      );
      setGuide(audioGuide);
      setCurrentSectionIndex(0);
    } catch (err) {
      setError('Failed to generate audio guide. Please try again.');
      console.error('Audio guide generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [destination, content, language]);

  // Play current section
  const playSection = useCallback(async (section: AudioGuideSection) => {
    setIsPlaying(true);

    try {
      if (section.audioUrl) {
        await voiceService.playAudio(section.audioUrl);
      } else {
        // Fallback to browser TTS
        await voiceService.speakWithBrowserTTS(section.content, language);
      }
    } catch (err) {
      console.error('Playback error:', err);
    } finally {
      setIsPlaying(false);
    }
  }, [language]);

  // Stop playback
  const handleStop = useCallback(() => {
    voiceService.stopPlayback();
    setIsPlaying(false);
  }, []);

  // Navigate sections
  const handlePrevious = useCallback(() => {
    handleStop();
    setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1));
  }, [currentSectionIndex, handleStop]);

  const handleNext = useCallback(() => {
    handleStop();
    if (guide) {
      setCurrentSectionIndex(Math.min(guide.sections.length - 1, currentSectionIndex + 1));
    }
  }, [guide, currentSectionIndex, handleStop]);

  // Play all sections sequentially
  const handlePlayAll = useCallback(async () => {
    if (!guide) return;

    setIsPlaying(true);
    for (let i = currentSectionIndex; i < guide.sections.length; i++) {
      setCurrentSectionIndex(i);
      if (!isPlaying) break; // Stop if user paused

      try {
        const section = guide.sections[i];
        if (section.audioUrl) {
          await voiceService.playAudio(section.audioUrl);
        } else {
          await voiceService.speakWithBrowserTTS(section.content, language);
        }
      } catch {
        break;
      }
    }
    setIsPlaying(false);
  }, [guide, currentSectionIndex, isPlaying, language]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Current section
  const currentSection = useMemo(() => {
    return guide?.sections[currentSectionIndex];
  }, [guide, currentSectionIndex]);

  // Usage stats
  const usageStats = voiceService.getUsageStats();

  return (
    <MagicCard className={cn('relative overflow-hidden', className)}>
      <BorderBeam size={300} duration={15} />

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Audio Guide
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {destination}
              </p>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
              className="text-sm bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-2 py-1"
              disabled={isPlaying || isGenerating}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
        </div>

        {/* Voice Status */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {isConfigured ? (
            <>
              <Volume2 className="w-3 h-3 text-emerald-500" />
              <span>ElevenLabs AI Voice</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>{usageStats.charactersRemaining.toLocaleString()} chars remaining</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3 text-amber-500" />
              <span>Browser TTS (add ElevenLabs key for premium voices)</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Generate Button */}
        {!guide && (
          <motion.button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Audio Guide...</span>
              </>
            ) : (
              <>
                <Headphones className="w-5 h-5" />
                <span>Generate Audio Guide</span>
              </>
            )}
          </motion.button>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Audio Player */}
        {guide && (
          <div className="space-y-4">
            {/* Current Section Info */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Section {currentSectionIndex + 1} of {guide.sections.length}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(currentSection?.duration || 0)}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {currentSection?.title}
              </h4>

              {/* Expand/collapse content preview */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide transcript
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show transcript
                  </>
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 text-sm text-gray-600 dark:text-gray-300 overflow-hidden"
                  >
                    {currentSection?.content}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4">
              <motion.button
                onClick={handlePrevious}
                disabled={currentSectionIndex === 0}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SkipBack className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={isPlaying ? handleStop : handlePlayAll}
                className="p-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </motion.button>

              <motion.button
                onClick={handleNext}
                disabled={currentSectionIndex === guide.sections.length - 1}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SkipForward className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-1.5">
              {guide.sections.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleStop();
                    setCurrentSectionIndex(i);
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === currentSectionIndex
                      ? 'bg-emerald-500 w-4'
                      : i < currentSectionIndex
                      ? 'bg-emerald-300 dark:bg-emerald-700'
                      : 'bg-gray-300 dark:bg-gray-600'
                  )}
                />
              ))}
            </div>

            {/* Section List */}
            <div className="mt-4 space-y-2">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                All Sections
              </h5>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {guide.sections.map((section, i) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      handleStop();
                      setCurrentSectionIndex(i);
                    }}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg text-left transition-all flex items-center justify-between',
                      i === currentSectionIndex
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    <span className="text-sm truncate">{section.title}</span>
                    <span className="text-xs opacity-60">
                      {formatDuration(section.duration || 0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Regenerate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isPlaying}
              className="w-full py-2 text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate in {language === 'en' ? 'Hindi' : 'English'}
            </button>

            {/* Total Duration */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              Total duration: {formatDuration(guide.duration)}
            </div>
          </div>
        )}
      </div>
    </MagicCard>
  );
};

export default AudioGuide;

