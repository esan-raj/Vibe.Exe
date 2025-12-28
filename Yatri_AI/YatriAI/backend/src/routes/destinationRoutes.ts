import { Router } from 'express';
import {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
} from '../controllers/destinationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);

// Admin routes
router.post('/', authenticate, authorize('admin'), createDestination);
router.put('/:id', authenticate, authorize('admin'), updateDestination);
router.delete('/:id', authenticate, authorize('admin'), deleteDestination);

export default router;































