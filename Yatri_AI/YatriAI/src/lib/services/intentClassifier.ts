/**
 * Intent Classification Service
 * 
 * Classifies user queries into specific intents for routing.
 * Uses rule-based classification with keyword matching.
 * Can be replaced with a trained ML model later.
 */

export type Intent =
  | 'plan_itinerary'
  | 'book_guide'
  | 'find_heritage'
  | 'budget_question'
  | 'cultural_info'
  | 'booking_query'
  | 'marketplace'
  | 'transport'
  | 'general_chat';

export interface IntentResult {
  intent: Intent;
  confidence: number;
  entities?: {
    location?: string;
    duration?: string;
    budget?: string;
  };
}

class IntentClassifierService {
  private intentPatterns: Map<Intent, RegExp[]> = new Map([
    [
      'plan_itinerary',
      [
        /plan.*itinerary/i,
        /create.*itinerary/i,
        /make.*plan/i,
        /schedule.*trip/i,
        /organize.*tour/i,
        /(\d+)\s*(day|days).*trip/i,
        /itinerary.*for/i,
      ],
    ],
    [
      'book_guide',
      [
        /book.*guide/i,
        /hire.*guide/i,
        /find.*guide/i,
        /need.*guide/i,
        /guide.*available/i,
        /local.*guide/i,
      ],
    ],
    [
      'find_heritage',
      [
        /heritage.*site/i,
        /historical.*place/i,
        /monument/i,
        /show.*heritage/i,
        /heritage.*attraction/i,
        /cultural.*site/i,
        /places.*visit/i,
        /attractions/i,
      ],
    ],
    [
      'budget_question',
      [
        /how.*much/i,
        /cost/i,
        /budget/i,
        /price/i,
        /expensive/i,
        /cheap/i,
        /affordable/i,
        /₹/i,
        /rupee/i,
      ],
    ],
    [
      'cultural_info',
      [
        /tell.*about/i,
        /explain/i,
        /what.*is/i,
        /history/i,
        /culture/i,
        /tradition/i,
        /festival/i,
        /durga.*puja/i,
        /significance/i,
      ],
    ],
    [
      'booking_query',
      [
        /my.*booking/i,
        /check.*booking/i,
        /booking.*status/i,
        /reservation/i,
        /confirm.*booking/i,
      ],
    ],
    [
      'marketplace',
      [
        /artisan/i,
        /handicraft/i,
        /product/i,
        /buy/i,
        /purchase/i,
        /marketplace/i,
        /shop/i,
        /craft/i,
      ],
    ],
    [
      'transport',
      [
        /transport/i,
        /train/i,
        /bus/i,
        /cab/i,
        /taxi/i,
        /how.*to.*reach/i,
        /travel.*to/i,
        /route/i,
      ],
    ],
  ]);

  async classify(query: string): Promise<IntentResult> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Extract entities
    const entities = this.extractEntities(query);
    
    // Score each intent
    const scores: Map<Intent, number> = new Map();
    
    for (const [intent, patterns] of this.intentPatterns.entries()) {
      let score = 0;
      patterns.forEach(pattern => {
        if (pattern.test(normalizedQuery)) {
          score += 1;
        }
      });
      scores.set(intent, score);
    }

    // Find best intent
    let bestIntent: Intent = 'general_chat';
    let bestScore = 0;

    for (const [intent, score] of scores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    // Calculate confidence (normalize to 0-1)
    const totalScore = Array.from(scores.values()).reduce((sum, s) => sum + s, 0);
    const confidence = totalScore > 0 ? Math.min(bestScore / totalScore, 1) : 0.3;

    return {
      intent: bestIntent,
      confidence,
      entities,
    };
  }

  private extractEntities(query: string): IntentResult['entities'] {
    const entities: IntentResult['entities'] = {};

    // Extract location
    const locationPatterns = [
      /(?:in|at|to|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /(Kolkata|Jharkhand|Ranchi|Howrah|Dakshineswar|Kalighat|Victoria|College Street|Park Street)/gi,
    ];
    
    for (const pattern of locationPatterns) {
      const matches = query.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          entities.location = match[1];
          break;
        }
      }
    }

    // Extract duration
    const durationMatch = query.match(/(\d+)\s*(day|days|week|weeks)/i);
    if (durationMatch) {
      entities.duration = durationMatch[0];
    }

    // Extract budget
    const budgetMatch = query.match(/₹?\s*(\d+(?:,\d+)*(?:k|K)?)/i);
    if (budgetMatch) {
      entities.budget = budgetMatch[0];
    }

    return entities;
  }
}

export const intentClassifier = new IntentClassifierService();










