import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  updateProductDiscount,
  updateProductStatus,
  toggleProductFeature,
  getProductManagerAnalytics,
} from '../controllers/productController.js';
import {
  authenticateUser,
  requireSeller,
  requireSellerOrAdmin,
  requireProductManager,
} from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/item/:slug', getProductBySlug);
router.get('/my-products', requireSeller, getSellerProducts);
router.get('/manager/analytics', requireProductManager, getProductManagerAnalytics);

router.post('/', requireSellerOrAdmin, createProduct);
router.put('/:id', requireSellerOrAdmin, updateProduct);
router.delete('/:id', requireSellerOrAdmin, deleteProduct);

// Product Manager Operations (Discounts, Status/Outdated, Feature)
router.patch('/:id/discount', requireProductManager, updateProductDiscount);
router.patch('/:id/status', requireProductManager, updateProductStatus);
router.patch('/:id/feature', requireProductManager, toggleProductFeature);

export default router;

