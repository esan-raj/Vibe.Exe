import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Globe, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { googleTranslateManager } from '../../lib/googleTranslate';

// Google Translate supported languages
const GOOGLE_TRANSLATE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'ar', name: 'Arabic' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'tl', name: 'Filipino' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'mr', name: 'Marathi' },
];

interface GoogleTranslateProps {
  variant?: 'header' | 'floating';
}

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const GoogleTranslate: React.FC<GoogleTranslateProps> = ({ variant = 'header' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleTranslateRef = useRef<HTMLDivElement>(null);

  // Initialize Google Translate
  const initializeTranslate = useCallback(async () => {
    if (!googleTranslateRef.current) return;

    try {
      setError(null);
      
      // Initialize the manager
      await googleTranslateManager.init({
        pageLanguage: 'en',
        includedLanguages: GOOGLE_TRANSLATE_LANGUAGES.map(lang => lang.code),
        onInit: () => {
          console.log('🎉 Google Translate manager ready');
        },
        onError: (error) => {
          console.error('❌ Google Translate manager error:', error);
          setError(error);
        }
      });

      // Create translate element
      await googleTranslateManager.createTranslateElement(googleTranslateRef.current);
      
      setIsLoaded(true);
      console.log('✅ Google Translate component initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Google Translate:', error);
      setError(error instanceof Error ? error.message : 'Initialization failed');
    }
  }, []);

  // Translate to specific language
  const translateToLanguage = useCallback((langCode: string) => {
    if (!googleTranslateRef.current || isTranslating) return;
    
    setIsTranslating(true);
    console.log(`🌐 Starting translation to: ${langCode || 'original'}`);

    // Small delay for UI feedback
    setTimeout(() => {
      const success = googleTranslateManager.translateTo(googleTranslateRef.current!, langCode);
      
      if (success) {
        setCurrentLanguage(langCode || 'en');
        setIsOpen(false);
        console.log(`✅ Translation completed: ${langCode || 'original'}`);
      } else {
        setError('Translation failed');
      }
      
      // Stop loading after 2 seconds max
      setTimeout(() => {
        setIsTranslating(false);
      }, 2000);
    }, 100);
  }, [isTranslating]);

  // Handle language selection
  const handleLanguageSelect = useCallback((langCode: string) => {
    translateToLanguage(langCode);
  }, [translateToLanguage]);

  // Get current language name
  const getCurrentLanguageName = () => {
    const lang = GOOGLE_TRANSLATE_LANGUAGES.find(l => l.code === currentLanguage);
    return lang ? lang.name : 'English';
  };

  // Load script on mount
  useEffect(() => {
    initializeTranslate();
  }, [initializeTranslate]);

  // Monitor current language
  useEffect(() => {
    if (!isLoaded || !googleTranslateRef.current) return;

    const interval = setInterval(() => {
      const currentLang = googleTranslateManager.getCurrentLanguage(googleTranslateRef.current!);
      if (currentLang !== currentLanguage) {
        setCurrentLanguage(currentLang);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded, currentLanguage]);

  // Show loading state
  if (!isLoaded && !error) {
    return (
      <div className="relative">
        <motion.button
          disabled
          className="p-2 text-gray-400 dark:text-gray-600 cursor-not-allowed rounded-lg flex items-center gap-1"
          title="Loading Google Translate..."
        >
          <Loader2 className="w-5 h-5 animate-spin" />
        </motion.button>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => {
            setError(null);
            initializeTranslate();
          }}
          className="p-2 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg flex items-center gap-1 transition-colors"
          title={`Google Translate Error: ${error}. Click to retry.`}
        >
          <Globe className="w-5 h-5" />
        </motion.button>
      </div>
    );
  }

  if (variant === 'floating') {
    // Floating variant is disabled - return null
    return null;
  }
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-xs"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Translate Page
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                <button
                  onClick={() => handleLanguageSelect('')}
                  disabled={isTranslating}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 disabled:opacity-50 ${
                    currentLanguage === 'en' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isTranslating && currentLanguage === 'en' ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Original (English)
                    </div>
                  ) : (
                    'Original (English)'
                  )}
                </button>
                
                {GOOGLE_TRANSLATE_LANGUAGES.filter(lang => lang.code !== 'en').map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    disabled={isTranslating}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0 disabled:opacity-50 ${
                      currentLanguage === language.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {isTranslating && currentLanguage === language.code ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {language.name}
                      </div>
                    ) : (
                      language.name
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        >
          <Globe className="w-6 h-6" />
          {isTranslating && <Loader2 className="w-4 h-4 animate-spin" />}
          {currentLanguage !== 'en' && !isTranslating && (
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              {getCurrentLanguageName()}
            </span>
          )}
        </motion.button>

        {/* Hidden Google Translate Element */}
        <div ref={googleTranslateRef} className="hidden" />
      </div>
    );
  }

  // Header variant
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1"
        title="Translate Page"
      >
        <Globe className="w-5 h-5" />
        {isTranslating && <Loader2 className="w-3 h-3 animate-spin" />}
        {currentLanguage !== 'en' && !isTranslating && (
          <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
            {currentLanguage.toUpperCase()}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4" />
                Translate Entire Page
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Powered by Google Translate
              </p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              <button
                onClick={() => handleLanguageSelect('')}
                disabled={isTranslating}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 text-sm disabled:opacity-50 ${
                  currentLanguage === 'en' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {isTranslating && currentLanguage === 'en' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    🇺🇸 Original (English)
                  </div>
                ) : (
                  '🇺🇸 Original (English)'
                )}
              </button>
              
              {GOOGLE_TRANSLATE_LANGUAGES.filter(lang => lang.code !== 'en').map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  disabled={isTranslating}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0 text-sm disabled:opacity-50 ${
                    currentLanguage === language.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isTranslating && currentLanguage === language.code ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {language.name}
                    </div>
                  ) : (
                    language.name
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Google Translate Element */}
      <div ref={googleTranslateRef} className="hidden" />
    </div>
  );
};

export default GoogleTranslate;