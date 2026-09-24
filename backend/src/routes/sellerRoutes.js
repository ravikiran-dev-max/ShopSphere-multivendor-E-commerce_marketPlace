import express from 'express';
import {
  getAllSellers,
  getSellerBySlug,
  updateSellerStatus,
  updateSellerProfile,
  getSellerDashboardStats,
} from '../controllers/sellerController.js';
import { authenticateUser, requireAdmin, requireSeller } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllSellers);
router.get('/store/:slug', getSellerBySlug);
router.put('/my-store', requireSeller, updateSellerProfile);
router.get('/dashboard-stats', requireSeller, getSellerDashboardStats);
router.patch('/:id/status', requireAdmin, updateSellerStatus);

export default router;
