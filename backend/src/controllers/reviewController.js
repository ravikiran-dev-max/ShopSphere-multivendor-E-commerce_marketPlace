import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import SellerOrder from '../models/SellerOrder.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment, images } = req.body;

  if (!productId || !rating || !comment) {
    throw new ApiError(400, 'Product ID, rating (1-5), and comment are required.');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  // Check if customer has a DELIVERED order for this product
  const purchasedSubOrder = await SellerOrder.findOne({
    customer: req.user._id,
    'items.product': productId,
    status: 'DELIVERED',
  });

  if (!purchasedSubOrder) {
    throw new ApiError(
      403,
      'You can only review products that you have purchased and received (DELIVERED).'
    );
  }

  // Check duplicate review
  const existingReview = await Review.findOne({ product: productId, customer: req.user._id });
  if (existingReview) {
    throw new ApiError(409, 'You have already submitted a review for this product.');
  }

  const review = await Review.create({
    product: productId,
    customer: req.user._id,
    seller: product.seller,
    rating: Number(rating),
    comment,
    images: images || [],
    isVerifiedPurchase: true,
  });

  // Re-calculate product aggregate rating
  const reviews = await Review.find({ product: productId });
  const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  product.ratingAverage = Number((totalRating / reviews.length).toFixed(1));
  product.ratingCount = reviews.length;
  await product.save();

  res.status(201).json(new ApiResponse(201, review, 'Review submitted successfully.'));
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('customer', 'name avatar')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, reviews, 'Product reviews fetched.'));
});

/**
 * @desc    Check if customer can review a product (has delivered order & not already reviewed)
 * @route   GET /api/v1/reviews/eligibility/:productId
 * @access  Private
 */
export const checkReviewEligibility = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const purchasedSubOrder = await SellerOrder.findOne({
    customer: req.user._id,
    'items.product': productId,
    status: 'DELIVERED',
  });

  const existingReview = await Review.findOne({
    product: productId,
    customer: req.user._id,
  });

  const canReview = !!purchasedSubOrder && !existingReview;

  res.status(200).json(
    new ApiResponse(200, {
      canReview,
      hasDeliveredOrder: !!purchasedSubOrder,
      hasReviewed: !!existingReview,
      existingReview,
    }, 'Review eligibility status.')
  );
});

/**
 * @desc    Get all reviews submitted by logged-in customer
 * @route   GET /api/v1/reviews/my-reviews
 * @access  Private
 */
export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ customer: req.user._id })
    .populate('product', 'title slug images price')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, reviews, 'Customer reviews retrieved.'));
});

/**
 * @desc    Delete review (Product Manager or Admin moderation)
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private (Product Manager or Admin)
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  const productId = review.product;
  await review.deleteOne();

  // Re-calculate product aggregate rating
  const reviews = await Review.find({ product: productId });
  const product = await Product.findById(productId);
  if (product) {
    if (reviews.length === 0) {
      product.ratingAverage = 0;
      product.ratingCount = 0;
    } else {
      const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
      product.ratingAverage = Number((totalRating / reviews.length).toFixed(1));
      product.ratingCount = reviews.length;
    }
    await product.save();
  }

  res.status(200).json(new ApiResponse(200, null, 'Review removed by moderation.'));
});


