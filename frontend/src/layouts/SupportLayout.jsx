import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiHelpCircle, FiMessageSquare, FiPackage, FiUser, FiGrid } from 'react-icons/fi';
import Sidebar from '../components/common/Sidebar.jsx';

const supportLinks = [
  { path: '/support-agent', label: 'Dashboard', icon: FiGrid, exact: true },
  { path: '/support-agent/issues', label: 'Customer Issues', icon: FiHelpCircle },
  { path: '/support-agent/orders', label: 'Order Inquiry', icon: FiPackage },
  { path: '/support-agent/tickets', label: 'Support Tickets', icon: FiMessageSquare },
  { path: '/support-agent/profile', label: 'Agent Profile', icon: FiUser },
];

const SupportLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar links={supportLinks} title="Support Desk Portal" roleBadge="SUPPORT AGENT" />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <h1 className="text-xl font-bold text-slate-800">Support Desk Command</h1>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
              Agent Available
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

export default SupportLayout;
