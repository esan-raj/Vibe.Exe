/**
 * AI Service
 * 
 * Handles AI-powered features:
 * - Itinerary generation
 * - Chat responses
 * - Travel recommendations
 * 
 * Integration hierarchy:
 * 1. Axicov agents (if configured) - Deployed AI agents as APIs
 * 2. Beeceptor mock (development)
 * 3. Direct AI API (production)
 * 
 * Enhanced with Requestly debug support for API debugging.
 * 
 * Prepared for integration with:
 * - Axicov for AI agent deployment
 * - OpenAI/Claude API for chat
 * - ElevenLabs for voice synthesis
 * - n8n for workflow orchestration
 */

import { ServiceURLs, ServiceFlags } from './config';
import { axicovService } from './axicov.service';
import { createServiceFetch } from '../debug';

// Create debug-enabled fetch for this service
const serviceFetch = createServiceFetch('AIService');

export interface ItineraryPreferences {
  interests: string[];
  budget: 'budget' | 'mid-range' | 'luxury';
  travelStyle: 'solo' | 'couple' | 'family' | 'group';
  duration: number;
  startDate?: string;
  groupSize?: number;
}

export interface GeneratedItinerary {
  id: string;
  title: string;
  duration: number;
  estimatedCost: number;
  destinations: ItineraryDestination[];
  dailyPlan: DayPlan[];
  highlights: string[];
  tips: string[];
  weather: string;
  bestTimeToVisit: string;
}

export interface ItineraryDestination {
  id: string;
  name: string;
  category: string;
  image: string;
  duration: string;
}

export interface DayPlan {
  day: number;
  destination: string;
  activities: string[];
  accommodation: string;
  meals: string[];
  transport: string;
  estimatedCost: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  relatedDestinations?: string[];
  bookingOptions?: any[];
}

// Mock responses for AI chat
const mockChatResponses: Record<string, ChatResponse> = {
  'best time': {
    message: 'The best time to visit Kolkata is from October to March when the weather is pleasant (20-28°C). Monsoon season (July-September) is perfect for exploring the city\'s heritage! 🌧️ Would you like me to help you plan a trip?',
    suggestions: ['Plan a winter trip', 'See heritage sites', 'Book a local guide'],
    relatedDestinations: ['Victoria Memorial', 'Howrah Bridge', 'Dakshineswar Kali Temple'],
  },
  'waterfall': {
    message: 'Kolkata is known for its rich heritage and culture! Must-visit places include:\n\n🏛️ **Victoria Memorial** - Iconic white marble monument\n🌉 **Howrah Bridge** - Engineering marvel over Hooghly River\n🕉️ **Dakshineswar Kali Temple** - Sacred temple with spiritual significance\n\nWould you like directions or booking assistance?',
    suggestions: ['Book heritage tour', 'See on map', 'Check weather'],
    relatedDestinations: ['Victoria Memorial', 'Howrah Bridge', 'Dakshineswar Kali Temple', 'Kumartuli'],
  },
  'food': {
    message: 'Try authentic Bengali cuisine! 🍽️\n\n🍛 **Kosha Mangsho** - Spicy mutton curry\n🍤 **Prawn Malai Curry** - Creamy prawn curry\n🍰 **Rasgulla** - Famous Bengali sweet\n☕ **Adda** - Coffee house culture\n\nDon\'t miss the street food at Park Street!',
    suggestions: ['Find local restaurants', 'Book food tour', 'See local markets'],
  },
  'safari': {
    message: 'Sundarbans offers excellent wildlife safaris! 🐅\n\n🦁 Best for: Royal Bengal Tigers, crocodiles, spotted deer, wild boars\n⏰ Timings: 6 AM - 9 AM (best for tiger spotting)\n💰 Entry: ₹100/person + ₹2000/vehicle\n\nI can help you book early morning slots for the best experience!',
    suggestions: ['Book safari now', 'Check availability', 'See other wildlife spots'],
    relatedDestinations: ['Sundarbans', 'Sajnekhali Wildlife Sanctuary', 'Sunderban Tiger Reserve'],
  },
  'default': {
    message: 'I\'d be happy to help you explore Kolkata! 🌟 You can ask me about:\n\n🗺️ Destinations & attractions\n🌤️ Best time to visit\n👨‍🏫 Local guides\n🛍️ Handicraft shopping\n🍽️ Local cuisine\n\nWhat would you like to know?',
    suggestions: ['Plan my trip', 'Find a guide', 'Explore destinations', 'Shop handicrafts'],
  },
};

