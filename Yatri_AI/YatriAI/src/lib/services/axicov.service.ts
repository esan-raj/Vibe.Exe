/**
 * Axicov AI Agent Service
 * 
 * Integrates with Axicov (axicov.com) for AI agent deployment.
 * Axicov allows deploying AI workflows as plug-and-play APIs.
 * 
 * Features:
 * - Multi-agent orchestration for complex tourism queries
 * - Instant API deployment without infrastructure management
 * - Ethereum wallet authentication (free tier available)
 * 
 * Agents:
 * - Travel Assistant: General tourism chat
 * - Itinerary Planner: Personalized trip planning
 * - Recommendations: Destination and activity suggestions
 * - Guide Matcher: Tourist-guide matching
 * - Cultural Expert: Tribal culture and heritage insights
 */

import { ServiceURLs, ServiceKeys, AxicovAgents, ServiceFlags } from './config';

// Agent execution result interface
export interface AgentExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime?: number;
  agentId: string;
  requestId: string;
}

// Agent input schemas
export interface TravelAssistantInput {
  message: string;
  context?: {
    userLocation?: string;
    previousMessages?: { role: 'user' | 'assistant'; content: string }[];
    userPreferences?: {
      interests: string[];
      budget: string;
    };
  };
}

export interface ItineraryPlannerInput {
  preferences: {
    interests: string[];
    budget: 'budget' | 'mid-range' | 'luxury';
    travelStyle: 'solo' | 'couple' | 'family' | 'group';
    duration: number;
    startDate?: string;
    groupSize?: number;
  };
  weather?: {
    current: string;
    forecast: string;
  };
}

export interface RecommendationsInput {
  interests: string[];
  budget: string;
  duration: number;
  visitedPlaces?: string[];
  currentLocation?: string;
}

export interface GuideMatcherInput {
  touristPreferences: {
    interests: string[];
    language: string;
    budget: string;
    dates: string[];
  };
  availableGuides?: {
    id: string;
    name: string;
    specialties: string[];
    languages: string[];
    rating: number;
  }[];
}

export interface CulturalExpertInput {
  topic: string;
  depth: 'brief' | 'detailed' | 'comprehensive';
  relatedTo?: string; // destination or activity name
}

// Agent response types
export interface TravelAssistantResponse {
  message: string;
  suggestions: string[];
  relatedDestinations?: string[];
  bookingOptions?: {
    type: string;
    title: string;
    price: number;
  }[];
}

export interface ItineraryPlannerResponse {
  id: string;
  title: string;
  duration: number;
  estimatedCost: number;
  destinations: {
    id: string;
    name: string;
    category: string;
    image: string;
    duration: string;
  }[];
  dailyPlan: {
    day: number;
    destination: string;
    activities: string[];
    accommodation: string;
    meals: string[];
    transport: string;
    estimatedCost: number;
  }[];
  highlights: string[];
  tips: string[];
  weather: string;
  bestTimeToVisit: string;
}

export interface RecommendationsResponse {
  destinations: {
    name: string;
    description: string;
    matchScore: number;
    category: string;
  }[];
  activities: {
    name: string;
    description: string;
    duration: string;
    price: number;
  }[];
  tips: string[];
}

export interface GuideMatcherResponse {
  matches: {
    guideId: string;
    guideName: string;
    matchScore: number;
    matchReasons: string[];
    availability: string;
    pricePerDay: number;
  }[];
  alternativeOptions?: string[];
}

export interface CulturalExpertResponse {
  title: string;
  content: string;
  keyFacts: string[];
  relatedTopics: string[];
  sources?: string[];
}

class AxicovService {
  private baseUrl: string;
  private apiKey: string;
  private isEnabled: boolean;

  constructor() {
    this.baseUrl = ServiceURLs.AXICOV_API;
    this.apiKey = ServiceKeys.AXICOV_API_KEY;
    this.isEnabled = ServiceFlags.USE_AXICOV && this.apiKey !== '';
  }

  /**
   * Check if Axicov is properly configured
   */
  isConfigured(): boolean {
    return this.isEnabled;
  }

  /**
   * Get available agents status
   */
  getAgentStatus(): Record<string, boolean> {
    return {
      travelAssistant: AxicovAgents.TRAVEL_ASSISTANT !== '',
      itineraryPlanner: AxicovAgents.ITINERARY_PLANNER !== '',
      recommendations: AxicovAgents.RECOMMENDATIONS !== '',
      guideMatcher: AxicovAgents.GUIDE_MATCHER !== '',
      culturalExpert: AxicovAgents.CULTURAL_EXPERT !== '',
    };
  }

