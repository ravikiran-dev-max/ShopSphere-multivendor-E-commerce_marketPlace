import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBox,
  FiShoppingBag,
  FiDollarSign,
  FiTrendingUp,
  FiZap,
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, aiRes] = await Promise.allSettled([
        api.get('/sellers/dashboard-stats'),
        api.get('/ai/seller-insights'),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.data);
      }
      if (aiRes.status === 'fulfilled') {
        setAiInsights(aiRes.value.data.data);
      }
    } catch (e) {
      toast.error('Failed to load merchant dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading merchant analytics..." />;

  const insightsList = aiInsights?.insights || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Merchant Store Performance</h2>
          <p className="text-sm text-slate-500">Track store revenues, product sales, and pending order dispatch.</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={stats?.sellerStatus === 'APPROVED' ? 'success' : 'warning'}
            className="text-xs py-1 px-3"
          >
            Store Status: {stats?.sellerStatus || 'APPROVED'}
          </Badge>
          <Link to="/seller/products">
            <Button variant="primary" size="sm" icon={FiBox}>
              Manage Products
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            <FiBox />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Listed Products</p>
            <p className="text-2xl font-black text-slate-900">{stats?.totalProducts || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            <FiShoppingBag />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Sub-Orders</p>
            <p className="text-2xl font-black text-slate-900">{stats?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Gross Revenue</p>
            <p className="text-2xl font-black text-slate-900">₹{stats?.grossRevenue || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <FiTrendingUp />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Store Rating</p>
            <p className="text-2xl font-black text-slate-900">{stats?.ratingAverage || 4.8} ★</p>
          </div>
        </div>
      </div>

      {/* AI Smart Merchant Advisor */}
      {insightsList.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 border border-indigo-800">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <FiZap className="text-amber-400 text-base" /> ShopSphere AI Merchant Advisor
          </div>
          <h3 className="text-xl font-black">Automated Sales & Inventory Intelligence</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {insightsList.map((insight, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2">
                <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                  {insight.type.replace('_', ' ')}
                </span>
                <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Merchant Orders */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">Recent Customer Sub-Orders</h3>
          <Link to="/seller/orders" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            View All Orders <FiArrowRight />
          </Link>
        </div>

        {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No orders received yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-bold text-slate-800">{order.sellerOrderNumber}</span>
                  <p className="text-xs text-slate-500">Customer: {order.customer?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="primary" size="sm">
                    {order.status}
                  </Badge>
                  <span className="font-bold text-slate-900">₹{order.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
