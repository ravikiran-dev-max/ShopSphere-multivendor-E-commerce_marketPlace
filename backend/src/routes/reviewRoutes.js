import express from 'express';
import {
  createReview,
  getProductReviews,
  checkReviewEligibility,
  getMyReviews,
  deleteReview,
} from '../controllers/reviewController.js';
import { authenticateUser, requireProductManager } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-reviews', authenticateUser, getMyReviews);
router.get('/eligibility/:productId', authenticateUser, checkReviewEligibility);
router.get('/:productId', getProductReviews);
router.post('/', authenticateUser, createReview);
router.delete('/:id', requireProductManager, deleteReview);

export default router;

