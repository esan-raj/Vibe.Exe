import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Play, Pause, Volume2, VolumeX, Clock, Camera, 
  ChevronRight, Globe, Sparkles, Star, ArrowRight, Loader2,
  SkipBack, SkipForward, List, X, Heart, Share2, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '../../magicui/MagicCard';
import { BorderBeam } from '../../magicui/BorderBeam';
import { ShimmerButton } from '../../magicui/ShimmerButton';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { BlurFade } from '../../magicui/BlurFade';
import { VictoriaMemorialIcon, HowrahBridgeIcon, TerracottaIcon } from '../../kolkata/KolkataIcons';
import { voiceService, isElevenLabsConfigured } from '../../../lib/services';

// Kolkata Heritage Sites with Narration Content
const heritageSites = [
  {
    id: 'victoria-memorial',
    name: 'Victoria Memorial',
    nameBengali: 'ভিক্টোরিয়া মেমোরিয়াল',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&h=500&q=80',
    icon: VictoriaMemorialIcon,
    color: '#FFFEF7',
    duration: '45 min',
    distance: '2.5 km',
    rating: 4.9,
    reviews: 2847,
    location: { lat: 22.5448, lng: 88.3426 },
    narration: {
      en: {
        intro: "Welcome to the Victoria Memorial, Kolkata's crown jewel and one of India's most magnificent monuments. Built between 1906 and 1921 in memory of Queen Victoria, this stunning white marble building stands as a testament to the city's colonial past and architectural grandeur.",
        history: "The Victoria Memorial was conceived by Lord Curzon, then Viceroy of India, after Queen Victoria's death in 1901. The building combines elements of British and Mughal architecture, designed by Sir William Emerson. The foundation stone was laid by the Prince of Wales in 1906.",
        architecture: "The memorial is built entirely of white Makrana marble from Rajasthan, the same marble used in the Taj Mahal. The central dome rises 56 meters high, topped by a 4.9-meter tall bronze statue of the Angel of Victory. The gardens cover 64 acres with beautiful Mughal-style landscaping.",
        highlights: "Inside, you'll find 25 galleries housing a vast collection of paintings, sculptures, and manuscripts. Don't miss the royal portraits, the rare collection of Queen Victoria's personal belongings, and the famous painting of the Black Hole of Calcutta.",
        conclusion: "The Victoria Memorial is not just a monument; it's a living museum of Kolkata's history. As the sun sets, the building glows golden, creating one of the most photographed scenes in India. Best visited early morning or at sunset for the magical light."
      },
      bn: {
        intro: "ভিক্টোরিয়া মেমোরিয়ালে স্বাগতম, কলকাতার মুকুট রত্ন এবং ভারতের সবচেয়ে দর্শনীয় স্মৃতিসৌধগুলির মধ্যে একটি। ১৯০৬ থেকে ১৯২১ সালের মধ্যে রানী ভিক্টোরিয়ার স্মৃতিতে নির্মিত, এই অত্যাশ্চর্য সাদা মার্বেল ভবনটি শহরের ঔপনিবেশিক অতীত এবং স্থাপত্য মহিমার সাক্ষ্য হিসাবে দাঁড়িয়ে আছে।",
        history: "ভিক্টোরিয়া মেমোরিয়ালের ধারণাটি তৎকালীন ভারতের ভাইসরয় লর্ড কার্জন দ্বারা ১৯০১ সালে রানী ভিক্টোরিয়ার মৃত্যুর পরে কল্পনা করা হয়েছিল। স্যার উইলিয়াম এমারসন দ্বারা নকশা করা এই ভবনটি ব্রিটিশ এবং মুঘল স্থাপত্যের উপাদানগুলিকে একত্রিত করে।",
        architecture: "স্মৃতিসৌধটি সম্পূর্ণরূপে রাজস্থানের মাকরানা সাদা মার্বেল দিয়ে তৈরি, তাজমহলে ব্যবহৃত একই মার্বেল। কেন্দ্রীয় গম্বুজ ৫৬ মিটার উঁচু, যার উপরে ৪.৯ মিটার লম্বা বিজয়ের দেবদূতের ব্রোঞ্জ মূর্তি রয়েছে।",
        highlights: "ভিতরে, আপনি পেইন্টিং, ভাস্কর্য এবং পান্ডুলিপির বিশাল সংগ্রহ সহ ২৫টি গ্যালারি পাবেন। রাজকীয় প্রতিকৃতি, রানী ভিক্টোরিয়ার ব্যক্তিগত জিনিসপত্রের বিরল সংগ্রহ মিস করবেন না।",
        conclusion: "ভিক্টোরিয়া মেমোরিয়াল শুধু একটি স্মৃতিস্তম্ভ নয়; এটি কলকাতার ইতিহাসের একটি জীবন্ত জাদুঘর। সূর্যাস্তের সময়, ভবনটি সোনালি রঙে জ্বলে ওঠে।"
      }
    },
    sections: ['intro', 'history', 'architecture', 'highlights', 'conclusion'],
    sectionLabels: {
      en: { intro: 'Introduction', history: 'History', architecture: 'Architecture', highlights: 'Highlights', conclusion: 'Conclusion' },
      bn: { intro: 'পরিচিতি', history: 'ইতিহাস', architecture: 'স্থাপত্য', highlights: 'বিশেষ আকর্ষণ', conclusion: 'উপসংহার' }
    }
  },
  {
    id: 'howrah-bridge',
    name: 'Howrah Bridge',
    nameBengali: 'হাওড়া ব্রিজ',
    image: 'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?auto=format&fit=crop&w=800&h=500&q=80',
    icon: HowrahBridgeIcon,
    color: '#8B7355',
    duration: '30 min',
    distance: '1 km',
    rating: 4.8,
    reviews: 3421,
    location: { lat: 22.5851, lng: 88.3468 },
    narration: {
      en: {
        intro: "Welcome to the Howrah Bridge, one of the world's busiest cantilever bridges and an iconic symbol of Kolkata. Officially named Rabindra Setu after Rabindranath Tagore, this engineering marvel has been connecting Kolkata to Howrah across the Hooghly River since 1943.",
        history: "The bridge was commissioned in 1936 to replace an earlier pontoon bridge. Designed by the Cleveland Bridge & Engineering Company of England, construction began in 1936 and was completed in 1942. The bridge was opened to traffic on February 3, 1943, during World War II.",
        architecture: "What makes Howrah Bridge truly remarkable is that it was constructed without using a single nut or bolt! The entire structure is held together by rivets. Spanning 705 meters with a main span of 457 meters, it's the sixth longest cantilever bridge in the world.",
        highlights: "Every day, more than 100,000 vehicles and countless pedestrians cross this bridge. The best time to experience it is at dawn when the flower market at its base comes alive, or at sunset when the bridge is silhouetted against the golden sky.",
        conclusion: "Howrah Bridge is more than just infrastructure; it's the beating heart of Kolkata's commerce and culture. Standing here, you're walking on history, witnessing the lifeblood of a city that never sleeps."
      },
      bn: {
        intro: "হাওড়া ব্রিজে স্বাগতম, বিশ্বের ব্যস্ততম ক্যান্টিলিভার সেতুগুলির মধ্যে একটি এবং কলকাতার একটি প্রতীকী চিহ্ন। রবীন্দ্রনাথ ঠাকুরের নামে আনুষ্ঠানিকভাবে রবীন্দ্র সেতু নামে পরিচিত, এই প্রকৌশল বিস্ময় ১৯৪৩ সাল থেকে হুগলি নদী জুড়ে কলকাতাকে হাওড়ার সাথে সংযুক্ত করে আসছে।",
        history: "পূর্ববর্তী একটি পন্টুন ব্রিজ প্রতিস্থাপনের জন্য ১৯৩৬ সালে সেতুটি চালু করা হয়েছিল। ইংল্যান্ডের ক্লিভল্যান্ড ব্রিজ অ্যান্ড ইঞ্জিনিয়ারিং কোম্পানি দ্বারা নকশা করা, নির্মাণ ১৯৩৬ সালে শুরু হয় এবং ১৯৪২ সালে সম্পন্ন হয়।",
        architecture: "হাওড়া ব্রিজকে সত্যই অসাধারণ করে তোলে যে এটি একটি বাদাম বা বোল্ট ব্যবহার না করেই নির্মিত হয়েছিল! সম্পূর্ণ কাঠামোটি রিভেট দ্বারা একসাথে ধরে রাখা হয়।",
        highlights: "প্রতিদিন, ১০০,০০০+ যানবাহন এবং অগণিত পথচারী এই সেতু পার করে। এটি অনুভব করার সেরা সময় হল ভোরে যখন এর গোড়ায় ফুলের বাজার জেগে ওঠে।",
        conclusion: "হাওড়া ব্রিজ শুধু অবকাঠামোর চেয়ে বেশি কিছু; এটি কলকাতার বাণিজ্য এবং সংস্কৃতির স্পন্দন। এখানে দাঁড়িয়ে, আপনি ইতিহাসের উপর হাঁটছেন।"
      }
    },
    sections: ['intro', 'history', 'architecture', 'highlights', 'conclusion'],
    sectionLabels: {
      en: { intro: 'Introduction', history: 'History', architecture: 'Architecture', highlights: 'Highlights', conclusion: 'Conclusion' },
      bn: { intro: 'পরিচিতি', history: 'ইতিহাস', architecture: 'স্থাপত্য', highlights: 'বিশেষ আকর্ষণ', conclusion: 'উপসংহার' }
    }
  },
  {
    id: 'kumartuli',
    name: 'Kumartuli',
    nameBengali: 'কুমারটুলি',
    image: 'https://images.unsplash.com/photo-1599030641314-e7f9e2f5e8e1?auto=format&fit=crop&w=800&h=500&q=80',
    icon: TerracottaIcon,
    color: '#C45C26',
    duration: '60 min',
    distance: '1.5 km',
    rating: 4.7,
    reviews: 1892,
    location: { lat: 22.6000, lng: 88.3667 },
    narration: {
      en: {
        intro: "Welcome to Kumartuli, the legendary potter's quarter of Kolkata where gods are born from clay. This narrow labyrinth of lanes has been home to generations of artisans who create the magnificent idols for Durga Puja and other festivals.",
        history: "Kumartuli's history dates back to the late 18th century when the zamindars of Shobhabazar invited potters from Krishnanagar to create idols for their Durga Puja celebrations. The artisans settled here, and over 300 years later, their descendants continue the sacred tradition.",
        architecture: "Unlike grand monuments, Kumartuli's beauty lies in its chaos. Narrow lanes open into workshops where bamboo frames transform into divine forms. The air is thick with the scent of wet clay, and the sound of artisans at work creates a symphony of devotion.",
        highlights: "The best time to visit is July to September when the workshops are in full swing preparing for Durga Puja. Watch as skilled hands mold straw and clay into the 10-armed goddess. Each idol takes months to complete and represents centuries of artistic tradition.",
        conclusion: "Kumartuli is where faith meets art, where ordinary clay becomes extraordinary divinity. As you walk these lanes, you're not just seeing craftsmanship; you're witnessing the soul of Bengal's most beloved festival being born."
      },
      bn: {
        intro: "কুমারটুলিতে স্বাগতম, কলকাতার কিংবদন্তি কুমোরপাড়া যেখানে মাটি থেকে দেবতারা জন্ম নেন। গলির এই সরু গোলকধাঁধা প্রজন্মের শিল্পীদের বাসস্থান যারা দুর্গা পূজা এবং অন্যান্য উৎসবের জন্য দর্শনীয় প্রতিমা তৈরি করেন।",
        history: "কুমারটুলির ইতিহাস ১৮ শতকের শেষের দিকে যখন শোভাবাজারের জমিদাররা তাদের দুর্গা পূজা উদযাপনের জন্য প্রতিমা তৈরি করতে কৃষ্ণনগর থেকে কুমোরদের আমন্ত্রণ জানিয়েছিলেন।",
        architecture: "মহৎ স্মৃতিস্তম্ভের বিপরীতে, কুমারটুলির সৌন্দর্য তার বিশৃঙ্খলায়। সরু গলি কর্মশালায় খোলে যেখানে বাঁশের ফ্রেম ঐশ্বরিক রূপে রূপান্তরিত হয়।",
        highlights: "সেরা সময় জুলাই থেকে সেপ্টেম্বর যখন কর্মশালাগুলি দুর্গা পূজার প্রস্তুতিতে ব্যস্ত থাকে। দক্ষ হাতগুলি খড় এবং মাটিকে দশ-সশস্ত্র দেবীতে রূপ দেয় দেখুন।",
        conclusion: "কুমারটুলি হল যেখানে বিশ্বাস শিল্পের সাথে মিলিত হয়, যেখানে সাধারণ মাটি অসাধারণ দেবত্বে পরিণত হয়। এই গলিতে হাঁটতে গিয়ে, আপনি শুধু কারুশিল্প দেখছেন না; আপনি বাংলার সবচেয়ে প্রিয় উৎসবের আত্মার জন্ম প্রত্যক্ষ করছেন।"
      }
    },
    sections: ['intro', 'history', 'architecture', 'highlights', 'conclusion'],
    sectionLabels: {
      en: { intro: 'Introduction', history: 'History', architecture: 'The Workshops', highlights: 'Best Time to Visit', conclusion: 'Conclusion' },
      bn: { intro: 'পরিচিতি', history: 'ইতিহাস', architecture: 'কর্মশালা', highlights: 'সেরা সময়', conclusion: 'উপসংহার' }
    }
  }
];

