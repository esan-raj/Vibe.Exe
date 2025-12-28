import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, BadgeCheck, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BlurFade } from '../magicui/BlurFade';
import { MagicCard } from '../magicui/MagicCard';

const ArtisansSection: React.FC = () => {
  const { t } = useTranslation('translation');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const artisanImages = [
    {
      url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'artisans.kumartuliIdols.title',
      descKey: 'artisans.kumartuliIdols.description',
      location: 'Kumartuli',
      craftKey: 'artisans.kumartuliIdols.craft',
      verified: true
    },
    {
      url: 'https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'artisans.kalighatPata.title',
      descKey: 'artisans.kalighatPata.description',
      location: 'Kalighat',
      craftKey: 'artisans.kalighatPata.craft',
      verified: true
    },
    {
      url: 'https://images.unsplash.com/photo-1584286595398-a96c206e0e4d?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'artisans.bankuraTerracotta.title',
      descKey: 'artisans.bankuraTerracotta.description',
      location: 'Bankura',
      craftKey: 'artisans.bankuraTerracotta.craft',
      verified: true
    },
    {
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'artisans.baluchariSilk.title',
      descKey: 'artisans.baluchariSilk.description',
      location: 'Bishnupur',
      craftKey: 'artisans.baluchariSilk.craft',
      verified: true
    },
    {
      url: 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'artisans.dokraMetal.title',
      descKey: 'artisans.dokraMetal.description',
      location: 'Bankura',
      craftKey: 'artisans.dokraMetal.craft',
      verified: true
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % artisanImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, artisanImages.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % artisanImages.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + artisanImages.length) % artisanImages.length);
  };

  return (
    <section id="artisans" className="py-20 bg-gradient-to-b from-kolkata-cream to-heritage-100/30 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-kolkata-terracotta/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-heritage-600/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-kolkata-terracotta/20 dark:bg-kolkata-terracotta/30 text-kolkata-terracotta dark:text-kolkata-gold text-sm font-medium mb-4">
              {t('artisans.badge')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-heritage">
              {t('artisans.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('artisans.subtitle')}
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <MagicCard gradientColor="#C45C26" gradientOpacity={0.15} className="overflow-hidden">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              {/* Image Carousel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <img
                    src={artisanImages[currentSlide].url}
                    alt={t(artisanImages[currentSlide].titleKey)}
                    className="w-full h-full object-cover"
                  />
                  {/* Terracotta themed gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-kolkata-maroon/90 via-kolkata-terracotta/30 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 font-heritage">
                      {t(artisanImages[currentSlide].titleKey)}
                    </h3>
                    <p className="text-gray-200 text-lg mb-4 max-w-xl">
                      {t(artisanImages[currentSlide].descKey)}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-gray-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-kolkata-gold" />
                        {artisanImages[currentSlide].location}
                      </span>
                      <span className="flex items-center gap-1 text-heritage-400">
                        <Palette className="w-4 h-4" />
                        {t(artisanImages[currentSlide].craftKey)}
                      </span>
                      {artisanImages[currentSlide].verified && (
                        <span className="flex items-center gap-1 text-green-400">
                          <BadgeCheck className="w-4 h-4" />
                          {t('common.blockchainVerified')}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-kolkata-terracotta/30 backdrop-blur-md hover:bg-kolkata-terracotta/50 transition-colors group"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-kolkata-terracotta/30 backdrop-blur-md hover:bg-kolkata-terracotta/50 transition-colors group"
              >
                <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {artisanImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentSlide(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'w-8 bg-kolkata-gold'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </MagicCard>
        </BlurFade>
      </div>
    </section>
  );
};

export default ArtisansSection;
