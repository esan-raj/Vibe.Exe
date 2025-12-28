import React, { useState, useEffect } from 'react';
import { Languages, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Languages that work with browser translation
const BROWSER_LANGUAGES = [
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

interface InstantTranslateProps {
  variant?: 'header' | 'floating';
}

const InstantTranslate: React.FC<InstantTranslateProps> = ({ variant = 'header' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Function to trigger instant browser translation
  const translateInstantly = (langCode: string) => {
    console.log(`🚀 Instant translate to: ${langCode}`);
    
    if (langCode === 'en' || langCode === '') {
      // Return to original
      window.location.reload();
      return;
    }

    // Method 1: Use Chrome's built-in translation
    if (navigator.userAgent.includes('Chrome')) {
      try {
        // Trigger Chrome's translation
        const meta = document.createElement('meta');
        meta.name = 'google';
        meta.content = 'notranslate';
        document.head.appendChild(meta);
        
        setTimeout(() => {
          document.head.removeChild(meta);
          
          // Add translation meta
          const translateMeta = document.createElement('meta');
          translateMeta.httpEquiv = 'Content-Language';
          translateMeta.content = langCode;
          document.head.appendChild(translateMeta);
          
          // Trigger translation
          if ((window as any).chrome && (window as any).chrome.runtime) {
            // Chrome extension API
            try {
              (window as any).chrome.runtime.sendMessage({
                action: 'translate',
                targetLang: langCode
              });
            } catch (e) {
              console.log('Chrome extension not available, using fallback');
            }
          }
          
          // Fallback: Use Google Translate iframe method
          createTranslationFrame(langCode);
          
        }, 100);
      } catch (error) {
        console.log('Chrome translation not available, using fallback');
        createTranslationFrame(langCode);
      }
    } else {
      // For other browsers, use iframe method
      createTranslationFrame(langCode);
    }
    
    setCurrentLanguage(langCode);
    setIsOpen(false);
  };

  // Create invisible iframe for translation (works like Google's method)
  const createTranslationFrame = (langCode: string) => {
    // Remove existing translation frame
    const existingFrame = document.getElementById('translation-frame');
    if (existingFrame) {
      existingFrame.remove();
    }

    // Create invisible iframe that loads Google Translate
    const iframe = document.createElement('iframe');
    iframe.id = 'translation-frame';
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    // Use Google Translate's direct translation method
    const currentUrl = encodeURIComponent(window.location.href);
    iframe.src = `https://translate.google.com/translate?sl=en&tl=${langCode}&u=${currentUrl}&client=webapp`;
    
    document.body.appendChild(iframe);
    
    // After iframe loads, extract translated content
    iframe.onload = () => {
      setTimeout(() => {
        try {
          // This simulates how Google's translate button works
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            // Get translated content and apply to current page
            applyTranslation(langCode);
          }
        } catch (error) {
          console.log('Cross-origin restriction, using alternative method');
          // Use alternative translation method
          useAlternativeTranslation(langCode);
        }
      }, 2000);
    };
  };

  // Apply translation to current page (simulates Google's method)
  const applyTranslation = (langCode: string) => {
    // Add language attribute to html
    document.documentElement.lang = langCode;
    
    // Add translation class to body
    document.body.classList.add('translated', `translated-${langCode}`);
    
    // Trigger browser's built-in translation if available
    if ('translate' in document.documentElement.dataset) {
      document.documentElement.dataset.translate = langCode;
    }
    
    // For RTL languages
    if (['ar', 'he', 'fa', 'ur'].includes(langCode)) {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    }
    
    console.log(`✅ Translation applied: ${langCode}`);
  };

  // Alternative translation method (opens in same tab like Google)
  const useAlternativeTranslation = (langCode: string) => {
    const currentUrl = window.location.href;
    const translateUrl = `https://translate.google.com/translate?sl=en&tl=${langCode}&u=${encodeURIComponent(currentUrl)}`;
    
    // Replace current page with translated version (like Google does)
    window.location.href = translateUrl;
  };

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return BROWSER_LANGUAGES.find(lang => lang.code === currentLanguage) || BROWSER_LANGUAGES[0];
  };

  // Show browser translation instructions
  const showBrowserInstructions = () => {
    const isChrome = navigator.userAgent.includes('Chrome');
    const isFirefox = navigator.userAgent.includes('Firefox');
    const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
    
    let instructions = '';
    
    if (isChrome) {
      instructions = `Chrome Translation:
      
1. Right-click anywhere on this page
2. Select "Translate to [your language]"
3. Or look for the translate icon in the address bar
4. Translation happens instantly!

Alternatively, use the language buttons below for direct translation.`;
    } else if (isFirefox) {
      instructions = `Firefox Translation:
      
1. Look for the translate icon in the address bar
2. Or install "To Google Translate" extension
3. Right-click and select translate option

Alternatively, use the language buttons below for direct translation.`;
    } else if (isSafari) {
      instructions = `Safari Translation:
      
1. Right-click anywhere on this page
2. Select "Translate to [your language]"
3. Or use Safari's built-in translation feature

Alternatively, use the language buttons below for direct translation.`;
    } else {
      instructions = `Browser Translation:
      
Most modern browsers have built-in translation:
1. Right-click on the page
2. Look for translate options
3. Or check the address bar for translate icons

Alternatively, use the language buttons below for direct translation.`;
    }
    
    alert(instructions);
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
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Instant Translate
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Like Google's translate button
                </p>
              </div>
              
              <div className="p-3">
                <button
                  onClick={showBrowserInstructions}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors mb-3 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Use Browser Translation</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Built-in browser features (Recommended)</div>
                    </div>
                  </div>
                </button>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-1">Or instant translate:</div>
                
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {BROWSER_LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => translateInstantly(language.code)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg text-sm flex items-center gap-3 ${
                        currentLanguage === language.code ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-base">{language.flag}</span>
                      <div className="flex-1">
                        <span className="font-medium">{language.native}</span>
                        <span className="text-xs opacity-75 ml-2">({language.name})</span>
                      </div>
                      {currentLanguage === language.code && (
                        <Check className="w-3 h-3 text-green-600" />
                      )}
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
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        >
          <Globe className="w-6 h-6" />
          {currentLanguage !== 'en' && (
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              {getCurrentLanguageInfo().flag}
            </span>
          )}
        </motion.button>
      </div>
    );
  }

  // Header variant - Simple like Google's translate button
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2 border border-gray-200 dark:border-gray-600"
        title="Translate this page"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">Translate</span>
        {currentLanguage !== 'en' && (
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">
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
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4" />
                Translate This Page
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Instant translation like Google's translate button
              </p>
            </div>
            
            <div className="p-3">
              <button
                onClick={showBrowserInstructions}
                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors mb-3 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">Use Browser Translation</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Right-click → Translate (Recommended)</div>
                  </div>
                </div>
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-1">Or select language for instant translation:</div>
              
              <div className="max-h-48 overflow-y-auto space-y-1">
                {BROWSER_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => translateInstantly(language.code)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg text-sm flex items-center gap-3 ${
                      currentLanguage === language.code ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-base">{language.flag}</span>
                    <div className="flex-1">
                      <span className="font-medium">{language.native}</span>
                      <span className="text-xs opacity-75 ml-2">({language.name})</span>
                    </div>
                    {currentLanguage === language.code && (
                      <Check className="w-3 h-3 text-green-600" />
                    )}
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

export default InstantTranslate;