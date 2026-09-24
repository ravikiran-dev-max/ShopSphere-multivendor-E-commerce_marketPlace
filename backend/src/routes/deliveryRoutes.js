import express from 'express';
import {
  getAssignedDeliveries,
  getDeliveryById,
  generateOTP,
  verifyOTP,
} from '../controllers/deliveryController.js';
import { authenticateUser, requireDelivery } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/assigned', requireDelivery, getAssignedDeliveries);
router.get('/:id', getDeliveryById);
router.post('/:id/generate-otp', requireDelivery, generateOTP);
router.post('/:id/verify-otp', requireDelivery, verifyOTP);

export default router;
