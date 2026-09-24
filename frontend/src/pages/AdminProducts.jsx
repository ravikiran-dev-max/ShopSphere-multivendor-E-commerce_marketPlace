import React, { useEffect, useState } from 'react';
import { FiPackage, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data.data);
    } catch (e) {
      toast.error('Failed to load catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product from marketplace?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product removed.');
      fetchProducts();
    } catch (e) {
      toast.error('Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Product Moderation</h1>
        <p className="text-sm text-slate-500">Monitor all product listings published by vendors.</p>
      </div>

      {isLoading ? (
        <Loader size="lg" text="Loading products..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <th className="p-4">Product</th>
                <th className="p-4">Seller</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.images[0]?.url} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                    <span className="font-bold text-slate-900">{p.title}</span>
                  </td>
                  <td className="p-4 text-xs text-slate-600">{p.seller?.name || 'Seller'}</td>
                  <td className="p-4 font-bold text-slate-900">₹{p.price}</td>
                  <td className="p-4"><Badge variant="success">{p.stock} in stock</Badge></td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(p._id)} className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
