import React, { useEffect, useState } from 'react';
import {
  FiPackage,
  FiTruck,
  FiClock,
  FiCheck,
  FiAlertCircle,
  FiMessageSquare,
  FiRefreshCw,
  FiKey,
  FiSend,
  FiCheckCircle,
  FiStar,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';

// Stages in Order Progression
const ORDER_STEPS = [
  { key: 'PLACED', label: 'Placed' },
  { key: 'PACKED', label: 'Packed' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'OUT_FOR_DELIVERY', label: 'On the Way' },
  { key: 'DELIVERED', label: 'Delivered' },
];

const getStepIndex = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 4;
    case 'OUT_FOR_DELIVERY':
      return 3;
    case 'SHIPPED':
      return 2;
    case 'PACKED':
      return 1;
    default:
      return 0;
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [deliveriesMap, setDeliveriesMap] = useState({});
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Inquiry / Complaint modal state
  const [inquiryModalOrder, setInquiryModalOrder] = useState(null);
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryPriority, setInquiryPriority] = useState('MEDIUM');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // Product Review modal state
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchOrdersAndReviews();
  }, []);

  const fetchOrdersAndReviews = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [ordersRes, myReviewsRes] = await Promise.allSettled([
        api.get('/orders'),
        api.get('/reviews/my-reviews'),
      ]);

      const orderList = ordersRes.status === 'fulfilled' ? ordersRes.value.data.data || [] : [];
      setOrders(orderList);

      if (myReviewsRes.status === 'fulfilled') {
        const myRevs = myReviewsRes.value.data.data || [];
        const reviewedIds = new Set(myRevs.map((r) => r.product?._id || r.product));
        setReviewedProductIds(reviewedIds);
      }

      // Fetch delivery dispatch info for sub-orders
      const subOrderIds = [];
      orderList.forEach((ord) => {
        ord.sellerOrders?.forEach((so) => subOrderIds.push(so._id));
      });

      if (subOrderIds.length > 0) {
        const deliveryPromises = subOrderIds.map(async (soId) => {
          try {
            const delRes = await api.get(`/deliveries/track/sub-order/${soId}`);
            return { soId, delivery: delRes.data.data };
          } catch {
            return { soId, delivery: null };
          }
        });
        const results = await Promise.all(deliveryPromises);
        const map = {};
        results.forEach((r) => {
          if (r.delivery) map[r.soId] = r.delivery;
        });
        setDeliveriesMap(map);
      }

      if (isManual) toast.success('Order tracking synchronized with live logistics.');
    } catch (error) {
      toast.error('Failed to load order history.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleOpenInquiry = (order, subOrder) => {
    setInquiryModalOrder({ parent: order, subOrder });
    setInquirySubject(`Inquiry: Package ${subOrder.sellerOrderNumber} - ${order.orderNumber}`);
    setInquiryMessage('');
    setInquiryPriority('MEDIUM');
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) return toast.error('Please describe your inquiry or issue.');

    setIsSubmittingInquiry(true);
    try {
      await api.post('/support/tickets', {
        subject: inquirySubject,
        description: inquiryMessage,
        priority: inquiryPriority,
        orderId: inquiryModalOrder.parent._id,
      });

      toast.success('Inquiry submitted successfully! A support agent has been notified.');
      setInquiryModalOrder(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit inquiry.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handleOpenReviewModal = (item) => {
    setReviewModalItem(item);
    setReviewRating(5);
    setReviewHoverRating(0);
    setReviewComment('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return toast.error('Please write a brief comment.');

    setIsSubmittingReview(true);
    try {
      const prodId = reviewModalItem.product?._id || reviewModalItem.product;
      await api.post('/reviews', {
        productId: prodId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      toast.success('⭐ Thank you! Your verified purchase review has been published.');
      setReviewedProductIds((prev) => new Set([...prev, prodId]));
      setReviewModalItem(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading your orders & live tracking..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Orders & Inquiries Hub</h1>
          <p className="text-sm text-slate-500">
            Real-time fulfillment tracking across multi-vendor stores with post-delivery product reviews.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={FiRefreshCw}
          isLoading={isRefreshing}
          onClick={() => fetchOrdersAndReviews(true)}
        >
          Sync Live Status
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-bold">
            <FiPackage />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Orders Placed Yet</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Once you purchase items from our independent vendors, track packages from warehouse packing to rider handover here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Parent Order Header */}
              <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase font-bold text-indigo-400">Order ID</span>
                    <span className="text-lg font-black tracking-wide">{order.orderNumber}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Placed: {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                    Payment: {order.paymentStatus} ({order.paymentMethod})
                  </Badge>
                  <span className="text-2xl font-black text-emerald-400">₹{order.finalAmount}</span>
                </div>
              </div>

              {/* Sub-Orders Section */}
              <div className="p-6 space-y-8">
                <div className="space-y-6">
                  {order.sellerOrders?.map((subOrder) => {
                    const currentStep = getStepIndex(subOrder.status);
                    const deliveryInfo = deliveriesMap[subOrder._id];
                    const isDelivered = subOrder.status === 'DELIVERED';

                    return (
                      <div
                        key={subOrder._id}
                        className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 space-y-6"
                      >
                        {/* Sub-Order Top Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                                {subOrder.sellerOrderNumber}
                              </span>
                              <span className="text-xs font-semibold text-slate-600">
                                Vendor: {subOrder.seller?.name || 'Seller Store'}
                              </span>
                            </div>
                            {subOrder.trackingNumber && (
                              <p className="text-xs text-slate-400">
                                Logistics Tracking: <span className="font-mono text-slate-700">{subOrder.trackingNumber}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                isDelivered
                                  ? 'success'
                                  : subOrder.status === 'OUT_FOR_DELIVERY'
                                  ? 'primary'
                                  : 'warning'
                              }
                            >
                              Status: {subOrder.status.replace(/_/g, ' ')}
                            </Badge>

                            <Button
                              size="sm"
                              variant="secondary"
                              icon={FiMessageSquare}
                              onClick={() => handleOpenInquiry(order, subOrder)}
                            >
                              Raise Inquiry
                            </Button>
                          </div>
                        </div>

                        {/* Real-time Order Progress Stepper */}
                        <div className="py-2">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Fulfillment Journey:
                          </div>
                          <div className="grid grid-cols-5 gap-2 relative">
                            {ORDER_STEPS.map((step, idx) => {
                              const isCompleted = idx <= currentStep;
                              const isCurrent = idx === currentStep;

                              return (
                                <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                                  <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                      isCompleted
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-white border-2 border-slate-300 text-slate-400'
                                    } ${isCurrent ? 'ring-4 ring-indigo-200' : ''}`}
                                  >
                                    {isCompleted ? <FiCheck className="stroke-[3]" /> : idx + 1}
                                  </div>
                                  <span
                                    className={`text-xs font-semibold ${
                                      isCompleted ? 'text-indigo-900' : 'text-slate-400'
                                    }`}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Live Delivery Handover Card (Rider & OTP) */}
                        {deliveryInfo && (
                          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-sm">
                                <FiTruck />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-indigo-950">
                                  Rider: {deliveryInfo.deliveryPartner?.name || 'Assigned Logistics Rider'}
                                </p>
                                <p className="text-xs text-indigo-700">
                                  Contact: {deliveryInfo.deliveryPartner?.phone || '+91 98765 43210'} • Tracking: {deliveryInfo.trackingCode}
                                </p>
                              </div>
                            </div>

                            {/* Delivery Handover OTP */}
                            {deliveryInfo.otpVerificationCode && !isDelivered && (
                              <div className="bg-white border-2 border-amber-400 rounded-xl px-4 py-2 text-center shadow-xs">
                                <span className="text-[10px] uppercase font-bold text-amber-700 block">
                                  Delivery Handover OTP
                                </span>
                                <span className="font-mono text-xl font-black text-slate-900 tracking-widest">
                                  {deliveryInfo.otpVerificationCode}
                                </span>
                                <span className="text-[10px] text-slate-400 block">Share with rider</span>
                              </div>
                            )}

                            {isDelivered && (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                <FiCheckCircle /> Verified Delivery Completed
                              </div>
                            )}
                          </div>
                        )}

                        {/* Sub-order items list with Post-Delivery Product Review */}
                        <div className="space-y-3 pt-2 border-t border-slate-200/60">
                          {subOrder.items?.map((item, idx) => {
                            const prodId = item.product?._id || item.product;
                            const hasReviewed = reviewedProductIds.has(prodId);

                            return (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm py-2 px-3 rounded-xl bg-white border border-slate-100 shadow-2xs"
                              >
                                <div className="flex items-center gap-3">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                    />
                                  )}
                                  <div>
                                    <p className="font-bold text-slate-900">{item.title}</p>
                                    <p className="text-xs text-slate-500">
                                      Qty: {item.quantity} × ₹{item.price} • SKU: {item.sku}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                  <span className="font-extrabold text-slate-900">₹{item.totalItemPrice}</span>

                                  {/* Review on Product after delivery */}
                                  {isDelivered && (
                                    <div>
                                      {hasReviewed ? (
                                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                          <FiCheck className="text-emerald-600 stroke-[3]" /> Reviewed
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => handleOpenReviewModal(item)}
                                          className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
                                        >
                                          <FiStar className="fill-amber-400 text-amber-500" />
                                          <span>Review Product</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inquiry / Complaint Modal */}
      {inquiryModalOrder && (
        <Modal
          isOpen={!!inquiryModalOrder}
          onClose={() => setInquiryModalOrder(null)}
          title="Raise Order Inquiry or Complaint"
        >
          <form onSubmit={handleSubmitInquiry} className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">
                Order: {inquiryModalOrder.parent?.orderNumber} (Sub-Order: {inquiryModalOrder.subOrder?.sellerOrderNumber})
              </p>
              <p className="text-slate-500">
                Vendor: {inquiryModalOrder.subOrder?.seller?.name || 'Seller Store'}
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Inquiry Subject
              </label>
              <input
                type="text"
                value={inquirySubject}
                onChange={(e) => setInquirySubject(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Priority
              </label>
              <select
                value={inquiryPriority}
                onChange={(e) => setInquiryPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="LOW">Low - General inquiry</option>
                <option value="MEDIUM">Medium - Status or delay question</option>
                <option value="HIGH">High - Incorrect item / delivery issue</option>
                <option value="URGENT">Urgent - Damaged package / refund request</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Message
              </label>
              <textarea
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder="Describe your issue with this specific package or delivery..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmittingInquiry}
              icon={FiSend}
            >
              Submit Order Inquiry
            </Button>
          </form>
        </Modal>
      )}

      {/* Product Review Modal (Post-Delivery Only) */}
      {reviewModalItem && (
        <Modal
          isOpen={!!reviewModalItem}
          onClose={() => setReviewModalItem(null)}
          title={`Write Verified Review - ${reviewModalItem.title}`}
        >
          <form onSubmit={handleSubmitReview} className="space-y-5">
            <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {reviewModalItem.image && (
                <img
                  src={reviewModalItem.image}
                  alt={reviewModalItem.title}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                />
              )}
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-slate-900">{reviewModalItem.title}</p>
                <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                  ✓ Verified Handover Purchase
                </span>
              </div>
            </div>

            {/* Star Rating Picker */}
            <div className="space-y-1.5 text-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Overall Experience Rating
              </label>
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setReviewHoverRating(star)}
                    onMouseLeave={() => setReviewHoverRating(0)}
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-3xl focus:outline-none transition-transform hover:scale-110"
                  >
                    <FiStar
                      className={`${
                        (reviewHoverRating || reviewRating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {reviewRating === 5
                  ? '5 Stars: Excellent'
                  : reviewRating === 4
                  ? '4 Stars: Very Good'
                  : reviewRating === 3
                  ? '3 Stars: Average'
                  : reviewRating === 2
                  ? '2 Stars: Poor'
                  : '1 Star: Terrible'}
              </p>
            </div>

            {/* Comment Area */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Review Feedback & Experience
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was the product quality, performance, packaging, and fulfillment? Share your feedback to assist other customers..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmittingReview}
              icon={FiStar}
            >
              Publish Verified Review
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
