import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Users, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BlurFade } from '../magicui/BlurFade';
import { MagicCard } from '../magicui/MagicCard';

const PujoSection: React.FC = () => {
  const { t } = useTranslation('translation');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const pujoImages = [
    {
      url: 'https://images.unsplash.com/photo-1601001816339-74036c49426d?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'pujo.ekdalia.title',
      descKey: 'pujo.ekdalia.description',
      locationKey: 'pujo.ekdalia.location',
      crowd: 'high',
      highlightKey: 'pujo.ekdalia.highlight'
    },
    {
      url: 'https://images.unsplash.com/photo-1598431429388-ec5b1a006db6?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'pujo.bagbazar.title',
      descKey: 'pujo.bagbazar.description',
      locationKey: 'pujo.bagbazar.location',
      crowd: 'veryHigh',
      highlightKey: 'pujo.bagbazar.highlight'
    },
    {
      url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'pujo.kumartuli.title',
      descKey: 'pujo.kumartuli.description',
      locationKey: 'pujo.kumartuli.location',
      crowd: 'medium',
      highlightKey: 'pujo.kumartuli.highlight'
    },
    {
      url: 'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'pujo.collegeSquare.title',
      descKey: 'pujo.collegeSquare.description',
      locationKey: 'pujo.collegeSquare.location',
      crowd: 'high',
      highlightKey: 'pujo.collegeSquare.highlight'
    },
    {
      url: 'https://images.unsplash.com/photo-1623841675698-8a9b9f1a3d6f?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'pujo.saltLake.title',
      descKey: 'pujo.saltLake.description',
      locationKey: 'pujo.saltLake.location',
      crowd: 'medium',
      highlightKey: 'pujo.saltLake.highlight'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % pujoImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, pujoImages.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % pujoImages.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + pujoImages.length) % pujoImages.length);
  };

  const getCrowdColor = (crowd: string) => {
    switch (crowd) {
      case 'veryHigh': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getCrowdLabel = (crowd: string) => {
    return t(`pujo.crowdLevels.${crowd}`);
  };

  return (
    <section id="pujo" className="py-20 bg-gradient-to-b from-durga-900/10 to-kolkata-cream dark:from-durga-900/30 dark:to-gray-900 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-durga-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-kolkata-vermillion/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-durga-500/20 dark:bg-durga-500/30 text-durga-600 dark:text-durga-400 text-sm font-medium mb-4">
              {t('pujo.badge')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-heritage">
              {t('pujo.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('pujo.subtitle')}
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <MagicCard gradientColor="#E23D28" gradientOpacity={0.15} className="overflow-hidden">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              {/* Image Carousel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <img
                    src={pujoImages[currentSlide].url}
                    alt={t(pujoImages[currentSlide].titleKey)}
                    className="w-full h-full object-cover"
                  />
                  {/* Vermillion themed gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-durga-900/90 via-durga-900/40 to-transparent" />
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
                      {t(pujoImages[currentSlide].titleKey)}
                    </h3>
                    <p className="text-gray-200 text-lg mb-4 max-w-xl">
                      {t(pujoImages[currentSlide].descKey)}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-gray-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-durga-400" />
                        {t(pujoImages[currentSlide].locationKey)}
                      </span>
                      <span className={`flex items-center gap-1 ${getCrowdColor(pujoImages[currentSlide].crowd)}`}>
                        <Users className="w-4 h-4" />
                        {getCrowdLabel(pujoImages[currentSlide].crowd)} {t('pujo.crowd')}
                      </span>
                      <span className="flex items-center gap-1 text-kolkata-yellow">
                        <Sparkles className="w-4 h-4" />
                        {t(pujoImages[currentSlide].highlightKey)}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-durga-500/30 backdrop-blur-md hover:bg-durga-500/50 transition-colors group"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-durga-500/30 backdrop-blur-md hover:bg-durga-500/50 transition-colors group"
              >
                <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {pujoImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentSlide(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'w-8 bg-durga-400'
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

export default PujoSection;
