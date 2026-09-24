import React from 'react';
import { FiUsers, FiShoppingBag, FiDollarSign, FiPackage } from 'react-icons/fi';

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Overview</h2>
        <p className="text-sm text-slate-500">Real-time stats across all active sellers and customer orders.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            <FiUsers />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Users</p>
            <p className="text-2xl font-extrabold text-slate-900">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            <FiShoppingBag />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Active Sellers</p>
            <p className="text-2xl font-extrabold text-slate-900">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <FiPackage />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Orders</p>
            <p className="text-2xl font-extrabold text-slate-900">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Platform Revenue</p>
            <p className="text-2xl font-extrabold text-slate-900">₹0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
