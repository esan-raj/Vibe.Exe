/**
 * Hybrid AI Service
 * 
 * Orchestrates custom models + Gemini API for optimal performance.
 * Uses custom models for fast, domain-specific tasks.
 * Falls back to Gemini API for complex generation.
 */

import { intentClassifier, type IntentResult } from './intentClassifier';
import { nerService, type ExtractedEntities } from './nerService';
import { embeddingService, getEmbedding, cosineSimilarity } from './embeddingService';
import { recommendationService } from './recommendationService';
import { budgetEstimationService } from './budgetEstimationService';
import { retrieveLocalContext, callGemini, type RagSource } from './rag.service';
import type { ItineraryPreferences } from './ai.service';
import { destinations, guides } from '../../data/mockData';

export interface HybridAIResponse {
  text: string;
  intent: IntentResult;
  entities: ExtractedEntities;
  context: RagSource[];
  budget?: {
    low: number;
    high: number;
    currency: string;
    basis: string;
  };
  recommendations?: {
    destinations: any[];
    itineraries: any[];
    guides: any[];
  };
  shouldUseGemini: boolean;
}

class HybridAIService {
  /**
   * Process user query with hybrid approach
   */
  async processQuery(
    query: string,
    userId?: string,
    preferences?: Partial<ItineraryPreferences>
  ): Promise<HybridAIResponse> {
    // Step 1: Intent Classification (custom model, fast)
    const intent = await intentClassifier.classify(query);
    
    // Step 2: Entity Extraction (custom model, fast)
    const entities = nerService.extract(query);
    
    // Step 3: Semantic Search (custom model, fast)
    const context = await this.retrieveContextWithEmbeddings(query);
    
    // Step 4: Route based on intent
    if (intent.intent === 'book_guide' && entities.locations.length > 0) {
      return this.handleBookingIntent(query, intent, entities, context);
    }
    
    if (intent.intent === 'get_recommendations' || (intent.confidence < 0.5 && userId)) {
      const recommendations = await recommendationService.getRecommendations(userId, 5);
      return {
        text: this.formatRecommendations(recommendations),
        intent,
        entities,
        context,
        recommendations,
        shouldUseGemini: false,
      };
    }
    
    // Step 5: Estimate budget if relevant
    let budget;
    if (intent.intent === 'budget_question' || intent.intent === 'plan_itinerary') {
      if (preferences) {
        const budgetEstimate = await budgetEstimationService.estimate(preferences as ItineraryPreferences);
        budget = {
          low: budgetEstimate.low,
          high: budgetEstimate.high,
          currency: budgetEstimate.currency,
          basis: budgetEstimate.basis,
        };
      }
    }
    
    // Step 6: Use Gemini for complex queries
    const shouldUseGemini = this.shouldUseGemini(intent, entities);
    
    if (shouldUseGemini) {
      // Call Gemini with pre-processed context
      const geminiResponse = await callGemini(query, context, [], budget ? {
        low: budget.low,
        high: budget.high,
        currency: budget.currency,
        basis: budget.basis,
        sources: [],
      } : undefined);
      
      return {
        text: geminiResponse?.text || 'I apologize, but I\'m having trouble processing your request right now.',
        intent,
        entities,
        context,
        budget,
        shouldUseGemini: true,
      };
    }
    
    // Step 7: Generate response without Gemini for simple queries
    const text = this.generateSimpleResponse(intent, entities, context);
    
    return {
      text,
      intent,
      entities,
      context,
      budget,
      shouldUseGemini: false,
    };
  }

  /**
   * Retrieve context using embeddings instead of keyword matching
   */
  private async retrieveContextWithEmbeddings(query: string): Promise<RagSource[]> {
    try {
      // Get query embedding
      const queryEmbedding = await getEmbedding(query);
      
      // Get embeddings for all destinations, itineraries, guides
      const allItems: Array<{ text: string; source: RagSource }> = [];
      
      destinations.forEach(dest => {
        allItems.push({
          text: `${dest.name} ${dest.description} ${dest.category}`,
          source: {
            title: dest.name,
            snippet: dest.description,
            score: 0,
            type: 'destination',
          },
        });
      });
      
      // Get embeddings and calculate similarities
      const similarities = await Promise.all(
        allItems.map(async item => {
          const itemEmbedding = await getEmbedding(item.text);
          const similarity = cosineSimilarity(queryEmbedding, itemEmbedding);
          return { ...item.source, score: similarity };
        })
      );
      
      // Sort by similarity and return top results
      return similarities
        .filter(item => item.score > 0.1) // Threshold for relevance
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    } catch (error) {
      console.warn('Embedding retrieval failed, falling back to keyword search:', error);
      // Fallback to original keyword-based search
      return retrieveLocalContext(query);
    }
  }

