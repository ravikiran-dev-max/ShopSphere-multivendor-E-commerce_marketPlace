import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiTruck, FiMapPin, FiCheckSquare, FiUser, FiGrid } from 'react-icons/fi';
import Sidebar from '../components/common/Sidebar.jsx';

const riderLinks = [
  { path: '/rider', label: 'Dashboard', icon: FiGrid, exact: true },
  { path: '/rider/deliveries', label: 'Assigned Deliveries', icon: FiTruck },
  { path: '/rider/map', label: 'Live Delivery Map', icon: FiMapPin },
  { path: '/rider/history', label: 'Delivery History', icon: FiCheckSquare },
  { path: '/rider/profile', label: 'Rider Profile', icon: FiUser },
];

const RiderLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar links={riderLinks} title="Rider Logistics Portal" roleBadge="DELIVERY RIDER" />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-slate-900 text-white px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <FiTruck className="text-indigo-400 text-xl" />
            <h1 className="text-lg font-bold">Rider Dispatch & Delivery Verification</h1>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ● Active Duty
          </span>
        </header>
        <main className="p-4 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RiderLayout;