  /**
   * Execute an Axicov agent
   */
  private async executeAgent<TInput, TOutput>(
    agentId: string,
    input: TInput,
    agentName: string
  ): Promise<AgentExecutionResult<TOutput>> {
    const requestId = `axc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    if (!this.isEnabled) {
      return {
        success: false,
        error: 'Axicov is not configured. Set VITE_USE_AXICOV=true and VITE_AXICOV_API_KEY in your environment.',
        agentId,
        requestId,
      };
    }

    if (!agentId) {
      return {
        success: false,
        error: `${agentName} agent is not configured. Set the agent ID in your environment.`,
        agentId: 'not-configured',
        requestId,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/agents/${agentId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Request-ID': requestId,
        },
        body: JSON.stringify({
          input,
          metadata: {
            source: 'YatriAI',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `Agent execution failed with status ${response.status}`,
          agentId,
          requestId,
          executionTime,
        };
      }

      const data = await response.json();

      return {
        success: true,
        data: data.output || data,
        agentId,
        requestId,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        agentId,
        requestId,
        executionTime,
      };
    }
  }

  /**
   * Travel Assistant Agent - General tourism chat
   */
  async askTravelAssistant(
    input: TravelAssistantInput
  ): Promise<AgentExecutionResult<TravelAssistantResponse>> {
    return this.executeAgent<TravelAssistantInput, TravelAssistantResponse>(
      AxicovAgents.TRAVEL_ASSISTANT,
      input,
      'Travel Assistant'
    );
  }

  /**
   * Itinerary Planner Agent - Generate personalized itineraries
   */
  async planItinerary(
    input: ItineraryPlannerInput
  ): Promise<AgentExecutionResult<ItineraryPlannerResponse>> {
    return this.executeAgent<ItineraryPlannerInput, ItineraryPlannerResponse>(
      AxicovAgents.ITINERARY_PLANNER,
      input,
      'Itinerary Planner'
    );
  }

  /**
   * Recommendations Agent - Get destination and activity suggestions
   */
  async getRecommendations(
    input: RecommendationsInput
  ): Promise<AgentExecutionResult<RecommendationsResponse>> {
    return this.executeAgent<RecommendationsInput, RecommendationsResponse>(
      AxicovAgents.RECOMMENDATIONS,
      input,
      'Recommendations'
    );
  }

  /**
   * Guide Matcher Agent - Match tourists with appropriate guides
   */
  async matchGuide(
    input: GuideMatcherInput
  ): Promise<AgentExecutionResult<GuideMatcherResponse>> {
    return this.executeAgent<GuideMatcherInput, GuideMatcherResponse>(
      AxicovAgents.GUIDE_MATCHER,
      input,
      'Guide Matcher'
    );
  }

  /**
   * Cultural Expert Agent - Provide cultural and heritage insights
   */
  async askCulturalExpert(
    input: CulturalExpertInput
  ): Promise<AgentExecutionResult<CulturalExpertResponse>> {
    return this.executeAgent<CulturalExpertInput, CulturalExpertResponse>(
      AxicovAgents.CULTURAL_EXPERT,
      input,
      'Cultural Expert'
    );
  }

  /**
   * Multi-agent orchestration for complex queries
   * Combines multiple agents to provide comprehensive responses
   */
  async orchestrateComplexQuery(query: {
    message: string;
    includeRecommendations?: boolean;
    includeItinerary?: boolean;
    includeCulturalContext?: boolean;
    userPreferences?: {
      interests: string[];
      budget: string;
      duration: number;
    };
  }): Promise<{
    chatResponse?: AgentExecutionResult<TravelAssistantResponse>;
    recommendations?: AgentExecutionResult<RecommendationsResponse>;
    culturalContext?: AgentExecutionResult<CulturalExpertResponse>;
    totalExecutionTime: number;
  }> {
    const startTime = Date.now();
    const results: {
      chatResponse?: AgentExecutionResult<TravelAssistantResponse>;
      recommendations?: AgentExecutionResult<RecommendationsResponse>;
      culturalContext?: AgentExecutionResult<CulturalExpertResponse>;
      totalExecutionTime: number;
    } = {
      totalExecutionTime: 0,
    };

    // Always get chat response
    results.chatResponse = await this.askTravelAssistant({
      message: query.message,
      context: {
        userPreferences: query.userPreferences ? {
          interests: query.userPreferences.interests,
          budget: query.userPreferences.budget,
        } : undefined,
      },
    });

    // Parallel execution for additional context
    const additionalPromises: Promise<void>[] = [];

    if (query.includeRecommendations && query.userPreferences) {
      additionalPromises.push(
        this.getRecommendations({
          interests: query.userPreferences.interests,
          budget: query.userPreferences.budget,
          duration: query.userPreferences.duration,
        }).then(result => {
          results.recommendations = result;
        })
      );
    }

    if (query.includeCulturalContext) {
      // Extract topic from message for cultural context
      const topic = this.extractCulturalTopic(query.message);
      if (topic) {
        additionalPromises.push(
          this.askCulturalExpert({
            topic,
            depth: 'brief',
          }).then(result => {
            results.culturalContext = result;
          })
        );
      }
    }

    await Promise.all(additionalPromises);

    results.totalExecutionTime = Date.now() - startTime;
    return results;
  }

  /**
   * Extract cultural topic from message for Cultural Expert agent
   */
  private extractCulturalTopic(message: string): string | null {
    const culturalKeywords = [
      'tribal', 'culture', 'tradition', 'festival', 'heritage',
      'santhali', 'ho', 'munda', 'oraon', 'craft', 'dance', 'music',
      'food', 'cuisine', 'history', 'temple', 'ritual'
    ];

    const lowerMessage = message.toLowerCase();
    for (const keyword of culturalKeywords) {
      if (lowerMessage.includes(keyword)) {
        return message; // Use the full message as the topic
      }
    }
    return null;
  }
}

export const axicovService = new AxicovService();
export default axicovService;

