/**
 * Language Context - FIXED VERSION
 * 
 * Key fixes:
 * - Uses "translation" namespace to match i18n config
 * - Force re-renders on language change using key prop
 * - Properly exposes i18n t function
 * - Added debug logging
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  ReactNode,
  useMemo
} from 'react';
import { useTranslation } from 'react-i18next';

import type { LanguageCode, LanguageContextType } from '../lib/i18n/types';
import {
  loadLanguage,
  getSavedLanguage,
  isRTL,
  getLanguageList,
} from '../lib/i18n';
import i18n from '../lib/i18n';

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Language Provider Component
 * Wraps the app to provide language context globally.
 */
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // CRITICAL FIX: Use "translation" namespace to match i18n config
  const { t, i18n: i18nInstance } = useTranslation('translation');
  
  // Track current language state
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    // Initialize from i18n or localStorage
    const saved = getSavedLanguage();
    console.log('🌐 LanguageProvider init with:', saved);
    return saved;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [, forceUpdate] = useState({});

  // Initialize language on mount
  useEffect(() => {
    const initLanguage = async () => {
      const savedLang = getSavedLanguage();
      console.log('🚀 Initializing language:', savedLang);
      
      if (savedLang !== 'en') {
        setIsLoading(true);
        try {
          await loadLanguage(savedLang);
          setCurrentLanguage(savedLang);
          console.log('✅ Initial language loaded:', savedLang);
        } catch (error) {
          console.error('❌ Failed to load saved language:', error);
          setCurrentLanguage('en');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    initLanguage();
  }, []);

  // Listen for i18next language changes and force re-render
  useEffect(() => {
    const handleLanguageChange = (lang: string) => {
      console.log('🔄 i18next language changed to:', lang);
      setCurrentLanguage(lang as LanguageCode);
      // Force re-render to update all t() calls
      forceUpdate({});
    };
    
    i18nInstance.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18nInstance.off('languageChanged', handleLanguageChange);
    };
  }, [i18nInstance]);

  /**
   * Change the current language
   */
  const setLanguage = useCallback(async (lang: LanguageCode): Promise<void> => {
    console.log(`🌐 setLanguage called: ${currentLanguage} → ${lang}`);
    
    if (lang === currentLanguage) {
      console.log('Same language, skipping');
      return;
    }
    
    setIsTranslating(true);
    
    try {
      await loadLanguage(lang, (progress) => {
        console.log(`📊 Translation progress: ${progress}%`);
      });
      
      setCurrentLanguage(lang);
      // Force immediate re-render
      forceUpdate({});
      
      console.log(`✅ Language switched to: ${lang}`);
    } catch (error) {
      console.error('❌ Failed to change language:', error);
      throw error;
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<LanguageContextType>(() => ({
    currentLanguage,
    setLanguage,
    isLoading,
    isTranslating,
    // CRITICAL: Use the t function directly from useTranslation hook
    // This ensures it's always up to date with current language
    t: (key: string, options?: Record<string, unknown>) => {
      const result = t(key, options as any);
      // Debug: Log if key is not translated
      if (result === key && import.meta.env.DEV) {
        console.warn(`⚠️ Missing translation for key: ${key}`);
      }
      return result;
    },
    availableLanguages: getLanguageList(),
    isRTL: isRTL(currentLanguage),
  }), [currentLanguage, setLanguage, isLoading, isTranslating, t]);

  // Debug: Log when provider re-renders
  useEffect(() => {
    console.log('🔄 LanguageProvider rendered, language:', currentLanguage);
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to access language context
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

/**
 * Hook for direct translation access (alternative to useLanguage)
 * Use this for simpler components that just need translation
 */
export const useAppTranslation = () => {
  const { t, i18n: i18nInstance } = useTranslation('translation');
  const [, forceUpdate] = useState({});
  
  // Force re-render on language change
  useEffect(() => {
    const handleChange = () => forceUpdate({});
    i18nInstance.on('languageChanged', handleChange);
    return () => {
      i18nInstance.off('languageChanged', handleChange);
    };
  }, [i18nInstance]);
  
  return { t, currentLanguage: i18nInstance.language };
};

export default LanguageContext;
