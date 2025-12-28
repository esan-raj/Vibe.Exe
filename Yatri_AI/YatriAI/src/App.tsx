import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HeroSection from './components/landing/HeroSection';
import AITipsMarquee from './components/landing/AITipsMarquee';
import TestimonialsCarousel from './components/landing/TestimonialsCarousel';
import FeaturesSection from './components/landing/FeaturesSection';
import HeritageSection from './components/landing/HeritageSection';
import PujoSection from './components/landing/PujoSection';
import ArtisansSection from './components/landing/ArtisansSection';
import SectionTransition from './components/common/SectionTransition';
// Lazy load dashboards for better performance
const TouristDashboard = lazy(() => import('./components/dashboard/TouristDashboard'));
const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'));
const GuideDashboard = lazy(() => import('./components/dashboard/GuideDashboard'));
const MarketplaceDashboard = lazy(() => import('./components/dashboard/MarketplaceDashboard'));
import TranslateTest from './components/common/TranslateTest';
import LoadingDemo from './components/common/LoadingDemo';
import InteractiveLoader from './components/common/InteractiveLoader';
import InitialLoader from './components/common/InitialLoader';
import { initializeServices } from './lib/services';
import { DEBUG_PANEL_ENABLED } from './lib/debug';
import { DebugPanel } from './components/debug/DebugPanel';
import BrowserOnlyTranslate from './components/common/BrowserOnlyTranslate';
import './lib/utils/translateDebug'; // Load debug utilities

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      {/* Hero Section - No transition needed as it's the first section */}
      <HeroSection />
      
      {/* AI Tips Marquee - Slide from right with quick animation */}
      <SectionTransition direction="right" delay={0.1} duration={0.6}>
        <AITipsMarquee />
      </SectionTransition>
      
      {/* Heritage Section - Fade in with scale effect */}
      <SectionTransition direction="scale" delay={0.2} duration={1} threshold={0.15}>
        <HeritageSection />
      </SectionTransition>
      
      {/* Pujo Section - Slide from left with stagger children */}
      <SectionTransition direction="left" delay={0.1} duration={0.8} staggerChildren={true} staggerDelay={0.15}>
        <PujoSection />
      </SectionTransition>
      
      {/* Artisans Section - Slide from up with longer delay */}
      <SectionTransition direction="up" delay={0.3} duration={0.9} threshold={0.2}>
        <ArtisansSection />
      </SectionTransition>
      
      {/* Features Section - Fade in with staggered children */}
      <SectionTransition direction="fade" delay={0.2} duration={1} staggerChildren={true} staggerDelay={0.2}>
        <FeaturesSection />
      </SectionTransition>
      
      {/* Testimonials Carousel - Scale in from center */}
      <SectionTransition direction="scale" delay={0.2} duration={0.8}>
        <TestimonialsCarousel />
      </SectionTransition>
      
      {/* Footer - Slide from down with fade */}
      <SectionTransition direction="down" delay={0.1} duration={0.7}>
        <Footer />
      </SectionTransition>
    </div>
  );
};

