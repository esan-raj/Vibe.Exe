import React, { useState, useEffect, useRef } from 'react';
import { Languages, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Languages that work with Google Translate widget
const LANGUAGES = [
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
];

interface WorkingTranslateProps {
  variant?: 'header' | 'floating';
}

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const WorkingTranslate: React.FC<WorkingTranslateProps> = ({ variant = 'header' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const translateRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    const loadGoogleTranslate = () => {
      // Don't load multiple times
      if (scriptLoaded.current) return;
      scriptLoaded.current = true;

      // Remove any existing elements
      const existingScript = document.getElementById('google-translate-script');
      if (existingScript) existingScript.remove();

      const existingElement = document.getElementById('google_translate_element');
      if (existingElement) existingElement.remove();

      // Create the translate element container
      const container = document.createElement('div');
      container.id = 'google_translate_element';
      container.style.display = 'none';
      document.body.appendChild(container);

      // Set up the initialization function
      window.googleTranslateElementInit = () => {
        try {
          if (window.google && window.google.translate) {
            new window.google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: LANGUAGES.map(lang => lang.code).join(','),
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
              multilanguagePage: true
            }, 'google_translate_element');

            // Wait for the select element to be created
            const checkForSelect = () => {
              const select = document.querySelector('#google_translate_element select.goog-te-combo');
              if (select) {
                setIsReady(true);
                setError(null);
                console.log('✅ Google Translate is ready!');
                
                // Hide all Google branding
                setTimeout(() => {
                  hideGoogleBranding();
                }, 500);
              } else {
                setTimeout(checkForSelect, 200);
              }
            };
            checkForSelect();
          }
        } catch (err) {
          console.error('Error initializing Google Translate:', err);
          setError('Failed to initialize translator');
        }
      };

      // Load the script
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.onerror = () => {
        setError('Failed to load Google Translate');
        console.error('Failed to load Google Translate script');
      };
      
      document.head.appendChild(script);
    };

    const hideGoogleBranding = () => {
      // Hide the banner
      const banner = document.querySelector('.goog-te-banner-frame');
      if (banner) (banner as HTMLElement).style.display = 'none';

      // Hide the gadget
      const gadget = document.querySelector('#google_translate_element .goog-te-gadget');
      if (gadget) (gadget as HTMLElement).style.display = 'none';

      // Reset body styles
      document.body.style.top = '0px';
      document.body.style.position = 'static';
    };

    loadGoogleTranslate();
  }, []);

  const translateTo = (langCode: string) => {
    if (!isReady) {
      setError('Translator not ready yet');
      return;
    }

    const select = document.querySelector('#google_translate_element select.goog-te-combo') as HTMLSelectElement;
    
    if (select) {
      console.log(`🌐 Translating to: ${langCode || 'original'}`);
      
      // Set the value
      select.value = langCode;
      
      // Trigger the change event
      const event = new Event('change', { bubbles: true, cancelable: true });
      select.dispatchEvent(event);
      
      // Update our state
      setCurrentLanguage(langCode || 'en');
      setIsOpen(false);
      setError(null);
      
      console.log(`✅ Translation triggered for: ${langCode || 'original'}`);
    } else {
      setError('Translation element not found');
      console.error('❌ Google Translate select element not found');
    }
  };

  const getCurrentLanguageInfo = () => {
    return LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];
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
                  {error ? error : isReady ? 'Click any language to translate' : 'Loading translator...'}
                </p>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {LANGUAGES.map((language) => (
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
        title={error ? error : isReady ? "Translate Page" : "Loading translator..."}
      >
        {error ? (
          <AlertCircle className="w-5 h-5 text-red-500" />
        ) : (
          <Languages className="w-5 h-5" />
        )}
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
                Page Translation
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {error ? error : isReady ? 'Click any language for immediate translation' : 'Loading translator...'}
              </p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {LANGUAGES.map((language) => (
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
    </div>
  );
};

export default WorkingTranslate;