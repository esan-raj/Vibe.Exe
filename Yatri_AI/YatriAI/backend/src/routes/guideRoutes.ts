import { Router } from 'express';
import {
  getAllGuides,
  getGuideById,
  getMyGuideProfile,
  updateGuideProfile,
  createTour,
  updateTour,
  deleteTour,
  updateGuideBookingStatus,
  getMyTours,
  getPendingTours,
  approveTour,
  getApprovedTours
} from '../controllers/guideController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllGuides);
router.get('/tours/approved', getApprovedTours); // Must be before /:id route
router.get('/:id', getGuideById);

// Guide protected routes
router.get('/profile/me', authenticate, authorize('guide'), getMyGuideProfile);
router.put('/profile', authenticate, authorize('guide'), updateGuideProfile);

// Tour management (guide only)
router.get('/tours/my', authenticate, authorize('guide'), getMyTours);
router.post('/tours', authenticate, authorize('guide'), createTour);
router.put('/tours/:id', authenticate, authorize('guide'), updateTour);
router.delete('/tours/:id', authenticate, authorize('guide'), deleteTour);

// Admin routes for tour approval
router.get('/tours/pending', authenticate, authorize('admin'), getPendingTours);
router.patch('/tours/:id/approve', authenticate, authorize('admin'), approveTour);

// Booking management (guide only)
router.patch('/bookings/:id/status', authenticate, authorize('guide'), updateGuideBookingStatus);

export default router;






























