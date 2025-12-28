import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerStats,
  approveProduct,
  getPendingProducts
} from '../controllers/productController.js';
import { getAllSellers } from '../controllers/sellerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllProducts);

// Admin routes (must be before /:id route)
router.get('/sellers', authenticate, authorize('admin'), getAllSellers);
router.get('/pending', authenticate, authorize('admin'), getPendingProducts);
router.patch('/:id/approve', authenticate, authorize('admin'), approveProduct);

// Public routes (after specific routes)
router.get('/:id', getProductById);

// Seller protected routes
router.get('/seller/my-products', authenticate, authorize('seller'), getMyProducts);
router.get('/seller/stats', authenticate, authorize('seller'), getSellerStats);
router.post('/', authenticate, authorize('seller'), createProduct);
router.put('/:id', authenticate, authorize('seller'), updateProduct);
router.delete('/:id', authenticate, authorize('seller'), deleteProduct);

export default router;






























