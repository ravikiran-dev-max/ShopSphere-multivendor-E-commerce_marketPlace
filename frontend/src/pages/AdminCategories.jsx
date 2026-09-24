import React, { useEffect, useState } from 'react';
import { FiFolder, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import Input from '../components/common/Input.jsx';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (e) {
      toast.error('Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name, description });
      toast.success('Category created successfully!');
      setIsModalOpen(false);
      setName('');
      setDescription('');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Category Management</h1>
          <p className="text-sm text-slate-500">Organize marketplace categories and sub-categories.</p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={() => setIsModalOpen(true)}>
          Create Category
        </Button>
      </div>

      {isLoading ? (
        <Loader size="lg" text="Loading categories..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div key={c._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  <FiFolder />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                  <p className="text-xs text-slate-400">/{c.slug}</p>
                </div>
              </div>
              {c.description && <p className="text-xs text-slate-600 pt-2">{c.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Category">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input label="Category Name" placeholder="e.g. Electronics & Gadgets" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-slate-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 p-2 text-sm"></textarea>
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Save Category
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
