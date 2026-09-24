import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiShield, FiTruck, FiRefreshCw, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import useAuthStore from '../store/useAuthStore.js';

const ProductDetails = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [slug]);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/products/item/${slug}`);
      const data = res.data.data;
      setProduct(data);
      setSelectedImage(data.images[0]?.url || '');
    } catch (error) {
      toast.error('Product not found.');
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return <Loader fullScreen text="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/products" className="text-indigo-600 font-semibold underline mt-2 block">
          Return to Marketplace Catalog
        </Link>
      </div>
    );
  }

  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Media Gallery */}
        <div className="space-y-4">
          <div className="aspect-4/3 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
            <img src={selectedImage} alt={product.title} className="w-full h-full object-cover" />
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
              <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                <FiStar className="fill-current text-amber-400" />
                <span>{product.ratingAverage || 4.8}</span>
                <span className="text-slate-400 font-normal">({product.ratingCount || 12} reviews)</span>
              </div>

              {product.sellerProfile && (
                <Link
                  to={`/sellers/store/${product.sellerProfile.storeSlug}`}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 font-semibold bg-slate-100 px-3 py-1 rounded-lg transition-colors"
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
                <span>Express Express Dispatch</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FiRefreshCw className="text-indigo-600 text-lg" />
                <span>Easy 7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
