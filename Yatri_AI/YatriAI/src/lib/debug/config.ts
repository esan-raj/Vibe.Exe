/**
 * Debug & Requestly Configuration
 * 
 * This module provides debugging utilities for API requests.
 * Works seamlessly with Requestly browser extension for advanced debugging.
 * 
 * Features:
 * - Request/Response logging with timing
 * - Debug headers for Requestly interception
 * - Request ID tracking
 * - Performance metrics
 * - Error tracking
 * 
 * Requestly Integration:
 * - Install Requestly extension from https://requestly.io
 * - Use X-Debug-* headers to create rules
 * - Filter requests by X-Request-ID for specific debugging
 */

// Debug mode flag - enable via environment variable
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true' || 
                          import.meta.env.DEV || 
                          localStorage.getItem('yatriai_debug') === 'true';

// Requestly integration flag
export const REQUESTLY_ENABLED = import.meta.env.VITE_REQUESTLY_ENABLED === 'true' ||
                                  localStorage.getItem('yatriai_requestly') === 'true';

// Debug panel visibility
export const DEBUG_PANEL_ENABLED = DEBUG_MODE && 
                                    import.meta.env.VITE_DEBUG_PANEL !== 'false';

// Configuration for debug features
export const DebugConfig = {
  // Max number of requests to store in history
  maxRequestHistory: 50,
  
  // Log levels
  logLevel: import.meta.env.VITE_DEBUG_LOG_LEVEL || 'info', // 'debug' | 'info' | 'warn' | 'error'
  
  // Enable console logging
  consoleLogging: true,
  
  // Enable performance timing
  performanceTiming: true,
  
  // Request header prefix for Requestly identification
  headerPrefix: 'X-YatriAI',
  
  // Colors for console logging
  colors: {
    request: '#3b82f6',  // Blue
    response: '#10b981', // Green
    error: '#ef4444',    // Red
    warning: '#f59e0b',  // Amber
    timing: '#8b5cf6',   // Purple
  },
};

// Debug header names (for Requestly rule matching)
export const DebugHeaders = {
  REQUEST_ID: `${DebugConfig.headerPrefix}-Request-ID`,
  TIMESTAMP: `${DebugConfig.headerPrefix}-Timestamp`,
  SOURCE: `${DebugConfig.headerPrefix}-Source`,
  DEBUG: `${DebugConfig.headerPrefix}-Debug`,
  MOCK: `${DebugConfig.headerPrefix}-Mock`,
  VERSION: `${DebugConfig.headerPrefix}-Version`,
};

// Generate unique request ID
export const generateRequestId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
};

// Helper to toggle debug mode at runtime
export const toggleDebugMode = (enabled?: boolean): boolean => {
  const newState = enabled ?? !localStorage.getItem('yatriai_debug');
  if (newState) {
    localStorage.setItem('yatriai_debug', 'true');
  } else {
    localStorage.removeItem('yatriai_debug');
  }
  console.log(`%c🔧 YatriAI Debug Mode: ${newState ? 'ENABLED' : 'DISABLED'}`, 
    `color: ${newState ? '#10b981' : '#ef4444'}; font-weight: bold;`);
  return !!newState;
};

// Helper to toggle Requestly integration
export const toggleRequestly = (enabled?: boolean): boolean => {
  const newState = enabled ?? !localStorage.getItem('yatriai_requestly');
  if (newState) {
    localStorage.setItem('yatriai_requestly', 'true');
  } else {
    localStorage.removeItem('yatriai_requestly');
  }
  console.log(`%c🔍 YatriAI Requestly: ${newState ? 'ENABLED' : 'DISABLED'}`,
    `color: ${newState ? '#10b981' : '#ef4444'}; font-weight: bold;`);
  return !!newState;
};

// Expose debug utilities to window for console access
if (typeof window !== 'undefined') {
  (window as any).YatriAIDebug = {
    toggleDebugMode,
    toggleRequestly,
    getConfig: () => DebugConfig,
    isDebugMode: () => DEBUG_MODE,
    isRequestlyEnabled: () => REQUESTLY_ENABLED,
  };
}

