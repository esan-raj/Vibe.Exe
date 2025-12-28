import { destinations, itineraries, guides } from '../../data/mockData';
import { getEmbedding, cosineSimilarity } from './embeddingService';

export type RagSource = {
  title: string;
  snippet: string;
  score: number;
  type: 'destination' | 'itinerary' | 'guide' | 'web';
  url?: string;
};

export type BudgetSource = {
  label: string;
  amount: number;
  sourceType: 'web' | 'local';
  url?: string;
  note?: string;
};

export type BudgetEstimate = {
  low: number;
  high: number;
  currency: string;
  basis: string;
  sources: BudgetSource[];
};

const fallbackWebSignals: BudgetSource[] = [
  { label: 'Backpacker band', amount: 2400, sourceType: 'web', note: 'Mock baseline for hostels + transit + street food' },
  { label: 'Comfort band', amount: 5200, sourceType: 'web', note: 'Mock baseline for 3-star + cabs' },
  { label: 'Premium band', amount: 9800, sourceType: 'web', note: 'Mock baseline for boutique stay + private car' },
];

const formatINR = (value: number) => value.toLocaleString('en-IN', { maximumFractionDigits: 0 });

const scoreMatch = (text: string, query: string) => {
  const haystack = text.toLowerCase();
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return 0;
  const hits = tokens.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0);
  return hits / tokens.length;
};

// Cache for embeddings to avoid recomputing
const embeddingCache = new Map<string, number[]>();

/**
 * Retrieve local context using semantic embeddings (with fallback to keyword matching)
 */
export const retrieveLocalContext = async (query: string, useEmbeddings: boolean = true): Promise<RagSource[]> => {
  // Try embeddings first if enabled
  if (useEmbeddings) {
    try {
      const queryEmbedding = await getEmbedding(query);
      
      // Get all items with their text
      const allItems: Array<{ text: string; source: RagSource }> = [];
      
      destinations.forEach((d) => {
        allItems.push({
          text: `${d.name} ${d.description} ${d.category}`,
          source: {
            title: d.name,
            snippet: d.description,
            score: 0,
            type: 'destination',
          },
        });
      });

      itineraries.forEach((itinerary) => {
        allItems.push({
          text: `${itinerary.title} ${itinerary.activities.join(' ')}`,
          source: {
            title: itinerary.title,
            snippet: `${itinerary.duration} day(s) • ₹${formatINR(itinerary.estimatedCost)} • ${itinerary.activities.slice(0, 2).join(', ')}`,
            score: 0,
            type: 'itinerary',
          },
        });
      });

      guides.forEach((guide) => {
        allItems.push({
          text: `${guide.name} ${guide.specialties.join(' ')} ${guide.languages.join(' ')}`,
          source: {
            title: guide.name,
            snippet: `${guide.specialties.slice(0, 2).join(', ')} • ₹${formatINR(guide.pricePerDay)}/day • ${guide.languages.join(', ')}`,
            score: 0,
            type: 'guide',
          },
        });
      });

      // Calculate similarities
      const results = await Promise.all(
        allItems.map(async (item) => {
          const cacheKey = item.text.toLowerCase().trim();
          let itemEmbedding = embeddingCache.get(cacheKey);
          
          if (!itemEmbedding) {
            itemEmbedding = await getEmbedding(item.text);
            embeddingCache.set(cacheKey, itemEmbedding);
          }
          
          const similarity = cosineSimilarity(queryEmbedding, itemEmbedding);
          return { ...item.source, score: similarity };
        })
      );

      // Filter by threshold and return top results
      return results
        .filter((item) => item.score > 0.1) // Threshold for relevance
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    } catch (error) {
      console.warn('Embedding retrieval failed, falling back to keyword matching:', error);
      // Fall through to keyword matching
    }
  }

  // Fallback to keyword matching
  const destinationHits: RagSource[] = destinations.map((d) => ({
    title: d.name,
    snippet: d.description,
    score: scoreMatch(`${d.name} ${d.description} ${d.category}`, query),
    type: 'destination',
  }));

  const itineraryHits: RagSource[] = itineraries.map((itinerary) => ({
    title: itinerary.title,
    snippet: `${itinerary.duration} day(s) • ₹${formatINR(itinerary.estimatedCost)} • ${itinerary.activities.slice(0, 2).join(', ')}`,
    score: scoreMatch(`${itinerary.title} ${itinerary.activities.join(' ')}`, query),
    type: 'itinerary',
  }));

  const guideHits: RagSource[] = guides.map((guide) => ({
    title: guide.name,
    snippet: `${guide.specialties.slice(0, 2).join(', ')} • ₹${formatINR(guide.pricePerDay)}/day • ${guide.languages.join(', ')}`,
    score: scoreMatch(`${guide.name} ${guide.specialties.join(' ')} ${guide.languages.join(' ')}`, query),
    type: 'guide',
  }));

  return [...destinationHits, ...itineraryHits, ...guideHits]
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
};

