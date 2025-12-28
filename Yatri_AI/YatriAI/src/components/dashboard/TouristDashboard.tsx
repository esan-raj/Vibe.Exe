import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Map, 
  MessageCircle, 
  CreditCard, 
  ShoppingBag, 
  Users, 
  Star, 
  User,
  Calendar,
  Shield,
  TrendingUp,
  LogOut,
  Train,
  Coffee,
  Palette,
  ChefHat,
  Image,
  Award,
  Heart,
  Sun,
  Moon,
  Menu,
  X,
  Navigation,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { bookings } from '../../data/mockData';
import api from '../../lib/api';
import groqService, { Recommendation } from '../../lib/services/groq.service';
import AIItineraryPlanner from './components/AIItineraryPlanner';
import AIChat from './components/AIChat';
import BookingSystem from './components/BookingSystem';
import GuideLocator from './components/GuideLocator';
import FeedbackPortal from './components/FeedbackPortal';
import TransportTracker from './components/TransportTracker';
import AddaBot from './components/AddaBot';
import ArtisanChronicles from './components/ArtisanChronicles';
import RecipeVault from './components/RecipeVault';
import PatachitraArchive from './components/PatachitraArchive';
import VerifiedMarketplace from './components/VerifiedMarketplace';
import HeritageNFT from './components/HeritageNFT';
import PandalDonations from './components/PandalDonations';

import PictureDeck from './components/PictureDeck';
import TravelPlanningDashboard from './components/TravelPlanningDashboard';
import GPSSuggestions from './components/GPSSuggestions';
import SOSAgent from './components/SOSAgent';


