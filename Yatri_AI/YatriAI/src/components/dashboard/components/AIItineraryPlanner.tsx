import TravelRAGAgent from './TravelRAGAgent';
import React from 'react';
import { Wand2 } from 'lucide-react';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { BlurFade } from '../../magicui/BlurFade';

const AIItineraryPlanner: React.FC = () => {

  return (
    <div className="space-y-8">
      <BlurFade delay={0.1} inView>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Wand2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Itinerary Planner{' '}
              <AnimatedGradientText className="text-3xl">✨</AnimatedGradientText>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Chat with our AI to plan your perfect Kolkata tour
            </p>
          </div>
        </div>
      </BlurFade>

      <BlurFade delay={0.2} inView>
        <TravelRAGAgent />
      </BlurFade>
    </div>
  );
};

export default AIItineraryPlanner;
