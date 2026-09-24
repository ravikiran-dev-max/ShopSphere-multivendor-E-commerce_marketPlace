import React from 'react';
import { FiBox, FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

const SellerDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Merchant Store Performance</h2>
        <p className="text-sm text-slate-500">Track store revenues, product sales, and pending order dispatch.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            <FiBox />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Listed Products</p>
            <p className="text-2xl font-extrabold text-slate-900">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            <FiShoppingBag />
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
            <p className="text-xs text-slate-500 font-semibold uppercase">Gross Earnings</p>
            <p className="text-2xl font-extrabold text-slate-900">₹0.00</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <FiTrendingUp />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Pending Settlements</p>
            <p className="text-2xl font-extrabold text-slate-900">₹0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
