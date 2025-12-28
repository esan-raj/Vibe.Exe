import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Admin routes
router.get('/', authenticate, authorize('admin'), getAnalytics);

export default router;


