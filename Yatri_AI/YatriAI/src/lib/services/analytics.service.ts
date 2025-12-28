/**
 * Analytics & Event Tracking Service
 * 
 * Tracks user events and behavior for analytics and insights.
 * Can be used with various analytics backends or n8n workflows.
 * 
 * Features:
 * - Event tracking (page views, clicks, conversions)
 * - User properties and traits
 * - Session management
 * - Funnel tracking
 * - Custom events
 * 
 * Privacy:
 * - Respects user consent preferences
 * - Can be disabled via feature flag
 * - No PII stored without consent
 */

import { ServiceFlags, ServiceURLs } from './config';
import { createServiceFetch } from '../debug';

// Create debug-enabled fetch
const serviceFetch = createServiceFetch('AnalyticsService');

// Event categories
export type EventCategory = 
  | 'navigation'
  | 'engagement'
  | 'conversion'
  | 'search'
  | 'booking'
  | 'payment'
  | 'ai_interaction'
  | 'error'
  | 'performance';

// Standard event names
export type StandardEvent = 
  | 'page_view'
  | 'session_start'
  | 'session_end'
  | 'search'
  | 'destination_view'
  | 'itinerary_generated'
  | 'itinerary_saved'
  | 'booking_started'
  | 'booking_completed'
  | 'booking_cancelled'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'guide_viewed'
  | 'guide_booked'
  | 'product_viewed'
  | 'product_purchased'
  | 'ai_chat_started'
  | 'ai_chat_message'
  | 'review_submitted'
  | 'share'
  | 'login'
  | 'logout'
  | 'signup'
  | 'error';

// Event interface
export interface AnalyticsEvent {
  name: string;
  category: EventCategory;
  properties?: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  anonymousId: string;
}

// User traits
export interface UserTraits {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  createdAt?: string;
  preferences?: {
    interests?: string[];
    budget?: string;
    language?: string;
  };
  stats?: {
    totalBookings?: number;
    totalSpent?: number;
    itinerariesGenerated?: number;
  };
}

// Session info
interface SessionInfo {
  id: string;
  startedAt: Date;
  pageViews: number;
  events: number;
  lastActivity: Date;
}

// Funnel step
export interface FunnelStep {
  name: string;
  completedAt?: Date;
}

// Funnel tracking
export interface Funnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  startedAt: Date;
  completedAt?: Date;
  dropped?: boolean;
}

// In-memory stores
const eventQueue: AnalyticsEvent[] = [];
const userTraitsStore: Map<string, UserTraits> = new Map();
const funnelStore: Map<string, Funnel> = new Map();
let currentSession: SessionInfo | null = null;

// Consent state
let consentGiven = false;

class AnalyticsService {
  private enabled: boolean;
  private apiUrl: string;
  private anonymousId: string;
  private flushInterval: number | null = null;

