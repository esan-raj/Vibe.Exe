import React, { useState, useEffect, useRef } from 'react';
import { Globe, Languages, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fast translation languages with their native names
const TRANSLATION_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', native: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', native: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', native: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
];

interface BrowserTranslateProps {
  variant?: 'header' | 'floating';
}

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const BrowserTranslate: React.FC<BrowserTranslateProps> = ({ variant = 'header' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isReady, setIsReady] = useState(false);
  const translateElementRef = useRef<HTMLDivElement>(null);
  const initializationAttempts = useRef(0);

  // Initialize Google Translate properly
  useEffect(() => {
    const initializeGoogleTranslate = () => {
      // Remove existing script if any
      const existingScript = document.getElementById('google-translate-script');
      if (existingScript) {
        existingScript.remove();
      }

      // Create the script
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

      // Set up the callback
      window.googleTranslateElementInit = () => {
        console.log('🔄 Google Translate script loaded, initializing...');
        
        if (window.google && window.google.translate && translateElementRef.current) {
          try {
            // Clear the container
            translateElementRef.current.innerHTML = '';
            
            // Create the translate element
            new window.google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: TRANSLATION_LANGUAGES.map(lang => lang.code).join(','),
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
              multilanguagePage: true
            }, translateElementRef.current);

            // Wait for the select element to be created
            const checkForSelect = () => {
              const selectElement = translateElementRef.current?.querySelector('select.goog-te-combo');
              if (selectElement) {
                console.log('✅ Google Translate initialized successfully');
                setIsReady(true);
                
                // Hide Google branding
                setTimeout(() => {
                  hideGoogleBranding();
                }, 500);
              } else if (initializationAttempts.current < 20) {
                initializationAttempts.current++;
                setTimeout(checkForSelect, 250);
              } else {
                console.error('❌ Failed to initialize Google Translate after multiple attempts');
              }
            };

            checkForSelect();
          } catch (error) {
            console.error('❌ Error creating Google Translate element:', error);
          }
        } else {
          console.error('❌ Google Translate API not available');
        }
      };

      script.onerror = () => {
        console.error('❌ Failed to load Google Translate script');
      };

      document.head.appendChild(script);
    };

    const hideGoogleBranding = () => {
      // Hide the banner
      const banner = document.querySelector('.goog-te-banner-frame');
      if (banner) {
        (banner as HTMLElement).style.display = 'none';
      }

      // Hide the gadget
      const gadget = translateElementRef.current?.querySelector('.goog-te-gadget');
      if (gadget) {
        (gadget as HTMLElement).style.display = 'none';
      }

      // Reset body styles
      document.body.style.top = '0px';
      document.body.style.position = 'static';
    };

    initializeGoogleTranslate();
  }, []);

  // Translation function that actually works
  const translateTo = (langCode: string) => {
    if (!isReady) {
      console.log('⚠️ Google Translate not ready yet');
      return;
    }

    const selectElement = translateElementRef.current?.querySelector('select.goog-te-combo') as HTMLSelectElement;
    
    if (selectElement) {
      console.log(`🌐 Translating to: ${langCode || 'original'}`);
      
      // Set the value and trigger change
      selectElement.value = langCode;
      
      // Create and dispatch the change event
      const changeEvent = new Event('change', { 
        bubbles: true, 
        cancelable: true 
      });
      selectElement.dispatchEvent(changeEvent);
      
      // Update our state
      setCurrentLanguage(langCode || 'en');
      setIsOpen(false);
      
      console.log(`✅ Translation triggered for: ${langCode || 'original'}`);
    } else {
      console.error('❌ Google Translate select element not found');
      
      // Try to reinitialize
      setIsReady(false);
      initializationAttempts.current = 0;
      
      setTimeout(() => {
        window.googleTranslateElementInit?.();
      }, 1000);
    }
  };

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return TRANSLATION_LANGUAGES.find(lang => lang.code === currentLanguage) || TRANSLATION_LANGUAGES[0];
  };

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
              className="mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-sm"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  Translate Page
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isReady ? 'Click any language to translate' : 'Loading translator...'}
                </p>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {TRANSLATION_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => translateTo(language.code === 'en' ? '' : language.code)}
                    disabled={!isReady}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0 disabled:opacity-50 flex items-center gap-3 ${
                      currentLanguage === language.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{language.native}</div>
                      <div className="text-xs opacity-75">{language.name}</div>
                    </div>
                    {currentLanguage === language.code && (
                      <Check className="w-4 h-4 text-blue-600" />
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
          <Languages className="w-6 h-6" />
          {currentLanguage !== 'en' && (
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              {getCurrentLanguageInfo().flag}
            </span>
          )}
        </motion.button>

        {/* Hidden Google Translate Element */}
        <div ref={translateElementRef} style={{ display: 'none' }} />
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
        title={isReady ? "Translate Page" : "Loading translator..."}
      >
        <Languages className="w-5 h-5" />
        {currentLanguage !== 'en' && (
          <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
            {getCurrentLanguageInfo().flag}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <Languages className="w-4 h-4" />
                Instant Page Translation
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isReady ? 'Click any language for immediate translation' : 'Loading translator...'}
              </p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {TRANSLATION_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => translateTo(language.code === 'en' ? '' : language.code)}
                  disabled={!isReady}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0 text-sm disabled:opacity-50 flex items-center gap-3 ${
                    currentLanguage === language.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-base">{language.flag}</span>
                  <div className="flex-1">
                    <span className="font-medium">{language.native}</span>
                    {language.native !== language.name && (
                      <span className="text-xs opacity-75 ml-2">({language.name})</span>
                    )}
                  </div>
                  {currentLanguage === language.code && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Google Translate Element */}
      <div ref={translateElementRef} style={{ display: 'none' }} />
    </div>
  );
};

export default BrowserTranslate;