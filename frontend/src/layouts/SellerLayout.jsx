import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  FiGrid,
  FiBox,
  FiPlusCircle,
  FiLayers,
  FiShoppingBag,
  FiRefreshCw,
  FiStar,
  FiTag,
  FiTrendingUp,
  FiDollarSign,
  FiSettings,
} from 'react-icons/fi';
import Sidebar from '../components/common/Sidebar.jsx';

const sellerLinks = [
  { path: '/seller', label: 'Dashboard', icon: FiGrid, exact: true },
  { path: '/seller/products', label: 'My Products', icon: FiBox },
  { path: '/seller/products/new', label: 'Add Product', icon: FiPlusCircle },
  { path: '/seller/inventory', label: 'Inventory', icon: FiLayers },
  { path: '/seller/orders', label: 'Orders', icon: FiShoppingBag },
  { path: '/seller/returns', label: 'Returns', icon: FiRefreshCw },
  { path: '/seller/reviews', label: 'Reviews', icon: FiStar },
  { path: '/seller/coupons', label: 'Coupons', icon: FiTag },
  { path: '/seller/analytics', label: 'Analytics', icon: FiTrendingUp },
  { path: '/seller/settlements', label: 'Settlements', icon: FiDollarSign },
  { path: '/seller/settings', label: 'Store Settings', icon: FiSettings },
];

const SellerLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar links={sellerLinks} title="Seller Hub" roleBadge="STORE SELLER" />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <h1 className="text-xl font-bold text-slate-800">Merchant Store Manager</h1>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              Approved Merchant
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

export default SellerLayout;
