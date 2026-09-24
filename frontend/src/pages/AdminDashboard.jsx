import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiDollarSign, FiPackage, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/overview');
      setStats(res.data.data);
    } catch (e) {
      console.log('Admin overview fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading platform administration overview..." />;

  const pendingSellers = stats?.pendingSellerApprovals || 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Command Overview</h2>
        <p className="text-sm text-slate-500">Real-time statistics across active users, seller applications, and orders.</p>
      </div>

      {/* Prominent Seller Approval Alert Banner if Pending Requests Exist */}
      {pendingSellers > 0 && (
        <div className="bg-amber-500 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-8 h-8 text-amber-100 shrink-0" />
            <div>
              <h3 className="text-lg font-extrabold">Pending Seller Approvals: {pendingSellers}</h3>
              <p className="text-xs text-amber-100">Merchant stores are awaiting your review and approval before they can list products.</p>
            </div>
          </div>
          <Link to="/admin/sellers">
            <Button variant="secondary" className="bg-slate-900 hover:bg-slate-950 text-white border-0" icon={FiArrowRight}>
              Review Seller Applications
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            <FiUsers />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Users</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <FiShoppingBag />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Seller Accounts</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.totalSellers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
            <FiPackage />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Products</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats?.totalProducts || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Platform Revenue</p>
            <p className="text-2xl font-extrabold text-slate-900">₹{stats?.totalRevenue || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
