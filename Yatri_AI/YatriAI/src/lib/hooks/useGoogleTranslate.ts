import { useState, useEffect, useCallback } from 'react';

interface GoogleTranslateState {
  isLoaded: boolean;
  currentLanguage: string;
  isTranslating: boolean;
  error: string | null;
}

interface UseGoogleTranslateReturn extends GoogleTranslateState {
  translateTo: (languageCode: string) => void;
  resetTranslation: () => void;
  getSupportedLanguages: () => string[];
}

/**
 * Custom hook for managing Google Translate functionality
 * 
 * Provides state management and utility functions for Google Translate integration
 * Handles script loading, language switching, and error states
 */
export const useGoogleTranslate = (): UseGoogleTranslateReturn => {
  const [state, setState] = useState<GoogleTranslateState>({
    isLoaded: false,
    currentLanguage: 'en',
    isTranslating: false,
    error: null,
  });

  // Check if Google Translate is available
  const checkGoogleTranslate = useCallback(() => {
    return !!(window as any).google?.translate?.TranslateElement;
  }, []);

  // Get supported languages from Google Translate
  const getSupportedLanguages = useCallback((): string[] => {
    // Common Google Translate language codes
    return [
      'en', 'hi', 'bn', 'fr', 'es', 'ar', 'de', 'ja', 'zh', 'ko',
      'pt', 'ru', 'it', 'nl', 'sv', 'da', 'no', 'fi', 'pl', 'tr',
      'th', 'vi', 'id', 'ms', 'tl', 'ur', 'ta', 'te', 'ml', 'kn',
      'gu', 'pa', 'mr', 'ne', 'si', 'my', 'km', 'lo', 'ka', 'am',
      'sw', 'zu', 'af', 'sq', 'az', 'be', 'bg', 'ca', 'hr', 'cs',
      'et', 'eu', 'gl', 'he', 'hu', 'is', 'ga', 'lv', 'lt', 'mk',
      'mt', 'ro', 'sk', 'sl', 'sr', 'uk', 'cy'
    ];
  }, []);

  // Translate to specific language
  const translateTo = useCallback((languageCode: string) => {
    if (!checkGoogleTranslate()) {
      setState(prev => ({ ...prev, error: 'Google Translate not loaded' }));
      return;
    }

    setState(prev => ({ ...prev, isTranslating: true, error: null }));

    try {
      // Find the Google Translate select element
      const selectElement = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
      
      if (selectElement) {
        selectElement.value = languageCode;
        selectElement.dispatchEvent(new Event('change'));
        
        setState(prev => ({
          ...prev,
          currentLanguage: languageCode,
          isTranslating: false,
        }));
      } else {
        throw new Error('Google Translate select element not found');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Translation failed',
        isTranslating: false,
      }));
    }
  }, [checkGoogleTranslate]);

  // Reset translation to original language
  const resetTranslation = useCallback(() => {
    translateTo('');
    setState(prev => ({ ...prev, currentLanguage: 'en' }));
  }, [translateTo]);

  // Check if Google Translate is loaded on mount
  useEffect(() => {
    const checkLoaded = () => {
      if (checkGoogleTranslate()) {
        setState(prev => ({ ...prev, isLoaded: true, error: null }));
      }
    };

    // Check immediately
    checkLoaded();

    // Set up interval to check for Google Translate availability
    const interval = setInterval(checkLoaded, 1000);

    // Clean up after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!checkGoogleTranslate()) {
        setState(prev => ({
          ...prev,
          error: 'Google Translate failed to load',
        }));
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [checkGoogleTranslate]);

  // Listen for language changes from Google Translate
  useEffect(() => {
    const handleLanguageChange = () => {
      const selectElement = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
      if (selectElement) {
        const currentLang = selectElement.value || 'en';
        setState(prev => ({ ...prev, currentLanguage: currentLang }));
      }
    };

    // Listen for changes on the Google Translate select element
    const selectElement = document.querySelector('select.goog-te-combo');
    if (selectElement) {
      selectElement.addEventListener('change', handleLanguageChange);
      return () => selectElement.removeEventListener('change', handleLanguageChange);
    }
  }, [state.isLoaded]);

  return {
    ...state,
    translateTo,
    resetTranslation,
    getSupportedLanguages,
  };
};