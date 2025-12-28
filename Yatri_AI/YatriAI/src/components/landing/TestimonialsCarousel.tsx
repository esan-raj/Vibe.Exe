import React, { useState, useEffect } from 'react';
import { Star, Quote, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Marquee } from '../magicui/Marquee';
import { BlurFade } from '../magicui/BlurFade';
import { MagicCard } from '../magicui/MagicCard';
import api from '../../lib/api';

// Kolkata-themed testimonials with translation keys
const kolkataTestimonialKeys = [
  {
    id: 1,
    translationKey: "testimonialsList.anirban",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5
  },
  {
    id: 2,
    translationKey: "testimonialsList.sarah",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5
  },
  {
    id: 3,
    translationKey: "testimonialsList.rahul",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    rating: 5
  },
  {
    id: 4,
    translationKey: "testimonialsList.emma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5
  },
  {
    id: 5,
    translationKey: "testimonialsList.priya",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    rating: 5
  },
  {
    id: 6,
    translationKey: "testimonialsList.james",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    rating: 5
  }
];

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  sentiment?: string;
  location?: string;
  translationKey?: string; // For fallback testimonials
}

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const { t } = useTranslation('translation');
  
  // Use translation if translationKey exists, otherwise use direct values
  const name = testimonial.translationKey 
    ? t(`${testimonial.translationKey}.name`) 
    : testimonial.name;
  const comment = testimonial.translationKey 
    ? t(`${testimonial.translationKey}.comment`) 
    : testimonial.comment;
  const location = testimonial.translationKey 
    ? t(`${testimonial.translationKey}.location`) 
    : (testimonial.location || 'Kolkata');
  const sentiment = testimonial.translationKey 
    ? t(`${testimonial.translationKey}.sentiment`) 
    : (testimonial.sentiment || 'positive');
  
  return (
    <MagicCard
      className="w-[350px] mx-4 flex-shrink-0"
      gradientColor="#FFB800"
      gradientOpacity={0.1}
    >
      <div className="p-6">
        <Quote className="w-8 h-8 text-kolkata-yellow/30 mb-4" />
        
        <div className="flex items-center space-x-1 mb-4">
          {[...Array(testimonial.rating || 5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-kolkata-yellow fill-current" />
          ))}
          {[...Array(5 - (testimonial.rating || 5))].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          ))}
        </div>
        
        <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm">
          "{comment}"
        </blockquote>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={testimonial.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border-2 border-kolkata-yellow/50 dark:border-kolkata-gold/50"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-kolkata-yellow rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              {name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {location}
            </div>
          </div>
          
          <div className="px-2 py-1 bg-kolkata-yellow/20 dark:bg-kolkata-gold/20 text-kolkata-terracotta dark:text-kolkata-gold rounded-full text-xs font-medium">
            {sentiment}
          </div>
        </div>
      </div>
    </MagicCard>
  );
};