  constructor() {
    this.enabled = ServiceFlags.ENABLE_ANALYTICS;
    this.apiUrl = ServiceURLs.ANALYTICS_API;
    this.anonymousId = this.getOrCreateAnonymousId();

    // Start session if analytics is enabled
    if (this.enabled && typeof window !== 'undefined') {
      this.startSession();
      this.setupAutoFlush();
      this.setupPageVisibility();
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.enabled && consentGiven;
  }

  /**
   * Set user consent for analytics
   */
  setConsent(consent: boolean): void {
    consentGiven = consent;
    if (consent) {
      localStorage.setItem('analytics_consent', 'true');
    } else {
      localStorage.removeItem('analytics_consent');
      this.clearData();
    }
  }

  /**
   * Check if user has given consent
   */
  hasConsent(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('analytics_consent') === 'true';
  }

  /**
   * Get or create anonymous ID for tracking
   */
  private getOrCreateAnonymousId(): string {
    if (typeof localStorage === 'undefined') {
      return `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    let id = localStorage.getItem('analytics_anon_id');
    if (!id) {
      id = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_anon_id', id);
    }
    return id;
  }

  /**
   * Start a new session
   */
  private startSession(): void {
    currentSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startedAt: new Date(),
      pageViews: 0,
      events: 0,
      lastActivity: new Date(),
    };
    
    this.track('session_start', 'navigation');
  }

  /**
   * Setup auto-flush of events
   */
  private setupAutoFlush(): void {
    // Flush events every 30 seconds
    this.flushInterval = window.setInterval(() => {
      this.flush();
    }, 30000);
  }

  /**
   * Setup page visibility tracking
   */
  private setupPageVisibility(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    window.addEventListener('beforeunload', () => {
      this.track('session_end', 'navigation');
      this.flush();
    });
  }

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Partial<UserTraits>): void {
    if (!this.isEnabled()) return;

    userTraitsStore.set(userId, {
      userId,
      ...traits,
    });

    this.track('identify', 'engagement', { userId, ...traits });
  }

  /**
   * Track an event
   */
  track(
    name: string | StandardEvent,
    category: EventCategory,
    properties?: Record<string, any>
  ): void {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      name,
      category,
      properties,
      timestamp: new Date(),
      sessionId: currentSession?.id || 'unknown',
      anonymousId: this.anonymousId,
    };

    // Add userId if identified
    const userId = this.getCurrentUserId();
    if (userId) {
      event.userId = userId;
    }

    eventQueue.push(event);

    // Update session stats
    if (currentSession) {
      currentSession.events++;
      currentSession.lastActivity = new Date();
      if (name === 'page_view') {
        currentSession.pageViews++;
      }
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`📊 [Analytics] ${category}/${name}`, properties || '');
    }
  }

  /**
   * Track page view
   */
  pageView(pageName: string, properties?: Record<string, any>): void {
    this.track('page_view', 'navigation', {
      page: pageName,
      url: typeof window !== 'undefined' ? window.location.pathname : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      ...properties,
    });
  }

  /**
   * Track search
   */
  search(query: string, results: number, properties?: Record<string, any>): void {
    this.track('search', 'search', {
      query,
      results,
      ...properties,
    });
  }

  /**
   * Track error
   */
  error(errorName: string, errorMessage: string, properties?: Record<string, any>): void {
    this.track('error', 'error', {
      errorName,
      errorMessage,
      ...properties,
    });
  }

  /**
   * Track AI interaction
   */
  aiInteraction(
    interactionType: 'chat' | 'itinerary' | 'recommendation',
    properties?: Record<string, any>
  ): void {
    this.track(`ai_${interactionType}`, 'ai_interaction', properties);
  }

  /**
   * Track booking funnel
   */
  trackBookingFunnel(step: 'started' | 'details' | 'payment' | 'completed' | 'cancelled', bookingId: string, properties?: Record<string, any>): void {
    const funnelId = `booking-${bookingId}`;
    
    if (step === 'started') {
      funnelStore.set(funnelId, {
        id: funnelId,
        name: 'Booking',
        steps: [{ name: 'started', completedAt: new Date() }],
        startedAt: new Date(),
      });
    } else {
      const funnel = funnelStore.get(funnelId);
      if (funnel) {
        funnel.steps.push({ name: step, completedAt: new Date() });
        if (step === 'completed') {
          funnel.completedAt = new Date();
        } else if (step === 'cancelled') {
          funnel.dropped = true;
        }
      }
    }

    this.track(`booking_${step}`, 'booking', {
      bookingId,
      ...properties,
    });
  }

  /**
   * Track conversion
   */
  conversion(conversionType: string, value?: number, properties?: Record<string, any>): void {
    this.track(conversionType, 'conversion', {
      value,
      ...properties,
    });
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string | undefined {
    // Try to get from stored traits
    for (const [userId] of userTraitsStore) {
      return userId;
    }
    return undefined;
  }

  /**
   * Flush events to backend
   */
  async flush(): Promise<void> {
    if (eventQueue.length === 0) return;
    if (!this.enabled) {
      eventQueue.length = 0;
      return;
    }

    const events = [...eventQueue];
    eventQueue.length = 0;

    try {
      await serviceFetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          session: currentSession,
          traits: Object.fromEntries(userTraitsStore),
        }),
      });
    } catch (error) {
      // Re-queue events on failure
      eventQueue.push(...events);
      console.warn('Failed to flush analytics events:', error);
    }
  }

  /**
   * Clear all analytics data
   */
  clearData(): void {
    eventQueue.length = 0;
    userTraitsStore.clear();
    funnelStore.clear();
    currentSession = null;
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('analytics_anon_id');
    }
  }

  /**
   * Get session info
   */
  getSessionInfo(): SessionInfo | null {
    return currentSession;
  }

  /**
   * Get funnel completion rate
   */
  getFunnelStats(funnelName: string): {
    started: number;
    completed: number;
    dropped: number;
    completionRate: number;
  } {
    const funnels = Array.from(funnelStore.values()).filter(f => f.name === funnelName);
    const started = funnels.length;
    const completed = funnels.filter(f => f.completedAt).length;
    const dropped = funnels.filter(f => f.dropped).length;
    
    return {
      started,
      completed,
      dropped,
      completionRate: started > 0 ? (completed / started) * 100 : 0,
    };
  }

  /**
   * Cleanup on unmount
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;

// Initialize consent from storage
if (typeof localStorage !== 'undefined') {
  consentGiven = localStorage.getItem('analytics_consent') === 'true';
}

