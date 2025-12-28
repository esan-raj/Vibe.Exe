/**
 * Budget Estimation Service
 * 
 * Estimates trip costs based on preferences and historical data.
 * Uses rule-based estimation with data-driven adjustments.
 */

import { itineraries } from '../../data/mockData';
import type { ItineraryPreferences } from './ai.service';

export interface BudgetEstimate {
  low: number;
  high: number;
  currency: string;
  basis: string;
  breakdown: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
    miscellaneous: number;
  };
}

class BudgetEstimationService {
  // Base costs per day (in INR)
  private baseCosts = {
    accommodation: {
      budget: 800,
      'mid-range': 2500,
      luxury: 6000,
    },
    food: {
      budget: 500,
      'mid-range': 1200,
      luxury: 3000,
    },
    transport: {
      budget: 300,
      'mid-range': 800,
      luxury: 2000,
    },
    activities: {
      budget: 200,
      'mid-range': 500,
      luxury: 1500,
    },
    miscellaneous: {
      budget: 200,
      'mid-range': 500,
      luxury: 1000,
    },
  };

  // Group size multipliers
  private groupMultipliers: Record<string, number> = {
    solo: 1.0,
    couple: 1.6, // Slight discount for sharing
    family: 2.8, // Kids cost less
    group: 0.9, // Per person cost decreases in groups
  };

  /**
   * Estimate budget based on preferences
   */
  async estimate(preferences: ItineraryPreferences): Promise<BudgetEstimate> {
    const budget = preferences.budget || 'mid-range';
    const duration = preferences.duration || 3;
    const groupSize = preferences.groupSize || this.getGroupSizeFromStyle(preferences.travelStyle);
    const travelStyle = preferences.travelStyle || 'couple';

    // Get base costs for budget level
    const baseAccommodation = this.baseCosts.accommodation[budget];
    const baseFood = this.baseCosts.food[budget];
    const baseTransport = this.baseCosts.transport[budget];
    const baseActivities = this.baseCosts.activities[budget];
    const baseMisc = this.baseCosts.miscellaneous[budget];

    // Apply group size multiplier
    const groupMultiplier = this.groupMultipliers[travelStyle] || 1.0;
    const perPersonMultiplier = groupSize > 1 ? groupMultiplier / groupSize : 1.0;

    // Calculate per day costs
    const accommodationPerDay = baseAccommodation * groupSize * perPersonMultiplier;
    const foodPerDay = baseFood * groupSize;
    const transportPerDay = baseTransport * groupSize * (groupSize > 1 ? 0.8 : 1.0); // Shared transport discount
    const activitiesPerDay = baseActivities * groupSize;
    const miscPerDay = baseMisc * groupSize;

    // Calculate total breakdown
    const breakdown = {
      accommodation: Math.round(accommodationPerDay * duration),
      food: Math.round(foodPerDay * duration),
      transport: Math.round(transportPerDay * duration),
      activities: Math.round(activitiesPerDay * duration),
      miscellaneous: Math.round(miscPerDay * duration),
    };

    // Adjust based on interests
    if (preferences.interests.includes('heritage') || preferences.interests.includes('culture')) {
      breakdown.activities = Math.round(breakdown.activities * 1.2); // Heritage sites may have entry fees
    }

    if (preferences.interests.includes('food')) {
      breakdown.food = Math.round(breakdown.food * 1.3); // Food tours cost more
    }

    if (preferences.interests.includes('shopping')) {
      breakdown.miscellaneous = Math.round(breakdown.miscellaneous * 2); // Shopping budget
    }

    // Calculate totals
    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    const low = Math.round(total * 0.85); // 15% buffer for low estimate
    const high = Math.round(total * 1.2); // 20% buffer for high estimate

    // Get basis from historical data if available
    const basis = this.getBasisFromHistoricalData(preferences);

    return {
      low,
      high,
      currency: 'INR',
      basis,
      breakdown,
    };
  }

  /**
   * Get group size from travel style
   */
  private getGroupSizeFromStyle(style?: string): number {
    switch (style) {
      case 'solo':
        return 1;
      case 'couple':
        return 2;
      case 'family':
        return 4;
      case 'group':
        return 6;
      default:
        return 2;
    }
  }

  /**
   * Get basis from historical itinerary data
   */
  private getBasisFromHistoricalData(preferences: ItineraryPreferences): string {
    // Find similar itineraries
    const similarItineraries = itineraries.filter(it => {
      const durationMatch = Math.abs(it.duration - (preferences.duration || 3)) <= 1;
      const activitiesMatch = preferences.interests.some(interest =>
        it.activities.some(act => act.toLowerCase().includes(interest.toLowerCase()))
      );
      return durationMatch && activitiesMatch;
    });

    if (similarItineraries.length > 0) {
      const avgCost = similarItineraries.reduce((sum, it) => sum + it.estimatedCost, 0) / similarItineraries.length;
      const perDayCost = avgCost / (preferences.duration || 3);
      return `Based on ${similarItineraries.length} similar itinerary${similarItineraries.length > 1 ? 'ies' : ''} (avg ₹${Math.round(perDayCost)}/day)`;
    }

    return `Based on ${preferences.budget || 'mid-range'} travel preferences and ${preferences.duration || 3}-day duration`;
  }

  /**
   * Validate and adjust budget estimate
   */
  validateEstimate(estimate: BudgetEstimate, preferences: ItineraryPreferences): BudgetEstimate {
    // Check if estimate is reasonable
    const total = estimate.low + estimate.high / 2;
    const perDay = total / (preferences.duration || 3);

    // Adjust if per day cost is too low or high
    if (perDay < 1000) {
      // Minimum reasonable budget
      const adjustment = (1000 - perDay) * (preferences.duration || 3);
      estimate.low = Math.max(estimate.low, Math.round(estimate.low + adjustment * 0.8));
      estimate.high = Math.max(estimate.high, Math.round(estimate.high + adjustment * 1.2));
      estimate.basis += ' (adjusted for minimum viable budget)';
    }

    if (perDay > 50000) {
      // Cap for luxury travel
      const adjustment = (perDay - 50000) * (preferences.duration || 3);
      estimate.low = Math.min(estimate.low, Math.round(estimate.low - adjustment * 0.8));
      estimate.high = Math.min(estimate.high, Math.round(estimate.high - adjustment * 1.2));
      estimate.basis += ' (capped at luxury maximum)';
    }

    return estimate;
  }
}

export const budgetEstimationService = new BudgetEstimationService();










