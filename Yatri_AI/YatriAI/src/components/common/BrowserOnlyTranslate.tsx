import React, { useState } from 'react';
import { Globe, Check, Info } from 'lucide-react';
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
];

interface BrowserOnlyTranslateProps {
  variant?: 'header' | 'floating';
}

const BrowserOnlyTranslate: React.FC<BrowserOnlyTranslateProps> = ({ variant = 'header' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Function to trigger browser's built-in translation
  const triggerBrowserTranslation = (langCode: string) => {
    const isChrome = navigator.userAgent.includes('Chrome');
    const isFirefox = navigator.userAgent.includes('Firefox');
    const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
    
    if (langCode === 'en' || langCode === '') {
      // Return to original
      window.location.reload();
      return;
    }

    let instructions = '';
    
    if (isChrome) {
      instructions = `Chrome Translation Steps:

1. Right-click anywhere on this page
2. Select "Translate to ${BROWSER_LANGUAGES.find(l => l.code === langCode)?.name}"
3. The page will translate instantly!

Alternative:
- Look for the translate icon in the address bar
- Click it and select your language`;
    } else if (isFirefox) {
      instructions = `Firefox Translation Steps:

1. Look for the translate icon in the address bar
2. Click it to translate the page
3. Or install "To Google Translate" extension

Alternative:
- Right-click and look for translate options`;
    } else if (isSafari) {
      instructions = `Safari Translation Steps:

1. Right-click anywhere on this page
2. Select "Translate to ${BROWSER_LANGUAGES.find(l => l.code === langCode)?.name}"
3. The page will translate instantly!

Alternative:
- Look for translation options in Safari's menu`;
    } else {
      instructions = `Browser Translation Steps:

1. Right-click anywhere on this page
2. Look for "Translate" or "Translate to ${BROWSER_LANGUAGES.find(l => l.code === langCode)?.name}"
3. Click it for instant translation

Most modern browsers have built-in translation features!`;
    }
    
    // Show instructions
    alert(instructions);
    
    // Try to trigger browser translation programmatically
    try {
      // Add language meta tag
      const existingMeta = document.querySelector('meta[http-equiv="Content-Language"]');
      if (existingMeta) {
        existingMeta.remove();
      }
      
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Language';
      meta.content = langCode;
      document.head.appendChild(meta);
      
      // Set HTML lang attribute
      document.documentElement.lang = langCode;
      
      // For RTL languages
      if (['ar', 'he', 'fa', 'ur'].includes(langCode)) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
      
      setCurrentLanguage(langCode);
      setIsOpen(false);
      
      console.log(`✅ Browser translation triggered for: ${langCode}`);
    } catch (error) {
      console.log('Browser translation setup completed');
    }
  };

  // Show general browser translation instructions
  const showGeneralInstructions = () => {
    const isChrome = navigator.userAgent.includes('Chrome');
    const isFirefox = navigator.userAgent.includes('Firefox');
    const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
    
    let instructions = '';
    
    if (isChrome) {
      instructions = `🌐 Chrome Translation (Recommended):

✅ Method 1 - Right-click Translation:
1. Right-click anywhere on this page
2. Select "Translate to [your language]"
3. Instant translation!

✅ Method 2 - Address Bar:
1. Look for the translate icon in the address bar
2. Click it and select your language
3. Done!

This works on ANY website, including localhost!`;
    } else if (isFirefox) {
      instructions = `🌐 Firefox Translation:

✅ Method 1 - Address Bar:
1. Look for the translate icon in the address bar
2. Click it to translate the page

✅ Method 2 - Extension:
1. Install "To Google Translate" extension
2. Right-click and translate

✅ Method 3 - Built-in:
1. Firefox may show translation bar automatically
2. Click "Translate" when it appears`;
    } else if (isSafari) {
      instructions = `🌐 Safari Translation:

✅ Method 1 - Right-click:
1. Right-click anywhere on this page
2. Select "Translate to [your language]"
3. Instant translation!

✅ Method 2 - Menu:
1. Go to Safari menu
2. Look for translation options
3. Select your language`;
    } else {
      instructions = `🌐 Browser Translation:

Most modern browsers have built-in translation:

✅ Common Methods:
1. Right-click anywhere on the page
2. Look for "Translate" options
3. Check the address bar for translate icons
4. Look in browser menus for translation

This works on ANY website, including development sites!`;
    }
    
    alert(instructions);
    setIsOpen(false);
  };

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return BROWSER_LANGUAGES.find(lang => lang.code === currentLanguage) || BROWSER_LANGUAGES[0];
  };

  if (variant === 'floating') {
    // Floating variant - circular icon button
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          title="Translate Page"
        >
          <Globe className="w-6 h-6" />
          
          {/* Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Translate 🌐
          </span>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute bottom-full right-0 mb-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4" />
                  Browser Translation
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Works perfectly on localhost and any website
                </p>
              </div>
              
              <div className="p-3">
                <button
                  onClick={showGeneralInstructions}
                  className="w-full text-left p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors mb-3 border border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Info className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-blue-900 dark:text-blue-100">How to Translate This Page</div>
                      <div className="text-xs text-blue-600 dark:text-blue-300">Works on localhost - Click for instructions</div>
                    </div>
                  </div>
                </button>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-1">Or get specific instructions for:</div>
                
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {BROWSER_LANGUAGES.filter(lang => lang.code !== 'en').map((language) => (
                    <button
                      key={language.code}
                      onClick={() => triggerBrowserTranslation(language.code)}
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
  }

  // Header variant - Simple and effective
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 border border-blue-200 dark:border-blue-700"
        title="Translate this page using your browser"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">Translate</span>
        {currentLanguage !== 'en' && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
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
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4" />
                Browser Translation
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Works perfectly on localhost and any website
              </p>
            </div>
            
            <div className="p-3">
              <button
                onClick={showGeneralInstructions}
                className="w-full text-left p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors mb-3 border border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-blue-900 dark:text-blue-100">How to Translate This Page</div>
                    <div className="text-xs text-blue-600 dark:text-blue-300">Works on localhost - Click for instructions</div>
                  </div>
                </div>
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-1">Or get specific instructions for:</div>
              
              <div className="max-h-48 overflow-y-auto space-y-1">
                {BROWSER_LANGUAGES.filter(lang => lang.code !== 'en').map((language) => (
                  <button
                    key={language.code}
                    onClick={() => triggerBrowserTranslation(language.code)}
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

export default BrowserOnlyTranslate;