export const buildLocalBudgetSignals = (): BudgetSource[] =>
  itineraries.map((itinerary) => ({
    label: `${itinerary.title} (${itinerary.duration}d)`,
    amount: Math.max(1, Math.round(itinerary.estimatedCost / Math.max(itinerary.duration, 1))),
    sourceType: 'local',
    note: 'Baseline from saved itinerary',
  }));

export const fetchWebContext = async (query: string): Promise<RagSource[]> => {
  if (import.meta.env.VITE_SEARCH_PROXY) {
    try {
      const response = await fetch(`${import.meta.env.VITE_SEARCH_PROXY}?q=${encodeURIComponent(`${query} travel guide attractions itinerary`)}`);
      const payload = await response.json();
      if (payload?.results?.length) {
        return payload.results.slice(0, 5).map((item: any) => ({
          title: item.title || 'Web result',
          snippet: item.snippet || item.description || 'Web search result',
          score: 0.8,
          type: 'web' as const,
          url: item.url,
        }));
      }
    } catch (error) {
      console.warn('Web search proxy unavailable:', error);
    }
  }
  // Fallback: Use Wikipedia and Wikivoyage public APIs when no proxy is set
  try {
    const q = `${query} travel guide attractions itinerary`;
    const wikiResp = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*`
    );
    const wikiJson = await wikiResp.json();
    const wikiResults: RagSource[] = Array.isArray(wikiJson?.query?.search)
      ? wikiJson.query.search.slice(0, 5).map((item: any) => {
          const title: string = item.title || 'Wikipedia result';
          const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;
          const snippet = String(item.snippet || '')
            .replace(/<\/?[^>]+>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&');
          return { title, snippet, score: 0.6, type: 'web', url };
        })
      : [];

    const voyageResp = await fetch(
      `https://en.wikivoyage.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*`
    );
    const voyageJson = await voyageResp.json();
    const voyageResults: RagSource[] = Array.isArray(voyageJson?.query?.search)
      ? voyageJson.query.search.slice(0, 5).map((item: any) => {
          const title: string = item.title || 'Wikivoyage result';
          const url = `https://en.wikivoyage.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;
          const snippet = String(item.snippet || '')
            .replace(/<\/?[^>]+>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&');
          return { title, snippet, score: 0.6, type: 'web', url };
        })
      : [];

    const combined = [...wikiResults, ...voyageResults];
    if (combined.length) return combined.slice(0, 5);
  } catch (err) {
    console.warn('Fallback web fetch failed:', err);
  }
  return [];
};

export const fetchWebBudgetSignals = async (query: string): Promise<BudgetSource[]> => {
  if (import.meta.env.VITE_SEARCH_PROXY) {
    try {
      const response = await fetch(`${import.meta.env.VITE_SEARCH_PROXY}?q=${encodeURIComponent(`${query} travel budget per day cost`)}`);
      const payload = await response.json();
      if (payload?.results?.length) {
        return payload.results.slice(0, 3).map((item: any) => ({
          label: item.title || 'Web budget signal',
          amount: Math.max(1, Math.round(Number(item.budget) || Math.random() * 3000 + 2000)),
          sourceType: 'web',
          url: item.url,
          note: item.snippet || 'Web search result',
        }));
      }
    } catch (error) {
      console.warn('Web search proxy unavailable, using fallback:', error);
    }
  }
  return fallbackWebSignals;
};

export const aggregateBudget = (webSignals: BudgetSource[], localSignals: BudgetSource[]): BudgetEstimate => {
  const signals = [...localSignals, ...webSignals].filter((s) => Number.isFinite(s.amount) && s.amount > 0);
  if (!signals.length) {
    return {
      low: 2000,
      high: 6000,
      currency: 'INR',
      basis: 'Fallback baseline (no signals available)',
      sources: fallbackWebSignals,
    };
  }
  const amounts = signals.map((s) => s.amount);
  const low = Math.round(Math.min(...amounts) * 0.9);
  const high = Math.round(Math.max(...amounts) * 1.15);
  return {
    low,
    high,
    currency: 'INR',
    basis: webSignals.length ? 'Web signals + local library' : 'Local library + mock web baseline',
    sources: signals.slice(0, 6),
  };
};

export const callGemini = async (
  prompt: string,
  localContext: RagSource[],
  webContext: RagSource[],
  budget?: BudgetEstimate
): Promise<{ text: string; budget?: BudgetEstimate } | null> => {
  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp';
  const proxyEndpoint = import.meta.env.VITE_GEMINI_PROXY;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Prefer proxy endpoint if configured
  if (proxyEndpoint) {
    try {
      console.log('🔍 Calling Gemini via proxy:', proxyEndpoint);
      const response = await fetch(proxyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, localContext, webContext, budget }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Proxy returned status ${response.status}:`, errorText);
        // Try to parse error JSON
        try {
          const errorData = JSON.parse(errorText);
          console.error('Error details:', errorData);
        } catch {}
        // Continue to direct API fallback
      } else {
        const data = await response.json();
        const text: string = data?.text || data?.output || '';
        if (text) {
          console.log(`✅ Gemini proxy response received, length: ${text.length} chars`);
        } else {
          console.warn('⚠️ Proxy response empty or missing text field');
        }
        let parsedBudget: BudgetEstimate | undefined;
        const match = typeof text === 'string' ? text.match(/```json\s*([\s\S]*?)\s*```/) : null;
        if (match) {
          try {
            const obj = JSON.parse(match[1]);
            if (obj && typeof obj.low === 'number' && typeof obj.high === 'number') {
              const categories = Array.isArray(obj.categories) ? obj.categories : [];
              parsedBudget = {
                low: obj.low,
                high: obj.high,
                currency: obj.currency || 'INR',
                basis: obj.basis || 'Gemini synthesis',
                sources: categories.map((c: any) => ({ label: String(c.label || 'Category'), amount: Number(c.amount) || 0, sourceType: 'web' })),
              };
            }
          } catch {}
        }
        return { text, budget: parsedBudget };
      }
    } catch (error) {
      console.error('❌ Gemini proxy unavailable:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
    }
  }

  // Direct API fallback
  if (!apiKey) {
    console.error('❌ No Gemini API key configured (VITE_GEMINI_API_KEY)');
    return null;
  }
  
  console.log('🔄 Falling back to direct Gemini API call');
  try {
    const localContextText = localContext
      .map((c) => `LOCAL ${c.type}: ${c.title} — ${c.snippet}`)
      .slice(0, 6)
      .join('\n');

    const webContextText = webContext
      .map((c) => `WEB: ${c.title} — ${c.snippet}`)
      .slice(0, 4)
      .join('\n');

    const body = {
      contents: [
        {
          parts: [
            {
              text: [
                'You are an expert Indian travel planner specializing in Kolkata and West Bengal.',
                `User request: ${prompt}`,
                '',
                'LOCAL KNOWLEDGE (from curated database):',
                localContextText || 'No local matches found.',
                '',
                'WEB INSIGHTS (current information):',
                webContextText || 'Synthesized by model.',
                '',
                'INSTRUCTIONS:',
                '1. Produce a single concise combined answer: Overview, Sights, Suggested flow, Food, Value tip',
                '2. FIRST output a JSON fenced block with a BudgetEstimate object: { low, high, currency:"INR", basis, categories:[{label, percent, amount}] }',
                '3. THEN output human-readable bullets. Keep it realistic and current; synthesize any web context as needed',
              ].join('\n'),
            },
          ],
        },
      ],
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    console.log(`📡 Calling Gemini API directly: ${url.split('?')[0]}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Direct API returned status ${response.status}:`, errorText);
      try {
        const errorData = JSON.parse(errorText);
        console.error('Error details:', errorData);
      } catch {}
      return null;
    }
    
    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (text) {
      console.log(`✅ Gemini direct response received, length: ${text.length} chars`);
    } else {
      console.warn('⚠️ Direct API response empty or missing text');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
    let parsedBudget: BudgetEstimate | undefined;
    const match = typeof text === 'string' ? text.match(/```json\s*([\s\S]*?)\s*```/) : null;
    if (match) {
      try {
        const obj = JSON.parse(match[1]);
        if (obj && typeof obj.low === 'number' && typeof obj.high === 'number') {
          const categories = Array.isArray(obj.categories) ? obj.categories : [];
          parsedBudget = {
            low: obj.low,
            high: obj.high,
            currency: obj.currency || 'INR',
            basis: obj.basis || 'Gemini synthesis',
            sources: categories.map((c: any) => ({ label: String(c.label || 'Category'), amount: Number(c.amount) || 0, sourceType: 'web' })),
          };
        }
      } catch {}
    }
    return { text, budget: parsedBudget };
  } catch (error) {
    console.warn('Gemini direct call failed:', error);
    return null;
  }
};


