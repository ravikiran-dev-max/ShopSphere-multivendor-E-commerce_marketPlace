import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiSearch,
  FiLogOut,
  FiGrid,
  FiPackage,
  FiShield,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore.js';
import Button from './Button.jsx';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 text-center font-medium">
        ✨ Welcome to <span className="text-indigo-400 font-bold">SHOPSPHERE</span> - The Premier Multi-Vendor Marketplace | Express Delivery & 100% Verified Sellers
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-indigo-200">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                Shop<span className="text-indigo-600">Sphere</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands & sellers..."
                className="w-full bg-slate-100/80 hover:bg-slate-100 text-slate-800 text-sm rounded-full py-2.5 pl-11 pr-24 border border-transparent focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
              />
              <FiSearch className="absolute left-4 top-3 text-slate-400 w-4 h-4" />
              <button
                type="submit"
                className="absolute right-1.5 top-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 rounded-full font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action Links & Profile */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/products"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Browse All
            </Link>
            <Link
              to="/sellers"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Top Sellers
            </Link>

            <div className="h-4 w-px bg-slate-200"></div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="text-slate-600 hover:text-indigo-600 transition-colors relative p-1.5"
              title="Wishlist"
            >
              <FiHeart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="text-slate-600 hover:text-indigo-600 transition-colors relative p-1.5 flex items-center gap-2"
              title="Cart"
            >
              <div className="relative">
                <FiShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-800">Cart</span>
            </Link>

            {/* User Dropdown / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 max-w-[100px] truncate">
                    {user?.name || 'Account'}
                  </span>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                        Role: {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2"
                        >
                          <FiShield className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}

                      {user?.role === 'SELLER' && (
                        <Link
                          to="/seller"
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2"
                        >
                          <FiGrid className="w-4 h-4" /> Seller Portal
                        </Link>
                      )}

                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2"
                      >
                        <FiPackage className="w-4 h-4" /> My Orders
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2"
                      >
                        <FiUser className="w-4 h-4" /> Profile Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 gap-2 font-medium"
                      >
                        <FiLogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-slate-100 text-slate-800 text-sm rounded-lg py-2 pl-9 pr-3"
              />
              <FiSearch className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            </div>
          </form>

          <Link
            to="/products"
            className="block text-sm font-medium text-slate-700 py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Browse Products
          </Link>
          <Link
            to="/cart"
            className="block text-sm font-medium text-slate-700 py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Cart (0)
          </Link>
          <Link
            to="/wishlist"
            className="block text-sm font-medium text-slate-700 py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Wishlist
          </Link>

          {!isAuthenticated ? (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Register Account
                </Button>
              </Link>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100">
              <div className="mb-2">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-sm text-rose-600 font-medium"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
