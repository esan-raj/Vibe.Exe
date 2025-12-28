/**
 * Language Selector Component - FIXED VERSION
 * 
 * Key fixes:
 * - Uses useTranslation hook directly for reliable updates
 * - Properly awaits language loading
 * - Shows translation progress
 * - Handles errors gracefully
 */

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Search, Check, ChevronDown, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../contexts/LanguageContext';
import type { LanguageCode, LanguageConfig } from '../../lib/i18n/types';
import { hasTranslations } from '../../lib/i18n/translationService';

interface LanguageSelectorProps {
  variant?: 'header' | 'footer' | 'settings';
  showLabel?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  showLabel = false,
  className = '',
}) => {
  // Use both hooks for reliability
  const { t: contextT } = useTranslation('translation');
  const { currentLanguage, setLanguage, isTranslating, availableLanguages } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [translationProgress, setTranslationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter languages based on search
  const filteredLanguages = availableLanguages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle language selection
  const handleSelectLanguage = async (lang: LanguageConfig) => {
    if (lang.code === currentLanguage || isTranslating) return;
    
    console.log(`🌐 Selecting language: ${lang.code}`);
    setError(null);
    setTranslationProgress(0);
    
    try {
      await setLanguage(lang.code);
      setIsOpen(false);
      setSearchQuery('');
      console.log(`✅ Language changed to: ${lang.code}`);
    } catch (err) {
      console.error('Failed to change language:', err);
      setError('Translation failed. Try again.');
    }
  };

  // Get current language config
  const currentLangConfig = availableLanguages.find((l) => l.code === currentLanguage);

  // Variant-specific styles
  const variantStyles = {
    header: {
      button: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
      dropdown: 'bg-white dark:bg-gray-800 shadow-2xl',
      item: 'hover:bg-kolkata-yellow/10 dark:hover:bg-kolkata-yellow/20',
    },
    footer: {
      button: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600',
      dropdown: 'bg-gray-800 shadow-2xl border border-gray-700',
      item: 'hover:bg-gray-700',
    },
    settings: {
      button: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600',
      dropdown: 'bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700',
      item: 'hover:bg-gray-100 dark:hover:bg-gray-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${styles.button} ${
          isTranslating ? 'opacity-70 cursor-wait' : ''
        }`}
        aria-label={contextT('common.selectLanguage')}
      >
        {isTranslating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
        
        <span className="text-lg">{currentLangConfig?.flag}</span>
        
        {showLabel && (
          <span className="text-sm font-medium hidden sm:inline">
            {currentLangConfig?.nativeName}
          </span>
        )}
        
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-72 rounded-2xl overflow-hidden z-50 ${styles.dropdown}`}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-kolkata-terracotta" />
                {contextT('common.selectLanguage')}
              </h3>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={contextT('common.searchLanguage')}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-kolkata-yellow focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Translation Progress */}
            {isTranslating && (
              <div className="px-4 py-2 bg-kolkata-yellow/10 border-b border-kolkata-yellow/20">
                <div className="flex items-center justify-between text-xs text-kolkata-terracotta mb-1">
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {contextT('language.translating')}
                  </span>
                  <span>{translationProgress}%</span>
                </div>
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${translationProgress}%` }}
                    className="h-full bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta"
                  />
                </div>
              </div>
            )}

            {/* Language List */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filteredLanguages.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No languages found
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = lang.code === currentLanguage;
                  const isCached = hasTranslations(lang.code);
                  
                  return (
                    <motion.button
                      key={lang.code}
                      whileHover={{ x: 4 }}
                      onClick={() => handleSelectLanguage(lang)}
                      disabled={isTranslating}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${styles.item} ${
                        isSelected ? 'bg-kolkata-yellow/20' : ''
                      } ${isTranslating ? 'cursor-wait' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {lang.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lang.nativeName}
                            {lang.rtl && (
                              <span className="ml-1 text-xs text-kolkata-terracotta">(RTL)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Cache indicator */}
                        {isCached && lang.code !== 'en' && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                            {contextT('language.cached')}
                          </span>
                        )}
                        
                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="w-5 h-5 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Powered by LibreTranslate • {availableLanguages.length} languages
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