class AIService {
  private baseUrl: string;
  private useMock: boolean;
  private useAxicov: boolean;

  constructor() {
    this.baseUrl = ServiceURLs.AI_API;
    this.useMock = ServiceFlags.USE_MOCK_AI;
    this.useAxicov = ServiceFlags.USE_AXICOV && axicovService.isConfigured();
  }

  /**
   * Check if using Axicov agents
   */
  isUsingAxicov(): boolean {
    return this.useAxicov;
  }

  /**
   * Generate an AI-powered itinerary
   * Priority: Axicov > Beeceptor/API > Mock
   */
  async generateItinerary(preferences: ItineraryPreferences): Promise<GeneratedItinerary> {
    // Try Axicov first if configured
    if (this.useAxicov) {
      try {
        console.log('🤖 Using Axicov Itinerary Planner agent...');
        const result = await axicovService.planItinerary({
          preferences: {
            interests: preferences.interests,
            budget: preferences.budget,
            travelStyle: preferences.travelStyle,
            duration: preferences.duration,
            startDate: preferences.startDate,
            groupSize: preferences.groupSize,
          },
        });

        if (result.success && result.data) {
          console.log(`✅ Axicov itinerary generated in ${result.executionTime}ms`);
          return result.data;
        }
        console.warn('⚠️ Axicov agent failed, falling back:', result.error);
      } catch (error) {
        console.warn('⚠️ Axicov unavailable, falling back:', error);
      }
    }

    // If using mock, simulate AI processing
    if (this.useMock && !import.meta.env.VITE_BEECEPTOR_URL) {
      return this.generateMockItinerary(preferences);
    }

    try {
      // Use debug-enabled fetch for Requestly support
      const response = await serviceFetch(`${this.baseUrl}/generate-itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        console.warn(`AI API returned ${response.status}, using fallback`);
        return this.generateMockItinerary(preferences);
      }

      return await response.json();
    } catch (error) {
      console.warn('AI API unavailable, using local mock:', error);
      return this.generateMockItinerary(preferences);
    }
  }

  /**
   * Get AI chat response
   * Priority: Axicov > Beeceptor/API > Mock
   */
  async chat(message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
    // Try Axicov first if configured
    if (this.useAxicov) {
      try {
        console.log('🤖 Using Axicov Travel Assistant agent...');
        const result = await axicovService.askTravelAssistant({
          message,
          context: {
            previousMessages: history.map(h => ({
              role: h.role === 'user' ? 'user' : 'assistant',
              content: h.content,
            })),
          },
        });

        if (result.success && result.data) {
          console.log(`✅ Axicov chat response in ${result.executionTime}ms`);
          return result.data;
        }
        console.warn('⚠️ Axicov agent failed, falling back:', result.error);
      } catch (error) {
        console.warn('⚠️ Axicov unavailable, falling back:', error);
      }
    }

    if (this.useMock && !import.meta.env.VITE_BEECEPTOR_URL) {
      return this.getMockChatResponse(message);
    }

    try {
      // Use debug-enabled fetch for Requestly support
      const response = await serviceFetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        return this.getMockChatResponse(message);
      }

      return await response.json();
    } catch (error) {
      console.warn('AI Chat API unavailable, using local mock:', error);
      return this.getMockChatResponse(message);
    }
  }

  /**
   * Get travel recommendations based on user preferences
   * Priority: Axicov > Mock
   */
  async getRecommendations(preferences: {
    interests: string[];
    budget: string;
    duration: number;
  }): Promise<{
    destinations: string[];
    activities: string[];
    tips: string[];
  }> {
    // Try Axicov first if configured
    if (this.useAxicov) {
      try {
        console.log('🤖 Using Axicov Recommendations agent...');
        const result = await axicovService.getRecommendations({
          interests: preferences.interests,
          budget: preferences.budget,
          duration: preferences.duration,
        });

        if (result.success && result.data) {
          console.log(`✅ Axicov recommendations in ${result.executionTime}ms`);
          return {
            destinations: result.data.destinations.map(d => d.name),
            activities: result.data.activities.map(a => a.name),
            tips: result.data.tips,
          };
        }
        console.warn('⚠️ Axicov agent failed, falling back:', result.error);
      } catch (error) {
        console.warn('⚠️ Axicov unavailable, falling back:', error);
      }
    }

    // Mock implementation - would call AI API in production
    const recommendations = {
      destinations: [] as string[],
      activities: [] as string[],
      tips: [] as string[],
    };

    if (preferences.interests.includes('nature')) {
      recommendations.destinations.push('Sundarbans', 'Sajnekhali Wildlife Sanctuary', 'Sunderban Tiger Reserve');
      recommendations.activities.push('Wildlife safari', 'Mangrove exploration', 'Sunrise viewing');
    }
    if (preferences.interests.includes('cultural')) {
      recommendations.destinations.push('Victoria Memorial', 'Kumartuli', 'Dakshineswar Kali Temple');
      recommendations.activities.push('Heritage walks', 'Durga Puja pandal hopping', 'Temple visits');
    }
    if (preferences.interests.includes('adventure')) {
      recommendations.destinations.push('Sundarbans', 'Howrah Bridge', 'College Street');
      recommendations.activities.push('Tram rides', 'Street food tours', 'Cultural exploration');
    }

    recommendations.tips = [
      'Book local guides for authentic experiences',
      'Try local tribal cuisine',
      'Visit during festivals for cultural immersion',
      'Carry cash as remote areas may not have ATMs',
    ];

    return recommendations;
  }

  /**
   * Get cultural insights about Kolkata
   * Uses Axicov Cultural Expert agent
   */
  async getCulturalInsights(topic: string): Promise<{
    title: string;
    content: string;
    keyFacts: string[];
    relatedTopics: string[];
  }> {
    if (this.useAxicov) {
      try {
        console.log('🤖 Using Axicov Cultural Expert agent...');
        const result = await axicovService.askCulturalExpert({
          topic,
          depth: 'detailed',
        });

        if (result.success && result.data) {
          console.log(`✅ Axicov cultural insights in ${result.executionTime}ms`);
          return result.data;
        }
        console.warn('⚠️ Axicov agent failed:', result.error);
      } catch (error) {
        console.warn('⚠️ Axicov unavailable:', error);
      }
    }

    // Fallback mock response
    return {
      title: `About ${topic}`,
      content: `Kolkata is rich in Bengali culture and heritage. The topic "${topic}" is an important part of the local traditions.`,
      keyFacts: [
        'Kolkata is known as the cultural capital of India',
        'Rich tradition of literature, art, and music',
        'Famous for Durga Puja celebrations and Kumartuli artisans',
      ],
      relatedTopics: ['Durga Puja', 'Bengali literature', 'Local cuisine'],
    };
  }

  /**
   * Match tourist with appropriate guides
   * Uses Axicov Guide Matcher agent
   */
  async matchGuides(preferences: {
    interests: string[];
    language: string;
    budget: string;
    dates: string[];
  }, availableGuides?: {
    id: string;
    name: string;
    specialties: string[];
    languages: string[];
    rating: number;
  }[]): Promise<{
    matches: {
      guideId: string;
      guideName: string;
      matchScore: number;
      matchReasons: string[];
    }[];
  }> {
    if (this.useAxicov) {
      try {
        console.log('🤖 Using Axicov Guide Matcher agent...');
        const result = await axicovService.matchGuide({
          touristPreferences: preferences,
          availableGuides,
        });

        if (result.success && result.data) {
          console.log(`✅ Axicov guide matching in ${result.executionTime}ms`);
          return {
            matches: result.data.matches.map(m => ({
              guideId: m.guideId,
              guideName: m.guideName,
              matchScore: m.matchScore,
              matchReasons: m.matchReasons,
            })),
          };
        }
        console.warn('⚠️ Axicov agent failed:', result.error);
      } catch (error) {
        console.warn('⚠️ Axicov unavailable:', error);
      }
    }

    // Fallback: simple matching based on interests
    if (availableGuides && availableGuides.length > 0) {
      const matches = availableGuides
        .map(guide => {
          const matchingSpecialties = guide.specialties.filter(s => 
            preferences.interests.some(i => s.toLowerCase().includes(i.toLowerCase()))
          );
          const languageMatch = guide.languages.includes(preferences.language) ? 1 : 0;
          const matchScore = (matchingSpecialties.length / preferences.interests.length) * 0.7 + 
                            languageMatch * 0.2 + 
                            (guide.rating / 5) * 0.1;
          
          return {
            guideId: guide.id,
            guideName: guide.name,
            matchScore: Math.round(matchScore * 100) / 100,
            matchReasons: [
              ...matchingSpecialties.map(s => `Specializes in ${s}`),
              ...(languageMatch ? [`Speaks ${preferences.language}`] : []),
              `Rating: ${guide.rating}/5`,
            ],
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);

      return { matches };
    }

    return { matches: [] };
  }

  private generateMockItinerary(preferences: ItineraryPreferences): GeneratedItinerary {
    const { duration, budget, interests } = preferences;
    
    const costPerDay = budget === 'budget' ? 2500 : budget === 'mid-range' ? 5000 : 10000;
    
    const destinations: ItineraryDestination[] = [
      { id: '1', name: 'Victoria Memorial', category: 'heritage', image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg', duration: '1 day' },
      { id: '2', name: 'Howrah Bridge', category: 'landmark', image: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg', duration: 'Half day' },
      { id: '3', name: 'Sundarbans', category: 'wildlife', image: 'https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg', duration: '1 day' },
    ];

    const dailyPlan: DayPlan[] = Array.from({ length: duration }, (_, i) => ({
      day: i + 1,
      destination: destinations[i % destinations.length].name,
      activities: [
        'Morning: Guided exploration',
        'Afternoon: Local experiences',
        'Evening: Cultural activities',
      ],
      accommodation: budget === 'luxury' ? 'Premium resort' : budget === 'mid-range' ? 'Comfortable hotel' : 'Budget homestay',
      meals: ['Traditional breakfast', 'Local lunch', 'Dinner with cultural show'],
      transport: 'Private vehicle with driver',
      estimatedCost: costPerDay,
    }));

    return {
      id: Date.now().toString(),
      title: `AI-Curated ${duration}-Day Kolkata ${interests.includes('adventure') ? 'Adventure' : 'Discovery'}`,
      duration,
      estimatedCost: costPerDay * duration,
      destinations: destinations.slice(0, Math.min(duration, 3)),
      dailyPlan,
      highlights: [
        'AI-optimized route for minimal travel time',
        'Weather-aware activity scheduling',
        'Local guide recommendations included',
        'Authentic cultural experiences',
      ],
      tips: [
        'Download offline maps before remote areas',
        'Carry mosquito repellent for forest areas',
        'Respect local customs and dress modestly at temples',
      ],
      weather: 'Pleasant, 22-28°C expected',
      bestTimeToVisit: 'Morning activities recommended for wildlife',
    };
  }

  private getMockChatResponse(message: string): ChatResponse {
    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(mockChatResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return mockChatResponses['default'];
  }
}

export const aiService = new AIService();
export default aiService;
