import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiLogOut, FiHome } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore.js';

const Sidebar = ({ links = [], title = 'Dashboard', roleBadge = '' }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
      <div>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
              {roleBadge}
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          </div>
        </div>

        {/* User Info Card */}
        <div className="p-4 bg-slate-800/50 mx-3 my-4 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="px-3 space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FiHome className="w-5 h-5 text-slate-400" />
            Back to Marketplace
          </NavLink>

          <div className="my-2 border-t border-slate-800"></div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-auto bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
