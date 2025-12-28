import React, { useState, useEffect } from 'react';
import { Menu, Moon, Sun, User, LogOut, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AuthModal from './AuthModal';
import MobileSidebar from './MobileSidebar';
import { ShimmerButton } from '../magicui/ShimmerButton';
import { AnimatedGradientText } from '../magicui/AnimatedGradientText';
import { TramIcon } from '../kolkata/KolkataIcons';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use useTranslation directly for reliable translation updates
  const { t } = useTranslation('translation');
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage(); // Just for language state
  const navigate = useNavigate();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { key: 'home', href: '#hero', labelKey: 'nav.home', sectionId: 'hero' },
    { key: 'heritage', href: '#heritage', labelKey: 'nav.heritage', sectionId: 'heritage', dashboardTab: 'heritage' },
    { key: 'pujo', href: '#pujo', labelKey: 'nav.pujo', sectionId: 'pujo', dashboardTab: 'explore' },
    { key: 'marketplace', href: '#artisans', labelKey: 'nav.artisans', sectionId: 'artisans', dashboardTab: 'artisans' },
    { key: 'about', href: '#footer', labelKey: 'nav.about', sectionId: 'footer' }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setIsMenuOpen(false);
    
    // If logged in and has dashboard tab, navigate to dashboard
    if (isAuthenticated && item.dashboardTab) {
      navigate(`/tourist-dashboard?tab=${item.dashboardTab}`);
      return;
    }
    
    // Scroll to section on landing page
    const element = document.getElementById(item.sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header className="bg-kolkata-cream/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-colors duration-300 border-b-2 border-kolkata-gold/40 dark:border-kolkata-gold/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 min-h-[64px]">
            {/* Logo - Kolkata Heritage */}
            <motion.div 
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-kolkata-yellow rounded-xl flex items-center justify-center shadow-lg border-2 border-kolkata-gold/30">
                <TramIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex flex-col hidden min-[375px]:flex">
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-xl font-bold text-kolkata-terracotta dark:text-kolkata-gold font-heritage">
                    {t('brand.name').split(' ')[0] || 'Kolkata'}
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-kolkata-terracotta dark:text-kolkata-gold font-heritage">{t('brand.name').split(' ')[1] || 'Heritage'}</span>
                </div>
                <span className="text-xs text-kolkata-sepia dark:text-kolkata-gold/60 -mt-1 hidden sm:block">{t('brand.tagline')}</span>
              </div>
              <Sparkles className="w-4 h-4 text-kolkata-yellow hidden sm:block" />
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => handleNavClick(item)}
                  whileHover={{ y: -2 }}
                  className="relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-kolkata-terracotta dark:hover:text-kolkata-gold transition-colors font-medium text-sm group"
                >
                  <span>{t(item.labelKey)}</span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-kolkata-yellow group-hover:w-3/4 transition-all duration-300 rounded-full" />
                </motion.button>
              ))}
            </nav>

            {/* Right Side Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
              {/* Desktop: Theme, User Menu */}
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-kolkata-terracotta dark:hover:text-kolkata-gold transition-colors rounded-lg hover:bg-kolkata-yellow/10 dark:hover:bg-kolkata-gold/10"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.button>

                {isAuthenticated ? (
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-kolkata-terracotta dark:hover:text-kolkata-gold transition-colors p-1.5 rounded-xl hover:bg-kolkata-yellow/10 dark:hover:bg-kolkata-gold/10"
                    >
                      <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-8 h-8 rounded-xl object-cover border-2 border-kolkata-yellow"
                      />
                      <span className="hidden lg:block font-medium text-sm">{user?.name}</span>
                    </motion.button>
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-kolkata-cream/95 dark:bg-gray-800 rounded-xl shadow-xl border border-kolkata-gold/30 dark:border-gray-700 overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-kolkata-gold/30 dark:border-gray-700 bg-kolkata-yellow/20 dark:bg-kolkata-gold/20">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('auth.logout')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <ShimmerButton
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 max-w-[120px] sm:max-w-none"
                    background="#FFB800"
                  >
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden min-[375px]:inline truncate">{t('auth.login')}</span>
                  </ShimmerButton>
                )}
              </div>

              {/* Mobile: Login Button + Hamburger Menu */}
              <div className="md:hidden flex items-center gap-1.5">
                {!isAuthenticated && (
                  <ShimmerButton
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-2.5 sm:px-3 py-1.5 text-xs whitespace-nowrap flex-shrink-0 max-w-[100px] sm:max-w-none"
                    background="#FFB800"
                  >
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden min-[375px]:inline truncate">{t('auth.login')}</span>
                  </ShimmerButton>
                )}
                {isAuthenticated && (
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="p-1.5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-kolkata-yellow/10 transition-colors flex-shrink-0"
                  >
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-7 h-7 rounded-lg object-cover border-2 border-kolkata-yellow"
                    />
                  </button>
                )}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-kolkata-yellow/10 dark:hover:bg-kolkata-gold/10 transition-colors flex-shrink-0"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
