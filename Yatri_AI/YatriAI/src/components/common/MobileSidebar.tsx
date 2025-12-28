import React from 'react';
import { X, Moon, Sun, User, LogOut, Home, Map, Headphones, Palette, Shield, Heart, Award, CreditCard, MapPin, ShoppingBag, Users, Star, ChefHat, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import BrowserOnlyTranslate from './BrowserOnlyTranslate';
import { TramIcon } from '../kolkata/KolkataIcons';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthClick: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, onAuthClick }) => {
  const { t } = useTranslation('translation');
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { key: 'home', href: '#hero', labelKey: 'nav.home', sectionId: 'hero', icon: Home },
    { key: 'heritage', href: '#heritage', labelKey: 'nav.heritage', sectionId: 'heritage', dashboardTab: 'heritage', icon: Headphones },
    { key: 'pujo', href: '#pujo', labelKey: 'nav.pujo', sectionId: 'pujo', dashboardTab: 'explore', icon: Heart },
    { key: 'marketplace', href: '#artisans', labelKey: 'nav.artisans', sectionId: 'artisans', dashboardTab: 'artisans', icon: Palette },
    { key: 'about', href: '#footer', labelKey: 'nav.about', sectionId: 'footer', icon: MapPin }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    onClose();
    
    if (isAuthenticated && item.dashboardTab) {
      navigate(`/tourist-dashboard?tab=${item.dashboardTab}`);
      return;
    }
    
    const element = document.getElementById(item.sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col overflow-y-auto"
            style={{ willChange: 'transform' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-kolkata-cream/50 dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-kolkata-yellow rounded-xl flex items-center justify-center shadow-lg border-2 border-kolkata-gold/30">
                  <TramIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-kolkata-terracotta dark:text-kolkata-gold font-heritage">
                    {t('brand.name')}
                  </span>
                  <span className="text-xs text-kolkata-sepia dark:text-kolkata-gold/60 -mt-1">
                    {t('brand.tagline')}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-kolkata-yellow/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Info / Login */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-kolkata-yellow"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onAuthClick();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-kolkata-yellow hover:bg-kolkata-gold text-white rounded-xl font-medium transition-colors shadow-lg"
                >
                  <User className="w-5 h-5" />
                  <span>{t('auth.login')}</span>
                </button>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-kolkata-terracotta dark:hover:text-kolkata-gold hover:bg-kolkata-yellow/10 dark:hover:bg-kolkata-gold/10 rounded-xl transition-all font-medium text-left"
                >
                  {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
                  <span>{t(item.labelKey)}</span>
                </button>
              ))}
            </nav>

            {/* Settings Section */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-kolkata-yellow/10 dark:hover:bg-kolkata-gold/10 rounded-xl transition-all"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{isDark ? t('common.lightMode') : t('common.darkMode')}</span>
              </button>

              {/* Language Selector */}
              <BrowserOnlyTranslate variant="mobile" />

              {/* Logout (if authenticated) */}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{t('auth.logout')}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileSidebar;

