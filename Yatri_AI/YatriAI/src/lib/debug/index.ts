/**
 * Debug Module Index
 * 
 * Central export for all debugging utilities.
 * 
 * Quick Start:
 * 1. Enable debug mode: Set VITE_DEBUG_MODE=true in .env or call YatriAIDebug.toggleDebugMode() in console
 * 2. Enable Requestly: Set VITE_REQUESTLY_ENABLED=true or call YatriAIDebug.toggleRequestly() in console
 * 3. Install Requestly browser extension for advanced request manipulation
 * 
 * Console Commands (available in browser dev tools):
 * - YatriAIDebug.toggleDebugMode()    - Toggle debug mode
 * - YatriAIDebug.toggleRequestly()    - Toggle Requestly headers
 * - YatriAIDebug.getRequests()        - Get all tracked requests
 * - YatriAIDebug.clearRequests()      - Clear request history
 * - YatriAIDebug.getConfig()          - Get debug configuration
 */

// Configuration
export {
  DEBUG_MODE,
  REQUESTLY_ENABLED,
  DEBUG_PANEL_ENABLED,
  DebugConfig,
  DebugHeaders,
  generateRequestId,
  toggleDebugMode,
  toggleRequestly,
} from './config';

// Interceptor
export {
  debugFetch,
  createServiceFetch,
  debugStore,
  type DebugRequest,
  type DebugResponse,
  type DebugEntry,
  type DebugFetchOptions,
} from './interceptor';

