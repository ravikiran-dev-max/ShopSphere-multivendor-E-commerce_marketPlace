import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiStar, FiShoppingCart, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Loader from '../components/common/Loader.jsx';
import useAuthStore from '../store/useAuthStore.js';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedSort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (e) {
      console.log('Categories error', e);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedSort) params.set('sort', selectedSort);

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data);
      setPagination(res.data.pagination || { page: 1, totalPages: 1 });
    } catch (e) {
      toast.error('Failed to load products');
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Explore Marketplace Catalog</h1>
          <p className="text-sm text-slate-500">Discover verified items across multiple independent sellers.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => {
              searchParams.set('category', e.target.value);
              setSearchParams(searchParams);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSort}
            onChange={(e) => {
              searchParams.set('sort', e.target.value);
              setSearchParams(searchParams);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="py-20">
          <Loader size="lg" text="Loading marketplace products..." />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <p className="text-lg font-bold text-slate-700">No products found matching your search</p>
          <p className="text-sm text-slate-500">Try adjusting your category filter or search terms.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchParams({});
            }}
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const price = product.discountPrice || product.price;
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={product.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Sale
                      </span>
                    )}
                    <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      {product.sellerProfile?.storeName || 'Verified Seller'}
                    </span>
                  </div>

                  {/* Info Section */}
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                      {product.category?.name || 'Category'}
                    </span>
                    <Link to={`/products/item/${product.slug}`}>
                      <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Ratings */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold pt-1">
                      <FiStar className="fill-current text-amber-400" />
                      <span>{product.ratingAverage || 4.5}</span>
                      <span className="text-slate-400 font-normal">({product.ratingCount || 10})</span>
                    </div>
                  </div>
                </div>

                {/* Price & Cart Actions */}
                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-3">
                  <div>
                    <div className="text-lg font-black text-slate-900">₹{price}</div>
                    {hasDiscount && (
                      <div className="text-xs text-slate-400 line-through">₹{product.price}</div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    icon={FiShoppingCart}
                    onClick={() => handleAddToCart(product)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
