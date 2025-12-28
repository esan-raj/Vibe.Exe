/**
 * Supported Languages Configuration
 * 
 * Defines all supported languages with their metadata.
 * LibreTranslate codes: https://libretranslate.com/languages
 */

import type { LanguageCode, LanguageConfig } from './types';

// Supported languages configuration
export const SUPPORTED_LANGUAGES: Record<LanguageCode, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    libreTranslateCode: 'en',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    rtl: false,
    libreTranslateCode: 'hi',
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    rtl: false,
    libreTranslateCode: 'bn',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    libreTranslateCode: 'fr',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    libreTranslateCode: 'es',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    libreTranslateCode: 'ar',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    libreTranslateCode: 'de',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    libreTranslateCode: 'ja',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    libreTranslateCode: 'zh',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    rtl: false,
    libreTranslateCode: 'ko',
  },
};

// Get all supported languages as array
export const getLanguageList = (): LanguageConfig[] => {
  return Object.values(SUPPORTED_LANGUAGES);
};

// Get language by code
export const getLanguage = (code: LanguageCode): LanguageConfig => {
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES.en;
};

// Check if language is RTL
export const isRTL = (code: LanguageCode): boolean => {
  return SUPPORTED_LANGUAGES[code]?.rtl || false;
};

// Get LibreTranslate code
export const getLibreTranslateCode = (code: LanguageCode): string => {
  return SUPPORTED_LANGUAGES[code]?.libreTranslateCode || 'en';
};

// RTL language codes for quick reference
export const RTL_LANGUAGES: LanguageCode[] = ['ar'];

// Default language
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

// Storage keys
export const STORAGE_KEYS = {
  CURRENT_LANGUAGE: 'yatri_language',
  TRANSLATION_CACHE_PREFIX: 'yatri_i18n_cache_',
  CACHE_VERSION: 'v2',
} as const;

