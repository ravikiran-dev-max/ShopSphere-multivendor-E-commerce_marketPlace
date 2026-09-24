import express from 'express';
import {
  generateProductDescription,
  getSellerSalesInsights,
} from '../controllers/aiController.js';
import { requireSeller } from '../middleware/auth.js';

const router = express.Router();

router.use(requireSeller);

router.post('/generate-description', generateProductDescription);
router.get('/seller-insights', getSellerSalesInsights);

export default router;
