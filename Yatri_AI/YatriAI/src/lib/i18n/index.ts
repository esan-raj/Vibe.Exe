/**
 * i18next Configuration - FIXED VERSION
 * 
 * Key fixes:
 * - Uses "translation" as default namespace (i18next standard)
 * - Proper resource structure: { lang: { translation: {...} } }
 * - Added debug logging for troubleshooting
 * - Proper language detection from localStorage
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import type { LanguageCode } from './types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, STORAGE_KEYS, isRTL } from './languages';
import { getCachedTranslations, translateAllKeys } from './translationService';

// Import base English translations (other languages loaded via API)
import enTranslations from '../../locales/en/common.json';

// Debug: Log the translations to verify they loaded
console.log('📚 English translations loaded:', Object.keys(enTranslations));
console.log('🌐 Other languages will be translated via LibreTranslate API');

// Get saved language from localStorage or default to English
const getSavedLang = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_LANGUAGE);
    if (saved && saved in SUPPORTED_LANGUAGES) {
      console.log('🌐 Saved language found:', saved);
      return saved;
    }
  } catch (e) {
    console.warn('Could not read saved language:', e);
  }
  return DEFAULT_LANGUAGE;
};

// Initialize i18next with CORRECT namespace structure
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // CRITICAL FIX: Use "translation" namespace (i18next default)
    // Only English is bundled, other languages loaded via API
    resources: {
      en: {
        translation: enTranslations,
      },
    },
    
    // Use "translation" as default namespace
    defaultNS: 'translation',
    ns: ['translation'],
    
    // Start with saved language or English
    lng: getSavedLang(),
    
    // Fallback to English if translation key missing
    fallbackLng: DEFAULT_LANGUAGE,
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEYS.CURRENT_LANGUAGE,
      caches: ['localStorage'],
    },
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    // React options - disable suspense for immediate rendering
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded', // Re-render on these events
      bindI18nStore: 'added removed', // Re-render when resources change
    },
    
    // Enable debug in development
    debug: import.meta.env.DEV,
    
    // Return key if translation not found (helps debugging)
    returnEmptyString: false,
    returnNull: false,
  });

// Log initialization status
console.log('✅ i18n initialized with language:', i18n.language);
console.log('📦 Available namespaces:', i18n.options.ns);

/**
 * Load translations for a language
 * - Checks cache first
 * - Translates via API if needed
 * - Injects bundle and switches language
 */
export const loadLanguage = async (
  lang: LanguageCode,
  onProgress?: (progress: number) => void
): Promise<void> => {
  console.log(`🔄 loadLanguage called for: ${lang}`);
  
  // English is always available
  if (lang === DEFAULT_LANGUAGE) {
    console.log('🇺🇸 Switching to English (always available)');
    await i18n.changeLanguage(lang);
    updateDocumentDirection(lang);
    saveLanguagePreference(lang);
    onProgress?.(100);
    return;
  }
  
  // Check if already loaded in i18next
  const hasBundle = i18n.hasResourceBundle(lang, 'translation');
  console.log(`📦 Has bundle for ${lang}:`, hasBundle);
  
  if (hasBundle) {
    console.log(`✅ Bundle exists, switching to ${lang}`);
    await i18n.changeLanguage(lang);
    updateDocumentDirection(lang);
    saveLanguagePreference(lang);
    onProgress?.(100);
    return;
  }
  
  // Check localStorage cache
  const cached = getCachedTranslations(lang);
  if (cached) {
    console.log(`📦 Found cached translations for ${lang}, injecting...`);
    // CRITICAL: Use true, true to deep merge and overwrite
    i18n.addResourceBundle(lang, 'translation', cached, true, true);
    await i18n.changeLanguage(lang);
    updateDocumentDirection(lang);
    saveLanguagePreference(lang);
    onProgress?.(100);
    console.log(`✅ Loaded ${lang} from cache`);
    return;
  }
  
  // Translate from English via API
  console.log(`🌐 No cache found, translating to ${lang} via API...`);
  
  try {
    const translated = await translateAllKeys(enTranslations, lang, onProgress);
    
    console.log(`📥 Translation complete, injecting bundle for ${lang}...`);
    console.log('Sample keys:', Object.keys(translated).slice(0, 5));
    
    // Inject the translated bundle
    i18n.addResourceBundle(lang, 'translation', translated, true, true);
    
    // Verify injection
    const bundleCheck = i18n.hasResourceBundle(lang, 'translation');
    console.log(`📦 Bundle injected for ${lang}:`, bundleCheck);
    
    // Switch language
    await i18n.changeLanguage(lang);
    updateDocumentDirection(lang);
    saveLanguagePreference(lang);
    
    console.log(`✅ Successfully switched to ${lang}`);
  } catch (error) {
    console.error(`❌ Failed to load language ${lang}:`, error);
    // Fallback to English
    await i18n.changeLanguage(DEFAULT_LANGUAGE);
    throw error;
  }
};

/**
 * Update document direction for RTL languages
 */
export const updateDocumentDirection = (lang: LanguageCode): void => {
  const isRtl = isRTL(lang);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  
  if (isRtl) {
    document.documentElement.classList.add('rtl');
  } else {
    document.documentElement.classList.remove('rtl');
  }
  
  console.log(`📐 Document direction set to: ${isRtl ? 'RTL' : 'LTR'}`);
};

/**
 * Save language preference to localStorage
 */
export const saveLanguagePreference = (lang: LanguageCode): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_LANGUAGE, lang);
  console.log(`💾 Language preference saved: ${lang}`);
};

/**
 * Get saved language preference
 */
export const getSavedLanguage = (): LanguageCode => {
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_LANGUAGE);
  if (saved && saved in SUPPORTED_LANGUAGES) {
    return saved as LanguageCode;
  }
  return DEFAULT_LANGUAGE;
};

/**
 * Get current language from i18next
 */
export const getCurrentLanguage = (): LanguageCode => {
  return (i18n.language as LanguageCode) || DEFAULT_LANGUAGE;
};

/**
 * Check if current language is RTL
 */
export const isCurrentRTL = (): boolean => {
  return isRTL(getCurrentLanguage());
};

// Export everything
export { i18n as default, SUPPORTED_LANGUAGES, isRTL, DEFAULT_LANGUAGE };
export type { LanguageCode, LanguageConfig } from './types';
export * from './languages';
export * from './translationService';
