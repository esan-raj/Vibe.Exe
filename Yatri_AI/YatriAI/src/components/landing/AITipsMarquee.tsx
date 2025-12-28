import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Marquee } from '../magicui/Marquee';

// Kolkata-themed AI tips with translation keys
const kolkataTipKeys = [
  { icon: "🚃", tipKey: "aiTips.tips.tram36" },
  { icon: "🪔", tipKey: "aiTips.tips.pujoPandals" },
  { icon: "☕", tipKey: "aiTips.tips.coffeeHouse" },
  { icon: "🎭", tipKey: "aiTips.tips.kumartuliArtisans" },
  { icon: "📚", tipKey: "aiTips.tips.collegeStreetBooks" },
  { icon: "🌅", tipKey: "aiTips.tips.princepGhatSunset" },
  { icon: "🍛", tipKey: "aiTips.tips.biryani" },
  { icon: "🏛️", tipKey: "aiTips.tips.victoriaMemorial" },
  { icon: "🚕", tipKey: "aiTips.tips.yellowTaxis" },
  { icon: "🎨", tipKey: "aiTips.tips.jorasanko" },
  { icon: "🛕", tipKey: "aiTips.tips.kalighatTemple" },
  { icon: "🌉", tipKey: "aiTips.tips.howrahBridge" },
  { icon: "🎪", tipKey: "aiTips.tips.parkStreet" },
  { icon: "🎵", tipKey: "aiTips.tips.rabindraSadan" },
  { icon: "🍰", tipKey: "aiTips.tips.mishtiDoi" },
];

const TipCard = ({ tipKey, icon }: { tipKey: string; icon: string }) => {
  const { t } = useTranslation('translation');
  
  return (
    <div className="flex items-center gap-3 px-5 py-3 mx-2 bg-white/10 backdrop-blur-sm rounded-full border border-kolkata-gold/30 hover:bg-kolkata-yellow/20 transition-all duration-300 group cursor-default">
      <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-white text-sm font-medium whitespace-nowrap">{t(tipKey)}</span>
    </div>
  );
};

const AITipsMarquee: React.FC = () => {
  const { t } = useTranslation('translation');
  
  // Create duplicate tips for seamless looping
  const allTips = [...kolkataTipKeys, ...kolkataTipKeys];

  return (
    <div className="relative bg-kolkata-yellow py-6 overflow-hidden">
      {/* Animated background pattern - Alpona style */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Fade overlays for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-kolkata-yellow z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-kolkata-yellow z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-4 relative z-20">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <span className="text-white font-semibold text-sm">{t('aiTips.header')}</span>
          <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">{t('aiTips.live')}</span>
        </div>
      </div>
      
      {/* Marquee - Very slow speed for better readability */}
      <Marquee pauseOnHover speed={200} className="relative z-0">
        {allTips.map((item, index) => (
          <TipCard key={index} tipKey={item.tipKey} icon={item.icon} />
        ))}
      </Marquee>

      {/* Bottom subtle decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
};

export default AITipsMarquee;
