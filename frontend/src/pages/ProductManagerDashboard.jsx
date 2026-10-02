import React, { useEffect, useState } from 'react';
import {
  FiBox,
  FiPercent,
  FiTrash2,
  FiStar,
  FiAlertTriangle,
  FiCheckCircle,
  FiTag,
  FiRefreshCw,
  FiSearch,
  FiEye,
  FiXCircle,
  FiTrendingUp,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';

const ProductManagerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'OUTDATED', 'DISCOUNTED', 'TOP_RATED'

  // Discount Modal State
  const [discountModalProduct, setDiscountModalProduct] = useState(null);
  const [discountType, setDiscountType] = useState('PERCENT'); // 'PERCENT' or 'FIXED'
  const [discountValue, setDiscountValue] = useState('');
  const [isUpdatingDiscount, setIsUpdatingDiscount] = useState(false);

  // Reviews Inspection Modal State
  const [reviewsModalProduct, setReviewsModalProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [prodsRes, analyticsRes] = await Promise.allSettled([
        api.get('/products?limit=100'),
        api.get('/products/manager/analytics'),
      ]);

      if (prodsRes.status === 'fulfilled') {
        setProducts(prodsRes.value.data.data?.products || prodsRes.value.data.data || []);
      }
      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data.data);
      }
    } catch (e) {
      toast.error('Failed to load catalog manager data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open Discount Modal
  const handleOpenDiscountModal = (product) => {
    setDiscountModalProduct(product);
    if (product.discountPrice) {
      setDiscountType('FIXED');
      setDiscountValue(product.discountPrice);
    } else {
      setDiscountType('PERCENT');
      setDiscountValue(15);
    }
  };

  // Submit Discount
  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    if (!discountModalProduct) return;

    setIsUpdatingDiscount(true);
    try {
      let payload = {};
      if (discountType === 'PERCENT') {
        payload = { discountPercent: Number(discountValue) };
      } else {
        payload = { discountPrice: Number(discountValue) };
      }

      const res = await api.patch(`/products/${discountModalProduct._id}/discount`, payload);
      toast.success(res.data.message || 'Product discount pricing updated!');

      // Update state
      setProducts(products.map((p) => (p._id === discountModalProduct._id ? res.data.data : p)));
      setDiscountModalProduct(null);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update discount.');
    } finally {
      setIsUpdatingDiscount(false);
    }
  };

  // Remove Discount
  const handleRemoveDiscount = async (productId) => {
    try {
      const res = await api.patch(`/products/${productId}/discount`, { discountPrice: null });
      toast.success('Discount removed. Base price restored.');
      setProducts(products.map((p) => (p._id === productId ? res.data.data : p)));
      setDiscountModalProduct(null);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to remove discount.');
    }
  };

  // Mark Product Status (e.g. OUTDATED / ARCHIVED / ACTIVE)
  const handleUpdateStatus = async (product, newStatus) => {
    try {
      const res = await api.patch(`/products/${product._id}/status`, {
        status: newStatus,
        reason: 'Catalog lifecycle moderation by Product Manager',
      });
      toast.success(`Product marked as ${newStatus}`);
      setProducts(products.map((p) => (p._id === product._id ? res.data.data : p)));
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product status');
    }
  };

  // Permanently Remove Outdated Product
  const handleDeleteOutdatedProduct = async (product) => {
    if (!window.confirm(`Permanently remove obsolete product "${product.title}" from marketplace?`)) {
      return;
    }
    try {
      await api.delete(`/products/${product._id}`);
      toast.success('Outdated product listing removed from marketplace.');
      setProducts(products.filter((p) => p._id !== product._id));
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product.');
    }
  };

  // Toggle Featured Status
  const handleToggleFeature = async (product) => {
    try {
      const res = await api.patch(`/products/${product._id}/feature`);
      toast.success(res.data.message || 'Feature status toggled.');
      setProducts(products.map((p) => (p._id === product._id ? res.data.data : p)));
    } catch (error) {
      toast.error('Failed to toggle featured status.');
    }
  };

  // Open Reviews Modal
  const handleViewReviews = async (product) => {
    setReviewsModalProduct(product);
    setIsLoadingReviews(true);
    try {
      const res = await api.get(`/reviews/${product._id}`);
      setProductReviews(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load reviews for this product.');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Moderate / Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Remove this review from the public product page?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review removed by Product Manager.');
      setProductReviews(productReviews.filter((r) => r._id !== reviewId));
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to remove review.');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'OUTDATED') {
      return p.status === 'OUTDATED' || p.status === 'ARCHIVED' || p.stock === 0;
    }
    if (activeTab === 'DISCOUNTED') {
      return p.discountPrice && p.discountPrice < p.price;
    }
    if (activeTab === 'TOP_RATED') {
      return p.ratingAverage >= 4.0;
    }
    return true;
  });

  if (isLoading) return <Loader fullScreen text="Loading product management suite..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Product Manager Command Hub</h2>
          <p className="text-sm text-slate-500">
            Prune outdated listings, apply promotional discounts, and inspect customer reviews across all vendor catalogs.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={FiRefreshCw} onClick={fetchDashboardData}>
          Refresh Catalog
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            <FiBox />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Products</p>
            <p className="text-2xl font-black text-slate-900">{analytics?.totalProducts ?? products.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <FiPercent />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Active Discounts</p>
            <p className="text-2xl font-black text-slate-900">{analytics?.discountedProducts ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold">
            <FiAlertTriangle />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Outdated / Zero Stock</p>
            <p className="text-2xl font-black text-slate-900">{analytics?.outdatedProducts ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            <FiStar />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Reviews ({analytics?.platformAvgRating || 4.8}★)</p>
            <p className="text-2xl font-black text-slate-900">{analytics?.totalReviews ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'ALL', label: 'All Catalog' },
              { key: 'DISCOUNTED', label: '🏷️ Discounted' },
              { key: 'OUTDATED', label: '⚠️ Outdated / Low Stock' },
              { key: 'TOP_RATED', label: '⭐ Top Rated' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[260px]">
            <FiSearch className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search product title, SKU, seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Base / Discount Price</th>
                <th className="py-3 px-4">Stock & Status</th>
                <th className="py-3 px-4">Customer Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const hasDiscount = p.discountPrice && p.discountPrice < p.price;
                  const discountPercent = hasDiscount
                    ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                    : 0;
                  const isOutdated = p.status === 'OUTDATED' || p.status === 'ARCHIVED';

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {p.images?.[0]?.url && (
                            <img
                              src={p.images[0].url}
                              alt={p.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                          )}
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                            <span className="text-[11px] font-mono text-slate-400">SKU: {p.sku}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                        {p.sellerProfile?.storeName || p.seller?.name || 'Vendor'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {hasDiscount ? (
                            <div className="flex items-center gap-2">
                              <span className="font-black text-rose-600">₹{p.discountPrice}</span>
                              <span className="text-xs text-slate-400 line-through">₹{p.price}</span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                {discountPercent}% OFF
                              </span>
                            </div>
                          ) : (
                            <span className="font-extrabold text-slate-800">₹{p.price}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                              p.stock === 0
                                ? 'bg-rose-100 text-rose-800'
                                : p.stock <= 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                          </span>
                          <div>
                            <Badge
                              variant={
                                isOutdated
                                  ? 'danger'
                                  : p.status === 'ACTIVE'
                                  ? 'success'
                                  : 'default'
                              }
                              size="sm"
                            >
                              {p.status}
                            </Badge>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleViewReviews(p)}
                          className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-xl transition"
                        >
                          <FiStar className="fill-amber-400 text-amber-500" />
                          <span>{p.ratingAverage || 0}★</span>
                          <span className="text-slate-400 font-normal">({p.ratingCount || 0})</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Apply Discount */}
                          <button
                            onClick={() => handleOpenDiscountModal(p)}
                            title="Manage Product Discount"
                            className="p-2 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
                          >
                            <FiPercent className="text-sm" />
                          </button>

                          {/* See Reviews */}
                          <button
                            onClick={() => handleViewReviews(p)}
                            title="Inspect Product Reviews"
                            className="p-2 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-100 transition"
                          >
                            <FiEye className="text-sm" />
                          </button>

                          {/* Toggle Outdated / Active */}
                          {p.status === 'OUTDATED' ? (
                            <button
                              onClick={() => handleUpdateStatus(p, 'ACTIVE')}
                              title="Restore to Active Catalog"
                              className="p-2 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
                            >
                              <FiCheckCircle className="text-sm" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(p, 'OUTDATED')}
                              title="Mark as Outdated"
                              className="p-2 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-100 transition"
                            >
                              <FiAlertTriangle className="text-sm" />
                            </button>
                          )}

                          {/* Permanent Remove / Delete */}
                          <button
                            onClick={() => handleDeleteOutdatedProduct(p)}
                            title="Remove Outdated Listing"
                            className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discount Configuration Modal */}
      {discountModalProduct && (
        <Modal
          isOpen={!!discountModalProduct}
          onClose={() => setDiscountModalProduct(null)}
          title={`Apply Discount - ${discountModalProduct.title}`}
        >
          <form onSubmit={handleSaveDiscount} className="space-y-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="text-slate-500 font-semibold">
                Product Base Price: <span className="font-black text-slate-800 text-sm">₹{discountModalProduct.price}</span>
              </p>
              {discountModalProduct.discountPrice && (
                <p className="text-rose-600 font-semibold">
                  Currently Discounted to: ₹{discountModalProduct.discountPrice}
                </p>
              )}
            </div>

            {/* Discount Mode Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDiscountType('PERCENT');
                  setDiscountValue(20);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition border ${
                  discountType === 'PERCENT'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Percentage Off (%)
              </button>

              <button
                type="button"
                onClick={() => {
                  setDiscountType('FIXED');
                  setDiscountValue(Math.round(discountModalProduct.price * 0.8));
                }}
                className={`py-2 rounded-xl text-xs font-bold transition border ${
                  discountType === 'FIXED'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Fixed Discount Price (₹)
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {discountType === 'PERCENT' ? 'Discount Percentage (0-99%)' : 'New Discounted Price (₹)'}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'PERCENT' ? 'e.g. 20' : 'e.g. 1499'}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                required
              />
            </div>

            {/* Live Calculation Preview */}
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <span className="font-bold block">Preview Customer Price:</span>
              <p>
                Base: ₹{discountModalProduct.price} &rarr; Customer Pays:{' '}
                <span className="font-black text-sm text-emerald-700">
                  ₹
                  {discountType === 'PERCENT'
                    ? Math.round(discountModalProduct.price * (1 - (Number(discountValue) || 0) / 100))
                    : Number(discountValue) || discountModalProduct.price}
                </span>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              {discountModalProduct.discountPrice && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleRemoveDiscount(discountModalProduct._id)}
                  className="flex-1"
                >
                  Clear Discount
                </Button>
              )}

              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdatingDiscount}
                className="flex-1"
                icon={FiTag}
              >
                Apply Promotional Price
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reviews Inspection & Moderation Modal */}
      {reviewsModalProduct && (
        <Modal
          isOpen={!!reviewsModalProduct}
          onClose={() => setReviewsModalProduct(null)}
          title={`Customer Reviews - ${reviewsModalProduct.title}`}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-800">Total Reviews: </span>
                <span className="text-slate-600">{productReviews.length}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <FiStar className="fill-amber-400" />
                <span>{reviewsModalProduct.ratingAverage || 0}★ Platform Average</span>
              </div>
            </div>

            {isLoadingReviews ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading reviews...</div>
            ) : productReviews.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No reviews submitted yet for this product listing.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {productReviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{rev.customer?.name || 'Customer'}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            ✓ Verified Delivery
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar
                              key={s}
                              className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>

                        {/* Remove review button */}
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          title="Moderate / Delete Review"
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProductManagerDashboard;
