import { Router } from 'express';
import {
  getMyBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getAllBookings
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Protected routes (any authenticated user)
router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.post('/', authenticate, createBooking);
router.patch('/:id/cancel', authenticate, cancelBooking);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllBookings);
router.patch('/:id/status', authenticate, authorize('admin'), updateBookingStatus);

export default router;































