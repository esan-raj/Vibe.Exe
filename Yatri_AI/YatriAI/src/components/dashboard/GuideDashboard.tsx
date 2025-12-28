import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map, 
  Calendar, 
  Users, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  Star,
  Clock,
  DollarSign,
  Trash2,
  X,
  Search,
  LogOut,
  MessageCircle,
  Headphones,
  Award,
  Sun,
  Moon,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { guideTours, guideBookings } from '../../data/mockData';
import api from '../../lib/api';

const GuideDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: TrendingUp, color: 'from-kolkata-yellow to-kolkata-gold' },
    { id: 'tours', label: 'My Heritage Tours', icon: Map, color: 'from-kolkata-terracotta to-durga-500' },
    { id: 'bookings', label: 'Manage Bookings', icon: Calendar, color: 'from-heritage-500 to-kolkata-sepia' },
    { id: 'profile', label: 'Guide Profile', icon: Users, color: 'from-kolkata-hooghly to-kolkata-blue' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <GuideDashboardHome />;
      case 'tours':
        return <MyTours />;
      case 'bookings':
        return <ManageBookings />;
      case 'profile':
        return <GuideProfile />;
      default:
        return <GuideDashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-kolkata-cream/30 to-heritage-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300 flex flex-col">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-lg flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white font-heritage">
              YatriAI - Guide
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-kolkata-terracotta dark:hover:text-kolkata-gold transition-colors rounded-lg hover:bg-kolkata-yellow/10 dark:hover:bg-kolkata-gold/10"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-72 bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl h-[calc(100vh-60px)] fixed top-[60px] left-0 bottom-0 overflow-y-auto border-r border-kolkata-yellow/20 flex-shrink-0"
        >
          {/* Header */}
          <div className="p-6 border-b border-kolkata-yellow/20 bg-gradient-to-r from-kolkata-yellow/10 to-heritage-500/10">
            <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-700/60 rounded-xl">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-kolkata-yellow/50"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-3 h-3 text-kolkata-gold fill-current" />
                  <span className="text-kolkata-terracotta dark:text-kolkata-gold font-medium">4.8 Rating • Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex flex-col h-[calc(100%-12rem)]">
            <div className="flex-1 space-y-2">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 group ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-kolkata-yellow/20`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-kolkata-yellow/10 hover:to-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : `bg-gradient-to-r ${item.color} bg-opacity-10`}`}>
                      <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-kolkata-terracotta dark:text-kolkata-gold'}`} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="guideActiveIndicator"
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
            
            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium">Logout</span>
            </motion.button>
          </nav>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden ml-72">
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col-reverse gap-3 z-50">
        {/* AI Assistant Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative group"
          title="AI Tour Assistant"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-durga-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-durga-500 rounded-full" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Assistant 🤖
          </span>
        </motion.button>
      </div>
    </div>
  );
};

// Guide Dashboard Home Component with Kolkata Theme
const GuideDashboardHome: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Heritage Tours', value: guideTours.filter(t => t.status === 'Active').length.toString(), icon: Map, color: 'from-kolkata-yellow to-kolkata-gold', bgPattern: '🏛️' },
    { label: 'Total Bookings', value: guideBookings.length.toString(), icon: Calendar, color: 'from-kolkata-terracotta to-durga-500', bgPattern: '🚃' },
    { label: 'This Month Revenue', value: '₹25,000', icon: DollarSign, color: 'from-heritage-500 to-kolkata-sepia', bgPattern: '🪔' },
    { label: 'Average Rating', value: '4.8', icon: Star, color: 'from-kolkata-hooghly to-kolkata-blue', bgPattern: '⭐' }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Welcome back, {user?.name}! 
          <span className="text-2xl">🚃</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Here's what's happening with your heritage tours in the City of Joy
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10 overflow-hidden group"
            >
              <span className="absolute -right-2 -bottom-2 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
                {stat.bgPattern}
              </span>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10"
        >
          <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-kolkata-terracotta" />
            Recent Bookings
          </h3>
          <div className="space-y-4">
            {guideBookings.slice(0, 3).map((booking, index) => (
              <motion.div 
                key={booking.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-kolkata-yellow/5 to-transparent rounded-xl hover:from-kolkata-yellow/10 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{booking.touristName}</p>
                  <p className="text-sm text-kolkata-sepia dark:text-gray-400">{booking.tourName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{booking.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'Confirmed' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : booking.status === 'Pending'
                    ? 'bg-kolkata-yellow/20 dark:bg-kolkata-yellow/10 text-kolkata-terracotta dark:text-kolkata-gold'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {booking.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tour Performance */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10"
        >
          <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-kolkata-terracotta" />
            Tour Performance
          </h3>
          <div className="space-y-4">
            <TourPerformanceList />
          </div>
        </motion.div>
      </div>

      {/* Kolkata Tips for Guides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10"
      >
        <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          🪔 Kolkata Guide Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-kolkata-yellow/10 to-transparent rounded-xl">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">🚃 Tram Heritage</p>
            <p className="text-sm text-kolkata-sepia dark:text-gray-400">Include tram rides in your Victoria Memorial tours</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-durga-50 to-transparent dark:from-durga-900/20 rounded-xl">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">🎭 Pujo Season</p>
            <p className="text-sm text-kolkata-sepia dark:text-gray-400">Pandal hopping tours are trending - add more!</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-heritage-50 to-transparent dark:from-heritage-900/20 rounded-xl">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">☕ Adda Culture</p>
            <p className="text-sm text-kolkata-sepia dark:text-gray-400">Add coffee house stops for authentic experiences</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function to replace Jharkhand with Kolkata and Betla with Sundarbans in tour data
const sanitizeTourData = (tour: any) => {
  return {
    ...tour,
    title: tour.title?.replace(/Jharkhand/gi, 'Kolkata').replace(/Betla/gi, 'Sundarbans') || tour.title,
    description: tour.description?.replace(/Jharkhand/gi, 'Kolkata').replace(/Betla/gi, 'Sundarbans') || tour.description
  };
};

// My Tours Component with Kolkata Theme
const MyTours: React.FC = () => {
  const [tours, setTours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in and try again.');
        setIsLoading(false);
        return;
      }
      
      const response = await api.getMyTours();
      console.log('Tours API response:', response);
      
      // Handle response - API client returns the data directly
      if (response && response.success !== false) {
        // Response could be { success: true, data: [...] } or just the array
        const toursData = Array.isArray(response) 
          ? response 
          : (response.data || (response.success ? [] : null));
        
        if (toursData !== null) {
          // Replace Jharkhand with Kolkata in all tours
          setTours(toursData.map(sanitizeTourData));
        } else {
          setError(response.message || 'Failed to load tours');
        }
      } else {
        setError(response?.message || 'Failed to load tours');
      }
    } catch (err: any) {
      console.error('Error fetching tours:', err);
      let errorMessage = 'Failed to load tours. ';
      
      if (err?.message?.includes('No token provided') || err?.message?.includes('Not authenticated')) {
        errorMessage += 'You are not logged in. Please log out and log back in.';
      } else if (err?.message) {
        errorMessage += err.message;
      } else if (err?.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tourId: string) => {
    if (!window.confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return;
    }
    try {
      await api.deleteTour(tourId);
      await fetchTours();
      alert('Tour deleted successfully');
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Failed to delete tour');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            My Heritage Tours
            <span className="text-2xl">🏛️</span>
          </h1>
          <p className="text-kolkata-sepia dark:text-gray-400">
            Manage your Kolkata heritage tour offerings
          </p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Tour</span>
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-heritage-500" />
        </div>
      ) : tours.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg text-center border border-heritage-500/10">
          <Map className="w-16 h-16 text-heritage-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-2">
            No Tours Yet
          </h3>
          <p className="text-kolkata-sepia dark:text-gray-400 mb-4">
            Create your first heritage tour to get started
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white px-5 py-2.5 rounded-xl shadow-lg"
          >
            Create Tour
          </motion.button>
        </div>
      ) : (
        <>
          {/* Tours Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour, index) => {
              const sanitizedTour = sanitizeTourData(tour);
              return (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-kolkata-yellow/10 group"
              >
                <div className="relative">
                  <img
                    src={sanitizedTour.image || 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={sanitizedTour.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex gap-2 flex-wrap">
                    {sanitizedTour.approved === false && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-yellow-500/80 text-white">
                        Pending Approval
                      </span>
                    )}
                    {sanitizedTour.approved === true && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-green-500/80 text-white">
                        ✓ Approved
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      sanitizedTour.status === 'Active'
                        ? 'bg-blue-500/80 text-white'
                        : 'bg-gray-500/80 text-white'
                    }`}>
                      {sanitizedTour.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold font-heritage text-gray-900 dark:text-white mb-2">
                    {sanitizedTour.title}
                  </h3>
                  
                  <p className="text-kolkata-sepia dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {sanitizedTour.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1 bg-kolkata-yellow/10 px-2 py-1 rounded-lg">
                      <Clock className="w-4 h-4 text-kolkata-terracotta" />
                      {sanitizedTour.duration}
                    </div>
                    <div className="flex items-center gap-1 bg-heritage-50 dark:bg-heritage-900/20 px-2 py-1 rounded-lg">
                      <DollarSign className="w-4 h-4 text-heritage-500" />
                      ₹{sanitizedTour.price}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-kolkata-sepia dark:text-gray-400">
                      {sanitizedTour.bookings} bookings
                    </span>
                    <div className="flex items-center text-kolkata-gold">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      4.8
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedTour(sanitizedTour);
                        setShowViewModal(true);
                      }}
                      className="flex-1 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white px-3 py-2.5 rounded-xl text-sm font-medium shadow-lg flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedTour(sanitizedTour);
                        setShowEditModal(true);
                      }}
                      className="flex-1 border border-kolkata-yellow/30 text-kolkata-terracotta dark:text-kolkata-gold px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-kolkata-yellow/10 transition-colors flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDelete(tour.id)}
                      className="px-3 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Tour Modal */}
      {showAddModal && (
        <AddTourModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (tourData) => {
            try {
              // Client-side validation
              if (!tourData.title || !tourData.description || !tourData.duration || !tourData.price || !tourData.image) {
                alert('Please fill in all required fields');
                return;
              }

              if (isNaN(Number(tourData.price)) || Number(tourData.price) <= 0) {
                alert('Price must be a positive number');
                return;
              }

              const response = await api.createTour({
                title: tourData.title.trim(),
                description: tourData.description.trim(),
                duration: tourData.duration.trim(),
                price: Number(tourData.price),
                image: tourData.image.trim()
              });
              
              if (response.success) {
                await fetchTours();
                setShowAddModal(false);
                alert('Tour created successfully! It will be visible after admin approval.');
              } else {
                alert(response.message || 'Failed to create tour');
              }
            } catch (error: any) {
              console.error('Error creating tour:', error);
              alert(error?.message || 'Failed to create tour. Please try again.');
            }
          }}
        />
      )}

      {/* Edit Tour Modal */}
      {showEditModal && selectedTour && (
        <EditTourModal
          tour={selectedTour}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTour(null);
          }}
          onUpdate={async (tourData) => {
            try {
              const response = await api.updateTour(selectedTour.id, {
                title: tourData.title,
                description: tourData.description,
                duration: tourData.duration,
                price: Number(tourData.price),
                image: tourData.image
              });
              if (response.success) {
                await fetchTours();
                setShowEditModal(false);
                setSelectedTour(null);
                alert('Tour updated successfully');
              } else {
                alert('Failed to update tour');
              }
            } catch (error: any) {
              console.error('Error updating tour:', error);
              alert(error?.message || 'Failed to update tour');
            }
          }}
        />
      )}

      {/* View Tour Modal */}
      {showViewModal && selectedTour && (
        <ViewTourModal
          tour={selectedTour}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTour(null);
          }}
        />
      )}
    </div>
  );
};