const HeritageWalk: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState(heritageSites[0]);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<number | null>(null);

  const currentNarration = selectedSite.narration[language];
  const sections = selectedSite.sections;
  const sectionLabels = selectedSite.sectionLabels[language];

  const elevenLabsConfigured = isElevenLabsConfigured();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      voiceService.stopAudio();
    };
  }, []);

  const handlePlay = async () => {
    if (isPlaying) {
      voiceService.stopAudio();
      setIsPlaying(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      return;
    }

    setIsLoading(true);
    const sectionKey = sections[currentSection] as keyof typeof currentNarration;
    const text = currentNarration[sectionKey];

    try {
      if (elevenLabsConfigured) {
        // Use ElevenLabs for premium voice
        const result = await voiceService.textToSpeech(text, {
          language,
          voiceId: language === 'bn' ? 'hindi' : 'english'
        });

        if (result.audioUrl) {
          setIsPlaying(true);
          voiceService.playAudio(result.audioUrl, `heritage-${selectedSite.id}-${currentSection}`, () => {
            setIsPlaying(false);
            // Auto-advance to next section
            if (currentSection < sections.length - 1) {
              setCurrentSection(prev => prev + 1);
            }
          });

          // Simulate progress
          const duration = result.duration || 30;
          let progress = 0;
          progressInterval.current = window.setInterval(() => {
            progress += (100 / duration);
            if (progress >= 100) {
              progress = 100;
              if (progressInterval.current) clearInterval(progressInterval.current);
            }
            setAudioProgress(progress);
          }, 1000);
        }
      } else {
        // Fallback to browser TTS
        setIsPlaying(true);
        voiceService.speakWithBrowserTTS(text, language === 'bn' ? 'hi' : 'en');
        
        // Estimate duration based on text length
        const words = text.split(' ').length;
        const durationMs = (words / 150) * 60 * 1000;
        
        let progress = 0;
        progressInterval.current = window.setInterval(() => {
          progress += (100 / (durationMs / 1000));
          if (progress >= 100) {
            progress = 100;
            setIsPlaying(false);
            if (progressInterval.current) clearInterval(progressInterval.current);
            // Auto-advance
            if (currentSection < sections.length - 1) {
              setCurrentSection(prev => prev + 1);
            }
          }
          setAudioProgress(progress);
        }, 1000);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (index: number) => {
    setCurrentSection(index);
    setAudioProgress(0);
    if (isPlaying) {
      voiceService.stopAudio();
      setIsPlaying(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
  };

  const toggleFavorite = (siteId: string) => {
    setFavorites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BlurFade delay={0.1} inView>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-heritage-500 to-kolkata-sepia rounded-2xl flex items-center justify-center shadow-lg">
              <VictoriaMemorialIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heritage">
                Heritage{' '}
                <AnimatedGradientText className="text-3xl">Walk</AnimatedGradientText>
                {' '}& Audio Guide 🎧
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                AI-narrated tours of Kolkata's heritage • <span className="font-bengali">ঐতিহ্য অডিও গাইড</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ElevenLabs Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              elevenLabsConfigured 
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
                : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
            }`}>
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-medium">
                {elevenLabsConfigured ? 'ElevenLabs AI Voice' : 'Browser TTS'}
              </span>
            </div>

            {/* Language Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-kolkata-yellow text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-4 py-2 text-sm font-medium transition-colors font-bengali ${
                  language === 'bn'
                    ? 'bg-durga-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                🪔 বাংলা
              </button>
            </div>
          </div>
        </div>
      </BlurFade>

      {/* Site Selection Grid */}
      <BlurFade delay={0.2} inView>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {heritageSites.map((site, index) => {
            const IconComponent = site.icon;
            const isSelected = selectedSite.id === site.id;
            const isFavorite = favorites.includes(site.id);

            return (
              <motion.div
                key={site.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedSite(site);
                  setCurrentSection(0);
                  setAudioProgress(0);
                  if (isPlaying) {
                    voiceService.stopAudio();
                    setIsPlaying(false);
                  }
                }}
                className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all ${
                  isSelected ? 'ring-4 ring-kolkata-yellow shadow-2xl' : 'shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="relative h-48">
                  <img
                    src={site.image}
                    alt={site.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(site.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="w-5 h-5 text-kolkata-yellow" />
                      <h3 className="text-white font-semibold text-lg">{site.name}</h3>
                    </div>
                    <p className="text-kolkata-gold text-sm font-bengali">{site.nameBengali}</p>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-white/80 text-xs">
                        <Clock className="w-3 h-3" />
                        {site.duration}
                      </div>
                      <div className="flex items-center gap-1 text-white/80 text-xs">
                        <Star className="w-3 h-3 fill-kolkata-yellow text-kolkata-yellow" />
                        {site.rating}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-kolkata-yellow text-gray-900 rounded-full text-xs font-bold">
                      Now Playing
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </BlurFade>

      {/* Audio Player & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Player */}
        <div className="lg:col-span-2">
          <MagicCard gradientColor={selectedSite.color} gradientOpacity={0.15}>
            <div className="p-6">
              <BorderBeam size={300} duration={20} colorFrom={selectedSite.color} colorTo="#FFB800" />

              {/* Site Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: selectedSite.color }}
                  >
                    <selectedSite.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heritage">
                      {selectedSite.name}
                    </h2>
                    <p className="text-kolkata-terracotta dark:text-kolkata-gold font-bengali text-lg">
                      {selectedSite.nameBengali}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Section Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                {sections.map((section, index) => (
                  <button
                    key={section}
                    onClick={() => handleSectionChange(index)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      currentSection === index
                        ? 'bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {sectionLabels[section as keyof typeof sectionLabels]}
                  </button>
                ))}
              </div>

              {/* Audio Controls */}
              <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 mb-6">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta"
                      style={{ width: `${audioProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Section {currentSection + 1} of {sections.length}</span>
                    <span className="text-xs text-gray-500">{Math.round(audioProgress)}%</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSectionChange(Math.max(0, currentSection - 1))}
                    disabled={currentSection === 0}
                    className="p-3 rounded-full bg-white dark:bg-gray-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <SkipBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlay}
                    disabled={isLoading}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-7 h-7 text-white animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-7 h-7 text-white" />
                    ) : (
                      <Play className="w-7 h-7 text-white ml-1" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSectionChange(Math.min(sections.length - 1, currentSection + 1))}
                    disabled={currentSection === sections.length - 1}
                    className="p-3 rounded-full bg-white dark:bg-gray-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-3 rounded-full bg-white dark:bg-gray-600 shadow-md hover:shadow-lg transition-all"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTranscript(!showTranscript)}
                    className={`p-3 rounded-full shadow-md hover:shadow-lg transition-all ${
                      showTranscript 
                        ? 'bg-kolkata-yellow text-white' 
                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Transcript */}
              <AnimatePresence>
                {showTranscript && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <List className="w-5 h-5 text-kolkata-yellow" />
                        {language === 'en' ? 'Transcript' : 'প্রতিলিপি'}
                      </h3>
                      <button
                        onClick={() => setShowTranscript(false)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${language === 'bn' ? 'font-bengali text-lg' : ''}`}>
                      {currentNarration[sections[currentSection] as keyof typeof currentNarration]}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </MagicCard>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Site Details */}
            <MagicCard gradientColor="#D4A015" gradientOpacity={0.1}>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-kolkata-yellow" />
                  Site Details
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Duration</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedSite.duration}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Distance</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedSite.distance}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-kolkata-yellow text-kolkata-yellow" />
                      <span className="font-medium text-gray-900 dark:text-white">{selectedSite.rating}</span>
                      <span className="text-gray-500 text-sm">({selectedSite.reviews})</span>
                    </div>
                  </div>
                </div>

                <ShimmerButton
                  className="w-full mt-6"
                  background="linear-gradient(135deg, #FFB800 0%, #C45C26 100%)"
                >
                  <Camera className="w-4 h-4" />
                  <span>View Photos</span>
                </ShimmerButton>
              </div>
            </MagicCard>

            {/* AI Voice Info */}
            <MagicCard gradientColor="#22c55e" gradientOpacity={0.1}>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  AI Voice Technology
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {elevenLabsConfigured 
                    ? 'Using ElevenLabs AI for natural, expressive narration in English and Bengali.'
                    : 'Using browser text-to-speech. Add VITE_ELEVENLABS_API_KEY for premium AI voice.'}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Globe className="w-4 h-4 text-kolkata-yellow" />
                  <span className="text-gray-500">Multi-language support: English & Bengali</span>
                </div>
              </div>
            </MagicCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeritageWalk;


