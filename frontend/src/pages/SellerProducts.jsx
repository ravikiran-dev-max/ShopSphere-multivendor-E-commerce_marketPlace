import React, { useEffect, useState } from 'react';
import { FiPlus, FiBox, FiTrash2, FiImage, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import Input from '../components/common/Input.jsx';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State including product image URLs array
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: '',
    sku: '',
  });

  const [imageUrls, setImageUrls] = useState(['']);

  useEffect(() => {
    fetchSellerProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (e) {}
  };

  const fetchSellerProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/products/my-products');
      setProducts(res.data.data);
    } catch (error) {
      toast.error('Failed to load merchant products.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImageUrlField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleRemoveImageUrlField = (index) => {
    const updated = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updated.length > 0 ? updated : ['']);
  };

  const handleImageUrlChange = (index, value) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedImages = imageUrls
        .filter((url) => url.trim() !== '')
        .map((url) => ({ url: url.trim(), alt: formData.title }));

      const payload = {
        ...formData,
        images: formattedImages.length > 0 ? formattedImages : [
          {
            url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
            alt: formData.title,
          },
        ],
      };

      await api.post('/products', payload);
      toast.success('Product created with picture gallery!');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: '', price: '', discountPrice: '', stock: '', sku: '' });
      setImageUrls(['']);
      fetchSellerProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted.');
      fetchSellerProducts();
    } catch (error) {
      toast.error('Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Merchant Store Products</h1>
          <p className="text-sm text-slate-500">Manage catalog, inventory stock, pricing, and product photos.</p>
        </div>

        <Button variant="primary" icon={FiPlus} onClick={() => setIsModalOpen(true)}>
          Add New Product
        </Button>
      </div>

      {isLoading ? (
        <Loader size="lg" text="Fetching your product catalog..." />
      ) : products.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-bold">
            <FiBox />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No products listed in your store yet</h2>
          <p className="text-sm text-slate-500">Click "Add New Product" to start selling on ShopSphere.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <th className="p-4">Product & Picture</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <span className="font-bold text-slate-900 line-clamp-1">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-600">{p.sku}</td>
                  <td className="p-4 text-xs text-slate-600">{p.category?.name || 'General'}</td>
                  <td className="p-4 font-bold text-slate-900">₹{p.discountPrice || p.price}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${p.stock <= 5 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteProduct(p._id)}
                      className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Product Modal with Picture Upload Feature */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Product with Pictures">
        <form onSubmit={handleCreateProduct} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <Input
            label="Product Title"
            placeholder="e.g. Wireless Noise Cancelling Headphones"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="SKU (Stock Keeping Unit)"
            placeholder="e.g. APEX-AUD-001"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Price (₹)"
              type="number"
              placeholder="4999"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label="Stock Quantity"
              type="number"
              placeholder="50"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>

          {/* Product Picture Upload Feature */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <FiImage /> Product Pictures (Image URLs / Media Upload)
              </label>
              <button
                type="button"
                onClick={handleAddImageUrlField}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                + Add Another Picture
              </button>
            </div>

            {imageUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  value={url}
                  onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrlField(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {/* Live Image Previews */}
            <div className="flex gap-2 overflow-x-auto pt-2">
              {imageUrls.map((url, idx) =>
                url.trim() ? (
                  <img
                    key={idx}
                    src={url}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                ) : null
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Detailed product features and specifications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              required
            ></textarea>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Publish Product to Marketplace
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default SellerProducts;
