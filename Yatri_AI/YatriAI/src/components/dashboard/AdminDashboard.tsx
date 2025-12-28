import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Search,
  Calendar,
  Star,
  DollarSign,
  ShieldCheck,
  Building,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Bell,
  Settings,
  Activity,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
  Eye,
  Trash2,
  Map,
  Clock,
  X,
  BookOpen,
  Image,
  Award,
  ChefHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { adminUsers } from '../../data/mockData';
import api from '../../lib/api';

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('analytics');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <ManageUsers />;
      case 'guides':
        return <ManageGuides />;
      case 'vendors':
        return <ManageVendors />;
      case 'products':
        return <ManageProducts />;
      case 'tours':
        return <ManageTours />;
      case 'recipes':
        return <ManageRecipes />;
      case 'artisans':
        return <ManageArtisans />;
      case 'patachitra':
        return <ManagePatachitra />;
      case 'feedback':
        return <ManageFeedback />;
      default:
        return <Analytics />;
    }
  };

  const navItems = [
    { id: 'analytics', label: 'Analytics', icon: LayoutDashboard, color: 'from-kolkata-yellow to-kolkata-gold' },
    { id: 'users', label: 'Manage Users', icon: Users, color: 'from-kolkata-terracotta to-durga-500' },
    { id: 'guides', label: 'Manage Guides', icon: ShieldCheck, color: 'from-heritage-500 to-kolkata-sepia' },
    { id: 'vendors', label: 'Manage Vendors', icon: Building, color: 'from-kolkata-hooghly to-kolkata-blue' },
    { id: 'products', label: 'Product Verification', icon: Package, color: 'from-purple-500 to-pink-600' },
    { id: 'tours', label: 'Tour Verification', icon: Map, color: 'from-blue-500 to-cyan-600' },
    { id: 'recipes', label: 'Recipe Approval', icon: BookOpen, color: 'from-orange-500 to-red-600' },
    { id: 'artisans', label: 'Artisan Approval', icon: Award, color: 'from-amber-500 to-yellow-600' },
    { id: 'patachitra', label: 'Patachitra Approval', icon: Image, color: 'from-indigo-500 to-purple-600' },
    { id: 'feedback', label: 'Manage Feedback', icon: MessageCircle, color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-kolkata-cream/30 to-heritage-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300 flex flex-col">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white font-heritage">
              YatriAI - Admin
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
                src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
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
        <motion.aside 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-72 bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl h-[calc(100vh-60px)] fixed top-[60px] left-0 bottom-0 overflow-y-auto border-r border-kolkata-yellow/20 flex-shrink-0"
        >
          {/* Header */}
          <div className="p-6 border-b border-kolkata-yellow/20 bg-gradient-to-r from-kolkata-yellow/10 to-durga-500/10">
            <div className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-700/60 rounded-xl">
              <img
                src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
                alt={user?.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-kolkata-yellow/50"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-kolkata-terracotta dark:text-kolkata-gold font-medium">🛡️ Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex flex-col h-[calc(100%-12rem)]">
            <div className="flex-1 space-y-2">
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveView(item.id)}
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
                        layoutId="activeIndicator"
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
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden ml-72">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col-reverse gap-3 z-50">
        {/* Notifications Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative group"
          title="Notifications"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-durga-500 rounded-full text-xs flex items-center justify-center font-bold">3</span>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Notifications
          </span>
        </motion.button>

        {/* Quick Settings */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`bg-gradient-to-r from-heritage-500 to-kolkata-sepia text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group ${
              isSettingsOpen ? 'ring-4 ring-heritage-500/50' : ''
            }`}
            title="Settings"
          >
            <Settings className="w-6 h-6" />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Settings ⚙️
            </span>
          </motion.button>

          {/* Settings Panel */}
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full right-0 mb-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-heritage-500/10 to-kolkata-sepia/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-heritage-500" />
                      Admin Settings
                    </h3>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {isDark ? <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Theme</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleTheme}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isDark
                          ? 'bg-gray-800 text-white'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {isDark ? 'Dark' : 'Light'}
                    </motion.button>
                  </div>

                  {/* Verification Settings */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-heritage-500" />
                      Verification Settings
                    </h4>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Auto-verify guides</span>
                        <input type="checkbox" className="rounded" defaultChecked={false} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Auto-verify sellers</span>
                        <input type="checkbox" className="rounded" defaultChecked={false} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Require documents</span>
                        <input type="checkbox" className="rounded" defaultChecked={true} />
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-kolkata-terracotta" />
                      Notifications
                    </h4>
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>New verification requests</span>
                        <input type="checkbox" className="rounded" defaultChecked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>User registrations</span>
                        <input type="checkbox" className="rounded" defaultChecked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>System alerts</span>
                        <input type="checkbox" className="rounded" defaultChecked={true} />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-kolkata-yellow" />
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-xs bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
                        Export Analytics
                      </button>
                      <button className="w-full text-left px-3 py-2 text-xs bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
                        Backup Database
                      </button>
                      <button className="w-full text-left px-3 py-2 text-xs bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
                        View Logs
                      </button>
                    </div>
                  </div>

                  {/* Account */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 p-2">
                      <img
                        src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
                        alt={user?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full mt-2 px-3 py-2 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Analytics Component with Kolkata Theme
const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getAnalytics();
        if (response.success && response.data) {
          setAnalyticsData(response.data);
        } else {
          setError('Failed to load analytics data');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const stats = analyticsData ? [
    { label: 'Total Users', value: analyticsData.totalUsers.value, icon: Users, color: 'from-kolkata-yellow to-kolkata-gold', change: analyticsData.totalUsers.change, bgPattern: '🏛️' },
    { label: 'New Registrations', value: analyticsData.newRegistrations.value, icon: UserCheck, color: 'from-kolkata-terracotta to-durga-500', change: analyticsData.newRegistrations.change, bgPattern: '🚃' },
    { label: 'Total Bookings', value: analyticsData.totalBookings.value, icon: Calendar, color: 'from-heritage-500 to-kolkata-sepia', change: analyticsData.totalBookings.change, bgPattern: '🪔' },
    { label: 'Revenue', value: analyticsData.revenue.value, icon: DollarSign, color: 'from-kolkata-hooghly to-kolkata-blue', change: analyticsData.revenue.change, bgPattern: '🎭' }
  ] : [
    { label: 'Total Users', value: '0', icon: Users, color: 'from-kolkata-yellow to-kolkata-gold', change: '0%', bgPattern: '🏛️' },
    { label: 'New Registrations', value: '0', icon: UserCheck, color: 'from-kolkata-terracotta to-durga-500', change: '0%', bgPattern: '🚃' },
    { label: 'Total Bookings', value: '0', icon: Calendar, color: 'from-heritage-500 to-kolkata-sepia', change: '0%', bgPattern: '🪔' },
    { label: 'Revenue', value: '₹0', icon: DollarSign, color: 'from-kolkata-hooghly to-kolkata-blue', change: '0%', bgPattern: '🎭' }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Analytics Dashboard 
          <span className="text-2xl">🏛️</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Monitor platform performance across the City of Joy
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Stats Grid with Kolkata Theme */
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
              {/* Background Pattern */}
              <span className="absolute -right-2 -bottom-2 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
                {stat.bgPattern}
              </span>
              
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className={`text-sm mt-1 flex items-center gap-1 ${
                    stat.change.startsWith('-') 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${stat.change.startsWith('-') ? 'rotate-180' : ''}`} />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10"
        >
          <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-kolkata-terracotta" />
            User Growth
          </h3>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-kolkata-yellow/5 to-kolkata-terracotta/5 rounded-xl border border-dashed border-kolkata-yellow/30">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-kolkata-yellow mx-auto mb-2" />
              <p className="text-kolkata-sepia dark:text-gray-400">Interactive chart - User growth over time</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10"
        >
          <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-kolkata-terracotta" />
            Revenue Trends
          </h3>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-heritage-50 to-durga-50 dark:from-heritage-900/20 dark:to-durga-900/20 rounded-xl border border-dashed border-heritage-300/30">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-heritage-500 mx-auto mb-2" />
              <p className="text-kolkata-sepia dark:text-gray-400">Interactive chart - Revenue trends</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10"
      >
        <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          🪔 Recent Activity in Kolkata
        </h3>
        <div className="space-y-4">
          {[
            { action: 'New tourist registered', user: 'Anjali Sharma', time: '2 mins ago', icon: '🏛️' },
            { action: 'Guide verified', user: 'Ravi Kumar', time: '15 mins ago', icon: '🚃' },
            { action: 'Booking confirmed', user: 'Victoria Memorial Tour', time: '1 hour ago', icon: '🎭' },
            { action: 'New vendor approved', user: 'Kumartuli Crafts', time: '2 hours ago', icon: '🎨' },
          ].map((activity, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-kolkata-yellow/5 to-transparent rounded-xl hover:from-kolkata-yellow/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{activity.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-sm text-kolkata-sepia dark:text-gray-400">{activity.user}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// ManageUsers Component with Kolkata Theme
const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Blocked'>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getAllUsers();
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          setError('Failed to load users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = async (userId: string, newStatus: 'Active' | 'Blocked') => {
    try {
      setUpdatingId(userId);
      const response = await api.updateUserStatus(userId, newStatus);
      if (response.success) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        ));
      } else {
        alert('Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'tourist' | 'guide' | 'seller') => {
    try {
      setUpdatingId(userId);
      const response = await api.updateUserRole(userId, newRole);
      if (response.success) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
      } else {
        alert('Failed to update user role');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Manage Users
          <span className="text-2xl">👥</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Monitor and manage all platform users in the City of Joy
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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-kolkata-yellow/30 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-kolkata-yellow focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          {(['All', 'Active', 'Blocked'] as const).map((status) => (
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

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-kolkata-yellow" />
          <p className="mt-4 text-kolkata-sepia dark:text-gray-400">Loading users...</p>
        </div>
      ) : (
        /* Users Table */
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
                  {['User', 'Role', 'Status', 'Join Date', 'Actions'].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-kolkata-terracotta dark:text-kolkata-gold uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-kolkata-yellow/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-kolkata-sepia dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="hover:bg-kolkata-yellow/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-kolkata-yellow/30"
                      />
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-kolkata-sepia dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                      disabled={updatingId === user.id}
                      className="text-sm bg-kolkata-yellow/10 border border-kolkata-yellow/30 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white capitalize focus:ring-2 focus:ring-kolkata-yellow disabled:opacity-50"
                    >
                      <option value="tourist">🏛️ Tourist</option>
                      <option value="guide">🚃 Guide</option>
                      <option value="seller">🎨 Seller</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'Active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {user.status === 'Active' ? '✓ ' : '✗ '}{user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-kolkata-sepia dark:text-gray-400">
                    {new Date(user.joinDate || user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.button
                      whileHover={{ scale: updatingId === user.id ? 1 : 1.05 }}
                      whileTap={{ scale: updatingId === user.id ? 1 : 0.95 }}
                      onClick={() => handleStatusChange(user.id, user.status === 'Active' ? 'Blocked' : 'Active')}
                      disabled={updatingId === user.id}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                        user.status === 'Active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {updatingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        user.status === 'Active' ? 'Block' : 'Unblock'
                      )}
                    </motion.button>
                  </td>
                </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ManageGuides Component with Kolkata Theme
const ManageGuides: React.FC = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getGuides();
        if (response.success && response.data) {
          setGuides(response.data);
        } else {
          setError('Failed to load guides');
        }
      } catch (err) {
        console.error('Error fetching guides:', err);
        setError('Failed to load guides');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const handleVerifyGuide = async (guideId: string, currentVerified: boolean) => {
    try {
      setVerifyingId(guideId);
      // Find user ID from guide data - guides have userId field
      const guide = guides.find(g => g.id === guideId);
      if (guide && guide.userId) {
        const response = await api.verifyUser(guide.userId, !currentVerified);
        if (response.success) {
          setGuides(guides.map(g => 
            g.id === guideId ? { ...g, isVerified: !currentVerified } : g
          ));
        } else {
          alert('Failed to verify guide');
        }
      } else {
        // Fallback: find user by name
        const usersResponse = await api.getAllUsers();
        if (usersResponse.success && usersResponse.data) {
          const user = usersResponse.data.find((u: any) => u.name === guide?.name);
          if (user) {
            const response = await api.verifyUser(user.id, !currentVerified);
            if (response.success) {
              setGuides(guides.map(g => 
                g.id === guideId ? { ...g, isVerified: !currentVerified } : g
              ));
            } else {
              alert('Failed to verify guide');
            }
          } else {
            alert('User not found for this guide');
          }
        }
      }
    } catch (err) {
      console.error('Error verifying guide:', err);
      alert('Failed to verify guide');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Manage Guides
          <span className="text-2xl">🚃</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Monitor and verify heritage tour guides
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-kolkata-yellow" />
          <p className="mt-4 text-kolkata-sepia dark:text-gray-400">Loading guides...</p>
        </div>
      ) : guides.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <p className="text-kolkata-sepia dark:text-gray-400">No guides found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide, index) => (
          <motion.div
            key={guide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10 overflow-hidden relative group"
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-kolkata-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={guide.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
                  alt={guide.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-kolkata-yellow/50"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {guide.name}
                  </h3>
                  <p className="text-sm text-kolkata-sepia dark:text-gray-400">
                    {guide.location || 'Kolkata'}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    guide.isVerified
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {guide.isVerified ? '✓ Verified' : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-kolkata-sepia dark:text-gray-400">
                <div className="flex items-center p-2 bg-kolkata-yellow/5 rounded-lg">
                  <Star className="w-4 h-4 mr-2 text-kolkata-gold fill-current" />
                  Rating: {guide.rating?.toFixed(1) || '0'}/5 ({guide.totalRatings || 0} reviews)
                </div>
                <div className="flex items-center p-2 bg-kolkata-yellow/5 rounded-lg">
                  <DollarSign className="w-4 h-4 mr-2 text-kolkata-terracotta" />
                  ₹{guide.pricePerDay?.toFixed(0) || '0'}/day
                </div>
                {guide.experience && (
                  <div className="flex items-center p-2 bg-kolkata-yellow/5 rounded-lg">
                    <Calendar className="w-4 h-4 mr-2 text-kolkata-terracotta" />
                    {guide.experience} years experience
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <motion.button 
                  whileHover={{ scale: verifyingId === guide.id ? 1 : 1.02 }}
                  whileTap={{ scale: verifyingId === guide.id ? 1 : 0.98 }}
                  onClick={() => handleVerifyGuide(guide.id, guide.isVerified)}
                  disabled={verifyingId === guide.id}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium shadow-lg disabled:opacity-50 ${
                    guide.isVerified
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white'
                  }`}
                >
                  {verifyingId === guide.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : guide.isVerified ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Guide</span>
                    </div>
                  )}
                </motion.button>
                {!guide.isVerified && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                    ⚠️ Pending verification
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ManageVendors Component with Kolkata Theme
const ManageVendors: React.FC = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getAllSellers();
        if (response.success && response.data) {
          setSellers(response.data);
        } else {
          setError('Failed to load sellers');
        }
      } catch (err) {
        console.error('Error fetching sellers:', err);
        setError('Failed to load sellers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
  }, []);

  const handleVerifySeller = async (userId: string, currentVerified: boolean) => {
    try {
      setVerifyingId(userId);
      const response = await api.verifyUser(userId, !currentVerified);
      if (response.success) {
        setSellers(sellers.map(s => 
          s.userId === userId ? { ...s, isVerified: !currentVerified } : s
        ));
      } else {
        alert('Failed to verify seller');
      }
    } catch (err) {
      console.error('Error verifying seller:', err);
      alert('Failed to verify seller');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Manage Vendors
          <span className="text-2xl">🎨</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Monitor and verify artisan vendors & marketplace sellers
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-kolkata-yellow" />
          <p className="mt-4 text-kolkata-sepia dark:text-gray-400">Loading sellers...</p>
        </div>
      ) : sellers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <p className="text-kolkata-sepia dark:text-gray-400">No sellers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((vendor, index) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10 overflow-hidden relative group"
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-heritage-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={vendor.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
                  alt={vendor.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-heritage-500/50"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {vendor.name}
                  </h3>
                  <p className="text-sm text-kolkata-sepia dark:text-gray-400">
                    {vendor.shopName || vendor.email}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    vendor.isVerified
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {vendor.isVerified ? '✓ Verified' : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-kolkata-sepia dark:text-gray-400">
                <div className="flex items-center p-2 bg-heritage-50 dark:bg-heritage-900/20 rounded-lg">
                  <Calendar className="w-4 h-4 mr-2 text-heritage-500" />
                  Joined: {new Date(vendor.joinDate).toLocaleDateString()}
                </div>
                <div className="flex items-center p-2 bg-heritage-50 dark:bg-heritage-900/20 rounded-lg">
                  <DollarSign className="w-4 h-4 mr-2 text-heritage-500" />
                  Revenue: ₹{vendor.totalRevenue?.toLocaleString() || '0'}
                </div>
                <div className="flex items-center p-2 bg-heritage-50 dark:bg-heritage-900/20 rounded-lg">
                  <Star className="w-4 h-4 mr-2 text-heritage-500 fill-current" />
                  Rating: {vendor.rating?.toFixed(1) || '0'}/5 ({vendor.totalRatings || 0} reviews)
                </div>
                <div className="flex items-center p-2 bg-heritage-50 dark:bg-heritage-900/20 rounded-lg">
                  <Building className="w-4 h-4 mr-2 text-heritage-500" />
                  Products: {vendor.totalProducts || 0}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <motion.button 
                  whileHover={{ scale: verifyingId === vendor.userId ? 1 : 1.02 }}
                  whileTap={{ scale: verifyingId === vendor.userId ? 1 : 0.98 }}
                  onClick={() => handleVerifySeller(vendor.userId, vendor.isVerified)}
                  disabled={verifyingId === vendor.userId}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium shadow-lg disabled:opacity-50 ${
                    vendor.isVerified
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gradient-to-r from-heritage-500 to-kolkata-sepia text-white'
                  }`}
                >
                  {verifyingId === vendor.userId ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : vendor.isVerified ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Vendor</span>
                    </div>
                  )}
                </motion.button>
                {!vendor.isVerified && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                    ⚠️ Pending verification
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ManageProducts Component - Product Verification
const ManageProducts: React.FC = () => {
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getPendingProducts();
      if (response.success && response.data) {
        setPendingProducts(response.data);
      } else {
        setError('Failed to load pending products');
      }
    } catch (err) {
      console.error('Error fetching pending products:', err);
      setError('Failed to load pending products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      const response = await api.approveProduct(productId, true);
      if (response.success) {
        await fetchPendingProducts();
        alert('Product approved successfully!');
      } else {
        alert('Failed to approve product');
      }
    } catch (error) {
      console.error('Error approving product:', error);
      alert('Failed to approve product');
    }
  };

  const handleReject = async (productId: string) => {
    if (!window.confirm('Are you sure you want to reject this product? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await api.approveProduct(productId, false);
      if (response.success) {
        await fetchPendingProducts();
        alert('Product rejected');
      } else {
        alert('Failed to reject product');
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Failed to reject product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    try {
      await api.deleteProduct(productId);
      await fetchPendingProducts();
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Product Verification
          <span className="text-2xl">📦</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Review and approve artisan products before they appear in the marketplace
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-heritage-500" />
        </div>
      ) : pendingProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg text-center border border-heritage-500/10"
        >
          <Package className="w-16 h-16 text-heritage-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-2">
            No Pending Products
          </h3>
          <p className="text-kolkata-sepia dark:text-gray-400">
            All products have been reviewed. New submissions will appear here.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-heritage-500/10"
            >
              <div className="relative">
                <img
                  src={product.imageUrl || 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-yellow-500/80 text-white">
                    Pending Approval
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold font-heritage text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{product.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="font-bold text-heritage-600 dark:text-kolkata-gold">₹{product.price?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{product.stock || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Seller:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{product.seller?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium text-gray-900 dark:text-white text-xs">{product.seller?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Submitted:</span>
                    <span className="font-medium text-gray-900 dark:text-white text-xs">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewingProduct(product)}
                    className="flex-1 border border-heritage-500/30 text-heritage-600 dark:text-kolkata-gold px-3 py-2 rounded-xl text-sm font-medium hover:bg-heritage-50 dark:hover:bg-heritage-900/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApprove(product.id)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-xl text-sm font-medium shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReject(product.id)}
                    className="px-3 py-2 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Product Modal */}
      {viewingProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewingProduct(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-heritage-500/20 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-heritage-500/10 flex-shrink-0">
              <h2 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white">
                Product Details
              </h2>
              <button
                onClick={() => setViewingProduct(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-heritage-500/30">
                  <img
                    src={viewingProduct.imageUrl || 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={viewingProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-heritage text-gray-900 dark:text-white mb-2">
                    {viewingProduct.name}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{viewingProduct.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-heritage-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-1">Price</p>
                      <p className="text-2xl font-bold text-heritage-600 dark:text-kolkata-gold">₹{viewingProduct.price?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-4 bg-heritage-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-1">Stock</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{viewingProduct.stock || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-heritage-500/10 flex gap-2 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleReject(viewingProduct.id);
                  setViewingProduct(null);
                }}
                className="flex-1 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Reject
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleApprove(viewingProduct.id);
                  setViewingProduct(null);
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg"
              >
                Approve Product
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
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

// ManageTours Component - Tour Verification
const ManageTours: React.FC = () => {
  const [pendingTours, setPendingTours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchPendingTours();
  }, []);

  const fetchPendingTours = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getPendingTours();
      if (response.success && response.data) {
        // Sanitize tour data to replace Jharkhand with Kolkata and Betla with Sundarbans
        setPendingTours(response.data.map(sanitizeTourData));
      } else {
        setError('Failed to load pending tours');
      }
    } catch (err) {
      console.error('Error fetching pending tours:', err);
      setError('Failed to load pending tours');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReject = async (tourId: string, approved: boolean) => {
    try {
      const response = await api.approveTour(tourId, approved);
      if (response.success) {
        await fetchPendingTours();
        alert(`Tour ${approved ? 'approved' : 'rejected'} successfully`);
      } else {
        alert(`Failed to ${approved ? 'approve' : 'reject'} tour`);
      }
    } catch (err) {
      console.error('Error approving/rejecting tour:', err);
      alert(`Failed to ${approved ? 'approve' : 'reject'} tour`);
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    if (!window.confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await api.deleteTour(tourId);
      if (response.success) {
        await fetchPendingTours();
        alert('Tour deleted successfully');
      } else {
        alert('Failed to delete tour');
      }
    } catch (err) {
      console.error('Error deleting tour:', err);
      alert('Failed to delete tour');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Tour Verification
          <span className="text-2xl">🗺️</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Review and approve heritage tours proposed by guides
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-kolkata-yellow" />
          <p className="mt-4 text-kolkata-sepia dark:text-gray-400">Loading pending tours...</p>
        </div>
      ) : pendingTours.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
          <Map className="w-16 h-16 text-kolkata-yellow mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-2">
            No Pending Tours
          </h3>
          <p className="text-kolkata-sepia dark:text-gray-400">
            All tours have been reviewed
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingTours.map((tour) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={tour.image || 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                  Pending
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold font-heritage text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {sanitizeTourData(tour).title}
                </h3>
                <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-4 line-clamp-2">
                  {sanitizeTourData(tour).description}
                </p>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-kolkata-sepia dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {tour.duration}
                  </span>
                  <span className="text-kolkata-terracotta dark:text-kolkata-gold font-semibold">
                    ₹{tour.price}
                  </span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApproveReject(tour.id, true)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApproveReject(tour.id, false)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Reject
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedTour(tour);
                      setShowViewModal(true);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteTour(tour.id)}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Tour Modal */}
      {showViewModal && selectedTour && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowViewModal(false);
            setSelectedTour(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-kolkata-yellow/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold font-heritage text-gray-900 dark:text-white">
                Tour Details
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTour(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative h-64 rounded-xl overflow-hidden">
                <img
                  src={selectedTour.image || 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={selectedTour.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold font-heritage text-gray-900 dark:text-white mb-2">
                  {sanitizeTourData(selectedTour).title}
                </h3>
                <p className="text-kolkata-sepia dark:text-gray-400">
                  {sanitizeTourData(selectedTour).description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-kolkata-yellow/10 dark:bg-kolkata-yellow/20 rounded-lg p-4">
                  <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-1">Duration</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTour.duration}</p>
                </div>
                <div className="bg-kolkata-terracotta/10 dark:bg-kolkata-terracotta/20 rounded-lg p-4">
                  <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-1">Price</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{selectedTour.price}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleApproveReject(selectedTour.id, true);
                    setShowViewModal(false);
                    setSelectedTour(null);
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Approve Tour
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleApproveReject(selectedTour.id, false);
                    setShowViewModal(false);
                    setSelectedTour(null);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Reject Tour
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// ManageRecipes Component - Recipe Approval
const ManageRecipes: React.FC = () => {
  const [pendingRecipes, setPendingRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRecipes();
  }, []);

  const fetchPendingRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Call API to fetch pending recipes
      setPendingRecipes([]);
    } catch (err) {
      console.error('Error fetching pending recipes:', err);
      setError('Failed to load pending recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReject = async (recipeId: string, approved: boolean) => {
    try {
      // TODO: Call API to approve/reject recipe
      await fetchPendingRecipes();
      alert(`Recipe ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error approving/rejecting recipe:', err);
      alert(`Failed to ${approved ? 'approve' : 'reject'} recipe`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Recipe Approval <span className="text-2xl">🍛</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Review and approve recipes submitted by tourists and admins
        </p>
      </motion.div>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-kolkata-terracotta" />
        </div>
      ) : pendingRecipes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <ChefHat className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No pending recipes to review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingRecipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{recipe.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{recipe.category}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveReject(recipe.id, true)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproveReject(recipe.id, false)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ManageArtisans Component - Artisan Approval
const ManageArtisans: React.FC = () => {
  const [pendingArtisans, setPendingArtisans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingArtisans();
  }, []);

  const fetchPendingArtisans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Call API to fetch pending artisans
      setPendingArtisans([]);
    } catch (err) {
      console.error('Error fetching pending artisans:', err);
      setError('Failed to load pending artisans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReject = async (artisanId: string, approved: boolean) => {
    try {
      // TODO: Call API to approve/reject artisan
      await fetchPendingArtisans();
      alert(`Artisan ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error approving/rejecting artisan:', err);
      alert(`Failed to ${approved ? 'approve' : 'reject'} artisan`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Artisan Approval <span className="text-2xl">🎨</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Review and approve artisans submitted by sellers and admins
        </p>
      </motion.div>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-kolkata-terracotta" />
        </div>
      ) : pendingArtisans.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No pending artisans to review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingArtisans.map((artisan) => (
            <motion.div
              key={artisan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <img src={artisan.image} alt={artisan.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{artisan.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{artisan.craft}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveReject(artisan.id, true)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproveReject(artisan.id, false)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ManagePatachitra Component - Patachitra Approval
const ManagePatachitra: React.FC = () => {
  const [pendingArtworks, setPendingArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingArtworks();
  }, []);

  const fetchPendingArtworks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Call API to fetch pending artworks
      setPendingArtworks([]);
    } catch (err) {
      console.error('Error fetching pending artworks:', err);
      setError('Failed to load pending artworks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReject = async (artworkId: string, approved: boolean) => {
    try {
      // TODO: Call API to approve/reject artwork
      await fetchPendingArtworks();
      alert(`Artwork ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error approving/rejecting artwork:', err);
      alert(`Failed to ${approved ? 'approve' : 'reject'} artwork`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Patachitra Approval <span className="text-2xl">🎨</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Review and approve patachitra artworks submitted by guides, tourists, and admins
        </p>
      </motion.div>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-kolkata-terracotta" />
        </div>
      ) : pendingArtworks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No pending artworks to review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingArtworks.map((artwork) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <img src={artwork.image || artwork.thumbnail} alt={artwork.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{artwork.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{artwork.artist}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveReject(artwork.id, true)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproveReject(artwork.id, false)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ManageFeedback Component with Kolkata Theme
const ManageFeedback: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Verified' | 'Pending'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching feedback...');
      const response = await api.getAllFeedback();
      console.log('📥 Feedback response:', response);
      
      if (response.success && response.data) {
        console.log(`✅ Loaded ${response.data.length} feedback entries`);
        setFeedbackList(response.data);
      } else {
        console.warn('⚠️ Response not successful:', response);
        setError(response.message || 'Failed to load feedback');
        setFeedbackList([]);
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch feedback:', error);
      setError(error.message || 'Failed to load feedback. Please check your connection and try again.');
      setFeedbackList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyFeedback = async (id: string, action: 'approve' | 'reject') => {
    setVerifyingId(id);
    try {
      const response = await api.verifyFeedback(id, action);
      if (response.success) {
        // Refresh feedback list
        await fetchFeedback();
      }
    } catch (error: any) {
      console.error('Failed to verify feedback:', error);
      alert(error.message || 'Failed to verify feedback');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await api.deleteFeedback(id);
      if (response.success) {
        // Refresh feedback list
        await fetchFeedback();
      }
    } catch (error: any) {
      console.error('Failed to delete feedback:', error);
      alert(error.message || 'Failed to delete feedback');
    } finally {
      setDeletingId(null);
    }
  };

    const filteredFeedback = feedbackList.filter(feedback => {
      const matchesSearch = feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feedback.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'All' || 
                           (filterStatus === 'Verified' && feedback.verified) ||
                           (filterStatus === 'Pending' && !feedback.verified);
      return matchesSearch && matchesFilter;
    });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold font-heritage text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Manage Feedback
          <span className="text-2xl">💬</span>
        </h1>
        <p className="text-kolkata-sepia dark:text-gray-400">
          Review and verify user feedback to display on the landing page
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-1">Total Feedback</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{feedbackList.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-kolkata-yellow to-kolkata-terracotta">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-green-500/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-1">Verified</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {feedbackList.filter(f => f.verified).length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-yellow-500/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kolkata-sepia dark:text-gray-400 mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {feedbackList.filter(f => !f.verified).length}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500">
              <Loader2 className="w-7 h-7 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-kolkata-sepia w-5 h-5" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-kolkata-yellow/30 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-kolkata-yellow focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          {(['All', 'Pending', 'Verified'] as const).map((status) => (
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

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={fetchFeedback}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Feedback List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-kolkata-yellow mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading feedback...</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {filteredFeedback.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg border border-kolkata-yellow/10">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No feedback found matching your criteria.
              </p>
            </div>
          ) : (
            filteredFeedback.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-kolkata-yellow/10 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <img
                      src={feedback.user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
                      alt={feedback.user?.name || 'User'}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-kolkata-yellow/30"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {feedback.user?.name || 'Anonymous'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          feedback.category 
                            ? 'bg-kolkata-yellow/20 text-kolkata-terracotta dark:text-kolkata-gold'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {feedback.category || 'General'}
                        </span>
                        {feedback.verified && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{feedback.comment}</p>
                      {feedback.sentiment && (
                        <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                          feedback.sentiment === 'positive'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : feedback.sentiment === 'negative'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        }`}>
                          Sentiment: {feedback.sentiment}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {!feedback.verified && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleVerifyFeedback(feedback.id, 'approve')}
                      disabled={verifyingId === feedback.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {verifyingId === feedback.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Publish</span>
                        </>
                      )}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteFeedback(feedback.id)}
                    disabled={deletingId === feedback.id}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {deletingId === feedback.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;