const TestimonialsCarousel: React.FC = () => {
  const { t } = useTranslation('translation');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await api.getTestimonials();
      if (response.success && response.data && response.data.length > 0) {
        // Convert API testimonials to our format
        const apiTestimonials: Testimonial[] = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          avatar: item.avatar,
          rating: item.rating,
          comment: item.comment,
          sentiment: item.sentiment,
          location: item.location || 'Kolkata'
        }));
        setTestimonials(apiTestimonials);
      } else {
        // Fallback to hardcoded testimonials
        const fallbackTestimonials: Testimonial[] = kolkataTestimonialKeys.map(item => ({
          id: item.id.toString(),
          name: t(`${item.translationKey}.name`),
          avatar: item.avatar,
          rating: item.rating,
          comment: t(`${item.translationKey}.comment`),
          sentiment: t(`${item.translationKey}.sentiment`),
          location: t(`${item.translationKey}.location`),
          translationKey: item.translationKey
        }));
        setTestimonials(fallbackTestimonials);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      // Fallback to hardcoded testimonials
      const fallbackTestimonials: Testimonial[] = kolkataTestimonialKeys.map(item => ({
        id: item.id.toString(),
        name: t(`${item.translationKey}.name`),
        avatar: item.avatar,
        rating: item.rating,
        comment: t(`${item.translationKey}.comment`),
        sentiment: t(`${item.translationKey}.sentiment`),
        location: t(`${item.translationKey}.location`),
        translationKey: item.translationKey
      }));
      setTestimonials(fallbackTestimonials);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure we have enough testimonials for the marquee (duplicate if needed)
  const allTestimonials = testimonials.length > 0 
    ? [...testimonials, ...testimonials] 
    : [...kolkataTestimonialKeys.map(item => ({
        id: item.id.toString(),
        name: t(`${item.translationKey}.name`),
        avatar: item.avatar,
        rating: item.rating,
        comment: t(`${item.translationKey}.comment`),
        sentiment: t(`${item.translationKey}.sentiment`),
        location: t(`${item.translationKey}.location`),
        translationKey: item.translationKey
      })), ...kolkataTestimonialKeys.map(item => ({
        id: item.id.toString(),
        name: t(`${item.translationKey}.name`),
        avatar: item.avatar,
        rating: item.rating,
        comment: t(`${item.translationKey}.comment`),
        sentiment: t(`${item.translationKey}.sentiment`),
        location: t(`${item.translationKey}.location`),
        translationKey: item.translationKey
      }))];
  
  const firstRow = allTestimonials.slice(0, Math.ceil(allTestimonials.length / 2));
  const secondRow = allTestimonials.slice(Math.ceil(allTestimonials.length / 2));

  return (
    <section id="testimonials" className="py-24 bg-kolkata-cream dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
      {/* Background decoration - Kolkata themed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gradient-to-r from-kolkata-yellow/10 to-transparent rounded-full blur-3xl transform -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-l from-durga-500/10 to-transparent rounded-full blur-3xl transform -translate-y-1/2" />
        {/* Subtle heritage texture */}
        <div className="absolute inset-0 terracotta-texture opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <BlurFade delay={0.1} inView>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kolkata-yellow/20 dark:bg-kolkata-gold/10 border border-kolkata-yellow/40 mb-6">
              <span className="text-2xl">💬</span>
              <span className="text-kolkata-terracotta dark:text-kolkata-gold text-sm font-medium">{t('testimonials.badge')}</span>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-heritage">
              {t('testimonials.title')}
            </h2>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-4">
              {t('testimonials.subtitle')}
            </p>
          </BlurFade>
        </div>
      </div>

      {/* Marquee Testimonials */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-kolkata-yellow" />
        </div>
      ) : (
        <div className="relative">
          {/* Gradient overlays for smooth fade */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-kolkata-cream dark:from-gray-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-kolkata-cream dark:from-gray-900 to-transparent z-10 pointer-events-none" />
          
          <Marquee pauseOnHover speed={20} className="py-4">
            {firstRow.map((testimonial, index) => (
              <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
            ))}
          </Marquee>
          
          <Marquee reverse pauseOnHover speed={20} className="py-4">
            {secondRow.map((testimonial, index) => (
              <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
            ))}
          </Marquee>
        </div>
      )}

      {/* Trust indicators - Kolkata themed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <BlurFade delay={0.5} inView>
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {(testimonials.length > 0 ? testimonials : kolkataTestimonialKeys).slice(0, 4).map((testimonial, i) => (
                  <img
                    key={i}
                    src={testimonial.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-kolkata-cream dark:border-gray-900"
                  />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">10,000+</span> {t('common.happyExplorers')}
              </span>
            </div>
            
            <div className="h-8 w-px bg-kolkata-sepia/30 dark:bg-gray-700 hidden md:block" />
            
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-kolkata-yellow fill-current" />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">4.9/5</span> {t('common.rating')}
              </span>
            </div>
            
            <div className="h-8 w-px bg-kolkata-sepia/30 dark:bg-gray-700 hidden md:block" />
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <svg className="w-5 h-5 text-kolkata-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><span className="font-semibold text-gray-900 dark:text-white">Blockchain</span> {t('testimonials.verifiedReviews')}</span>
            </div>
            
            <div className="h-8 w-px bg-kolkata-sepia/30 dark:bg-gray-700 hidden md:block" />
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <span className="text-xl">🚃</span>
              <span><span className="font-semibold text-gray-900 dark:text-white">Heritage</span> {t('common.heritageCertifiedGuides')}</span>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