const LoadingScreen: React.FC = () => {
  const { setLoading } = useLoading();

  useEffect(() => {
    // Simulate initial loading
    setLoading(true, "Initializing YatriAI...");
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading YatriAI...</p>
      </div>
    </div>
  );
};

// Simple loading component for Suspense fallbacks (doesn't use hooks)
const DashboardLoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Dashboard...</p>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { setLoading } = useLoading();

  // Show loading when authenticating
  useEffect(() => {
    if (isLoading) {
      setLoading(true, "Authenticating user...");
    } else {
      setLoading(false);
    }
  }, [isLoading, setLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && user) {
    // Show appropriate dashboard based on user role
    switch (user.role) {
      case 'tourist':
        return <Navigate to="/tourist-dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'guide':
        return <Navigate to="/guide-dashboard" replace />;
      case 'seller':
        return <Navigate to="/marketplace-dashboard" replace />;
      default:
        return <LandingPage />;
    }
  }

  return <LandingPage />;
};


function App() {
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  // Handle initial loader completion
  const handleInitialLoadComplete = () => {
    setShowInitialLoader(false);
  };

  // Initialize external services on app startup - MUST be before any early returns
  useEffect(() => {
    initializeServices().then(({ status, usingMocks, usingAxicov, usingN8n, usingElevenLabs, usingDodoPayments, usingBlockchain, analyticsEnabled }) => {
      console.log('📋 External Service Status:', status);
      
      if (usingAxicov) {
        console.log('🤖 AI agents powered by Axicov - https://axicov.com');
      }
      
      if (usingN8n) {
        console.log('⚡ Workflow automation powered by n8n');
      }
      
      if (usingElevenLabs) {
        console.log('🎙️ Voice AI powered by ElevenLabs - https://elevenlabs.io');
      }
      
      if (usingDodoPayments) {
        console.log('💳 Payments powered by Dodo Payments - https://dodopayments.com');
      }
      
      if (usingBlockchain) {
        console.log('⛓️ Blockchain verification powered by ETHIndia');
      }
      
      if (analyticsEnabled) {
        console.log('📊 Analytics tracking enabled');
      }
      
      if (usingMocks) {
        console.log('💡 Tips:');
        console.log('   - Set VITE_BEECEPTOR_URL for API mocking');
        console.log('   - Set VITE_USE_AXICOV=true for AI agents');
        console.log('   - Set VITE_USE_N8N=true for workflow automation');
        console.log('   - Set VITE_ELEVENLABS_API_KEY for premium voice');
        console.log('   - Set VITE_DODO_PUBLIC_KEY for Dodo Payments');
        console.log('   - Set VITE_USE_REAL_BLOCKCHAIN=true for Ethereum');
      }
      
      // Log Requestly debug info
      console.log(
        '%c🔍 YatriAI Debug Mode: ' + (DEBUG_PANEL_ENABLED ? 'ENABLED' : 'DISABLED'),
        `color: ${DEBUG_PANEL_ENABLED ? '#10b981' : '#6b7280'}; font-weight: bold;`
      );
      if (DEBUG_PANEL_ENABLED) {
        console.log(
          '%c💡 Debug Panel available! Click the 🐞 button in the corner.',
          'color: #8b5cf6;'
        );
        console.log(
          '%c💡 Console commands: YatriAIDebug.toggleDebugMode(), YatriAIDebug.getRequests(), YatriAIDebug.clearRequests()',
          'color: #8b5cf6;'
        );
      }
    });

    // Add keyboard shortcut for debug panel toggle
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl+Shift+D to toggle debug mode
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (typeof (window as any).YatriAIDebug?.toggleDebugMode === 'function') {
          (window as any).YatriAIDebug.toggleDebugMode();
          // Force re-render (in a real app, you'd use state management)
          window.location.reload();
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Show initial loader first - AFTER all hooks
  if (showInitialLoader) {
    return <InitialLoader onComplete={handleInitialLoadComplete} minLoadingTime={1500} />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <LoadingProvider>
          <AuthProvider>
            <Router>
              <div className="App">
                <AppWithLoader />
              </div>
            </Router>
          </AuthProvider>
        </LoadingProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const AppWithLoader: React.FC = () => {
  const { isLoading, loadingText, progress, showProgress } = useLoading();

  return (
    <>
      {/* Interactive Loading Screen */}
      <InteractiveLoader 
        isLoading={isLoading}
        loadingText={loadingText}
        progress={progress}
        showProgress={showProgress}
      />
      
      {/* Main App Content */}
      <Routes>
        {/* Role-based landing and redirects */}
        <Route path="/" element={<AppContent />} />

        {/* Explicit dashboard routes - Lazy loaded */}
        <Route 
          path="/tourist-dashboard" 
          element={
            <Suspense fallback={<DashboardLoadingFallback />}>
              <TouristDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <Suspense fallback={<DashboardLoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/guide-dashboard" 
          element={
            <Suspense fallback={<DashboardLoadingFallback />}>
              <GuideDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/marketplace-dashboard" 
          element={
            <Suspense fallback={<DashboardLoadingFallback />}>
              <MarketplaceDashboard />
            </Suspense>
          } 
        />
        
        {/* Test page for Google Translate */}
        <Route path="/translate-test" element={<TranslateTest />} />
        
        {/* Loading Demo Page */}
        <Route path="/loading-demo" element={<LoadingDemo />} />
        
        {/* SEO-friendly language routes */}
        <Route path="/:lang" element={<AppContent />} />
        <Route path="/:lang/dashboard" element={<AppContent />} />
      </Routes>
      
      {/* Floating Translate Icon - Global */}
      <div className="fixed bottom-6 right-6 z-50">
        <BrowserOnlyTranslate variant="floating" />
      </div>
      
      {/* Debug Panel - Only shown in development or when debug mode is enabled */}
      {DEBUG_PANEL_ENABLED && <DebugPanel />}
    </>
  );
};

export default App;
