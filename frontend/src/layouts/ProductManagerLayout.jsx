import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiBox, FiPercent, FiStar, FiAlertTriangle, FiUser, FiGrid } from 'react-icons/fi';
import Sidebar from '../components/common/Sidebar.jsx';

const pmLinks = [
  { path: '/product-manager', label: 'Catalog Manager', icon: FiGrid, exact: true },
  { path: '/product-manager/discounts', label: 'Discount Campaigns', icon: FiPercent },
  { path: '/product-manager/outdated', label: 'Outdated & Stock', icon: FiAlertTriangle },
  { path: '/product-manager/reviews', label: 'Review Moderation', icon: FiStar },
  { path: '/product-manager/profile', label: 'Manager Profile', icon: FiUser },
];

const ProductManagerLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar links={pmLinks} title="Product Manager Hub" roleBadge="PRODUCT MANAGER" />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div>
            <h1 className="text-xl font-black text-slate-900">Marketplace Catalog Control</h1>
            <p className="text-xs text-slate-400">Outdated product pruning, promotional discounting & review moderation</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              ⚡ Catalog Lead Active
            </span>
          </div>
        </header>
        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProductManagerLayout;
