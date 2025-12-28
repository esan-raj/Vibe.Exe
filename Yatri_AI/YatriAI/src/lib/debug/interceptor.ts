/**
 * HTTP Debug Interceptor
 * 
 * Wraps fetch requests with debugging capabilities:
 * - Automatic request/response logging
 * - Performance timing
 * - Debug headers for Requestly
 * - Request history tracking
 * - Error capture and formatting
 */

import { 
  DEBUG_MODE, 
  REQUESTLY_ENABLED,
  DebugConfig, 
  DebugHeaders, 
  generateRequestId 
} from './config';

// Request/Response types for tracking
export interface DebugRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  source?: string;
}

export interface DebugResponse {
  id: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  duration: number;
}

export interface DebugEntry {
  id: string;
  request: DebugRequest;
  response?: DebugResponse;
  error?: {
    message: string;
    stack?: string;
  };
  status: 'pending' | 'success' | 'error';
  duration?: number;
  source: string;
}

// Request history store
class DebugStore {
  private entries: DebugEntry[] = [];
  private listeners: Set<(entries: DebugEntry[]) => void> = new Set();

  add(entry: DebugEntry): void {
    this.entries.unshift(entry);
    if (this.entries.length > DebugConfig.maxRequestHistory) {
      this.entries = this.entries.slice(0, DebugConfig.maxRequestHistory);
    }
    this.notify();
  }

  update(id: string, updates: Partial<DebugEntry>): void {
    const index = this.entries.findIndex(e => e.id === id);
    if (index !== -1) {
      this.entries[index] = { ...this.entries[index], ...updates };
      this.notify();
    }
  }

  getAll(): DebugEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
    this.notify();
  }

  subscribe(listener: (entries: DebugEntry[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.getAll()));
  }
}

export const debugStore = new DebugStore();

// Console logger with styled output
const logRequest = (entry: DebugEntry): void => {
  if (!DebugConfig.consoleLogging) return;

  const { request } = entry;
  console.groupCollapsed(
    `%c➡️ ${request.method} %c${request.url}`,
    `color: ${DebugConfig.colors.request}; font-weight: bold;`,
    'color: inherit;'
  );
  console.log('🆔 Request ID:', entry.id);
  console.log('📍 Source:', entry.source);
  console.log('📤 Headers:', request.headers);
  if (request.body) {
    console.log('📦 Body:', request.body);
  }
  console.log('⏱️ Timestamp:', new Date(request.timestamp).toISOString());
  console.groupEnd();
};

const logResponse = (entry: DebugEntry): void => {
  if (!DebugConfig.consoleLogging || !entry.response) return;

  const { request, response, duration } = entry;
  const isError = response.status >= 400;
  
  console.groupCollapsed(
    `%c⬅️ ${response.status} %c${request.method} ${request.url} %c(${duration}ms)`,
    `color: ${isError ? DebugConfig.colors.error : DebugConfig.colors.response}; font-weight: bold;`,
    'color: inherit;',
    `color: ${DebugConfig.colors.timing};`
  );
  console.log('🆔 Request ID:', entry.id);
  console.log('📊 Status:', response.status, response.statusText);
  console.log('📥 Response Headers:', response.headers);
  if (response.body) {
    console.log('📦 Body:', response.body);
  }
  console.log('⏱️ Duration:', `${duration}ms`);
  console.groupEnd();
};

const logError = (entry: DebugEntry): void => {
  if (!DebugConfig.consoleLogging || !entry.error) return;

  console.groupCollapsed(
    `%c❌ ERROR %c${entry.request.method} ${entry.request.url}`,
    `color: ${DebugConfig.colors.error}; font-weight: bold;`,
    'color: inherit;'
  );
  console.log('🆔 Request ID:', entry.id);
  console.error('💥 Error:', entry.error.message);
  if (entry.error.stack) {
    console.error('📚 Stack:', entry.error.stack);
  }
  console.groupEnd();
};

