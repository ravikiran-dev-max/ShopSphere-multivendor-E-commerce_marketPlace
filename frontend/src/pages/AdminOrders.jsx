import React, { useEffect, useState } from 'react';
import { FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data);
    } catch (e) {
      toast.error('Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Marketplace Orders</h1>
        <p className="text-sm text-slate-500">Monitor customer transactions and split seller sub-orders.</p>
      </div>

      {isLoading ? (
        <Loader size="lg" text="Loading orders..." />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{o.orderNumber}</span>
                  <Badge variant={o.paymentStatus === 'PAID' ? 'success' : 'warning'}>{o.paymentStatus}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">Customer: {o.customer?.name} ({o.customer?.email})</p>
              </div>
              <span className="text-xl font-extrabold text-indigo-600">₹{o.finalAmount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
