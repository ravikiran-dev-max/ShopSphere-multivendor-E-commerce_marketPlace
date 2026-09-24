import React, { useEffect, useState } from 'react';
import { FiShoppingBag, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';

const SellerOrders = () => {
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
      toast.error('Failed to load merchant orders.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/seller-orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Merchant Store Orders</h1>
        <p className="text-sm text-slate-500">Fulfill sub-orders assigned to your vendor account.</p>
      </div>

      {isLoading ? (
        <Loader size="lg" text="Loading vendor orders..." />
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border text-center text-slate-500 text-sm">No orders received yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-slate-900">{o.sellerOrderNumber}</span>
                <Badge variant="primary">{o.status}</Badge>
              </div>
              <div className="text-sm text-slate-600">Customer: {o.customer?.name} ({o.customer?.email})</div>
              <div className="flex gap-2 pt-2">
                {o.status === 'PLACED' && (
                  <button onClick={() => handleUpdateStatus(o._id, 'CONFIRMED')} className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    Confirm Order
                  </button>
                )}
                {o.status === 'CONFIRMED' && (
                  <button onClick={() => handleUpdateStatus(o._id, 'PACKED')} className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    Mark Packed
                  </button>
                )}
                {o.status === 'PACKED' && (
                  <button onClick={() => handleUpdateStatus(o._id, 'SHIPPED')} className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    Dispatch Order (Ship)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
