import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Camera, Heart, Star, Sparkles, Globe } from 'lucide-react';
import { TramIcon } from '../kolkata/KolkataIcons';

interface InteractiveLoaderProps {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
  showProgress?: boolean;
}

const InteractiveLoader: React.FC<InteractiveLoaderProps> = ({
  isLoading,
  loadingText = "Exploring Kolkata's Heritage...",
  progress = 0,
  showProgress = false
}) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Kolkata heritage loading tips
  const loadingTips = [
    "🏛️ Discovering Victoria Memorial's secrets...",
    "🌉 Crossing the iconic Howrah Bridge...",
    "🎭 Exploring Durga Puja celebrations...",
    "🎨 Finding traditional Bengali crafts...",
    "🍽️ Tasting authentic Kolkata street food...",
    "📚 Visiting College Street book market...",
    "🚋 Riding the heritage tram routes...",
    "🏺 Uncovering Kumartuli pottery art...",
    "🎵 Listening to Rabindra Sangeet...",
    "🌸 Strolling through Botanical Gardens..."
  ];

  // Heritage icons that float around
  const heritageIcons = [
    { icon: MapPin, color: '#FFB800', delay: 0 },
    { icon: Camera, color: '#C45C26', delay: 0.2 },
    { icon: Heart, color: '#E91E63', delay: 0.4 },
    { icon: Star, color: '#FF9800', delay: 0.6 },
    { icon: Sparkles, color: '#9C27B0', delay: 0.8 },
    { icon: Globe, color: '#2196F3', delay: 1.0 }
  ];

  // Cycle through loading tips
  useEffect(() => {
    if (!isLoading) return;
    
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % loadingTips.length);
    }, 2000);

    return () => clearInterval(tipInterval);
  }, [isLoading, loadingTips.length]);

  // Animation phases
  useEffect(() => {
    if (!isLoading) return;
    
    const phaseInterval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(phaseInterval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-kolkata-cream dark:bg-gray-900 flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 animate-pulse">
            <div className="w-full h-full opacity-30 bg-kolkata-yellow"></div>
          </div>
        </div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 184, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(196, 92, 38, 0.1) 0%, transparent 50%)`,
            backgroundSize: '100px 100px'
          }}></div>
        </div>

        {/* Floating Heritage Icons */}
        {heritageIcons.map((item, index) => (
          <motion.div
            key={index}
            className="absolute"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
              rotate: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [0, 1, 0.8, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              delay: item.delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            <item.icon 
              className="w-8 h-8 opacity-30" 
              style={{ color: item.color }}
            />
          </motion.div>
        ))}

        {/* Main Loading Content */}
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          {/* Main Logo/Icon */}
          <motion.div
            className="mb-8"
            animate={{
              scale: animationPhase === 0 ? [1, 1.2, 1] : animationPhase === 1 ? [1, 0.9, 1.1, 1] : [1, 1.3, 0.8, 1],
              rotate: animationPhase === 2 ? [0, 360] : 0,
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <div className="relative">
              {/* Pulsing Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-kolkata-yellow/40"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 0, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                style={{ width: '120px', height: '120px', margin: '-10px' }}
              />
              
              {/* Main Icon */}
              <div className="w-24 h-24 bg-kolkata-yellow rounded-full flex items-center justify-center shadow-2xl shadow-kolkata-yellow/40 border-4 border-kolkata-gold/20">
                <TramIcon className="w-12 h-12 text-white" />
              </div>
              
              {/* Sparkles */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.5
                }}
              >
                <Sparkles className="w-6 h-6 text-kolkata-gold" />
              </motion.div>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.div
            className="mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold font-heritage text-kolkata-terracotta dark:text-kolkata-gold">
              YatriAI
            </h1>
            <p className="text-sm text-kolkata-sepia dark:text-kolkata-gold/70 mt-1">
              Smart Tourism Platform
            </p>
          </motion.div>

          {/* Loading Text with Typewriter Effect */}
          <motion.div
            className="mb-8"
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
              {loadingTips[currentTip]}
            </p>
          </motion.div>

          {/* Progress Bar (if enabled) */}
          {showProgress && (
            <motion.div
              className="mb-6"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-kolkata-terracotta rounded-full shadow-inner"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {progress}% Complete
              </p>
            </motion.div>
          )}

          {/* Animated Dots */}
          <motion.div className="flex justify-center space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-kolkata-terracotta rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Fun Interactive Element */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              className="text-sm text-kolkata-terracotta dark:text-kolkata-gold hover:text-kolkata-gold dark:hover:text-kolkata-yellow transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentTip((prev) => (prev + 1) % loadingTips.length)}
            >
              ✨ Click for next heritage fact
            </motion.button>
          </motion.div>
        </div>

        {/* Bottom Heritage Quote */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            "Kolkata - The City of Joy awaits your discovery"
          </p>
        </motion.div>

        {/* Subtle Particle Effect */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-kolkata-gold/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
              }}
              animate={{
                y: -10,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InteractiveLoader;