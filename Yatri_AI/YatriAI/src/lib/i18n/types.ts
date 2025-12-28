/**
 * i18n Type Definitions
 * 
 * Type-safe internationalization types for the Kolkata Heritage platform.
 */

// Supported language codes
export type LanguageCode = 'en' | 'hi' | 'bn' | 'fr' | 'es' | 'ar' | 'de' | 'ja' | 'zh' | 'ko';

// Language configuration interface
export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  libreTranslateCode: string; // LibreTranslate API language code
}

// Translation cache entry
export interface TranslationCache {
  translations: Record<string, unknown>;
  timestamp: number;
  version: string;
}

// Translation request/response types
export interface TranslateRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslateResponse {
  translatedText: string;
  detectedLanguage?: string;
}

export interface BatchTranslateRequest {
  texts: string[];
  sourceLang: string;
  targetLang: string;
}

export interface BatchTranslateResponse {
  translations: string[];
}

// i18next resource type
export interface I18nResources {
  [language: string]: {
    common: Record<string, unknown>;
  };
}

// Language context type
export interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  isLoading: boolean;
  isTranslating: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
  availableLanguages: LanguageConfig[];
  isRTL: boolean;
}




















