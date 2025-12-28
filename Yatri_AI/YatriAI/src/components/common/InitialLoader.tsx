import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TramIcon } from '../kolkata/KolkataIcons';

interface InitialLoaderProps {
  onComplete: () => void;
  minLoadingTime?: number;
}

const InitialLoader: React.FC<InitialLoaderProps> = ({ 
  onComplete, 
  minLoadingTime = 1500 
}) => {
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    "Initializing YatriAI...",
    "Loading Kolkata Heritage Sites...",
    "Connecting to Tourism Services...",
    "Preparing Smart Features...",
    "Loading Cultural Content...",
    "Finalizing Experience...",
    "Almost Ready..."
  ];

  useEffect(() => {
    const startTime = Date.now();
    
    // Phase progression
    const phaseTimer = setInterval(() => {
      setLoadingPhase(prev => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, minLoadingTime / loadingSteps.length);

    // Progress animation - slower and more realistic
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const timeElapsed = Date.now() - startTime;
        const targetProgress = Math.min((timeElapsed / minLoadingTime) * 100, 100);
        
        if (prev < targetProgress) {
          // Balanced progress increment for 1.5-second loading
          return Math.min(prev + 3, targetProgress);
        }
        
        if (prev >= 100 && timeElapsed >= minLoadingTime) {
          clearInterval(progressTimer);
          clearInterval(phaseTimer);
          setTimeout(onComplete, 250); // Balanced delay for 1.5-second loading
        }
        
        return prev;
      });
    }, 40); // Balanced update interval for 1.5-second loading

    return () => {
      clearInterval(phaseTimer);
      clearInterval(progressTimer);
    };
  }, [onComplete, minLoadingTime]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ 
          duration: 0.5
        }}
        className="fixed inset-0 z-[10000] bg-kolkata-cream dark:bg-gray-900 flex items-center justify-center overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255, 184, 0, 0.1) 0%, transparent 50%), 
                               radial-gradient(circle at 80% 80%, rgba(196, 92, 38, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 40% 60%, rgba(226, 61, 40, 0.1) 0%, transparent 50%)`,
              backgroundSize: '400px 400px, 300px 300px, 500px 500px',
              animation: 'float 8s ease-in-out infinite'
            }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Logo Animation */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 1.2, 
              ease: "easeOut",
              type: "spring",
              stiffness: 100
            }}
          >
            <div className="relative">
              {/* Outer Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-kolkata-yellow/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.5, 0.2],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ width: '140px', height: '140px', margin: '-20px' }}
              />
              
              {/* Middle Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-kolkata-terracotta/30"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [360, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ width: '120px', height: '120px', margin: '-10px' }}
              />
              
              {/* Main Logo */}
              <div className="w-24 h-24 bg-kolkata-yellow rounded-full flex items-center justify-center shadow-2xl shadow-kolkata-yellow/50 border-4 border-kolkata-gold/30">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <TramIcon className="w-12 h-12 text-white" />
                </motion.div>
              </div>
              
              {/* Sparkle Effects */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-kolkata-gold rounded-full"
                  style={{
                    top: `${20 + Math.sin(i * Math.PI / 3) * 60}px`,
                    left: `${20 + Math.cos(i * Math.PI / 3) * 60}px`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.div
            className="mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.h1 
              className="text-4xl font-bold font-heritage text-kolkata-terracotta dark:text-kolkata-gold mb-2"
              animate={{ 
                textShadow: [
                  "0 0 0px rgba(196, 92, 38, 0)",
                  "0 0 10px rgba(196, 92, 38, 0.3)",
                  "0 0 0px rgba(196, 92, 38, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              YatriAI
            </motion.h1>
            <motion.p 
              className="text-kolkata-sepia dark:text-kolkata-gold/70 text-lg font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Smart Tourism Platform
            </motion.p>
          </motion.div>

          {/* Loading Text */}
          <motion.div
            className="mb-8"
            key={loadingPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              {loadingSteps[loadingPhase]}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="w-80 max-w-sm mx-auto"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "20rem", opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <div className="relative">
              {/* Progress Track */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-kolkata-terracotta rounded-full relative"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-kolkata-yellow/50 rounded-full"
                    animate={{
                      x: ["-100%", "100%"]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255, 184, 0, 0.6) 50%, transparent 100%)"
                    }}
                  />
                </motion.div>
              </div>
              
              {/* Progress Text */}
              <motion.div
                className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span>Loading...</span>
                <span>{progress}%</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Heritage Quote */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 italic font-bengali">
              "Kolkata - The City of Joy awaits your discovery"
            </p>
          </motion.div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-kolkata-gold/40 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
              }}
              animate={{
                y: -10,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InitialLoader;