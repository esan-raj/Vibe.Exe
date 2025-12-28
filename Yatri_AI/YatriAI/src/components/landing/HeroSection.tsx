import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { ShimmerButton } from '../magicui/ShimmerButton';
import { AnimatedGradientText } from '../magicui/AnimatedGradientText';
import { SparklesText } from '../magicui/SparklesText';
import { Particles } from '../magicui/Particles';
import { BlurFade } from '../magicui/BlurFade';

// Kolkata Heritage Icons
const TramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19 16.94V8.5C19 5.79 16.76 3.5 14 3.5H10C7.24 3.5 5 5.79 5 8.5V16.94C5 17.28 5.03 17.62 5.09 17.94L3 20.5V21H21V20.5L18.91 17.94C18.97 17.62 19 17.28 19 16.94ZM8.5 18C7.67 18 7 17.33 7 16.5S7.67 15 8.5 15 10 15.67 10 16.5 9.33 18 8.5 18ZM9 11V7H15V11H9ZM15.5 18C14.67 18 14 17.33 14 16.5S14.67 15 15.5 15 17 15.67 17 16.5 16.33 18 15.5 18Z"/>
  </svg>
);

const HeroSection: React.FC = () => {
  // Use useTranslation directly for reliable translation updates
  const { t } = useTranslation('translation');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Kolkata Heritage Images - with translation keys
  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1920&h=1080&q=80',
      titleKey: 'hero.images.victoria.title',
      subtitleKey: 'hero.images.victoria.subtitle'
    },
    {
      url: 'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?auto=format&fit=crop&w=1920&h=1080&q=80',
      titleKey: 'hero.images.howrah.title',
      subtitleKey: 'hero.images.howrah.subtitle'
    },
    {
      url: 'https://images.unsplash.com/photo-1599030641314-e7f9e2f5e8e1?auto=format&fit=crop&w=1920&h=1080&q=80',
      titleKey: 'hero.images.kumartuli.title',
      subtitleKey: 'hero.images.kumartuli.subtitle'
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1920&h=1080&q=80',
      titleKey: 'hero.images.durgaPuja.title',
      subtitleKey: 'hero.images.durgaPuja.subtitle'
    },
    {
      url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1920&h=1080&q=80',
      titleKey: 'hero.images.princepGhat.title',
      subtitleKey: 'hero.images.princepGhat.subtitle'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(`/tourist-dashboard?tab=explore&search=${encodeURIComponent(searchQuery)}&date=${selectedDate}`);
    } else {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleQuickAccess = (dashboardTab: string) => {
    if (isAuthenticated) {
      navigate(`/tourist-dashboard?tab=${dashboardTab}`);
    } else {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="hero" className="relative min-h-screen h-screen overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImages[currentSlide].url})` }}
          />
        </AnimatePresence>
        
        {/* Gradient Overlays - Kolkata Colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-kolkata-maroon/40 via-transparent to-black/30" />
        
        {/* Animated Particles - Kolkata Yellow (reduced on mobile) */}
        <Particles 
          className="absolute inset-0 hidden sm:block" 
          quantity={40} 
          color="#FFB800" 
          staticity={30}
        />

        {/* Tram Animation - Bottom (hidden on mobile for performance) */}
        <motion.div
          animate={{ x: ['100vw', '-100px'] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 z-10 opacity-60 hidden md:block"
        >
          <div className="flex items-center gap-1 text-kolkata-yellow">
            <TramIcon />
            <div className="w-32 h-1 bg-kolkata-yellow rounded" />
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <BlurFade delay={0.1} inView>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-kolkata-yellow/20 backdrop-blur-sm border border-kolkata-yellow/40">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-kolkata-yellow" />
                  <span className="text-white/90 text-xs sm:text-sm font-medium">{t('brand.tagline')}</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-durga-500/20 backdrop-blur-sm border border-durga-500/40">
                  <span className="text-2xl">🪔</span>
                </div>
              </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 leading-tight font-heritage">
                <SparklesText sparklesCount={4} colors={{ first: '#FFB800', second: '#E23D28' }}>
                  {t('hero.title')}
                </SparklesText>
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6">
                <AnimatedGradientText className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold">
                  {t('hero.subtitle')}
                </AnimatedGradientText>
              </h2>
            </BlurFade>

            <BlurFade delay={0.3} inView>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 leading-relaxed max-w-2xl">
                {t('hero.description')}
              </p>
            </BlurFade>

            {/* Search Bar */}
            <BlurFade delay={0.4} inView>
              <form
                onSubmit={handleSearch}
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl mb-6 sm:mb-8 border-2 border-kolkata-gold/50 dark:border-kolkata-gold/30"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 relative group">
                    <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-kolkata-sepia w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-kolkata-yellow transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('hero.searchPlaceholder')}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl border-2 border-kolkata-gold/40 dark:border-gray-700 bg-kolkata-cream/50 dark:bg-gray-800 focus:ring-2 focus:ring-kolkata-yellow focus:border-kolkata-yellow text-gray-900 dark:text-white placeholder-kolkata-sepia/70 transition-all font-sans text-sm sm:text-base"
                    />
                  </div>
                  <div className="relative group">
                    <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-kolkata-sepia w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-kolkata-yellow transition-colors" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full sm:w-48 pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl border-2 border-kolkata-gold/40 dark:border-gray-700 bg-kolkata-cream/50 dark:bg-gray-800 focus:ring-2 focus:ring-kolkata-yellow focus:border-kolkata-yellow text-gray-900 dark:text-white transition-all text-sm sm:text-base"
                    />
                  </div>
                  <ShimmerButton 
                    type="submit"
                    background="#FFB800"
                    className="px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base whitespace-nowrap"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{t('common.explore')}</span>
                  </ShimmerButton>
                </div>
              </form>
            </BlurFade>

            {/* Quick Access Cards - Kolkata Themed */}
            <BlurFade delay={0.5} inView>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { 
                    titleKey: 'features.heritageWalk.title', 
                    icon: '🏛️', 
                    color: 'bg-kolkata-yellow', 
                    hoverColor: 'hover:bg-kolkata-gold',
                    shadow: 'shadow-tram',
                    dashboardTab: 'heritage'
                  },
                  { 
                    titleKey: 'features.pujoRoute.title', 
                    icon: '🪔', 
                    color: 'bg-durga-500', 
                    hoverColor: 'hover:bg-kolkata-vermillion',
                    shadow: 'shadow-terracotta',
                    dashboardTab: 'pandal-donations'
                  },
                  { 
                    titleKey: 'features.artisanMarket.title', 
                    icon: '🎭', 
                    color: 'bg-kolkata-terracotta', 
                    hoverColor: 'hover:bg-kolkata-maroon',
                    shadow: 'shadow-heritage',
                    dashboardTab: 'artisans'
                  }
                ].map((card, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleQuickAccess(card.dashboardTab)}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative ${card.color} ${card.hoverColor} text-white p-6 rounded-xl transition-all duration-300 group overflow-hidden ${card.shadow}`}
                  >
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                    
                    <div className="relative flex flex-col items-start gap-2">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-3xl float-animation">{card.icon}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform opacity-70" />
                      </div>
                      <span className="font-semibold text-lg">{t(card.titleKey)}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </BlurFade>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide 
                ? 'w-8 h-3 bg-kolkata-yellow' 
                : 'w-3 h-3 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Slide Info */}
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-8 right-8 text-white text-right z-20 hidden md:block"
      >
        <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-3 border border-kolkata-yellow/30">
          <h3 className="text-xl font-semibold mb-1 font-heritage">{t(heroImages[currentSlide].titleKey)}</h3>
          <p className="text-gray-300 text-sm">{t(heroImages[currentSlide].subtitleKey)}</p>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-8 z-20 hidden md:flex flex-col items-center"
      >
        <span className="text-kolkata-yellow/60 text-xs mb-2 rotate-90 origin-center tracking-widest">SCROLL</span>
        <div className="w-6 h-10 border-2 border-kolkata-yellow/30 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-kolkata-yellow rounded-full"
          />
        </div>
      </motion.div>

    </section>
  );
};

export default HeroSection;
