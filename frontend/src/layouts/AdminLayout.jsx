import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiShoppingBag,
  FiFolder,
  FiPackage,
  FiRefreshCw,
  FiDollarSign,
  FiTruck,
  FiHelpCircle,
  FiStar,
  FiActivity,
  FiSettings,
} from 'react-icons/fi';
import Sidebar from '../components/common/Sidebar.jsx';

const adminLinks = [
  { path: '/admin', label: 'Overview', icon: FiGrid, exact: true },
  { path: '/admin/users', label: 'Users', icon: FiUsers },
  { path: '/admin/sellers', label: 'Sellers', icon: FiShoppingBag, badge: 'New' },
  { path: '/admin/products', label: 'Products', icon: FiPackage },
  { path: '/admin/categories', label: 'Categories', icon: FiFolder },
  { path: '/admin/orders', label: 'Orders', icon: FiPackage },
  { path: '/admin/returns', label: 'Returns & Refunds', icon: FiRefreshCw },
  { path: '/admin/settlements', label: 'Settlements', icon: FiDollarSign },
  { path: '/admin/deliveries', label: 'Deliveries', icon: FiTruck },
  { path: '/admin/support', label: 'Support Tickets', icon: FiHelpCircle },
  { path: '/admin/reviews', label: 'Reviews', icon: FiStar },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: FiActivity },
  { path: '/admin/settings', label: 'Settings', icon: FiSettings },
];

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar links={adminLinks} title="Admin Center" roleBadge="PLATFORM ADMIN" />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <h1 className="text-xl font-bold text-slate-800">Admin Command Portal</h1>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              ● System Operational
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

export default AdminLayout;
