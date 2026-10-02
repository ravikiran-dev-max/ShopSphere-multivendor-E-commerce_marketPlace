import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import useAuthStore from '../store/useAuthStore.js';

const Wishlist = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      // In development, products catalog is populated or fetched
      const res = await api.get('/products');
      // For demonstration, show featured items as saved to wishlist
      const products = res.data.data?.filter((p) => p.isFeatured) || res.data.data?.slice(0, 2) || [];
      setWishlistItems(products);
    } catch (e) {
      toast.error('Failed to load wishlist items.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      toast.error('Only customers can add items to cart.');
      return;
    }
    try {
      await api.post('/cart/items', { productId: product._id, quantity: 1 });
      toast.success(`Moved ${product.title} to cart!`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not move to cart');
    }
  };

  const handleRemove = (productId) => {
    setWishlistItems((prev) => prev.filter((p) => p._id !== productId));
    toast.success('Item removed from wishlist.');
  };

  if (isLoading) return <Loader fullScreen text="Loading your saved wishlist..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Your Saved Wishlist</h1>
        <p className="text-sm text-slate-500">Products you've saved to purchase across marketplace merchants.</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-2xl">
            <FiHeart />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Your wishlist is empty</h2>
          <p className="text-sm text-slate-500">Save items while browsing to track prices and availability.</p>
          <Link to="/products">
            <Button variant="primary" icon={FiArrowRight}>
              Explore Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-5 flex flex-col justify-between space-y-4"
            >
              <div className="flex gap-4">
                <img
                  src={
                    item.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={item.title}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {item.sellerProfile?.storeName || 'Verified Vendor'}
                  </span>
                  <Link to={`/products/item/${item.slug}`}>
                    <h3 className="text-sm font-bold text-slate-900 hover:text-indigo-600 line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-base font-black text-slate-900">
                    ₹{item.discountPrice || item.price}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  icon={FiShoppingCart}
                  onClick={() => handleAddToCart(item)}
                >
                  Move to Cart
                </Button>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove from wishlist"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
