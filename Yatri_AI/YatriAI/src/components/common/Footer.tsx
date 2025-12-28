import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatedGradientText } from '../magicui/AnimatedGradientText';
import { ShimmerButton } from '../magicui/ShimmerButton';
import { TramIcon } from '../kolkata/KolkataIcons';

const Footer: React.FC = () => {
  const { t } = useTranslation('translation');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubscribe = () => {
    if (email && email.includes('@')) {
      setIsSubscribed(true);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickLinkClick = (dashboardTab?: string, section?: string) => {
    if (isAuthenticated && dashboardTab) {
      navigate(`/tourist-dashboard?tab=${dashboardTab}`);
    } else if (section) {
      scrollToSection(section);
    }
  };

  const handleServiceClick = (dashboardTab: string) => {
    if (isAuthenticated) {
      navigate(`/tourist-dashboard?tab=${dashboardTab}`);
    } else {
      scrollToSection('features');
    }
  };

  const openSocialLink = (platform: string) => {
    const socialUrls: { [key: string]: string } = {
      'Facebook': 'https://facebook.com',
      'Twitter': 'https://twitter.com',
      'Instagram': 'https://instagram.com',
      'Youtube': 'https://youtube.com'
    };
    window.open(socialUrls[platform], '_blank', 'noopener,noreferrer');
  };

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', color: 'hover:bg-blue-500' },
    { icon: Twitter, name: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: Instagram, name: 'Instagram', color: 'hover:bg-pink-500' },
    { icon: Youtube, name: 'Youtube', color: 'hover:bg-red-500' }
  ];

  const quickLinks = [
    { nameKey: 'footer.quickLinks.heritageSites', section: 'features', dashboardTab: 'heritage' },
    { nameKey: 'footer.quickLinks.durgaPuja', section: 'features', dashboardTab: 'pandal-donations' },
    { nameKey: 'footer.quickLinks.artisanMarketplace', section: 'features', dashboardTab: 'verified-marketplace' },
    { nameKey: 'footer.quickLinks.tramRoutes', section: 'features', dashboardTab: 'transport' },
    { nameKey: 'footer.quickLinks.foodGuide', section: 'features', dashboardTab: 'recipes' },
    { nameKey: 'footer.quickLinks.emergency', section: 'features', dashboardTab: 'safety' }
  ];

  const services = [
    { nameKey: 'footer.features.aiPlanner', icon: '🤖', dashboardTab: 'planner' },
    { nameKey: 'footer.features.blockchain', icon: '⛓️', dashboardTab: 'heritage-nft' },
    { nameKey: 'footer.features.audioTours', icon: '🎧', dashboardTab: 'heritage' },
    { nameKey: 'footer.features.pujoOptimizer', icon: '🪔', dashboardTab: 'pandal-donations' },
    { nameKey: 'footer.features.artisanConnect', icon: '🎭', dashboardTab: 'artisans' },
    { nameKey: 'footer.features.addaAI', icon: '☕', dashboardTab: 'chat' }
  ];

  const techPartners = [
    { name: 'Axicov', desc: 'AI Agents' },
    { name: 'n8n', desc: 'Automation' },
    { name: 'ElevenLabs', desc: 'Voice AI' },
    { name: 'Ethereum', desc: 'Blockchain' },
    { name: 'Dodo', desc: 'Payments' }
  ];

  const contactInfo = [
    { icon: Mail, text: 'hello@kolkataheritage.in' },
    { icon: Phone, text: '+91 33-HERITAGE' },
    { icon: MapPin, text: 'Kolkata, West Bengal' }
  ];

  return (
    <footer id="footer" className="bg-gradient-to-b from-gray-900 to-gray-950 text-white relative overflow-hidden">
      {/* Background decoration - Kolkata themed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-kolkata-yellow/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-durga-500/5 rounded-full blur-3xl" />
        {/* Subtle tram tracks */}
        <div className="absolute inset-0 opacity-5 tram-tracks" />
      </div>

      {/* Newsletter Section */}
      <div className="relative border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2 font-heritage">
                <Sparkles className="w-6 h-6 text-kolkata-yellow" />
                {t('footer.newsletter.title')}
              </h3>
              <p className="text-gray-400">
                {t('footer.newsletter.subtitle')}
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletter.placeholder')}
                disabled={isSubscribed}
                className="flex-1 md:w-72 px-4 py-3 rounded-xl bg-gray-800 border border-kolkata-gold/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-kolkata-yellow focus:border-transparent disabled:opacity-50"
              />
              <ShimmerButton 
                onClick={handleSubscribe}
                className="px-6 py-3"
                background={isSubscribed ? "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)" : "linear-gradient(135deg, #FFB800 0%, #C45C26 100%)"}
              >
                {isSubscribed ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t('common.subscribed')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('common.subscribe')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </ShimmerButton>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed bottom-8 right-8 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>{t('footer.newsletter.subscribeSuccess')}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-xl flex items-center justify-center shadow-lg shadow-kolkata-yellow/30"
              >
                <TramIcon className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <AnimatedGradientText className="text-xl font-bold font-heritage">
                  {t('brand.name')}
                </AnimatedGradientText>
                <span className="text-xs text-kolkata-gold/60">{t('brand.tagline')}</span>
              </div>
            </motion.div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('brand.description')}
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={() => openSocialLink(social.name)}
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all ${social.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 font-heritage">
              <span className="w-8 h-0.5 bg-gradient-to-r from-kolkata-yellow to-durga-500 rounded-full" />
              {t('footer.quickLinks.title')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <button 
                    onClick={() => handleQuickLinkClick(link.dashboardTab, link.section)}
                    className="text-gray-400 hover:text-kolkata-gold transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-kolkata-yellow" />
                    <span>{t(link.nameKey)}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 font-heritage">
              <span className="w-8 h-0.5 bg-gradient-to-r from-kolkata-yellow to-durga-500 rounded-full" />
              {t('footer.features.title')}
            </h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <button 
                    onClick={() => handleServiceClick(service.dashboardTab)}
                    className="text-gray-400 hover:text-kolkata-gold transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="text-sm">{service.icon}</span>
                    {t(service.nameKey)}
                  </button>
                </motion.li>
              ))}
            </ul>

            {/* Powered By */}
            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-3">{t('footer.poweredBy')}</p>
              <div className="flex flex-wrap gap-2">
                {techPartners.map((sponsor, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400 hover:text-kolkata-gold hover:border-kolkata-gold/30 border border-gray-700 transition-colors"
                  >
                    {sponsor.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 font-heritage">
              <span className="w-8 h-0.5 bg-gradient-to-r from-kolkata-yellow to-durga-500 rounded-full" />
              {t('footer.contact.title')}
            </h3>
            <div className="space-y-4">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div 
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-center space-x-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-kolkata-yellow/20 transition-colors">
                      <Icon className="w-4 h-4 text-kolkata-gold" />
                    </div>
                    <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{item.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-sm flex items-center gap-2"
            >
              {t('footer.copyright')}
            </motion.div>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { key: 'footer.privacyPolicy', label: t('footer.privacyPolicy') },
                { key: 'footer.termsOfService', label: t('footer.termsOfService') },
                { key: 'footer.cookiePolicy', label: t('footer.cookiePolicy') }
              ].map((link, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 2000);
                  }}
                  whileHover={{ y: -2 }}
                  className="text-gray-400 hover:text-kolkata-gold transition-colors text-sm"
                >
                  {link.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
