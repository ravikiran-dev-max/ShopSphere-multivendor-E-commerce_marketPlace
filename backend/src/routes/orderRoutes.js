import express from 'express';
import {
  checkoutOrder,
  getOrders,
  updateSellerOrderStatus,
} from '../controllers/orderController.js';
import { authenticateUser, requireCustomer, requireSellerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', getOrders);
router.post('/checkout', requireCustomer, checkoutOrder);
router.patch('/seller-orders/:id/status', requireSellerOrAdmin, updateSellerOrderStatus);

export default router;
