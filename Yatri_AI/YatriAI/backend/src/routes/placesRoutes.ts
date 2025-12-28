import express from 'express';
import { getNearbyPlaces, getPlaceDetails, getAISuggestions } from '../controllers/placesController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get nearby places within specified radius
router.post('/nearby', authenticate, getNearbyPlaces);

// Get AI-powered suggestions for restaurants, transit, and shopping
router.post('/ai-suggestions', authenticate, getAISuggestions);

// Get details of a specific place
router.get('/:id', authenticate, getPlaceDetails);

export default router;