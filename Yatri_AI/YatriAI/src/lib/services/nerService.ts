/**
 * Named Entity Recognition (NER) Service
 * 
 * Extracts structured entities from user queries:
 * - Locations (heritage sites, cities)
 * - Dates (tomorrow, next week, 3 days)
 * - Budgets (₹5000, budget-friendly, luxury)
 * - Durations (3 days, weekend trip)
 */

export interface ExtractedEntities {
  locations: string[];
  dates: string[];
  budgets: string[];
  durations: string[];
  heritageSites: string[];
  travelStyles?: ('solo' | 'couple' | 'family' | 'group')[];
  interests?: string[];
}

class NERService {
  private locationKeywords = [
    'Kolkata', 'Calcutta', 'Howrah', 'Dakshineswar', 'Kalighat',
    'Victoria Memorial', 'College Street', 'Park Street', 'Kumartuli',
    'Princep Ghat', 'Marble Palace', 'Indian Museum', 'Jharkhand', 'Ranchi',
  ];

  private heritageSiteKeywords = [
    'Victoria Memorial', 'Howrah Bridge', 'Dakshineswar', 'Kalighat',
    'Kumartuli', 'College Street', 'Princep Ghat', 'Marble Palace',
    'Indian Museum', 'Park Street', 'heritage site', 'monument', 'temple',
  ];

  private datePatterns = [
    /(today|tomorrow|day after tomorrow)/gi,
    /(next week|this week|coming week)/gi,
    /(next month|this month)/gi,
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/g, // MM/DD/YYYY
    /(\d{1,2}-\d{1,2}-\d{2,4})/g, // MM-DD-YYYY
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}/gi,
  ];

  private durationPatterns = [
    /(\d+)\s*(day|days)/gi,
    /(\d+)\s*(week|weeks)/gi,
    /(\d+)\s*(month|months)/gi,
    /(weekend|weekend trip)/gi,
    /(day trip|one day)/gi,
  ];

  private budgetPatterns = [
    /₹\s*(\d+(?:,\d+)*(?:k|K)?)/gi,
    /(\d+(?:,\d+)*(?:k|K)?)\s*rupee/gi,
    /(budget|budget-friendly|cheap|affordable|low cost)/gi,
    /(mid-range|moderate|medium)/gi,
    /(luxury|premium|high-end|expensive)/gi,
  ];

  private travelStylePatterns = [
    /(solo|alone|by myself)/gi,
    /(couple|romantic|honeymoon)/gi,
    /(family|with kids|children)/gi,
    /(group|friends|with friends)/gi,
  ];

  private interestKeywords = [
    'heritage', 'culture', 'food', 'shopping', 'temple', 'museum',
    'art', 'literature', 'history', 'architecture', 'festival',
  ];

  extract(query: string): ExtractedEntities {
    const normalizedQuery = query.toLowerCase();
    const entities: ExtractedEntities = {
      locations: [],
      dates: [],
      budgets: [],
      durations: [],
      heritageSites: [],
      travelStyles: [],
      interests: [],
    };

    // Extract locations
    for (const location of this.locationKeywords) {
      const regex = new RegExp(`\\b${location}\\b`, 'gi');
      if (regex.test(query)) {
        entities.locations.push(location);
      }
    }

    // Extract heritage sites
    for (const site of this.heritageSiteKeywords) {
      const regex = new RegExp(`\\b${site.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      if (regex.test(query)) {
        entities.heritageSites.push(site);
      }
    }

    // Extract dates
    for (const pattern of this.datePatterns) {
      const matches = query.matchAll(pattern);
      for (const match of matches) {
        if (match[0] && !entities.dates.includes(match[0])) {
          entities.dates.push(match[0]);
        }
      }
    }

    // Extract durations
    for (const pattern of this.durationPatterns) {
      const matches = query.matchAll(pattern);
      for (const match of matches) {
        if (match[0] && !entities.durations.includes(match[0])) {
          entities.durations.push(match[0]);
        }
      }
    }

    // Extract budgets
    for (const pattern of this.budgetPatterns) {
      const matches = query.matchAll(pattern);
      for (const match of matches) {
        if (match[0] && !entities.budgets.includes(match[0])) {
          entities.budgets.push(match[0]);
        }
      }
    }

    // Extract travel styles
    for (const pattern of this.travelStylePatterns) {
      const matches = query.matchAll(pattern);
      for (const match of matches) {
        const style = match[0].toLowerCase();
        if (style.includes('solo') || style.includes('alone')) {
          entities.travelStyles?.push('solo');
        } else if (style.includes('couple') || style.includes('romantic')) {
          entities.travelStyles?.push('couple');
        } else if (style.includes('family') || style.includes('kids')) {
          entities.travelStyles?.push('family');
        } else if (style.includes('group') || style.includes('friends')) {
          entities.travelStyles?.push('group');
        }
      }
    }

    // Extract interests
    for (const interest of this.interestKeywords) {
      const regex = new RegExp(`\\b${interest}\\b`, 'gi');
      if (regex.test(query)) {
        entities.interests?.push(interest);
      }
    }

    // Remove duplicates
    entities.locations = [...new Set(entities.locations)];
    entities.dates = [...new Set(entities.dates)];
    entities.budgets = [...new Set(entities.budgets)];
    entities.durations = [...new Set(entities.durations)];
    entities.heritageSites = [...new Set(entities.heritageSites)];
    entities.travelStyles = [...new Set(entities.travelStyles)];
    entities.interests = [...new Set(entities.interests)];

    return entities;
  }
}

export const nerService = new NERService();