// Build debug headers for Requestly
const buildDebugHeaders = (requestId: string, source: string): Record<string, string> => {
  if (!REQUESTLY_ENABLED) return {};

  return {
    [DebugHeaders.REQUEST_ID]: requestId,
    [DebugHeaders.TIMESTAMP]: Date.now().toString(),
    [DebugHeaders.SOURCE]: source,
    [DebugHeaders.DEBUG]: 'true',
    [DebugHeaders.VERSION]: import.meta.env.VITE_APP_VERSION || '1.0.0',
  };
};

// Parse response headers to object
const parseHeaders = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

// Parse request body
const parseBody = (body: BodyInit | null | undefined): any => {
  if (!body) return undefined;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  return body;
};

export interface DebugFetchOptions extends RequestInit {
  source?: string;
  skipDebug?: boolean;
}

/**
 * Debug-enhanced fetch function
 * 
 * Usage:
 * ```typescript
 * import { debugFetch } from '@/lib/debug';
 * 
 * const response = await debugFetch('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ query: 'test' }),
 *   source: 'AIService',
 * });
 * ```
 */
export async function debugFetch(
  input: RequestInfo | URL,
  init?: DebugFetchOptions
): Promise<Response> {
  const { source = 'unknown', skipDebug = false, ...fetchInit } = init || {};

  // If debug mode is off, just do regular fetch
  if (!DEBUG_MODE || skipDebug) {
    return fetch(input, fetchInit);
  }

  const requestId = generateRequestId();
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = fetchInit?.method || 'GET';
  const startTime = performance.now();

  // Add debug headers
  const debugHeaders = buildDebugHeaders(requestId, source);
  const headers = {
    ...(fetchInit?.headers as Record<string, string> || {}),
    ...debugHeaders,
  };

  // Create request entry
  const entry: DebugEntry = {
    id: requestId,
    request: {
      id: requestId,
      url,
      method,
      headers,
      body: parseBody(fetchInit?.body),
      timestamp: Date.now(),
      source,
    },
    status: 'pending',
    source,
  };

  debugStore.add(entry);
  logRequest(entry);

  try {
    const response = await fetch(input, {
      ...fetchInit,
      headers,
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // Clone response to read body
    const clonedResponse = response.clone();
    let responseBody: any;
    try {
      responseBody = await clonedResponse.json();
    } catch {
      try {
        responseBody = await clonedResponse.text();
      } catch {
        responseBody = undefined;
      }
    }

    const debugResponse: DebugResponse = {
      id: requestId,
      status: response.status,
      statusText: response.statusText,
      headers: parseHeaders(response.headers),
      body: responseBody,
      timestamp: Date.now(),
      duration,
    };

    const updatedEntry: Partial<DebugEntry> = {
      response: debugResponse,
      status: response.ok ? 'success' : 'error',
      duration,
    };

    debugStore.update(requestId, updatedEntry);
    logResponse({ ...entry, ...updatedEntry } as DebugEntry);

    return response;
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    const errorInfo = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    };

    const updatedEntry: Partial<DebugEntry> = {
      error: errorInfo,
      status: 'error',
      duration,
    };

    debugStore.update(requestId, updatedEntry);
    logError({ ...entry, ...updatedEntry } as DebugEntry);

    throw error;
  }
}

/**
 * Create a debug-enhanced fetch function for a specific service
 * 
 * Usage:
 * ```typescript
 * const serviceFetch = createServiceFetch('WeatherService');
 * const response = await serviceFetch('/api/weather', { method: 'GET' });
 * ```
 */
export function createServiceFetch(serviceName: string) {
  return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    return debugFetch(input, { ...init, source: serviceName });
  };
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).YatriAIDebug = {
    ...(window as any).YatriAIDebug,
    getRequests: () => debugStore.getAll(),
    clearRequests: () => debugStore.clear(),
    debugFetch,
  };
}

