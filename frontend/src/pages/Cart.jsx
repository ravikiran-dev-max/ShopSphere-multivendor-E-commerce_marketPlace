import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiArrowRight, FiTag, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';

const Cart = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCartData(res.data.data);
    } catch (error) {
      toast.error('Failed to load cart items.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    try {
      await api.put(`/cart/items/${itemId}`, { quantity: newQty });
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      toast.success('Item removed from cart.');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item.');
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      await api.post('/cart/coupon', { code: couponCode.trim() });
      toast.success(`Coupon '${couponCode}' applied!`);
      setCouponCode('');
      fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading your multi-vendor cart..." />;
  }

  const items = cartData?.items || [];
  const itemsSubtotal = cartData?.itemsSubtotal || 0;
  const discountAmount = cartData?.discountAmount || 0;
  const shippingTotal = items.length > 0 ? 50 : 0;
  const grandTotal = Math.max(0, itemsSubtotal - discountAmount + shippingTotal);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Your Shopping Cart</h1>
        <p className="text-sm text-slate-500">
          Items from multiple sellers will be intelligently split into sub-orders during checkout.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-bold">
            <FiShoppingBag />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Your cart is currently empty</h2>
          <p className="text-sm text-slate-500">Explore products from verified sellers and add items to your cart.</p>
          <Link to="/products">
            <Button variant="primary" icon={FiArrowRight}>
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div
                  key={item._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-5 justify-between"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={product.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                      alt={product.title}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Seller: {item.seller?.name || 'Verified Vendor'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{product.title}</h3>
                      <p className="text-sm font-black text-slate-900">₹{item.price}</p>
                    </div>
                  </div>

                  {/* Quantity and Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                        className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <FiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                        className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove item"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Coupon Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FiTag className="text-indigo-600" /> Apply Coupon Code
              </h3>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
                />
                <Button type="submit" variant="secondary" size="sm" isLoading={isApplyingCoupon}>
                  Apply
                </Button>
              </form>

              {cartData?.couponCode && (
                <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg flex items-center justify-between">
                  <span>Applied: {cartData.couponCode}</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
            </div>

            {/* Order Total Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Order Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{itemsSubtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Standard Shipping</span>
                  <span className="font-semibold text-slate-900">₹{shippingTotal}</span>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">₹{grandTotal}</span>
                </div>
              </div>

              <Link to="/checkout" className="block pt-2">
                <Button variant="primary" className="w-full" size="lg" icon={FiArrowRight}>
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