const TouristDashboard: React.FC = () => {
  const { t } = useTranslation('translation');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddaBotOpen, setIsAddaBotOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true); // Auto-open sidebar on desktop
      } else {
        setIsSidebarOpen(false); // Auto-close sidebar on mobile
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', labelKey: 'dashboard.menuItems.dashboard', icon: Home },
    { id: 'travel-planning', labelKey: 'dashboard.menuItems.travelPlanning', icon: Calendar, isNew: true },
    { id: 'itinerary', labelKey: 'dashboard.menuItems.aiItinerary', icon: Map },

    { id: 'picture-deck', labelKey: 'dashboard.menuItems.pictureDeck', icon: Image, isNew: true },

    { id: 'gps-suggestions', labelKey: 'dashboard.menuItems.nearbyPlaces', icon: Navigation, isNew: true },

    { id: 'transport', labelKey: 'dashboard.menuItems.transport', icon: Train, isNew: true },
    { id: 'artisans', labelKey: 'dashboard.menuItems.artisanChronicles', icon: Palette, isNew: true },
    { id: 'recipes', labelKey: 'dashboard.menuItems.recipeVault', icon: ChefHat, isNew: true },
    { id: 'patachitra', labelKey: 'dashboard.menuItems.patachitraArchive', icon: Image, isNew: true },
    { id: 'verified-market', labelKey: 'dashboard.menuItems.verifiedMarket', icon: Shield, isNew: true, isBlockchain: true },
    { id: 'heritage-nft', labelKey: 'dashboard.menuItems.heritageNFT', icon: Award, isNew: true, isBlockchain: true },
    { id: 'pandal-donate', labelKey: 'dashboard.menuItems.pandalDonations', icon: Heart, isNew: true, isBlockchain: true },
    { id: 'bookings', labelKey: 'dashboard.menuItems.bookings', icon: CreditCard },
    { id: 'guides', labelKey: 'dashboard.menuItems.findGuides', icon: Users },
    { id: 'feedback', labelKey: 'dashboard.menuItems.feedback', icon: Star },
    { id: 'profile', labelKey: 'dashboard.menuItems.myProfile', icon: User }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome />;
      case 'travel-planning':
        return <TravelPlanningDashboard />;
      case 'itinerary':
        return <AIItineraryPlanner />;

      case 'picture-deck':
        return <PictureDeck />;

      case 'gps-suggestions':
        return <GPSSuggestions />;

      case 'transport':
        return <TransportTracker />;
      case 'artisans':
        return <ArtisanChronicles />;
      case 'recipes':
        return <RecipeVault />;
      case 'patachitra':
        return <PatachitraArchive />;
      case 'verified-market':
        return <VerifiedMarketplace />;
      case 'heritage-nft':
        return <HeritageNFT />;
      case 'pandal-donate':
        return <PandalDonations />;
      case 'bookings':
        return <BookingSystem />;
      case 'guides':
        return <GuideLocator />;
      case 'feedback':
        return <FeedbackPortal />;
      case 'profile':
        return <ProfileManagement />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Burger Menu Button - Mobile */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-kolkata-yellow/10 dark:hover:bg-kolkata-gold/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="w-8 h-8 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">🪔</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-heritage">
              {t('brand.name')}
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-kolkata-terracotta dark:hover:text-kolkata-gold transition-colors rounded-lg hover:bg-kolkata-yellow/10 dark:hover:bg-kolkata-gold/10"
              title={isDark ? t('common.lightMode') : t('common.darkMode')}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            
            {/* User Avatar */}
            <div className="flex items-center space-x-2">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-kolkata-yellow"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">{user?.name}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Backdrop - Mobile */}
        <AnimatePresence>
          {isSidebarOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || !isMobile) && (
            <motion.aside
              initial={isMobile ? { x: '-100%' } : false}
              animate={isMobile ? { x: 0 } : false}
              exit={isMobile ? { x: '-100%' } : false}
              transition={{ type: 'tween', duration: 0.3 }}
              className={`fixed lg:fixed lg:top-[60px] lg:left-0 lg:bottom-0 left-0 h-[calc(100vh-60px)] w-64 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto z-50 lg:z-auto flex-shrink-0`}
            >
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <SOSAgent />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">SOS Agent</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Emergency Assistant</p>
                    </div>
                  </div>
                </div>
              </div>

              <nav className="p-4 flex flex-col h-[calc(100%-5rem)]">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    const isNewFeature = 'isNew' in item && item.isNew;
                    const isBlockchain = 'isBlockchain' in item && item.isBlockchain;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (isMobile) setIsSidebarOpen(false); // Close sidebar on mobile after selection
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors mb-2 ${
                          activeTab === item.id
                            ? 'bg-gradient-to-r from-kolkata-yellow/20 to-kolkata-terracotta/20 text-kolkata-terracotta dark:text-kolkata-gold border border-kolkata-yellow/30'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 flex-shrink-0 ${isNewFeature ? 'text-kolkata-terracotta' : ''} ${isBlockchain ? 'text-purple-500' : ''}`} />
                        <span className="font-medium flex-1 text-sm">{t(item.labelKey)}</span>
                        {isBlockchain ? (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                            ⛓️
                          </span>
                        ) : isNewFeature && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-kolkata-yellow to-durga-500 text-white text-xs font-bold rounded-full animate-pulse flex-shrink-0">
                            {t('common.new')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={() => {
                    handleLogout();
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{t('auth.logout')}</span>
                </button>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 w-full lg:w-auto overflow-y-auto overflow-x-hidden min-h-0 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col-reverse gap-3 z-50">
        {/* Adda Bot Button - Kolkata Personality Chat */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddaBotOpen(true)}
          className="bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative group"
          title="Adda Bot - Kolkata Chat"
        >
          <Coffee className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-durga-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-durga-500 rounded-full" />
          
          {/* Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Adda Bot ☕
          </span>
        </motion.button>

        {/* AI Chat Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          title="AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
          
          {/* Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Assistant 🤖
          </span>
        </motion.button>
      </div>

      {/* AI Chat Modal */}
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      {/* Adda Bot Modal */}
      <AddaBot isOpen={isAddaBotOpen} onClose={() => setIsAddaBotOpen(false)} />
    </div>
  );
};

// Dashboard Home Component
const DashboardHome: React.FC = () => {
  const { t } = useTranslation('translation');
  const { user } = useAuth();
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [userItineraries, setUserItineraries] = useState<any[]>([]);
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([]);
  const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [stats, setStats] = useState([
    { labelKey: 'dashboard.stats.placesVisited', value: '0', icon: Map, color: 'from-kolkata-yellow to-kolkata-gold' },
    { labelKey: 'dashboard.stats.totalBookings', value: '0', icon: Calendar, color: 'from-kolkata-terracotta to-durga-500' },
    { labelKey: 'dashboard.stats.upcomingTrips', value: '0', icon: Star, color: 'from-kolkata-hooghly to-kolkata-blue' },
    { labelKey: 'dashboard.stats.savedPlaces', value: '0', icon: TrendingUp, color: 'from-heritage-500 to-kolkata-sepia' }
  ]);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
    fetchRecommendations();
  }, []);

  // Helper function to calculate and update stats
  const calculateAndUpdateStats = (fetchedBookings: any[], fetchedItineraries: any[]) => {
    // Calculate stats with case-insensitive status comparison
    const confirmedBookings = fetchedBookings.filter((b: any) => 
      b.status && b.status.toLowerCase() === 'confirmed'
    );
    const upcomingBookings = fetchedBookings.filter((b: any) => {
      if (!b.status || b.status.toLowerCase() !== 'confirmed') return false;
      try {
        // Parse booking date and set to start of day for comparison
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        
        // Get today's date at start of day for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Booking is upcoming if date is today or in the future
        const isUpcoming = bookingDate >= today;
        
        console.log(`📅 Booking "${b.title}": date=${b.date}, parsed=${bookingDate.toISOString()}, today=${today.toISOString()}, isUpcoming=${isUpcoming}`);
        
        return isUpcoming;
      } catch (error) {
        console.error(`❌ Error parsing booking date for "${b.title}":`, error);
        return false;
      }
    });
    
    console.log(`📊 Stats calculation: ${fetchedBookings.length} total bookings, ${confirmedBookings.length} confirmed, ${upcomingBookings.length} upcoming`);

    // Count unique places visited from itineraries
    const visitedPlaces = new Set<string>();
    fetchedItineraries.forEach((itinerary: any) => {
      if (itinerary.destinations && Array.isArray(itinerary.destinations)) {
        itinerary.destinations.forEach((dest: any) => {
          if (dest.id) visitedPlaces.add(dest.id);
        });
      }
    });

    // Update stats
    setStats([
      { 
        labelKey: 'dashboard.stats.placesVisited', 
        value: visitedPlaces.size.toString(), 
        icon: Map, 
        color: 'from-kolkata-yellow to-kolkata-gold' 
      },
      { 
        labelKey: 'dashboard.stats.totalBookings', 
        value: confirmedBookings.length.toString(), 
        icon: Calendar, 
        color: 'from-kolkata-terracotta to-durga-500' 
      },
      { 
        labelKey: 'dashboard.stats.upcomingTrips', 
        value: upcomingBookings.length.toString(), 
        icon: Star, 
        color: 'from-kolkata-hooghly to-kolkata-blue' 
      },
      { 
        labelKey: 'dashboard.stats.savedPlaces', 
        value: visitedPlaces.size.toString(), // Using visited places as saved places for now
        icon: TrendingUp, 
        color: 'from-heritage-500 to-kolkata-sepia' 
      }
    ]);
  };

  const fetchUserData = async () => {
    setIsLoadingStats(true);
    let fetchedBookings: any[] = [];
    let fetchedItineraries: any[] = [];
    
    try {
      // Fetch bookings
      const bookingsResponse = await api.getMyBookings();
      console.log('📊 Bookings API Response:', bookingsResponse);
      fetchedBookings = bookingsResponse.success && bookingsResponse.data ? bookingsResponse.data : [];
      console.log(`✅ Loaded ${fetchedBookings.length} bookings, ${fetchedBookings.filter((b: any) => b.status?.toLowerCase() === 'confirmed').length} confirmed`);
      setUserBookings(fetchedBookings);

      // Fetch itineraries
      const itinerariesResponse = await api.getMyItineraries();
      console.log('🗺️ Itineraries API Response:', itinerariesResponse);
      fetchedItineraries = itinerariesResponse.success && itinerariesResponse.data ? itinerariesResponse.data : [];
      console.log(`✅ Loaded ${fetchedItineraries.length} itineraries`);
      setUserItineraries(fetchedItineraries);
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      // Fallback to mock data on error
      fetchedBookings = bookings;
      fetchedItineraries = [];
      console.log(`🔄 Using fallback mock data: ${fetchedBookings.length} bookings`);
      setUserBookings(bookings);
      setUserItineraries([]);
    } finally {
      // Always calculate stats regardless of API success/failure
      calculateAndUpdateStats(fetchedBookings, fetchedItineraries);
      setIsLoadingStats(false);
    }
  };

  const fetchRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const response = await groqService.getAllRecommendations();

      if (response.success && response.recommendations) {
        setAllRecommendations(response.recommendations);
        setCurrentRecommendationIndex(0); // Start from the beginning
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleRefreshRecommendations = () => {
    // Cycle to the next 3 recommendations
    if (allRecommendations.length > 0) {
      const nextIndex = (currentRecommendationIndex + 3) % allRecommendations.length;
      setCurrentRecommendationIndex(nextIndex);
    } else {
      // If no recommendations loaded yet, fetch them
      fetchRecommendations();
    }
  };

  // Get current 3 recommendations to display
  const getCurrentRecommendations = (): Recommendation[] => {
    if (allRecommendations.length === 0) return [];
    
    const recommendations: Recommendation[] = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentRecommendationIndex + i) % allRecommendations.length;
      recommendations.push(allRecommendations[index]);
    }
    return recommendations;
  };

  const currentRecommendations = getCurrentRecommendations();

  // Get category gradient colors
  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      heritage: 'from-heritage-50 to-kolkata-cream dark:from-heritage-900/20 dark:to-heritage-900/10',
      culture: 'from-durga-50 to-durga-100/50 dark:from-durga-900/20 dark:to-durga-900/10',
      food: 'from-kolkata-yellow/20 to-kolkata-terracotta/10 dark:from-kolkata-yellow/10 dark:to-kolkata-terracotta/5',
      nature: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10',
      adventure: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10',
      spiritual: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/10',
    };
    return gradients[category] || 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700';
  };

  const getCategoryBorder = (category: string) => {
    const borders: Record<string, string> = {
      heritage: 'border-heritage-200/30',
      culture: 'border-durga-200/30',
      food: 'border-kolkata-yellow/20',
      nature: 'border-green-200/30',
      adventure: 'border-blue-200/30',
      spiritual: 'border-purple-200/30',
    };
    return borders[category] || 'border-gray-200 dark:border-gray-700';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-heritage">
          {t('dashboard.welcome')}, {user?.name}! 🪔
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('dashboard.overview.title')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-kolkata-yellow/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t(stat.labelKey)}</p>
                  {isLoadingStats ? (
                    <Loader2 className="w-6 h-6 animate-spin text-kolkata-terracotta" />
                  ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.overview.recentBookings')}</h3>
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-kolkata-terracotta" />
            </div>
          ) : userBookings.length > 0 ? (
          <div className="space-y-4">
              {userBookings.slice(0, 3).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{booking.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{booking.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-kolkata-yellow/20 dark:bg-kolkata-yellow/10 text-kolkata-terracotta dark:text-kolkata-gold'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No bookings yet</p>
            </div>
          )}
        </div>

        {/* AI Recommendations - Real-time from Groq */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard.overview.recommendedPlaces')}
            </h3>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefreshRecommendations}
              disabled={isLoadingRecommendations}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-kolkata-terracotta dark:hover:text-kolkata-gold transition-colors rounded-lg hover:bg-kolkata-yellow/10 dark:hover:bg-kolkata-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh recommendations"
            >
              {isLoadingRecommendations ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          {isLoadingRecommendations && allRecommendations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-kolkata-terracotta" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading recommendations...</span>
            </div>
          ) : currentRecommendations.length > 0 ? (
            <div className="space-y-4">
              {currentRecommendations.map((rec, index) => (
                <motion.div
                  key={`${currentRecommendationIndex}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 bg-gradient-to-r ${getCategoryGradient(rec.category)} rounded-lg border ${getCategoryBorder(rec.category)}`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {rec.icon} {rec.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                </motion.div>
              ))}
              {allRecommendations.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  Showing {currentRecommendationIndex + 1}-{Math.min(currentRecommendationIndex + 3, allRecommendations.length)} of {allRecommendations.length} recommendations
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Map className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recommendations available</p>
              <button
                onClick={fetchRecommendations}
                className="mt-4 text-sm text-kolkata-terracotta dark:text-kolkata-gold hover:underline"
              >
                Load recommendations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Profile Management Component
const ProfileManagement: React.FC = () => {
  const { t } = useTranslation('translation');
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.menuItems.myProfile')}</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {isEditing ? t('common.save') : t('common.edit')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('auth.fullName')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('auth.fullName')}</label>
              <input
                type="text"
                value={user?.name}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('auth.email')}</label>
              <input
                type="email"
                value={user?.email}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('dashboard.menuItems.myProfile')}</h3>
          <div className="text-center">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
            />
            {isEditing && (
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                {t('common.edit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristDashboard;
