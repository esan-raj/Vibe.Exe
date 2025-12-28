/**
 * Service Worker Registration
 * 
 * Registers the service worker for offline translation support.
 */

/**
 * Register the service worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    
    console.log('✅ Service Worker registered:', registration.scope);
    
    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available
            console.log('🔄 New content available, refresh to update');
            
            // Optionally notify user
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('sw-update-available'));
            }
          }
        });
      }
    });
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Unregister all service workers
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    await Promise.all(
      registrations.map((registration) => registration.unregister())
    );
    
    console.log('✅ Service Workers unregistered');
    return true;
  } catch (error) {
    console.error('Failed to unregister Service Workers:', error);
    return false;
  }
};

/**
 * Send message to service worker
 */
export const sendMessageToSW = <T>(type: string, payload?: unknown): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      reject(new Error('No active service worker'));
      return;
    }
    
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };
    
    navigator.serviceWorker.controller.postMessage(
      { type, payload },
      [messageChannel.port2]
    );
  });
};

/**
 * Clear translation cache in service worker
 */
export const clearSWTranslationCache = async (): Promise<boolean> => {
  try {
    const result = await sendMessageToSW<{ success: boolean }>('CLEAR_TRANSLATION_CACHE');
    return result.success;
  } catch (error) {
    console.error('Failed to clear SW translation cache:', error);
    return false;
  }
};

/**
 * Get service worker cache statistics
 */
export const getSWCacheStats = async (): Promise<{ staticAssets: number; translations: number } | null> => {
  try {
    return await sendMessageToSW('GET_CACHE_STATS');
  } catch (error) {
    console.error('Failed to get SW cache stats:', error);
    return null;
  }
};

/**
 * Check if app is running offline
 */
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

/**
 * Listen for online/offline events
 */
export const addConnectivityListener = (callback: (isOnline: boolean) => void): () => void => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};




















