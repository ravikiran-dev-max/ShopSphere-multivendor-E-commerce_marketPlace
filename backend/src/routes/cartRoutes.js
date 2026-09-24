import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
} from '../controllers/cartController.js';
import { requireCustomer } from '../middleware/auth.js';

const router = express.Router();

router.use(requireCustomer); // All cart routes require CUSTOMER authentication

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.post('/coupon', applyCoupon);

export default router;
