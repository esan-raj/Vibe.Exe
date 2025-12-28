/**
 * YatriAI Translation Server
 * 
 * Express server that provides translation caching using Google Translate (primary)
 * with MyMemory as fallback.
 * 
 * Features:
 * - In-memory cache for translated text
 * - Google Translate (more reliable, higher limits)
 * - Rate limiting protection with delays
 * - Batch translation support
 * 
 * Run: npm run dev (development) or npm start (production)
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { translate } from '@vitalets/google-translate-api';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// In-Memory Translation Cache
// ============================================

interface CacheEntry {
  translatedText: string;
  timestamp: number;
}

const translationCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_SIZE = 10000;

const getCacheKey = (text: string, sourceLang: string, targetLang: string): string => {
  return `${sourceLang}:${targetLang}:${text}`;
};

const getFromCache = (text: string, sourceLang: string, targetLang: string): string | null => {
  const key = getCacheKey(text, sourceLang, targetLang);
  const entry = translationCache.get(key);
  
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    translationCache.delete(key);
    return null;
  }
  
  return entry.translatedText;
};

const saveToCache = (text: string, sourceLang: string, targetLang: string, translatedText: string): void => {
  if (translationCache.size >= MAX_CACHE_SIZE) {
    const entriesToRemove = Math.floor(MAX_CACHE_SIZE * 0.1);
    const iterator = translationCache.keys();
    for (let i = 0; i < entriesToRemove; i++) {
      const key = iterator.next().value;
      if (key) translationCache.delete(key);
    }
  }
  
  const key = getCacheKey(text, sourceLang, targetLang);
  translationCache.set(key, {
    translatedText,
    timestamp: Date.now(),
  });
};

const getCacheStats = () => ({
  size: translationCache.size,
  maxSize: MAX_CACHE_SIZE,
  ttlDays: CACHE_TTL_MS / (24 * 60 * 60 * 1000),
});

// ============================================
// Middleware
// ============================================

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// Translation Functions
// ============================================

// Map our language codes to Google Translate codes
const getGoogleLangCode = (lang: string): string => {
  const langMap: Record<string, string> = {
    'en': 'en',
    'hi': 'hi',
    'bn': 'bn',
    'fr': 'fr',
    'es': 'es',
    'ar': 'ar',
    'de': 'de',
    'ja': 'ja',
    'zh': 'zh-CN',
    'ko': 'ko',
  };
  return langMap[lang] || lang;
};

/**
 * Translate using Google Translate API (unofficial but reliable)
 */
const translateWithGoogle = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> => {
  try {
    const result = await translate(text, {
      from: getGoogleLangCode(sourceLang),
      to: getGoogleLangCode(targetLang),
    });
    
    if (result && result.text) {
      console.log(`✅ Google: "${text.substring(0, 25)}..." → "${result.text.substring(0, 25)}..."`);
      return result.text;
    }
    
    return null;
  } catch (error) {
    console.warn('⚠️ Google Translate error:', error instanceof Error ? error.message : 'Unknown');
    return null;
  }
};

/**
 * Main translation function with caching
 */
const attemptTranslation = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  // Check cache first
  const cached = getFromCache(text, sourceLang, targetLang);
  if (cached) {
    console.log(`📦 Cache hit: "${text.substring(0, 25)}..."`);
    return cached;
  }
  
  // Try Google Translate
  const googleResult = await translateWithGoogle(text, sourceLang, targetLang);
  if (googleResult) {
    saveToCache(text, sourceLang, targetLang, googleResult);
    return googleResult;
  }
  
  // All APIs failed, return original text
  console.error(`❌ Translation failed for: "${text.substring(0, 30)}..."`);
  return text;
};

// ============================================
// API Routes
// ============================================

/**
 * POST /translate - Single text translation
 */
