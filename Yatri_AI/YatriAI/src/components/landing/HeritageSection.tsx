import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Clock, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BlurFade } from '../magicui/BlurFade';
import { MagicCard } from '../magicui/MagicCard';

const HeritageSection: React.FC = () => {
  const { t } = useTranslation('translation');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const heritageImages = [
    {
      url: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'heritage.victoria.title',
      descKey: 'heritage.victoria.description',
      locationKey: 'heritage.victoria.location',
      rating: 4.9,
      duration: '2-3 hrs'
    },
    {
      url: 'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'heritage.howrah.title',
      descKey: 'heritage.howrah.description',
      locationKey: 'heritage.howrah.location',
      rating: 4.8,
      duration: '1 hr'
    },
    {
      url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'heritage.marble.title',
      descKey: 'heritage.marble.description',
      locationKey: 'heritage.marble.location',
      rating: 4.7,
      duration: '1.5 hrs'
    },
    {
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'heritage.kalighat.title',
      descKey: 'heritage.kalighat.description',
      locationKey: 'heritage.kalighat.location',
      rating: 4.9,
      duration: '1 hr'
    },
    {
      url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&h=600&q=80',
      titleKey: 'heritage.collegeStreet.title',
      descKey: 'heritage.collegeStreet.description',
      locationKey: 'heritage.collegeStreet.location',
      rating: 4.6,
      duration: '2 hrs'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heritageImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, heritageImages.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % heritageImages.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + heritageImages.length) % heritageImages.length);
  };

  return (
    <section id="heritage" className="py-20 bg-gradient-to-b from-kolkata-cream to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-kolkata-sepia/20 dark:bg-kolkata-gold/20 text-kolkata-sepia dark:text-kolkata-gold text-sm font-medium mb-4">
              {t('heritage.badge')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-heritage">
              {t('heritage.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('heritage.subtitle')}
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <MagicCard gradientColor="#8B7355" gradientOpacity={0.15} className="overflow-hidden">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              {/* Image Carousel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  <img
                    src={heritageImages[currentSlide].url}
                    alt={t(heritageImages[currentSlide].titleKey)}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
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
                      {t(heritageImages[currentSlide].titleKey)}
                    </h3>
                    <p className="text-gray-200 text-lg mb-4 max-w-xl">
                      {t(heritageImages[currentSlide].descKey)}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-gray-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-kolkata-yellow" />
                        {t(heritageImages[currentSlide].locationKey)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-kolkata-yellow fill-current" />
                        {heritageImages[currentSlide].rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-kolkata-yellow" />
                        {heritageImages[currentSlide].duration}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors group"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors group"
              >
                <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {heritageImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentSlide(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'w-8 bg-kolkata-yellow'
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

export default HeritageSection;
