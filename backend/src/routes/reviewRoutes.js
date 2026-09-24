import express from 'express';
import { createReview, getProductReviews } from '../controllers/reviewController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/', authenticateUser, createReview);

export default router;
