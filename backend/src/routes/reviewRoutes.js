import express from 'express';
import {
  createReview,
  getProductReviews,
  checkReviewEligibility,
  getMyReviews,
} from '../controllers/reviewController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-reviews', authenticateUser, getMyReviews);
router.get('/eligibility/:productId', authenticateUser, checkReviewEligibility);
router.get('/:productId', getProductReviews);
router.post('/', authenticateUser, createReview);

export default router;

