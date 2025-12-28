import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { GoogleGenerativeAI } from '@google/generative-ai';
import authRoutes from './routes/authRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import productRoutes from './routes/productRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import itineraryRoutes from './routes/itineraryRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import trainRoutes from './routes/trainRoutes.js';
import mlRoutes from './routes/mlRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import sosAgentRoutes from './routes/sosAgent.js';

import pictureDeckRoutes from './routes/pictureDeckRoutes.js';

import placesRoutes from './routes/placesRoutes.js';
import beaconRoutes from './routes/beaconRoutes.js';
import { beaconService } from './services/beaconService.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load env from backend/.env and fallback to root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
try {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
} catch {}

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow all origins in development
  credentials: true
}));
app.use(express.json());

// Serve static files for audio
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sos', sosAgentRoutes);

app.use('/api/picture-deck', pictureDeckRoutes);

app.use('/api/places', placesRoutes);
app.use('/api/beacon', beaconRoutes);


// Initialize Gemini AI client
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('✅ Gemini AI SDK initialized');
} else {
  console.warn('⚠️ Gemini API key not found - Gemini features will be disabled');
}

// Gemini proxy to avoid CORS and hide API key
app.post('/gemini', async (req, res) => {
  try {
    // Default to latest free Flash model: gemini-2.0-flash-exp or fallback to gemini-1.5-flash
    const { model = 'gemini-2.0-flash-exp', prompt, localContext = [], webContext = [], budget } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing required field: prompt' });
    }

    if (!genAI) {
      const apiKeyCheck = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKeyCheck) {
        console.error('❌ Gemini API key not found in environment variables');
        return res.status(500).json({ error: 'Gemini API key not configured on server' });
      }
      genAI = new GoogleGenerativeAI(apiKeyCheck);
    }

    console.log(`🔍 Gemini proxy called with model: ${model} (using SDK)`);

    const contextText = [...(Array.isArray(localContext) ? localContext : []), ...(Array.isArray(webContext) ? webContext : [])]
      .slice(0, 8)
      .map((c: any) => `${c.type || 'context'}: ${c.title || ''} — ${c.snippet || ''}`)
      .join('\n');

    const budgetText = budget
      ? `Budget window: ₹${new Intl.NumberFormat('en-IN').format(budget.low)} - ₹${new Intl.NumberFormat('en-IN').format(budget.high)} (${budget.basis}).`
      : 'Budget not provided.';

    const fullPrompt = [
      'You are a concise Indian travel planner for Kolkata.',
      `User request: ${prompt}`,
      budgetText,
      contextText ? `Context:\n${contextText}` : 'No retrieved context.',
      'Return 2-4 bullets: sights, suggested flow, food, and a one-line value tip.',
    ].join('\n\n');

    // Use SDK instead of REST API
    const generativeModel = genAI.getGenerativeModel({ model });
    const result = await generativeModel.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ Gemini SDK response received, length: ${text?.length || 0} chars`);
    return res.json({ text: typeof text === 'string' ? text : '' });
  } catch (error: any) {
    console.error('❌ Gemini proxy error:', error?.message || error);
    
    // If model not found, try fallback to gemini-1.5-flash
    if (error?.message?.includes('not found') || error?.message?.includes('404')) {
      const fallbackModel = 'gemini-1.5-flash';
      console.log(`🔄 Trying fallback model: ${fallbackModel}`);
      try {
        const { prompt, localContext = [], webContext = [], budget } = req.body;
        const contextText = [...(Array.isArray(localContext) ? localContext : []), ...(Array.isArray(webContext) ? webContext : [])]
          .slice(0, 8)
          .map((c: any) => `${c.type || 'context'}: ${c.title || ''} — ${c.snippet || ''}`)
          .join('\n');
        const budgetText = budget
          ? `Budget window: ₹${new Intl.NumberFormat('en-IN').format(budget.low)} - ₹${new Intl.NumberFormat('en-IN').format(budget.high)} (${budget.basis}).`
          : 'Budget not provided.';
        const fullPrompt = [
          'You are a concise Indian travel planner for Kolkata.',
          `User request: ${prompt}`,
          budgetText,
          contextText ? `Context:\n${contextText}` : 'No retrieved context.',
          'Return 2-4 bullets: sights, suggested flow, food, and a one-line value tip.',
        ].join('\n\n');
        
        const generativeModel = genAI!.getGenerativeModel({ model: fallbackModel });
        const result = await generativeModel.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        console.log(`✅ Gemini fallback response received, length: ${text?.length || 0} chars`);
        return res.json({ text: typeof text === 'string' ? text : '' });
      } catch (fallbackError: any) {
        console.error('❌ Fallback also failed:', fallbackError?.message || fallbackError);
      }
    }
    
    return res.status(500).json({ 
      error: 'Gemini proxy failed',
      details: error?.message || 'Unknown error'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Initialize beacon service with Socket.IO
beaconService.initialize(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 YatriAI Backend running on http://localhost:${PORT}`);
  console.log(`🌐 Network access: http://10.79.157.114:${PORT}`);
  console.log(`🔗 Socket.IO enabled for beacon nodes`);
});

export default app;