// Booking type for proper TypeScript typing
interface GuideBooking {
  id: string;
  tourName: string;
  touristName: string;
  touristEmail: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  amount: number;
  participants: number;
}

// Tour Performance List Component
const TourPerformanceList: React.FC = () => {
  const [tours, setTours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await api.getMyTours();
        if (response.success && response.data) {
          setTours(response.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching tours:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8 text-kolkata-sepia dark:text-gray-400">Loading...</div>;
  }

  if (tours.length === 0) {
    return <div className="text-center py-8 text-kolkata-sepia dark:text-gray-400">No tours yet</div>;
  }

  return (
    <>
      {tours.map((tour: any, index: number) => (
        <motion.div 
          key={tour.id} 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + index * 0.1 }}
          className="p-4 bg-gradient-to-r from-heritage-50 to-transparent dark:from-heritage-900/20 dark:to-transparent rounded-xl hover:from-heritage-100 dark:hover:from-heritage-900/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-gray-900 dark:text-white">{tour.title}</p>
            <span className="text-sm text-kolkata-terracotta dark:text-kolkata-gold font-semibold">₹{tour.price}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-kolkata-sepia dark:text-gray-400">
            <span>{tour.bookings || 0} bookings</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              tour.status === 'Active'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}>
              {tour.status}
            </span>
          </div>
        </motion.div>
      ))}
    </>
  );
};

