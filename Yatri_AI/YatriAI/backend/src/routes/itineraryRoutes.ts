import { Router } from 'express';
import {
  getMyItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  generateAIItinerary
} from '../controllers/itineraryController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Protected routes (tourist users)
router.get('/my', authenticate, getMyItineraries);
router.get('/:id', authenticate, getItineraryById);
router.post('/', authenticate, createItinerary);
router.put('/:id', authenticate, updateItinerary);
router.delete('/:id', authenticate, deleteItinerary);

// AI itinerary generation
router.post('/generate', authenticate, generateAIItinerary);

export default router;































