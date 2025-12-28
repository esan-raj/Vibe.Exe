import { useLoadingState } from '../../contexts/LoadingContext';

// Predefined loading messages for different scenarios
const LOADING_MESSAGES = {
  // Authentication
  login: "Authenticating user...",
  logout: "Signing out...",
  register: "Creating your account...",
  
  // Data Loading
  destinations: "🏛️ Loading Kolkata heritage sites...",
  guides: "👨‍🏫 Finding local tour guides...",
  products: "🎨 Discovering artisan crafts...",
  itinerary: "🗺️ Planning your perfect journey...",
  
  // Booking
  booking: "📅 Processing your booking...",
  payment: "💳 Securing your payment...",
  confirmation: "✅ Confirming your reservation...",
  
  // Translation
  translate: "🌐 Preparing translation...",
  
  // General
  loading: "⏳ Loading content...",
  saving: "💾 Saving changes...",
  uploading: "📤 Uploading files...",
  processing: "⚙️ Processing request...",
  
  // Heritage specific
  heritage: "🏛️ Exploring Victoria Memorial...",
  pujo: "🎭 Loading Durga Puja celebrations...",
  crafts: "🎨 Finding traditional Bengali crafts...",
  food: "🍽️ Discovering Kolkata street food...",
  culture: "🎵 Immersing in Bengali culture...",
};

export const useInteractiveLoading = () => {
  const { startLoading, stopLoading, updateProgress } = useLoadingState();

  // Quick loading functions for common scenarios
  const showLoading = (type: keyof typeof LOADING_MESSAGES, withProgress = false) => {
    startLoading(LOADING_MESSAGES[type], withProgress);
  };

  const showCustomLoading = (message: string, withProgress = false) => {
    startLoading(message, withProgress);
  };

  // Simulate progress loading (useful for file uploads, data processing)
  const simulateProgress = async (
    message: string,
    duration = 3000,
    onComplete?: () => void
  ) => {
    startLoading(message, true);
    
    const steps = 20;
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const progress = (i / steps) * 100;
      updateProgress(progress);
      
      if (i < steps) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }
    
    setTimeout(() => {
      stopLoading();
      onComplete?.();
    }, 500);
  };

  // Async operation wrapper with loading
  const withLoading = async <T>(
    operation: () => Promise<T>,
    loadingMessage: string,
    withProgress = false
  ): Promise<T> => {
    try {
      startLoading(loadingMessage, withProgress);
      const result = await operation();
      return result;
    } finally {
      stopLoading();
    }
  };

  // Heritage-themed loading messages
  const heritageLoading = {
    victoria: () => showCustomLoading("🏛️ Exploring Victoria Memorial's grandeur..."),
    howrah: () => showCustomLoading("🌉 Crossing the iconic Howrah Bridge..."),
    dakshineswar: () => showCustomLoading("🕉️ Visiting Dakshineswar Temple..."),
    pujo: () => showCustomLoading("🎭 Experiencing Durga Puja magic..."),
    crafts: () => showCustomLoading("🎨 Discovering Kumartuli pottery..."),
    food: () => showCustomLoading("🍽️ Tasting authentic Bengali cuisine..."),
    books: () => showCustomLoading("📚 Browsing College Street books..."),
    tram: () => showCustomLoading("🚋 Riding heritage tram routes..."),
    music: () => showCustomLoading("🎵 Listening to Rabindra Sangeet..."),
    garden: () => showCustomLoading("🌸 Strolling through Botanical Gardens..."),
  };

  return {
    // Basic loading controls
    startLoading,
    stopLoading,
    updateProgress,
    
    // Quick loading functions
    showLoading,
    showCustomLoading,
    
    // Advanced loading functions
    simulateProgress,
    withLoading,
    
    // Heritage-themed loading
    heritageLoading,
    
    // Predefined messages
    LOADING_MESSAGES,
  };
};