import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MagicCard } from '../magicui/MagicCard';
import { BorderBeam } from '../magicui/BorderBeam';
import { BlurFade } from '../magicui/BlurFade';
import { ShimmerButton } from '../magicui/ShimmerButton';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../common/AuthModal';
import { 
  TramIcon, 
  DurgaIcon, 
  VictoriaMemorialIcon, 
  TerracottaIcon, 
  BookIcon, 
  AddaTeaIcon
} from '../kolkata/KolkataIcons';

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation('translation');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleFeatureClick = (dashboardTab: string) => {
    if (isAuthenticated) {
      navigate(`/tourist-dashboard?tab=${dashboardTab}`);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleStartJourney = () => {
    if (isAuthenticated) {
      navigate('/tourist-dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    // After successful login, always redirect to tourist dashboard
    navigate('/tourist-dashboard');
  };

  const features = [
    {
      Icon: TramIcon,
      titleKey: 'features.tramHeritage.title',
      descriptionKey: 'features.tramHeritage.description',
      color: 'from-kolkata-yellow to-kolkata-gold',
      gradient: '#FFB800',
      dashboardTab: 'transport'
    },
    {
      Icon: DurgaIcon,
      titleKey: 'features.pujoRoute.title',
      descriptionKey: 'features.pujoRoute.description',
      color: 'from-durga-500 to-kolkata-vermillion',
      gradient: '#E23D28',
      dashboardTab: 'pandal-donations'
    },
    {
      Icon: VictoriaMemorialIcon,
      titleKey: 'features.heritageWalk.title',
      descriptionKey: 'features.heritageWalk.description',
      color: 'from-kolkata-sepia to-heritage-700',
      gradient: '#8B7355',
      dashboardTab: 'heritage'
    },
    {
      Icon: TerracottaIcon,
      titleKey: 'features.artisanMarket.title',
      descriptionKey: 'features.artisanMarket.description',
      color: 'from-kolkata-terracotta to-kolkata-maroon',
      gradient: '#C45C26',
      dashboardTab: 'verified-marketplace'
    },
    {
      Icon: BookIcon,
      titleKey: 'features.literaryKolkata.title',
      descriptionKey: 'features.literaryKolkata.description',
      color: 'from-kolkata-blue to-kolkata-purple',
      gradient: '#1E3A5F',
      dashboardTab: 'patachitra'
    },
    {
      Icon: AddaTeaIcon,
      titleKey: 'features.addaAI.title',
      descriptionKey: 'features.addaAI.description',
      color: 'from-kolkata-maidan to-heritage-600',
      gradient: '#2D5A27',
      dashboardTab: 'chat'
    }
  ];

  const stats = [
    { value: '300+', labelKey: 'stats.heritageSites', icon: '🏛️' },
    { value: '5000+', labelKey: 'stats.pujoPandals', icon: '🪔' },
    { value: '1000+', labelKey: 'stats.artisanCrafts', icon: '🎭' },
    { value: '150+', labelKey: 'stats.tramStops', icon: '🚃' }
  ];

  return (
    <section id="features" className="py-24 bg-kolkata-cream dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
      {/* Background decoration - Kolkata themed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-kolkata-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-durga-500/10 rounded-full blur-3xl" />
        {/* Tram tracks pattern */}
        <div className="absolute inset-0 tram-tracks opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <BlurFade delay={0.1} inView>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kolkata-yellow/20 dark:bg-kolkata-yellow/10 border border-kolkata-yellow/40 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kolkata-yellow opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-kolkata-yellow"></span>
              </span>
              <span className="text-kolkata-terracotta dark:text-kolkata-gold text-sm font-medium">{t('features.badge')}</span>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 font-heritage">
              {t('features.title')}
            </h2>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t('features.subtitle')}
            </p>
          </BlurFade>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.Icon;
            return (
              <BlurFade key={index} delay={0.1 * index} inView>
                <MagicCard 
                  className="h-full card-heritage"
                  gradientColor={feature.gradient}
                  gradientOpacity={0.15}
                >
                  <div className="relative p-8 h-full">
                    {/* Border Beam Effect */}
                    <BorderBeam 
                      size={250}
                      duration={12}
                      delay={index * 2}
                      colorFrom={feature.gradient}
                      colorTo="#FFB800"
                    />

                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-kolkata-yellow dark:group-hover:text-kolkata-gold transition-colors font-heritage">
                      {t(feature.titleKey)}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                      {t(feature.descriptionKey)}
                    </p>

                    <motion.button
                      onClick={() => handleFeatureClick(feature.dashboardTab)}
                      whileHover={{ x: 5 }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-kolkata-yellow dark:text-kolkata-gold hover:text-kolkata-terracotta dark:hover:text-kolkata-yellow transition-colors"
                    >
                      {t('common.learnMore')}
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </MagicCard>
              </BlurFade>
            );
          })}
        </div>

        {/* Stats Section - Kolkata themed */}
        <BlurFade delay={0.6} inView>
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 border border-kolkata-sepia/20 dark:border-kolkata-gold/20 shadow-heritage"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm font-medium">{t(stat.labelKey)}</div>
              </motion.div>
            ))}
          </div>
        </BlurFade>

        {/* Call to Action */}
        <BlurFade delay={0.8} inView>
          <div className="text-center mt-20">
            <ShimmerButton
              onClick={handleStartJourney}
              shimmerColor="#ffffff"
              background="linear-gradient(135deg, #FFB800 0%, #C45C26 100%)"
              className="text-lg px-10 py-5"
            >
              <span className="font-heritage">{t('features.startJourney')}</span>
              <ArrowRight className="w-5 h-5" />
            </ShimmerButton>
            
            <p className="mt-4 text-kolkata-sepia dark:text-gray-400 text-sm">
              {t('features.startJourneyNote')}
            </p>
          </div>
        </BlurFade>
      </div>

      {/* Auth Modal - Force tourist role and redirect to tourist dashboard */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        forceTouristRole={true}
        onSuccessRedirect={handleAuthSuccess}
      />
    </section>
  );
};

export default FeaturesSection;