  /**
   * Determine if Gemini should be used
   */
  private shouldUseGemini(intent: IntentResult, entities: ExtractedEntities): boolean {
    // Use Gemini for complex intents
    const complexIntents: string[] = [
      'plan_itinerary',
      'cultural_info',
      'general_chat',
    ];
    
    if (complexIntents.includes(intent.intent)) {
      return true;
    }
    
    // Use Gemini if confidence is low (ambiguous query)
    if (intent.confidence < 0.5) {
      return true;
    }
    
    // Use Gemini if query is complex (many entities)
    if (entities.locations.length + entities.dates.length + entities.budgets.length > 3) {
      return true;
    }
    
    return false;
  }

  /**
   * Handle booking intent without Gemini
   */
  private handleBookingIntent(
    query: string,
    intent: IntentResult,
    entities: ExtractedEntities,
    context: RagSource[]
  ): HybridAIResponse {
    const location = entities.locations[0] || 'Kolkata';
    const availableGuides = guides.filter(guide => {
      if (entities.locations.length > 0) {
        return guide.languages.some(lang => 
          entities.locations.some(loc => guide.name.toLowerCase().includes(loc.toLowerCase()))
        );
      }
      return true;
    }).slice(0, 3);

    const text = availableGuides.length > 0
      ? `I found ${availableGuides.length} guide${availableGuides.length > 1 ? 's' : ''} available in ${location}:\n\n` +
        availableGuides.map(guide => 
          `• ${guide.name} - ₹${guide.pricePerDay}/day\n  Specialties: ${guide.specialties.join(', ')}\n  Languages: ${guide.languages.join(', ')}`
        ).join('\n\n') +
        `\n\nWould you like to book one of these guides?`
      : `I couldn't find guides specifically for ${location}. Would you like me to search more broadly?`;

    return {
      text,
      intent,
      entities,
      context,
      shouldUseGemini: false,
    };
  }

  /**
   * Generate simple response without Gemini
   */
  private generateSimpleResponse(
    intent: IntentResult,
    entities: ExtractedEntities,
    context: RagSource[]
  ): string {
    switch (intent.intent) {
      case 'find_heritage':
        if (context.length > 0) {
          const heritageSites = context.filter(c => c.type === 'destination').slice(0, 5);
          return `Here are some heritage sites I found:\n\n` +
            heritageSites.map(site => `• ${site.title}\n  ${site.snippet}`).join('\n\n') +
            `\n\nWould you like more details about any of these?`;
        }
        return 'I can help you find heritage sites. Could you specify a location or type of heritage site you\'re interested in?';
      
      case 'transport':
        return 'I can help you with transport information. For train bookings, please use the transport section. For local transport, I recommend using local cabs or public transport.';
      
      case 'marketplace':
        return 'You can browse artisan products in the marketplace section. Each product is blockchain-verified for authenticity.';
      
      default:
        return 'I understand you\'re looking for information. Let me help you with that.';
    }
  }

  /**
   * Format recommendations for display
   */
  private formatRecommendations(recommendations: any): string {
    let text = 'Based on your preferences, here are some recommendations:\n\n';
    
    if (recommendations.destinations.length > 0) {
      text += '**Destinations:**\n';
      recommendations.destinations.slice(0, 3).forEach((dest: any) => {
        text += `• ${dest.name} - ${dest.description}\n`;
      });
      text += '\n';
    }
    
    if (recommendations.itineraries.length > 0) {
      text += '**Itineraries:**\n';
      recommendations.itineraries.slice(0, 2).forEach((it: any) => {
        text += `• ${it.title} - ${it.duration} days, ₹${it.estimatedCost}\n`;
      });
      text += '\n';
    }
    
    if (recommendations.guides.length > 0) {
      text += '**Guides:**\n';
      recommendations.guides.slice(0, 2).forEach((guide: any) => {
        text += `• ${guide.name} - ₹${guide.pricePerDay}/day\n`;
      });
    }
    
    return text;
  }
}

export const hybridAIService = new HybridAIService();










