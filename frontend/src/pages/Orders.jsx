import React, { useEffect, useState } from 'react';
import { FiPackage, FiTruck, FiClock, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data);
    } catch (error) {
      toast.error('Failed to load order history.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading your orders..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Your Marketplace Orders</h1>
        <p className="text-sm text-slate-500">Track order fulfillment status across independent vendor stores.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-bold">
            <FiPackage />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No orders placed yet</h2>
          <p className="text-sm text-slate-500">Your placed orders and vendor tracking updates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Parent Order Header */}
              <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase font-bold text-indigo-400">Parent Order</span>
                    <span className="text-lg font-black">{order.orderNumber}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                    Payment: {order.paymentStatus}
                  </Badge>
                  <span className="text-xl font-black text-emerald-400">₹{order.finalAmount}</span>
                </div>
              </div>

              {/* Vendor Sub-Orders Splitting View */}
              <div className="p-6 space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sub-Orders Split by Vendor Stores:
                </h4>

                {order.sellerOrders?.map((subOrder) => (
                  <div key={subOrder._id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{subOrder.sellerOrderNumber}</span>
                        <span className="text-xs text-slate-500">
                          (Vendor: {subOrder.seller?.name || 'Seller Store'})
                        </span>
                      </div>
                      <Badge variant="primary" size="sm">
                        Status: {subOrder.status}
                      </Badge>
                    </div>

                    {/* Sub-order items */}
                    <div className="space-y-2">
                      {subOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img src={item.image} alt={item.title} className="w-10 h-10 rounded object-cover" />
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{item.title}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity} x ₹{item.price}</p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-800">₹{item.totalItemPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
