/**
 * Groq API Service
 * Fetches real-time travel recommendations using Groq AI
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-70b-versatile';

export interface Recommendation {
  title: string;
  description: string;
  category: string;
  icon?: string;
}

export interface GroqRecommendationsResponse {
  recommendations: Recommendation[];
  success: boolean;
  error?: string;
}

class GroqService {
  /**
   * Load all 30 recommendations from JSON file
   */
  async getAllRecommendations(): Promise<GroqRecommendationsResponse> {
    try {
      // Import JSON file dynamically
      const recommendationsModule = await import('../../data/recommendations.json');
      const allRecommendations = (recommendationsModule.default || recommendationsModule) as Recommendation[];
      
      if (!allRecommendations || allRecommendations.length === 0) {
        return this.getFallbackRecommendations();
      }

      console.log(`✅ Loaded ${allRecommendations.length} recommendations from JSON`);
      return {
        recommendations: allRecommendations,
        success: true,
      };
    } catch (error) {
      console.error('❌ Error loading recommendations from JSON:', error);
      return this.getFallbackRecommendations();
    }
  }

  /**
   * Fetch travel recommendations based on user preferences and location
   * @deprecated Use getAllRecommendations() instead for cycling through 30 recommendations
   */
  async getRecommendations(
    userPreferences?: {
      interests?: string[];
      budget?: string;
      travelStyle?: string;
      location?: string;
    }
  ): Promise<GroqRecommendationsResponse> {
    // Always use JSON recommendations now
    return this.getAllRecommendations();
  }

  /**
   * Fallback recommendations when JSON file is unavailable
   */
  private getFallbackRecommendations(): GroqRecommendationsResponse {
    return {
      recommendations: [
        {
          title: '🚃 Tram Heritage Route',
          description: 'Experience Kolkata\'s iconic yellow tram on Route 36, passing through major heritage landmarks including Victoria Memorial and Park Street.',
          category: 'heritage',
          icon: '🚃',
        },
        {
          title: '🪔 Durga Puja Pandal Hopping',
          description: 'Explore the best Durga Puja pandals in South Kolkata, starting with Ekdalia Evergreen. Best visited during early morning hours to avoid crowds.',
          category: 'culture',
          icon: '🪔',
        },
        {
          title: '🏛️ Heritage Walk',
          description: 'Discover colonial architecture and literary heritage through College Street, Indian Coffee House, and Jorasanko Thakur Bari - Tagore\'s ancestral home.',
          category: 'heritage',
          icon: '🏛️',
        },
      ],
      success: true,
    };
  }
}

export const groqService = new GroqService();
export default groqService;

