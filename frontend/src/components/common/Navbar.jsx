import React, { useState, useEffect } from 'react';
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
  FiTruck,
  FiLifeBuoy,
} from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore.js';
import Button from './Button.jsx';
import api from '../../services/api.js';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      api
        .get('/cart')
        .then((res) => {
          const totalQty =
            res.data.data?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          setCartCount(totalQty);
        })
        .catch(() => {});
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    navigate('/login');
  };

  const getOrdersLink = () => {
    if (user?.role === 'SELLER') return '/seller/orders';
    if (user?.role === 'DELIVERY' || user?.role === 'RIDER') return '/rider/deliveries';
    if (user?.role === 'ADMIN') return '/admin/orders';
    return '/orders';
  };

  const getOrdersLabel = () => {
    if (user?.role === 'SELLER') return 'Store Sub-Orders';
    if (user?.role === 'DELIVERY' || user?.role === 'RIDER') return 'My Deliveries';
    if (user?.role === 'ADMIN') return 'Marketplace Orders';
    return 'My Orders';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 font-medium">
         Welcome to <span className="text-indigo-400 font-bold">WHITEZA</span> - Find your fashion Here
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
    <Link to="/" className="flex items-center gap-2 shrink-0">
  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-gray-300">
    <img
      src="WHITEZA.png"   // ✅ use a proper relative path
      alt="WHITEZA Logo"
      className="w-10 h-10 object-contain" // ✅ added width/height for consistency
    />
  </div>
  <div className="flex flex-col">
    <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
      WHITE<span className="text-gray-700">ZA</span>
    </span>
    <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
      Find Your Fashion Here
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
  className="absolute right-1.5 top-1 
             bg-black/50 hover:bg-gray-700 
             text-white text-xs px-4 py-1.5 
             rounded-full font-medium 
             backdrop-blur-sm transition-colors"
>
  Search
</button>

            </div>
          </form>

          {/* Action Links & Profile */}
          <div className="hidden lg:flex items-center gap-6">
          
   <Link
    to="/products"
    className="text-sm font-medium text-slate-600 hover:text-black transition-colors duration-300 hover:scale-105 transform"
  >
   Products
  </Link>
  <Link
    to="/sellers"
    className="text-sm font-medium text-slate-600 hover:text-black transition-colors duration-300 hover:scale-105 transform"
  >
    Top Sellers
  </Link>

  <div className="h-4 w-px bg-slate-200"></div>

  {/* Wishlist */}
  <Link
    to="/wishlist"
    className="text-slate-600 hover:text-black transition-colors duration-300 relative p-1.5 hover:rotate-12 transform"
    title="Wishlist"
  >
    <FiHeart className="w-5 h-5" />
  </Link>

  {/* Cart */}
  <Link
    to="/cart"
    className="text-slate-600 hover:text-black transition-colors duration-300 relative p-1.5 flex items-center gap-2 hover:scale-105 transform"
    title="Cart"
  >
    <div className="relative">
      <FiShoppingCart className="w-5 h-5 transition-transform duration-300 hover:rotate-6" />
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
          {cartCount}
        </span>
      )}
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
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2 font-medium"
                        >
                          <FiShield className="w-4 h-4 text-indigo-600" /> Admin Command
                        </Link>
                      )}

                      {user?.role === 'SELLER' && (
                        <Link
                          to="/seller"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2 font-medium"
                        >
                          <FiGrid className="w-4 h-4 text-indigo-600" /> Seller Portal
                        </Link>
                      )}

                      {(user?.role === 'DELIVERY' || user?.role === 'RIDER') && (
                        <Link
                          to="/rider"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2 font-medium"
                        >
                          <FiTruck className="w-4 h-4 text-indigo-600" /> Rider Portal
                        </Link>
                      )}

                      {user?.role === 'SUPPORT' && (
                        <Link
                          to="/support-agent"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2 font-medium"
                        >
                          <FiGrid className="w-4 h-4 text-indigo-600" /> Support Desk
                        </Link>
                      )}

                      <Link
                        to={getOrdersLink()}
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2"
                      >
                        <FiPackage className="w-4 h-4" /> {getOrdersLabel()}
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2"
                      >
                        <FiHeart className="w-4 h-4" /> Saved Wishlist
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2"
                      >
                        <FiUser className="w-4 h-4" /> Profile Details
                      </Link>

                      <Link
                        to="/support"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 gap-2"
                      >
                        <FiLifeBuoy className="w-4 h-4" /> Support Center
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
            to="/sellers"
            className="block text-sm font-medium text-slate-700 py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Top Sellers
          </Link>
          <Link
            to="/cart"
            className="block text-sm font-medium text-slate-700 py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Cart {cartCount > 0 ? `(${cartCount})` : ''}
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

              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1.5 text-sm text-indigo-600 font-semibold"
                >
                  Admin Center
                </Link>
              )}
              {user?.role === 'SELLER' && (
                <Link
                  to="/seller"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1.5 text-sm text-indigo-600 font-semibold"
                >
                  Seller Hub
                </Link>
              )}
              {(user?.role === 'DELIVERY' || user?.role === 'RIDER') && (
                <Link
                  to="/rider"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1.5 text-sm text-indigo-600 font-semibold"
                >
                  Rider Portal
                </Link>
              )}
              {user?.role === 'SUPPORT' && (
                <Link
                  to="/support-agent"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1.5 text-sm text-indigo-600 font-semibold"
                >
                  Support Portal
                </Link>
              )}

              <Link
                to={getOrdersLink()}
                onClick={() => setIsMenuOpen(false)}
                className="block py-1.5 text-sm text-slate-700 font-medium"
              >
                {getOrdersLabel()}
              </Link>

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
