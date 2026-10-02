import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiStar,
  FiShoppingCart,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiShoppingBag,
  FiCheckCircle,
  FiSend,
  FiMessageSquare,
  FiAlertCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';
import useAuthStore from '../store/useAuthStore.js';

const ProductDetails = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [eligibility, setEligibility] = useState({ canReview: false, hasDeliveredOrder: false, hasReviewed: false });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  // Inline Review Form state
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [slug]);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/products/item/${slug}`);
      const data = res.data.data;
      setProduct(data);
      setSelectedImage(data.images?.[0]?.url || '');

      // Fetch reviews and eligibility in parallel
      if (data?._id) {
        fetchReviews(data._id);
        if (isAuthenticated && user?.role === 'CUSTOMER') {
          checkReviewEligibility(data._id);
        }
      }
    } catch (error) {
      toast.error('Product not found.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async (productId) => {
    try {
      const res = await api.get(`/reviews/${productId}`);
      setReviews(res.data.data || []);
    } catch (e) {
      console.log('Error fetching reviews', e);
    }
  };

  const checkReviewEligibility = async (productId) => {
    try {
      const res = await api.get(`/reviews/eligibility/${productId}`);
      setEligibility(res.data.data || {});
    } catch (e) {
      console.log('Error checking eligibility', e);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your cart.');
      return;
    }
    if (user?.role !== 'CUSTOMER') {
      toast.error('Only Customer accounts can add items to cart.');
      return;
    }
    try {
      await api.post('/cart/items', { productId: product._id, quantity: 1 });
      toast.success(`Added ${product.title} to cart!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not add to cart');
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return toast.error('Please enter review feedback.');

    setIsSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: ratingInput,
        comment: commentInput.trim(),
      });

      toast.success('⭐ Verified purchase review submitted successfully!');
      setCommentInput('');
      setRatingInput(5);
      fetchReviews(product._id);
      checkReviewEligibility(product._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-slate-500 mt-2">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="inline-block mt-4 text-indigo-600 font-semibold hover:underline">
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  const price = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Product Hero Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center relative">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-sm">
                SALE
              </span>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img.url ? 'border-indigo-600 scale-95' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Purchase Panel */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs uppercase font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {product.category?.name || 'General Category'}
              </span>
              <span className="text-xs font-semibold text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 leading-snug">{product.title}</h1>

            {/* Ratings & Seller Badge */}
            <div className="flex flex-wrap items-center gap-4 text-sm pt-1">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/60">
                <FiStar className="fill-amber-400 text-amber-400" />
                <span>{product.ratingAverage || 4.8}</span>
                <span className="text-slate-400 font-normal">
                  ({reviews.length > 0 ? reviews.length : (product.ratingCount || 12)} customer reviews)
                </span>
              </div>

              {product.sellerProfile && (
                <Link
                  to={`/sellers/store/${product.sellerProfile.storeSlug}`}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 font-semibold bg-slate-100 px-3 py-1 rounded-xl transition-colors"
                >
                  <FiShoppingBag className="text-indigo-600" />
                  <span>{product.sellerProfile.storeName}</span>
                </Link>
              )}
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900">₹{price}</span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through ml-3">₹{product.price}</span>
                )}
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                In Stock ({product.stock} units)
              </span>
            </div>

            {/* Description */}
            <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <Button size="lg" variant="primary" className="w-full" icon={FiShoppingCart} onClick={handleAddToCart}>
              Add to Multi-Vendor Shopping Cart
            </Button>

            <div className="grid grid-cols-3 gap-3 text-center text-[11px] font-semibold text-slate-500 pt-2">
              <div className="flex flex-col items-center gap-1">
                <FiShield className="text-indigo-600 text-lg" />
                <span>Verified Seller</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FiTruck className="text-indigo-600 text-lg" />
                <span>Express Courier Handover</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FiRefreshCw className="text-indigo-600 text-lg" />
                <span>7-Day Return Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Ratings & Post-Delivery Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FiStar className="fill-amber-400 text-amber-400" /> Customer Ratings & Reviews
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verified feedback from customers who received and completed delivery of this product.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-slate-900">{product.ratingAverage || 4.8}</span>
            <div>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.ratingAverage || 5) ? 'fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Based on {reviews.length} customer review{reviews.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Post-Delivery Review Submission Form (Only if Delivered & Not Yet Reviewed) */}
        {isAuthenticated && eligibility.canReview && (
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="space-y-1">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                Verified Delivery Handover Completed
              </span>
              <h3 className="text-lg font-bold text-slate-900">How was your product experience?</h3>
              <p className="text-xs text-slate-600">
                You've received this item! Leave a review to help other shoppers.
              </p>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              {/* Star Rating Selection */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRatingInput(star)}
                    className="p-1 text-2xl focus:outline-none transition-transform hover:scale-125"
                  >
                    <FiStar
                      className={`${
                        (hoverRating || ratingInput) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {ratingInput === 5
                    ? '5/5 Excellent'
                    : ratingInput === 4
                    ? '4/5 Very Good'
                    : ratingInput === 3
                    ? '3/5 Average'
                    : ratingInput === 2
                    ? '2/5 Below Average'
                    : '1/5 Unsatisfied'}
                </span>
              </div>

              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write your honest review on product quality, packaging, and fulfillment..."
                rows={3}
                className="w-full rounded-2xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              ></textarea>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmittingReview}
                icon={FiSend}
              >
                Submit Verified Review
              </Button>
            </form>
          </div>
        )}

        {/* Notice for already reviewed or ineligible users */}
        {isAuthenticated && eligibility.hasReviewed && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-800">
            <FiCheckCircle className="text-lg text-emerald-600 shrink-0" />
            <span>
              You have reviewed this product after delivery. Thank you for contributing to the marketplace community!
            </span>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-slate-600">
            <span>Have you purchased and received this product? Sign in to submit your review.</span>
            <Link to="/login" className="font-bold text-indigo-600 hover:underline shrink-0">
              Sign In &rarr;
            </Link>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-10 space-y-2 text-slate-400">
            <FiMessageSquare className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No customer reviews yet for this product listing.</p>
            <p className="text-xs">Be the first verified customer to share feedback once delivered!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                      {rev.customer?.name ? rev.customer.name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{rev.customer?.name || 'Customer'}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                          • {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {rev.isVerifiedPurchase && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <FiCheckCircle /> Verified Purchase
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed pl-12">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
