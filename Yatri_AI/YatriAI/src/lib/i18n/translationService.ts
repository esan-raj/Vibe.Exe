/**
 * Translation Service - FIXED VERSION
 * 
 * Key fixes:
 * - Better error handling for LibreTranslate API
 * - CORS handling with fallback
 * - Mock translation mode for development/testing
 * - Detailed logging for debugging
 * - Rate limit handling
 */

import type { LanguageCode, TranslationCache } from './types';
import { getLibreTranslateCode, STORAGE_KEYS, DEFAULT_LANGUAGE } from './languages';

// Configuration - Use backend proxy by default to avoid CORS issues
const BACKEND_TRANSLATE_API = import.meta.env.VITE_BACKEND_TRANSLATE_URL || 'http://localhost:3001/translate';
const LIBRE_TRANSLATE_API = import.meta.env.VITE_LIBRE_TRANSLATE_URL || 'https://libretranslate.de/translate';
const USE_MOCK_TRANSLATIONS = import.meta.env.VITE_USE_MOCK_TRANSLATIONS === 'true';
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Always prefer backend proxy (handles CORS properly)
const PREFER_BACKEND = true;

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // ms between requests

/**
 * Get cache key for a language
 * Format: yatri_i18n_cache_v2_hi (matches the actual localStorage key format)
 */
const getCacheKey = (lang: LanguageCode): string => {
  return `${STORAGE_KEYS.TRANSLATION_CACHE_PREFIX}${STORAGE_KEYS.CACHE_VERSION}_${lang}`;
};

/**
 * Check if cached translations are valid
 */
const isCacheValid = (cache: TranslationCache | null): boolean => {
  if (!cache) return false;
  const now = Date.now();
  return now - cache.timestamp < CACHE_EXPIRY_MS;
};

/**
 * Get cached translations from localStorage
 */
export const getCachedTranslations = (lang: LanguageCode): Record<string, unknown> | null => {
  try {
    const cacheKey = getCacheKey(lang);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      console.log(`📦 No cache found for ${lang}`);
      return null;
    }
    
    const cacheData: TranslationCache = JSON.parse(cached);
    
    if (isCacheValid(cacheData)) {
      console.log(`✅ Valid cache found for ${lang}`);
      return cacheData.translations;
    }
    
    // Cache expired
    console.log(`⏰ Cache expired for ${lang}, removing...`);
    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error('Error reading translation cache:', error);
    return null;
  }
};

/**
 * Save translations to localStorage cache
 */
export const cacheTranslations = (
  lang: LanguageCode,
  translations: Record<string, unknown>
): void => {
  try {
    const cacheKey = getCacheKey(lang);
    const cacheData: TranslationCache = {
      translations,
      timestamp: Date.now(),
      version: STORAGE_KEYS.CACHE_VERSION,
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`💾 Translations cached for ${lang}`);
  } catch (error) {
    console.error('Error caching translations:', error);
  }
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = (lang?: LanguageCode): void => {
  try {
    if (lang) {
      localStorage.removeItem(getCacheKey(lang));
      console.log(`🗑️ Cache cleared for ${lang}`);
    } else {
      Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_KEYS.TRANSLATION_CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
      console.log('🗑️ All translation caches cleared');
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Mock translation for testing (adds language prefix)
 */
const mockTranslate = (text: string, targetLang: LanguageCode): string => {
  // Add language code prefix for visual confirmation
  const langPrefix: Record<string, string> = {
    hi: 'हिंदी: ',
    bn: 'বাংলা: ',
    fr: 'FR: ',
    es: 'ES: ',
    ar: 'عربي: ',
    de: 'DE: ',
    ja: '日本語: ',
    zh: '中文: ',
    ko: '한국어: ',
  };
  
  return (langPrefix[targetLang] || `[${targetLang}] `) + text;
};

/**
 * Wait for rate limiting
 */
const waitForRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => 
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
};

/**
 * Translate a single text using backend proxy or LibreTranslate API
 * The backend proxy handles CORS properly
 */
export const translateText = async (
  text: string,
  targetLang: LanguageCode,
  sourceLang: LanguageCode = DEFAULT_LANGUAGE
): Promise<string> => {
  // Skip empty strings
  if (!text || text.trim() === '') {
    return text;
  }
  
  // Use mock translations if enabled
  if (USE_MOCK_TRANSLATIONS) {
    return mockTranslate(text, targetLang);
  }
  
  try {
    await waitForRateLimit();
    
    // Use backend proxy (handles CORS) or direct LibreTranslate
    const useBackend = PREFER_BACKEND && BACKEND_TRANSLATE_API;
    const apiUrl = useBackend ? BACKEND_TRANSLATE_API : LIBRE_TRANSLATE_API;
    
    console.log(`🌐 Translating via ${useBackend ? 'backend' : 'direct'}: "${text.substring(0, 30)}..." to ${targetLang}`);
    
    // Backend expects: { text, sourceLang, targetLang }
    // LibreTranslate expects: { q, source, target, format }
    const requestBody = useBackend
      ? {
          text: text,
          sourceLang: getLibreTranslateCode(sourceLang),
          targetLang: getLibreTranslateCode(targetLang),
        }
      : {
          q: text,
          source: getLibreTranslateCode(sourceLang),
          target: getLibreTranslateCode(targetLang),
          format: 'text',
        };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        console.warn('⚠️ Rate limited, waiting and retrying...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return translateText(text, targetLang, sourceLang);
      }
      
      console.error(`❌ Translation API error: ${response.status}`);
      // If backend fails, try direct LibreTranslate (will likely fail due to CORS)
      if (useBackend) {
        console.log('🔄 Backend failed, attempting direct API...');
        return translateTextDirect(text, targetLang, sourceLang);
      }
      return text; // Return original on error
    }

    const data = await response.json();
    const translated = data.translatedText || text;
    
    console.log(`✅ Translated: "${translated.substring(0, 30)}..."`);
    return translated;
    
  } catch (error) {
    console.error('❌ Translation error:', error);
    
    // If backend failed, try mock as last resort
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('⚠️ Backend unreachable, ensure server is running on port 3001');
      console.warn('⚠️ Run: cd server && npm run dev');
      return text; // Return original text instead of mock
    }
    
    return text; // Return original text on any error
  }
};

/**
 * Direct translation (bypasses backend) - will fail due to CORS in browser
 */
const translateTextDirect = async (
  text: string,
  targetLang: LanguageCode,
  sourceLang: LanguageCode = DEFAULT_LANGUAGE
): Promise<string> => {
  try {
    const response = await fetch(LIBRE_TRANSLATE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: getLibreTranslateCode(sourceLang),
        target: getLibreTranslateCode(targetLang),
        format: 'text',
      }),
    });
    
    if (!response.ok) return text;
    
    const data = await response.json();
    return data.translatedText || text;
  } catch {
    return text;
  }
};

