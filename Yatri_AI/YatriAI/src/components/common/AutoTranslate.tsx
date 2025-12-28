import React, { useState, useEffect } from 'react';
import { Globe, Check, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Languages for automatic translation
const AUTO_TRANSLATE_LANGUAGES = [
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
];

interface AutoTranslateProps {
  variant?: 'header' | 'floating';
}

const AutoTranslate: React.FC<AutoTranslateProps> = ({ variant = 'header' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationMethod, setTranslationMethod] = useState<'widget' | 'redirect' | 'iframe'>('redirect');

  // Initialize Google Translate Widget
  const initializeGoogleTranslateWidget = () => {
    // Remove existing widget
    const existingWidget = document.getElementById('google_translate_element');
    if (existingWidget) {
      existingWidget.innerHTML = '';
    }

    // Create widget container if it doesn't exist
    if (!existingWidget) {
      const widgetContainer = document.createElement('div');
      widgetContainer.id = 'google_translate_element';
      widgetContainer.style.display = 'none';
      document.body.appendChild(widgetContainer);
    }

    // Load Google Translate script
    if (!(window as any).google?.translate) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);

      // Initialize callback
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: AUTO_TRANSLATE_LANGUAGES.map(l => l.code).join(','),
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');
      };
    }
  };

  // Method 1: Force Google Translate Widget to translate
  const forceWidgetTranslation = (langCode: string) => {
    console.log(`🚀 Force widget translation to: ${langCode}`);
    
    if (langCode === 'en') {
      // Reset to original
      const translateSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (translateSelect) {
        translateSelect.value = '';
        translateSelect.dispatchEvent(new Event('change'));
      }
      return;
    }

    // Wait for widget to load, then force translation
    const checkWidget = setInterval(() => {
      const translateSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (translateSelect) {
        clearInterval(checkWidget);
        translateSelect.value = langCode;
        translateSelect.dispatchEvent(new Event('change'));
        console.log(`✅ Widget translation triggered: ${langCode}`);
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkWidget);
      console.log('Widget timeout, falling back to redirect method');
      forceRedirectTranslation(langCode);
    }, 5000);
  };

  // Method 2: Force redirect to Google Translate
  const forceRedirectTranslation = (langCode: string) => {
    console.log(`🚀 Force redirect translation to: ${langCode}`);
    
    if (langCode === 'en') {
      // Reload original page
      if (window.location.href.includes('translate.google.com')) {
        // Extract original URL from Google Translate URL
        const urlMatch = window.location.href.match(/u=([^&]+)/);
        if (urlMatch) {
          const originalUrl = decodeURIComponent(urlMatch[1]);
          window.location.href = originalUrl;
        } else {
          window.location.reload();
        }
      }
      return;
    }

    // Get current URL
    let currentUrl = window.location.href;
    
    // If already on Google Translate, extract original URL
    if (currentUrl.includes('translate.google.com')) {
      const urlMatch = currentUrl.match(/u=([^&]+)/);
      if (urlMatch) {
        currentUrl = decodeURIComponent(urlMatch[1]);
      }
    }

    // Create Google Translate URL
    const translateUrl = `https://translate.google.com/translate?sl=en&tl=${langCode}&u=${encodeURIComponent(currentUrl)}`;
    
    // Force redirect
    window.location.href = translateUrl;
  };

  // Method 3: Force iframe translation (embedded)
  const forceIframeTranslation = (langCode: string) => {
    console.log(`🚀 Force iframe translation to: ${langCode}`);
    
    if (langCode === 'en') {
      // Remove translation iframe
      const iframe = document.getElementById('auto-translate-iframe');
      if (iframe) {
        iframe.remove();
      }
      document.body.classList.remove('auto-translated');
      return;
    }

    // Create invisible iframe for translation
    const existingIframe = document.getElementById('auto-translate-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'auto-translate-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.zIndex = '9999';
    iframe.style.backgroundColor = 'white';

    const currentUrl = window.location.href;
    iframe.src = `https://translate.google.com/translate?sl=en&tl=${langCode}&u=${encodeURIComponent(currentUrl)}`;

    document.body.appendChild(iframe);
    document.body.classList.add('auto-translated');

    console.log(`✅ Iframe translation loaded: ${langCode}`);
  };

  // Auto translate function
  const autoTranslate = async (langCode: string) => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    setCurrentLanguage(langCode);
    setIsOpen(false);

    try {
      // Try different methods based on preference
      switch (translationMethod) {
        case 'widget':
          forceWidgetTranslation(langCode);
          break;
        case 'redirect':
          forceRedirectTranslation(langCode);
          break;
        case 'iframe':
          forceIframeTranslation(langCode);
          break;
      }

      // Add language attributes to page
      document.documentElement.lang = langCode;
      if (['ar', 'he', 'fa', 'ur'].includes(langCode)) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }

      console.log(`✅ Auto translation completed: ${langCode}`);
    } catch (error) {
      console.error('Auto translation failed:', error);
    } finally {
      setTimeout(() => setIsTranslating(false), 2000);
    }
  };

  // Initialize widget on component mount
  useEffect(() => {
    if (translationMethod === 'widget') {
      initializeGoogleTranslateWidget();
    }
  }, [translationMethod]);

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return AUTO_TRANSLATE_LANGUAGES.find(lang => lang.code === currentLanguage) || AUTO_TRANSLATE_LANGUAGES[0];
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
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Auto Translate
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Automatic Google Translate
                </p>
              </div>
              
              <div className="p-3">
                {/* Translation Method Selector */}
                <div className="mb-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Translation Method:</label>
                  <select
                    value={translationMethod}
                    onChange={(e) => setTranslationMethod(e.target.value as any)}
                    className="w-full text-xs p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="redirect">Redirect (Recommended)</option>
                    <option value="iframe">Embedded Frame</option>
                    <option value="widget">Google Widget</option>
                  </select>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1">
                  {AUTO_TRANSLATE_LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => autoTranslate(language.code)}
                      disabled={isTranslating}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg text-sm flex items-center gap-3 ${
                        currentLanguage === language.code ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                      } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-base">{language.flag}</span>
                      <div className="flex-1">
                        <span className="font-medium">{language.native}</span>
                        <span className="text-xs opacity-75 ml-2">({language.name})</span>
                      </div>
                      {isTranslating && currentLanguage === language.code ? (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                      ) : currentLanguage === language.code ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isTranslating}
          className={`bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${
            isTranslating ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isTranslating ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Globe className="w-6 h-6" />
          )}
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
        disabled={isTranslating}
        className={`px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 border border-blue-200 dark:border-blue-700 ${
          isTranslating ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        title="Auto translate this page"
      >
        {isTranslating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">Auto Translate</span>
        {currentLanguage !== 'en' && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
            {getCurrentLanguageInfo().flag}
          </span>
        )}
        <ExternalLink className="w-3 h-3 opacity-60" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4" />
                Auto Translate Page
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Automatic Google Translate - No manual selection needed
              </p>
            </div>
            
            <div className="p-3">
              {/* Translation Method Selector */}
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block font-medium">Translation Method:</label>
                <select
                  value={translationMethod}
                  onChange={(e) => setTranslationMethod(e.target.value as any)}
                  className="w-full text-xs p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="redirect">🔄 Redirect (Works on localhost)</option>
                  <option value="iframe">📱 Embedded Frame</option>
                  <option value="widget">🔧 Google Widget</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {translationMethod === 'redirect' && 'Redirects to Google Translate (Recommended)'}
                  {translationMethod === 'iframe' && 'Embeds translation in current page'}
                  {translationMethod === 'widget' && 'Uses Google Translate widget'}
                </p>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-1">Select language for automatic translation:</div>
              
              <div className="max-h-48 overflow-y-auto space-y-1">
                {AUTO_TRANSLATE_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => autoTranslate(language.code)}
                    disabled={isTranslating}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg text-sm flex items-center gap-3 ${
                      currentLanguage === language.code ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                    } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-base">{language.flag}</span>
                    <div className="flex-1">
                      <span className="font-medium">{language.native}</span>
                      <span className="text-xs opacity-75 ml-2">({language.name})</span>
                    </div>
                    {isTranslating && currentLanguage === language.code ? (
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    ) : currentLanguage === language.code ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutoTranslate;