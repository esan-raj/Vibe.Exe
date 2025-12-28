/**
 * YatriAI Service Worker
 * 
 * Provides offline support for translations and language bundles.
 * Caches:
 * - Translation API responses
 * - Language JSON files
 * - Static assets
 */

const CACHE_NAME = 'yatriai-v1';
const TRANSLATION_CACHE = 'yatriai-translations-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ============================================
// Install Event
// ============================================

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================
// Activate Event
// ============================================

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activated');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== TRANSLATION_CACHE)
            .map((name) => {
              console.log(`🗑️ Service Worker: Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ============================================
// Fetch Event
// ============================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle translation API requests
  if (url.pathname.includes('/translate') || url.hostname.includes('libretranslate')) {
    event.respondWith(handleTranslationRequest(request));
    return;
  }
  
  // Handle locale JSON files
  if (url.pathname.includes('/locales/') && url.pathname.endsWith('.json')) {
    event.respondWith(handleLocaleRequest(request));
    return;
  }
  
  // Handle other requests with network-first strategy
  event.respondWith(handleGeneralRequest(request));
});

// ============================================
// Request Handlers
// ============================================

/**
 * Handle translation API requests
 * Strategy: Network first, fallback to cache
 */
async function handleTranslationRequest(request) {
  const cache = await caches.open(TRANSLATION_CACHE);
  
  try {
    // Try network first
    const response = await fetch(request.clone());
    
    if (response.ok) {
      // Cache successful responses
      const cacheKey = await generateCacheKey(request);
      cache.put(cacheKey, response.clone());
      console.log(`📡 Translation: Network success, cached`);
    }
    
    return response;
  } catch (error) {
    console.log(`📦 Translation: Network failed, trying cache`);
    
    // Fallback to cache
    const cacheKey = await generateCacheKey(request);
    const cached = await cache.match(cacheKey);
    
    if (cached) {
      console.log(`✅ Translation: Cache hit`);
      return cached;
    }
    
    // Return error response if no cache
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Translation unavailable offline. Please connect to the internet.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle locale JSON file requests
 * Strategy: Cache first, update from network
 */
async function handleLocaleRequest(request) {
  const cache = await caches.open(TRANSLATION_CACHE);
  
  // Check cache first
  const cached = await cache.match(request);
  
  if (cached) {
    console.log(`📦 Locale: Cache hit for ${request.url}`);
    
    // Update cache in background
    fetch(request.clone())
      .then((response) => {
        if (response.ok) {
          cache.put(request, response);
        }
      })
      .catch(() => {});
    
    return cached;
  }
  
  // Fetch from network
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request.clone(), response.clone());
      console.log(`📡 Locale: Network success, cached ${request.url}`);
    }
    
    return response;
  } catch (error) {
    console.log(`❌ Locale: Failed to load ${request.url}`);
    
    return new Response(
      JSON.stringify({}),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle general requests
 * Strategy: Network first, fallback to cache
 */
async function handleGeneralRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (response.ok && request.method === 'GET') {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/');
    }
    
    throw error;
  }
}

/**
 * Generate unique cache key for POST requests
 */
async function generateCacheKey(request) {
  if (request.method === 'GET') {
    return request;
  }
  
  // For POST requests, create a unique key based on body
  const body = await request.clone().text();
  const hash = await hashString(body);
  
  return new Request(`${request.url}?hash=${hash}`, {
    method: 'GET',
    headers: request.headers,
  });
}

/**
 * Simple hash function for cache keys
 */
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

// ============================================
// Message Handler
// ============================================

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_TRANSLATION_CACHE':
      caches.delete(TRANSLATION_CACHE).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'GET_CACHE_STATS':
      Promise.all([
        caches.open(CACHE_NAME).then(c => c.keys()),
        caches.open(TRANSLATION_CACHE).then(c => c.keys()),
      ]).then(([staticKeys, translationKeys]) => {
        event.ports[0].postMessage({
          staticAssets: staticKeys.length,
          translations: translationKeys.length,
        });
      });
      break;
  }
});

console.log('🚀 YatriAI Service Worker loaded');




