export const craftAssistantReply = (
  query: string,
  localContext: RagSource[],
  budget: BudgetEstimate,
  llmText?: string
) => {
  const destinationsPicked = localContext.filter((c) => c.type === 'destination').slice(0, 3);
  const itinerariesPicked = localContext.filter((c) => c.type === 'itinerary').slice(0, 2);
  const guidesPicked = localContext.filter((c) => c.type === 'guide').slice(0, 2);
  // Web insights disabled; rely on Gemini synthesis

  const budgetLine = `Budget: ₹${formatINR(budget.low)} - ₹${formatINR(budget.high)} per day (${budget.basis})`;

  const localKnowledgeLines: string[] = [];
  if (destinationsPicked.length) {
    localKnowledgeLines.push(`Local destinations: ${destinationsPicked.map((d) => d.title).join(', ')}`);
  }
  if (itinerariesPicked.length) {
    localKnowledgeLines.push(`Template itineraries: ${itinerariesPicked.map((it) => it.title).join(' | ')}`);
  }
  if (guidesPicked.length) {
    localKnowledgeLines.push(`Available guides: ${guidesPicked.map((g) => g.title).join(', ')}`);
  }

  // Web insights omitted

  const combinedAnalysis = [
    `Combined travel plan for "${query}":`,
    budgetLine,
    '',
    'Local knowledge:',
    ...localKnowledgeLines.map(line => `- ${line}`),
    localKnowledgeLines.length === 0 ? '- No local matches found; synthesizing from other signals.' : '',
    '',
    // Web insights omitted (Gemini synthesis used instead)
  ].filter(line => line !== '');

  const llmSection = llmText 
    ? [ '', 'AI recommendation (combined sources):', llmText ]
    : [ '', 'AI synthesis unavailable; showing retrieved data above.' ];

  const footer = [
    '',
    'Next steps: ask to expand the itinerary, show luxury options, or add cultural experiences.'
  ];

  return [...combinedAnalysis, ...llmSection, ...footer].join('\n');
};