// Manage Bookings Component with Kolkata Theme
const ManageBookings: React.FC = () => {
  const [bookings, setBookings] = useState<GuideBooking[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMyGuideProfile();
      if (response.success && response.data && response.data.bookings) {
        setBookings(response.data.bookings.map((b: any) => ({
          id: b.id,
          tourName: b.tourName,
          touristName: b.touristName,
          touristEmail: b.touristEmail,
          date: b.date,
          status: b.status,
          amount: b.amount || 0,
          participants: b.participants || 1
        })));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.touristName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.tourName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || 
                         booking.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = async (bookingId: string, newStatus: 'confirmed' | 'pending' | 'cancelled') => {
    try {
      const response = await api.updateGuideBookingStatus(bookingId, newStatus);
      if (response.success) {
        await fetchBookings();
      } else {
        alert('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Manage Bookings
          <span className="text-2xl">📅</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Review and manage heritage tour bookings
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-kolkata-sepia w-5 h-5" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-kolkata-yellow/30 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-kolkata-yellow focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          {['All', 'Confirmed', 'Pending', 'Cancelled'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-kolkata-yellow/10 border border-kolkata-yellow/20'
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Bookings Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-kolkata-yellow/10"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-kolkata-yellow/10 to-kolkata-terracotta/10">
              <tr>
                {['Tourist', 'Tour', 'Date', 'Participants', 'Amount', 'Status', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-kolkata-terracotta dark:text-kolkata-gold uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-kolkata-yellow/10">
              {filteredBookings.map((booking, index) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="hover:bg-kolkata-yellow/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {booking.touristName}
                      </div>
                      <div className="text-sm text-kolkata-sepia dark:text-gray-400">
                        {booking.touristEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                      {booking.tourName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-kolkata-sepia dark:text-gray-400">
                    {new Date(booking.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-kolkata-sepia dark:text-gray-400">
                    {booking.participants}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-kolkata-terracotta dark:text-kolkata-gold">
                    ₹{booking.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'Confirmed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : booking.status === 'Pending'
                        ? 'bg-kolkata-yellow/20 dark:bg-kolkata-yellow/10 text-kolkata-terracotta dark:text-kolkata-gold'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.status.toLowerCase()}
                      onChange={(e) => {
                        const newStatus = e.target.value as 'confirmed' | 'pending' | 'cancelled';
                        handleStatusChange(booking.id, newStatus);
                      }}
                      className="text-sm bg-kolkata-yellow/10 border border-kolkata-yellow/30 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-kolkata-yellow"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

// Guide Profile Component with Kolkata Theme
const GuideProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white flex items-center gap-3">
            Guide Profile
            <span className="text-2xl">🎭</span>
          </h1>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white px-5 py-2.5 rounded-xl shadow-lg"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10"
        >
          <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-kolkata-terracotta" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={user?.name}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl border border-kolkata-yellow/30 bg-kolkata-yellow/5 dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 focus:ring-2 focus:ring-kolkata-yellow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl border border-kolkata-yellow/30 bg-kolkata-yellow/5 dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 focus:ring-2 focus:ring-kolkata-yellow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Location</label>
              <input
                type="text"
                defaultValue="Kolkata, West Bengal"
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl border border-kolkata-yellow/30 bg-kolkata-yellow/5 dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 focus:ring-2 focus:ring-kolkata-yellow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Experience (Years)</label>
              <input
                type="number"
                defaultValue="8"
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl border border-kolkata-yellow/30 bg-kolkata-yellow/5 dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 focus:ring-2 focus:ring-kolkata-yellow"
              />
            </div>
          </div>
        </motion.div>

        {/* Profile Picture & Stats */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10"
          >
            <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-6">Profile Picture</h3>
            <div className="text-center">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-32 h-32 rounded-2xl object-cover mx-auto mb-4 ring-4 ring-kolkata-yellow/30"
              />
              {isEditing && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white px-4 py-2 rounded-xl shadow-lg"
                >
                  Change Photo
                </motion.button>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10"
          >
            <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-4">Guide Stats</h3>
            <div className="space-y-4">
              {[
                { label: 'Rating', value: '4.8', icon: Star, highlight: true },
                { label: 'Total Tours', value: '3', icon: Map },
                { label: 'Total Bookings', value: '47', icon: Calendar },
                { label: 'Member Since', value: 'Jan 2024', icon: Award },
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-kolkata-yellow/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <stat.icon className={`w-4 h-4 ${stat.highlight ? 'text-kolkata-gold fill-current' : 'text-kolkata-terracotta'}`} />
                    <span className="text-kolkata-sepia dark:text-gray-400">{stat.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Tour Modal Components
type TourPayload = { title: string; description: string; duration: string; price: string; image: string };

const AddTourModal: React.FC<{ onClose: () => void; onAdd: (payload: TourPayload) => void }> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState<TourPayload>({
    title: '',
    description: '',
    duration: '',
    price: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData({ ...formData, image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.duration || !formData.price || !formData.image) {
      alert('Please fill in all fields');
      return;
    }
    onAdd(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-heritage-500/20 flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-heritage-500/10 flex-shrink-0">
          <h2 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-heritage-500" />
            Create New Tour
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Tour Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Victoria Memorial Heritage Walk"
                className="w-full px-4 py-3 border border-heritage-500/30 rounded-xl bg-heritage-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-heritage-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe your heritage tour..."
                className="w-full px-4 py-3 border border-heritage-500/30 rounded-xl bg-heritage-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-heritage-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Duration *</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 3 hours"
                  className="w-full px-4 py-3 border border-heritage-500/30 rounded-xl bg-heritage-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-heritage-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="2000"
                  className="w-full px-4 py-3 border border-heritage-500/30 rounded-xl bg-heritage-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-heritage-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Tour Image *</label>
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-heritage-500/30 mb-2">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData({ ...formData, image: '' });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-heritage-500/30 rounded-xl p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="tour-image-upload"
                  />
                  <label htmlFor="tour-image-upload" className="cursor-pointer">
                    <Map className="w-12 h-12 text-heritage-500 mx-auto mb-2" />
                    <p className="text-sm text-kolkata-sepia dark:text-gray-400">Click to upload tour image</p>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-heritage-500/10">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white px-4 py-3 rounded-xl shadow-lg"
            >
              Create Tour
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const EditTourModal: React.FC<{ tour: any; onClose: () => void; onUpdate: (payload: TourPayload) => void }> = ({ tour, onClose, onUpdate }) => {
  const sanitizedTour = sanitizeTourData(tour);
  const [formData, setFormData] = useState<TourPayload>({
    title: sanitizedTour.title || '',
    description: sanitizedTour.description || '',
    duration: sanitizedTour.duration || '',
    price: sanitizedTour.price?.toString() || '',
    image: sanitizedTour.image || ''
  });
  const [imagePreview, setImagePreview] = useState<string>(sanitizedTour.image || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData({ ...formData, image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-heritage-500/20 flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-heritage-500/10 flex-shrink-0">
          <h2 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white flex items-center gap-2">
            <Edit className="w-5 h-5 text-heritage-500" />
            Edit Tour
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Tour Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-heritage-500/30 rounded-xl bg-heritage-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-heritage-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-heritage-500/30 rounded-xl bg-heritage-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-heritage-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Duration *</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-heritage-500/30 rounded-xl bg-heritage-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-heritage-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-heritage-500/30 rounded-xl bg-heritage-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-heritage-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-kolkata-sepia dark:text-gray-300 mb-2">Tour Image *</label>
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-heritage-500/30 mb-2">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData({ ...formData, image: '' });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-heritage-500/30 rounded-xl bg-heritage-50/50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-heritage-500/10">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white px-4 py-3 rounded-xl shadow-lg"
            >
              Update Tour
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ViewTourModal: React.FC<{ tour: any; onClose: () => void }> = ({ tour, onClose }) => {
  const sanitizedTour = sanitizeTourData(tour);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-heritage-500/20 flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-heritage-500/10 flex-shrink-0">
          <h2 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-heritage-500" />
            Tour Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-heritage-500/30">
              <img
                src={sanitizedTour.image || 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={sanitizedTour.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-heritage text-gray-900 dark:text-white mb-2">{sanitizedTour.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{sanitizedTour.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-heritage-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-1">Duration</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{sanitizedTour.duration}</p>
                </div>
                <div className="p-4 bg-heritage-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-1">Price</p>
                  <p className="text-2xl font-bold text-heritage-600 dark:text-kolkata-gold">₹{sanitizedTour.price?.toLocaleString() || '0'}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {sanitizedTour.approved === false && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/80 text-white">
                    Pending Approval
                  </span>
                )}
                {sanitizedTour.approved === true && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/80 text-white">
                    ✓ Approved
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  sanitizedTour.status === 'Active' ? 'bg-blue-500/80 text-white' : 'bg-gray-500/80 text-white'
                }`}>
                  {sanitizedTour.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GuideDashboard;
