import React, { useState } from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Native Browser Translation Component
 * Uses browser's built-in translation features and provides fallback options
 */
const NativeTranslate: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Languages with Google Translate URLs
  const languages = [
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
  ];

  // Function to trigger browser translation
  const translatePage = (langCode: string) => {
    const currentUrl = window.location.href;
    
    // Method 1: Try to trigger browser's built-in translation
    if ('chrome' in window) {
      // Chrome-specific translation trigger
      try {
        // This will prompt Chrome to translate the page
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Language';
        meta.content = langCode;
        document.head.appendChild(meta);
        
        // Remove after a moment
        setTimeout(() => {
          document.head.removeChild(meta);
        }, 1000);
      } catch (error) {
        console.log('Chrome translation not available');
      }
    }
    
    // Method 2: Use Google Translate URL (opens in same tab)
    const translateUrl = `https://translate.google.com/translate?sl=en&tl=${langCode}&u=${encodeURIComponent(currentUrl)}`;
    
    // Ask user if they want to use Google Translate
    const useGoogleTranslate = window.confirm(
      `Would you like to translate this page to ${languages.find(l => l.code === langCode)?.native}?\n\nThis will use Google Translate in your browser.`
    );
    
    if (useGoogleTranslate) {
      window.location.href = translateUrl;
    }
    
    setIsOpen(false);
  };

  // Function to show browser translation instructions
  const showTranslationInstructions = () => {
    const instructions = `
To translate this page:

Chrome/Edge:
• Right-click on the page
• Select "Translate to [your language]"
• Or press Ctrl+Shift+T

Firefox:
• Install "To Google Translate" extension
• Or use the translation icon in address bar

Safari:
• Right-click and select "Translate to [language]"
• Or use Safari's built-in translation

Mobile:
• Most mobile browsers have built-in translation
• Look for the translate icon in the address bar
    `;
    
    alert(instructions);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-1"
        title="Translate Page"
      >
        <Globe className="w-5 h-5" />
        <span className="text-xs font-medium">Translate</span>
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
                Choose your preferred translation method
              </p>
            </div>
            
            <div className="p-3">
              <button
                onClick={showTranslationInstructions}
                className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors mb-2 border border-gray-200 dark:border-gray-600"
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

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-1">Or translate via Google Translate:</div>
              
              <div className="max-h-48 overflow-y-auto space-y-1">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => translatePage(language.code)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg text-sm flex items-center gap-3"
                  >
                    <span className="text-base">{language.flag}</span>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">{language.native}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({language.name})</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
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

export default NativeTranslate;