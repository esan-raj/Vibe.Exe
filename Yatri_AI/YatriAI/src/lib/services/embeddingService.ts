/**
 * Embedding Service
 * 
 * Provides semantic embeddings for text using a lightweight model.
 * Uses @xenova/transformers for browser-compatible inference.
 * Falls back to keyword matching if model not available.
 */

import { destinations, itineraries, guides } from '../../data/mockData';

// Simple TF-IDF based embeddings as fallback (no external dependencies)
class SimpleEmbeddingService {
  private vocabulary: Map<string, number> = new Map();
  private documentVectors: Map<string, number[]> = new Map();
  private initialized = false;

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private buildVocabulary() {
    const allTexts: string[] = [];
    
    // Collect all text from destinations, itineraries, guides
    destinations.forEach(d => {
      allTexts.push(`${d.name} ${d.description} ${d.category}`);
    });
    
    itineraries.forEach(it => {
      allTexts.push(`${it.title} ${it.activities.join(' ')}`);
    });
    
    guides.forEach(g => {
      allTexts.push(`${g.name} ${g.specialties.join(' ')} ${g.languages.join(' ')}`);
    });

    // Build vocabulary
    const vocabSet = new Set<string>();
    allTexts.forEach(text => {
      this.tokenize(text).forEach(word => vocabSet.add(word));
    });

    let index = 0;
    vocabSet.forEach(word => {
      this.vocabulary.set(word, index++);
    });
  }

  private computeTFIDF(text: string, allTexts: string[]): number[] {
    const tokens = this.tokenize(text);
    const vocabSize = this.vocabulary.size;
    const vector = new Array(vocabSize).fill(0);

    // Term Frequency
    const tf: Map<string, number> = new Map();
    tokens.forEach(token => {
      tf.set(token, (tf.get(token) || 0) + 1);
    });

    // Document Frequency
    const df: Map<string, number> = new Map();
    allTexts.forEach(doc => {
      const docTokens = new Set(this.tokenize(doc));
      docTokens.forEach(token => {
        if (this.vocabulary.has(token)) {
          df.set(token, (df.get(token) || 0) + 1);
        }
      });
    });

    // Compute TF-IDF
    const totalDocs = allTexts.length;
    tokens.forEach(token => {
      const vocabIndex = this.vocabulary.get(token);
      if (vocabIndex !== undefined) {
        const termFreq = tf.get(token) || 0;
        const docFreq = df.get(token) || 1;
        const idf = Math.log(totalDocs / docFreq);
        vector[vocabIndex] = (termFreq / tokens.length) * idf;
      }
    });

    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  async initialize() {
    if (this.initialized) return;
    
    this.buildVocabulary();
    this.initialized = true;
  }

  async encode(text: string): Promise<number[]> {
    await this.initialize();
    
    const allTexts: string[] = [
      ...destinations.map(d => `${d.name} ${d.description} ${d.category}`),
      ...itineraries.map(it => `${it.title} ${it.activities.join(' ')}`),
      ...guides.map(g => `${g.name} ${g.specialties.join(' ')}`),
    ];

    return this.computeTFIDF(text, allTexts);
  }

  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }
}

// Export singleton instance
export const embeddingService = new SimpleEmbeddingService();

// Pre-computed embeddings cache
const embeddingCache = new Map<string, number[]>();

export async function getEmbedding(text: string): Promise<number[]> {
  const cacheKey = text.toLowerCase().trim();
  
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  const embedding = await embeddingService.encode(text);
  embeddingCache.set(cacheKey, embedding);
  
  return embedding;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  return embeddingService.cosineSimilarity(vecA, vecB);
}