/**
 * Flatten nested object to dot-notation keys
 */
const flattenObject = (
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> => {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  }
  
  return result;
};

/**
 * Unflatten dot-notation keys back to nested object
 */
const unflattenObject = (obj: Record<string, string>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split('.');
    let current: Record<string, unknown> = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k] as Record<string, unknown>;
    }
    
    current[keys[keys.length - 1]] = value;
  }
  
  return result;
};

/**
 * Translate all keys in a translation object using batch endpoint
 * Uses backend /translate/batch endpoint to translate all texts in one request
 */
export const translateAllKeys = async (
  translations: Record<string, unknown>,
  targetLang: LanguageCode,
  onProgress?: (progress: number) => void
): Promise<Record<string, unknown>> => {
  console.log(`🚀 translateAllKeys started for ${targetLang}`);
  
  // Check cache first
  const cached = getCachedTranslations(targetLang);
  if (cached) {
    console.log(`📦 Returning cached translations for ${targetLang}`);
    onProgress?.(100);
    return cached;
  }

  // English doesn't need translation
  if (targetLang === DEFAULT_LANGUAGE) {
    console.log('🇺🇸 English requested, returning original');
    onProgress?.(100);
    return translations;
  }

  console.log(`🌐 Starting translation to ${targetLang}...`);

  // Flatten the translations object
  const flattened = flattenObject(translations);
  const keys = Object.keys(flattened);
  const values = Object.values(flattened);
  
  console.log(`📊 Total keys to translate: ${keys.length}`);
  
  // Use batch endpoint for all translations
  // Split into larger batches (50) to reduce API calls while still showing progress
  const batchSize = 50;
  const totalBatches = Math.ceil(values.length / batchSize);
  const translated: Record<string, string> = {};
  
  for (let i = 0; i < values.length; i += batchSize) {
    const batch = values.slice(i, i + batchSize);
    const batchKeys = keys.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} texts)`);
    
    try {
      // Use batch endpoint
      const batchApiUrl = BACKEND_TRANSLATE_API.replace('/translate', '/translate/batch');
      
      const response = await fetch(batchApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: batch,
          sourceLang: getLibreTranslateCode(DEFAULT_LANGUAGE),
          targetLang: getLibreTranslateCode(targetLang),
        }),
      });
      
      if (!response.ok) {
        console.error(`❌ Batch translation failed: ${response.status}`);
        // Fallback: use original texts
        batchKeys.forEach((key, index) => {
          translated[key] = batch[index];
        });
      } else {
        const data = await response.json();
        const results = data.translations || [];
        
        // Map translated values to keys
        batchKeys.forEach((key, index) => {
          translated[key] = results[index]?.translatedText || batch[index];
        });
      }
    } catch (error) {
      console.error('❌ Batch translation error:', error);
      // Fallback: use original texts
      batchKeys.forEach((key, index) => {
        translated[key] = batch[index];
      });
    }
    
    // Update progress
    const progress = Math.round((batchNum / totalBatches) * 100);
    onProgress?.(progress);
    
    // Small delay between batches
    if (i + batchSize < values.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Unflatten back to nested object
  const result = unflattenObject(translated);
  
  // Cache the result
  cacheTranslations(targetLang, result);
  
  console.log(`✅ Translation complete for ${targetLang}`);
  console.log('Sample translated keys:', Object.keys(result).slice(0, 3));
  
  return result;
};

/**
 * Check if translations are available
 */
export const hasTranslations = (lang: LanguageCode): boolean => {
  if (lang === DEFAULT_LANGUAGE) return true;
  return getCachedTranslations(lang) !== null;
};

/**
 * Get translation statistics
 */
export const getTranslationStats = (): {
  cachedLanguages: LanguageCode[];
  cacheSize: number;
} => {
  const cachedLanguages: LanguageCode[] = [];
  let cacheSize = 0;
  
  Object.keys(localStorage)
    .filter(key => key.startsWith(STORAGE_KEYS.TRANSLATION_CACHE_PREFIX))
    .forEach(key => {
      const langMatch = key.match(new RegExp(`${STORAGE_KEYS.TRANSLATION_CACHE_PREFIX}(\\w+)_`));
      if (langMatch) {
        cachedLanguages.push(langMatch[1] as LanguageCode);
        cacheSize += localStorage.getItem(key)?.length || 0;
      }
    });
  
  return { cachedLanguages, cacheSize };
};
