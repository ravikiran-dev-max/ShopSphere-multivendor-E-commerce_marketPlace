import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductBySlug,
  getSellerProducts,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticateUser, requireSeller, requireSellerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/item/:slug', getProductBySlug);
router.get('/my-products', requireSeller, getSellerProducts);
router.post('/', requireSellerOrAdmin, createProduct);
router.put('/:id', requireSellerOrAdmin, updateProduct);
router.delete('/:id', requireSellerOrAdmin, deleteProduct);

export default router;
