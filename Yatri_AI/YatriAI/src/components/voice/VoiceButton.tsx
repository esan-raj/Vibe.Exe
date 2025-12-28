/**
 * VoiceButton Component
 * 
 * A button that speaks text using ElevenLabs or browser TTS.
 * Features:
 * - Play/pause/stop controls
 * - Visual feedback during playback
 * - Voice selection
 * - Language support
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Pause, Loader2 } from 'lucide-react';
import { voiceService } from '../../lib/services/voice.service';
import { cn } from '../../lib/utils';

interface VoiceButtonProps {
  text: string;
  language?: string;
  voiceId?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  showLabel?: boolean;
  label?: string;
  className?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  text,
  language = 'en',
  voiceId,
  size = 'md',
  variant = 'ghost',
  showLabel = false,
  label = 'Listen',
  className,
  onPlayStart,
  onPlayEnd,
  onError,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Sync with voice service state
  useEffect(() => {
    const handleStateChange = (playing: boolean) => {
      setIsPlaying(playing);
      if (!playing) {
        setIsPaused(false);
      }
    };

    voiceService.setOnPlayStateChange(handleStateChange);

    return () => {
      voiceService.setOnPlayStateChange(() => {});
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (isPlaying && !isPaused) {
      // Pause playback
      voiceService.pausePlayback();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      // Resume playback
      voiceService.resumePlayback();
      setIsPaused(false);
      return;
    }

    // Start new playback
    setIsLoading(true);
    try {
      await voiceService.speakChatResponse(text, {
        language,
        onStart: () => {
          setIsLoading(false);
          setIsPlaying(true);
          onPlayStart?.();
        },
        onEnd: () => {
          setIsPlaying(false);
          setIsPaused(false);
          onPlayEnd?.();
        },
        onError: (error) => {
          setIsLoading(false);
          setIsPlaying(false);
          onError?.(error);
        },
      });
    } catch (error) {
      setIsLoading(false);
      setIsPlaying(false);
      onError?.(error as Error);
    }
  }, [text, language, isPlaying, isPaused, onPlayStart, onPlayEnd, onError]);

  const handleStop = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    voiceService.stopPlayback();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  // Size classes
  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    secondary: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
  };

  const Icon = isLoading ? Loader2 : isPaused ? Volume2 : isPlaying ? Pause : Volume2;

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <motion.button
        onClick={handleClick}
        className={cn(
          'rounded-full transition-all duration-200 flex items-center justify-center gap-2',
          sizeClasses[size],
          variantClasses[variant],
          isLoading && 'cursor-wait',
          isPlaying && 'ring-2 ring-emerald-500 ring-opacity-50'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isLoading}
        title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Listen'}
      >
        <Icon
          size={iconSizes[size]}
          className={cn(
            isLoading && 'animate-spin',
            isPlaying && !isPaused && 'text-emerald-500'
          )}
        />
        {showLabel && <span>{isPlaying ? (isPaused ? 'Resume' : 'Pause') : label}</span>}
      </motion.button>

      {/* Stop button - shows when playing */}
      <AnimatePresence>
        {isPlaying && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleStop}
            className={cn(
              'rounded-full transition-all duration-200',
              sizeClasses[size],
              'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Stop"
          >
            <VolumeX size={iconSizes[size]} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sound wave animation component for visual feedback
export const SoundWave: React.FC<{ isPlaying: boolean; className?: string }> = ({
  isPlaying,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-emerald-500 rounded-full"
          animate={
            isPlaying
              ? {
                  height: [8, 16, 8],
                  transition: {
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  },
                }
              : { height: 8 }
          }
        />
      ))}
    </div>
  );
};

export default VoiceButton;