app.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, sourceLang = 'en', targetLang } = req.body;
    
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing required fields: text, targetLang' });
    }
    
    // Don't translate if same language
    if (sourceLang === targetLang) {
      return res.json({ translatedText: text, cached: true });
    }
    
    const translatedText = await attemptTranslation(text, sourceLang, targetLang);
    
    res.json({
      translatedText,
      cached: getFromCache(text, sourceLang, targetLang) !== null,
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

/**
 * POST /translate/batch - Batch translation with rate limiting
 */
app.post('/translate/batch', async (req: Request, res: Response) => {
  try {
    const { texts, sourceLang = 'en', targetLang } = req.body;
    
    if (!Array.isArray(texts) || texts.length === 0 || !targetLang) {
      return res.status(400).json({ error: 'Missing required fields: texts (array), targetLang' });
    }
    
    // Don't translate if same language
    if (sourceLang === targetLang) {
      return res.json({
        translations: texts.map((text: string) => ({
          text,
          translatedText: text,
          cached: true,
        })),
      });
    }
    
    console.log(`📦 Batch translating ${texts.length} texts (${sourceLang} → ${targetLang})`);
    
    const translations = [];
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      
      // Check cache first
      const cached = getFromCache(text, sourceLang, targetLang);
      if (cached) {
        translations.push({ text, translatedText: cached, cached: true });
        continue;
      }
      
      // Translate with Google
      const translatedText = await attemptTranslation(text, sourceLang, targetLang);
      translations.push({ text, translatedText, cached: false });
      
      // Longer delay to avoid Google Translate rate limiting (500ms between requests)
      if (i < texts.length - 1 && !cached) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`✅ Batch complete: ${translations.filter(t => t.cached).length} cached, ${translations.filter(t => !t.cached).length} translated`);
    
    res.json({ translations });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({ error: 'Batch translation failed' });
  }
});

/**
 * GET /cache/stats - Get cache statistics
 */
app.get('/cache/stats', (_req: Request, res: Response) => {
  res.json(getCacheStats());
});

/**
 * DELETE /cache - Clear translation cache
 */
app.delete('/cache', (_req: Request, res: Response) => {
  const previousSize = translationCache.size;
  translationCache.clear();
  res.json({ message: `Cache cleared. Removed ${previousSize} entries.` });
});

/**
 * GET /health - Health check
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cache: getCacheStats(),
    api: 'Google Translate',
  });
});

/**
 * POST /gemini - Proxy to Google Generative Language API
 * Avoids browser CORS and hides API key. Expects body: { model?, prompt, context?, budget? }
 */
app.post('/gemini', async (req: Request, res: Response) => {
  try {
    const { model = 'gemini-1.5-pro', prompt, context = [], budget } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing required field: prompt' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured on server' });
    }

    const contextText = Array.isArray(context)
      ? context
          .slice(0, 8)
          .map((c: any) => `${c.type || 'context'}: ${c.title || ''} — ${c.snippet || ''}`)
          .join('\n')
      : '';

    const budgetText = budget
      ? `Budget window: ₹${new Intl.NumberFormat('en-IN').format(budget.low)} - ₹${new Intl.NumberFormat('en-IN').format(budget.high)} (${budget.basis}).`
      : 'Budget not provided.';

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: [
                'You are a concise Indian travel planner for Kolkata.',
                `User request: ${prompt}`,
                budgetText,
                contextText ? `Context:\n${contextText}` : 'No retrieved context.',
                'Return 2-4 bullets: sights, suggested flow, food, and a one-line value tip.',
              ].join('\n\n'),
            },
          ],
        },
      ],
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const err = await resp.text();
      return res.status(502).json({ error: 'Gemini API error', details: err });
    }
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ text: typeof text === 'string' ? text : '' });
  } catch (error) {
    console.error('Gemini proxy error:', error);
    res.status(500).json({ error: 'Gemini proxy failed' });
  }
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              YatriAI Translation Server                    ║
╠════════════════════════════════════════════════════════════╣
║  🌐 Server running on http://localhost:${PORT}                ║
║  📦 Cache: In-memory (${MAX_CACHE_SIZE.toLocaleString()} entries max)              ║
║  ⏰ Cache TTL: 7 days                                       ║
║  🔗 API: Google Translate                                  ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║  POST /translate       - Single text translation           ║
║  POST /translate/batch - Batch translation                 ║
║  GET  /cache/stats     - Cache statistics                  ║
║  DELETE /cache         - Clear cache                       ║
║  GET  /health          - Health check                      ║
╚════════════════════════════════════════════════════════════╝
  `);
});
