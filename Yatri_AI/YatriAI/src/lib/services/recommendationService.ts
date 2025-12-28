/**
 * Recommendation Service
 * 
 * Provides personalized recommendations based on user behavior.
 * Uses collaborative filtering and content-based filtering.
 * Falls back to popularity-based recommendations.
 */

import { destinations, itineraries, guides } from '../../data/mockData';
import type { Destination, Itinerary, Guide } from '../../types';

export interface RecommendationResult {
  destinations: Destination[];
  itineraries: Itinerary[];
  guides: Guide[];
}

class RecommendationService {
  // Mock user interaction data (in production, fetch from backend)
  private userInteractions: Map<string, Set<string>> = new Map();
  
  // Popularity scores (based on ratings and views)
  private popularityScores: Map<string, number> = new Map();

  constructor() {
    this.initializePopularityScores();
  }

  private initializePopularityScores() {
    // Calculate popularity based on ratings
    destinations.forEach(dest => {
      this.popularityScores.set(`dest_${dest.id}`, dest.rating || 4.0);
    });

    itineraries.forEach(it => {
      // Popularity based on estimated cost (lower = more popular) and duration
      const popularity = 5.0 - (it.estimatedCost / 10000) + (it.duration * 0.1);
      this.popularityScores.set(`itinerary_${it.id}`, Math.max(1, Math.min(5, popularity)));
    });

    guides.forEach(guide => {
      // Popularity based on rating and price (lower price = more popular)
      const popularity = (guide.rating || 4.0) - (guide.pricePerDay / 5000);
      this.popularityScores.set(`guide_${guide.id}`, Math.max(1, Math.min(5, popularity)));
    });
  }

  /**
   * Get recommendations for a user
   */
  async getRecommendations(
    userId?: string,
    limit: number = 5
  ): Promise<RecommendationResult> {
    // If user has interactions, use collaborative filtering
    if (userId && this.userInteractions.has(userId)) {
      return this.getCollaborativeRecommendations(userId, limit);
    }

    // Otherwise, use popularity-based recommendations
    return this.getPopularityRecommendations(limit);
  }

  /**
   * Collaborative filtering recommendations
   */
  private getCollaborativeRecommendations(
    userId: string,
    limit: number
  ): RecommendationResult {
    const userItems = this.userInteractions.get(userId) || new Set();
    
    // Find similar users (users who interacted with same items)
    const similarUsers: Map<string, number> = new Map();
    
    for (const [otherUserId, otherItems] of this.userInteractions.entries()) {
      if (otherUserId === userId) continue;
      
      let commonItems = 0;
      otherItems.forEach(item => {
        if (userItems.has(item)) commonItems++;
      });
      
      if (commonItems > 0) {
        const similarity = commonItems / Math.sqrt(userItems.size * otherItems.size);
        similarUsers.set(otherUserId, similarity);
      }
    }

    // Get items liked by similar users
    const itemScores: Map<string, number> = new Map();
    
    for (const [similarUserId, similarity] of similarUsers.entries()) {
      const similarUserItems = this.userInteractions.get(similarUserId) || new Set();
      similarUserItems.forEach(item => {
        if (!userItems.has(item)) {
          itemScores.set(item, (itemScores.get(item) || 0) + similarity);
        }
      });
    }

    // Sort and get top items
    const topItems = Array.from(itemScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item);

    return this.itemsToRecommendations(topItems, limit);
  }

  /**
   * Popularity-based recommendations
   */
  private getPopularityRecommendations(limit: number): RecommendationResult {
    // Sort by popularity scores
    const topDestinations = [...destinations]
      .sort((a, b) => {
        const scoreA = this.popularityScores.get(`dest_${a.id}`) || 0;
        const scoreB = this.popularityScores.get(`dest_${b.id}`) || 0;
        return scoreB - scoreA;
      })
      .slice(0, limit);

    const topItineraries = [...itineraries]
      .sort((a, b) => {
        const scoreA = this.popularityScores.get(`itinerary_${a.id}`) || 0;
        const scoreB = this.popularityScores.get(`itinerary_${b.id}`) || 0;
        return scoreB - scoreA;
      })
      .slice(0, limit);

    const topGuides = [...guides]
      .sort((a, b) => {
        const scoreA = this.popularityScores.get(`guide_${a.id}`) || 0;
        const scoreB = this.popularityScores.get(`guide_${b.id}`) || 0;
        return scoreB - scoreA;
      })
      .slice(0, limit);

    return {
      destinations: topDestinations,
      itineraries: topItineraries,
      guides: topGuides,
    };
  }

  /**
   * Convert item IDs to recommendation objects
   */
  private itemsToRecommendations(
    itemIds: string[],
    limit: number
  ): RecommendationResult {
    const destinations: Destination[] = [];
    const itineraries: Itinerary[] = [];
    const guides: Guide[] = [];

    for (const itemId of itemIds) {
      if (itemId.startsWith('dest_')) {
        const id = itemId.replace('dest_', '');
        const dest = destinations.find(d => d.id === id);
        if (dest) destinations.push(dest);
      } else if (itemId.startsWith('itinerary_')) {
        const id = itemId.replace('itinerary_', '');
        const it = itineraries.find(i => i.id === id);
        if (it) itineraries.push(it);
      } else if (itemId.startsWith('guide_')) {
        const id = itemId.replace('guide_', '');
        const guide = guides.find(g => g.id === id);
        if (guide) guides.push(guide);
      }
    }

    return {
      destinations: destinations.slice(0, limit),
      itineraries: itineraries.slice(0, limit),
      guides: guides.slice(0, limit),
    };
  }

  /**
   * Record user interaction (for training the model)
   */
  recordInteraction(userId: string, itemId: string, itemType: 'destination' | 'itinerary' | 'guide') {
    if (!this.userInteractions.has(userId)) {
      this.userInteractions.set(userId, new Set());
    }
    this.userInteractions.get(userId)!.add(`${itemType}_${itemId}`);
  }

  /**
   * Get similar items based on content (content-based filtering)
   */
  getSimilarItems(
    itemId: string,
    itemType: 'destination' | 'itinerary' | 'guide',
    limit: number = 5
  ): (Destination | Itinerary | Guide)[] {
    let baseItem: Destination | Itinerary | Guide | undefined;
    
    if (itemType === 'destination') {
      baseItem = destinations.find(d => d.id === itemId);
    } else if (itemType === 'itinerary') {
      baseItem = itineraries.find(i => i.id === itemId);
    } else if (itemType === 'guide') {
      baseItem = guides.find(g => g.id === itemId);
    }

    if (!baseItem) return [];

    // Simple similarity based on category/type
    const similar: Array<{ item: Destination | Itinerary | Guide; score: number }> = [];

    if (itemType === 'destination') {
      const baseDest = baseItem as Destination;
      destinations.forEach(dest => {
        if (dest.id !== itemId) {
          let score = 0;
          if (dest.category === baseDest.category) score += 2;
          if (Math.abs((dest.rating || 0) - (baseDest.rating || 0)) < 0.5) score += 1;
          similar.push({ item: dest, score });
        }
      });
    }

    return similar
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.item);
  }
}

export const recommendationService = new RecommendationService();










