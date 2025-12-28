import { Router } from 'express';
import { analyzeMonument, uploadMiddleware } from '../controllers/pictureDeckController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Protected route for monument analysis
router.post('/analyze', authenticate, uploadMiddleware, analyzeMonument);

export default router;