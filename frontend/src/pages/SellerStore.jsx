import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiStar,
  FiMail,
  FiPhone,
  FiArrowLeft,
  FiShoppingCart,
  FiCheckCircle,
  FiShield,
  FiBox,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import useAuthStore from '../store/useAuthStore.js';

const SellerStore = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuthStore();

  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStoreDetails();
  }, [slug]);

  const fetchStoreDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/sellers/store/${slug}`);
      setStoreData(res.data.data.seller);
      setProducts(res.data.data.products || []);
    } catch (error) {
      toast.error('Seller store not found.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please log in as a customer to add items to your cart.');
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

  if (isLoading) {
    return <Loader fullScreen text="Loading merchant storefront..." />;
  }

  if (!storeData) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800">Seller Storefront Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested vendor profile does not exist or is inactive.</p>
        <Link to="/sellers" className="inline-block mt-4">
          <Button variant="primary" icon={FiArrowLeft}>
            Browse Verified Sellers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/sellers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <FiArrowLeft /> Back to Verified Merchants
        </Link>
      </div>

      {/* Storefront Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/90 text-white font-black text-3xl flex items-center justify-center shadow-lg border border-indigo-400/30 shrink-0">
              {storeData.storeName?.charAt(0) || 'S'}
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight">{storeData.storeName}</h1>
                <Badge variant="success" size="sm" className="flex items-center gap-1">
                  <FiShield className="inline" /> Verified Merchant
                </Badge>
              </div>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                {storeData.storeDescription || 'Premier merchant partner on ShopSphere.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                {storeData.businessEmail && (
                  <span className="flex items-center gap-1">
                    <FiMail className="text-indigo-400" /> {storeData.businessEmail}
                  </span>
                )}
                {storeData.businessPhone && (
                  <span className="flex items-center gap-1">
                    <FiPhone className="text-indigo-400" /> {storeData.businessPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 flex items-center gap-6 shrink-0">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 text-xl font-black">
                <FiStar className="fill-current" />
                <span>{storeData.ratingAverage || 4.8}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                {storeData.ratingCount || 35} Reviews
              </p>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-xl font-black text-indigo-400 flex items-center justify-center gap-1">
                <FiBox />
                <span>{products.length}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Active Items</p>
            </div>
          </div>
        </div>

        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Store Catalog Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Products from this Merchant</h2>
            <p className="text-xs text-slate-500">Shipped directly from this vendor warehouse.</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            {products.length} products listed
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <FiShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No active products listed currently</h3>
            <p className="text-sm text-slate-500">Check back soon for new inventory arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const price = product.discountPrice || product.price;
              const hasDiscount = product.discountPrice && product.discountPrice < product.price;

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <Link to={`/products/item/${product.slug}`} className="block overflow-hidden relative">
                    <img
                      src={
                        product.images[0]?.url ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-md">
                        Sale
                      </span>
                    )}
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {product.category?.name || 'Item'}
                      </span>
                      <Link to={`/products/item/${product.slug}`}>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        <FiStar className="fill-current text-amber-400" />
                        <span>{product.ratingAverage || 4.8}</span>
                        <span className="text-slate-400 font-normal">({product.ratingCount || 10})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-lg font-black text-slate-900">₹{price}</span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through ml-2">₹{product.price}</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-sm transition-colors active:scale-95"
                        title="Add to multi-vendor cart"
                      >
                        <FiShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerStore;
