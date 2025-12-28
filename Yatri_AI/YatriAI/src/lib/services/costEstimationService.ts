import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'your-api-key-here');

export interface CostEstimationRequest {
  destinationName: string;
  address: string;
  category: 'heritage' | 'temple' | 'food' | 'shopping' | 'nature';
  duration: number; // in hours
  visitTime: string;
  priority: 'high' | 'medium' | 'low';
  groupSize?: number;
  travelStyle?: 'budget' | 'mid-range' | 'luxury';
}

export interface CostEstimationResponse {
  estimatedCost: number; // in rupees
  breakdown: {
    entryFee?: number;
    transportation?: number;
    food?: number;
    shopping?: number;
    guide?: number;
    miscellaneous?: number;
  };
  explanation: string;
  tips: string[];
  confidence: 'high' | 'medium' | 'low';
}

export class CostEstimationService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async estimateCost(request: CostEstimationRequest): Promise<CostEstimationResponse> {
    try {
      const prompt = this.buildCostEstimationPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseCostEstimationResponse(text);
    } catch (error) {
      console.error('Cost estimation error:', error);
      return this.getFallbackEstimation(request);
    }
  }

  private buildCostEstimationPrompt(request: CostEstimationRequest): string {
    const {
      destinationName,
      address,
      category,
      duration,
      visitTime,
      priority,
      groupSize = 2,
      travelStyle = 'mid-range'
    } = request;

    return `
You are a travel cost estimation expert for Kolkata, India. Provide a detailed cost estimation in Indian Rupees (₹) for visiting the following destination:

**Destination Details:**
- Name: ${destinationName}
- Address: ${address}
- Category: ${category}
- Duration: ${duration} hours
- Visit Time: ${visitTime}
- Priority: ${priority}
- Group Size: ${groupSize} people
- Travel Style: ${travelStyle}

**Instructions:**
1. Provide cost estimation in Indian Rupees (₹) only
2. Consider current 2024 prices for Kolkata
3. Include breakdown for: entry fees, local transportation, food, shopping, guide fees, miscellaneous
4. Factor in the destination category, duration, and travel style
5. Provide practical money-saving tips
6. Rate your confidence level (high/medium/low)

**Response Format (JSON):**
{
  "estimatedCost": [total cost in rupees],
  "breakdown": {
    "entryFee": [amount or 0],
    "transportation": [local transport cost],
    "food": [food/refreshment cost],
    "shopping": [typical shopping cost],
    "guide": [guide fee if applicable],
    "miscellaneous": [other expenses]
  },
  "explanation": "[detailed explanation of cost calculation]",
  "tips": ["[tip 1]", "[tip 2]", "[tip 3]"],
  "confidence": "[high/medium/low]"
}

**Context for Kolkata:**
- Heritage sites: Victoria Memorial (₹30), Howrah Bridge (free), Marble Palace (₹10)
- Temples: Most are free, donations ₹10-50
- Food: Street food ₹50-150, restaurants ₹200-800 per person
- Shopping: New Market, College Street - budget ₹200-2000
- Transportation: Metro ₹10-25, taxi ₹15-30/km, auto ₹12-20/km
- Guides: ₹500-1500 per day depending on expertise

Provide realistic, current pricing for ${travelStyle} travel style.
`;
  }

  private parseCostEstimationResponse(text: string): CostEstimationResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and sanitize the response
        return {
          estimatedCost: Math.round(parsed.estimatedCost || 0),
          breakdown: {
            entryFee: Math.round(parsed.breakdown?.entryFee || 0),
            transportation: Math.round(parsed.breakdown?.transportation || 0),
            food: Math.round(parsed.breakdown?.food || 0),
            shopping: Math.round(parsed.breakdown?.shopping || 0),
            guide: Math.round(parsed.breakdown?.guide || 0),
            miscellaneous: Math.round(parsed.breakdown?.miscellaneous || 0),
          },
          explanation: parsed.explanation || 'Cost estimated based on typical Kolkata pricing.',
          tips: Array.isArray(parsed.tips) ? parsed.tips : [
            'Visit during weekdays for lower costs',
            'Try local street food for authentic experience',
            'Use metro for affordable transportation'
          ],
          confidence: parsed.confidence || 'medium'
        };
      }
    } catch (error) {
      console.error('Failed to parse cost estimation response:', error);
    }

    // Fallback parsing if JSON extraction fails
    return this.extractCostFromText(text);
  }

  private extractCostFromText(text: string): CostEstimationResponse {
    // Try to extract cost numbers from text
    const costMatches = text.match(/₹\s*(\d+)/g);
    const costs = costMatches?.map(match => parseInt(match.replace(/₹\s*/, ''))) || [];
    
    const estimatedCost = costs.length > 0 ? Math.max(...costs) : 500;

    return {
      estimatedCost,
      breakdown: {
        entryFee: Math.round(estimatedCost * 0.1),
        transportation: Math.round(estimatedCost * 0.2),
        food: Math.round(estimatedCost * 0.4),
        shopping: Math.round(estimatedCost * 0.2),
        miscellaneous: Math.round(estimatedCost * 0.1),
      },
      explanation: 'Cost estimated based on AI analysis of destination and travel parameters.',
      tips: [
        'Book tickets online for discounts',
        'Visit during off-peak hours',
        'Try local transportation options'
      ],
      confidence: 'medium'
    };
  }

  private getFallbackEstimation(request: CostEstimationRequest): CostEstimationResponse {
    // Fallback cost estimation based on category and duration
    const baseCosts = {
      heritage: 300,
      temple: 100,
      food: 400,
      shopping: 800,
      nature: 200
    };

    const baseAmount = baseCosts[request.category] || 300;
    const durationMultiplier = Math.max(1, request.duration / 2);
    const estimatedCost = Math.round(baseAmount * durationMultiplier);

    return {
      estimatedCost,
      breakdown: {
        entryFee: request.category === 'heritage' ? Math.round(estimatedCost * 0.1) : 0,
        transportation: Math.round(estimatedCost * 0.25),
        food: Math.round(estimatedCost * 0.4),
        shopping: request.category === 'shopping' ? Math.round(estimatedCost * 0.3) : Math.round(estimatedCost * 0.1),
        miscellaneous: Math.round(estimatedCost * 0.15),
      },
      explanation: `Estimated cost for ${request.destinationName} based on category (${request.category}) and duration (${request.duration} hours). This is a fallback estimation.`,
      tips: [
        'Use public transportation to save money',
        'Visit during weekdays for better prices',
        'Try local food options for authentic experience'
      ],
      confidence: 'low'
    };
  }

  // Quick estimation for common Kolkata destinations
  async getQuickEstimate(destinationName: string, _category: string, duration: number): Promise<number> {
    const quickEstimates: Record<string, number> = {
      'victoria memorial': 400,
      'howrah bridge': 200,
      'dakshineswar temple': 300,
      'kalighat temple': 250,
      'park street': 600,
      'new market': 800,
      'college street': 300,
      'princep ghat': 200,
      'marble palace': 350,
      'indian museum': 300
    };

    const normalizedName = destinationName.toLowerCase();
    const baseEstimate = quickEstimates[normalizedName] || 400;
    
    // Adjust for duration
    const durationMultiplier = Math.max(0.5, duration / 2);
    return Math.round(baseEstimate * durationMultiplier);
  }
}

export const costEstimationService = new CostEstimationService();