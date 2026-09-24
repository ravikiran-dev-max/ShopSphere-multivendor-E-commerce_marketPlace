import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
                S
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Shop<span className="text-indigo-400">Sphere</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              ShopSphere is a next-generation multi-vendor marketplace connecting verified sellers with buyers globally. Seamless order splitting, secure payments, and fast fulfillment.
            </p>
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} ShopSphere Inc. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="hover:text-indigo-400 transition-colors">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-indigo-400 transition-colors">Featured Categories</Link></li>
              <li><Link to="/sellers" className="hover:text-indigo-400 transition-colors">Verified Sellers</Link></li>
              <li><Link to="/deals" className="hover:text-indigo-400 transition-colors">Hot Deals</Link></li>
            </ul>
          </div>

          {/* Seller Portal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">For Sellers</h4>
            <ul className="space-y-2">
              <li><Link to="/seller/register" className="hover:text-indigo-400 transition-colors">Sell on ShopSphere</Link></li>
              <li><Link to="/seller/login" className="hover:text-indigo-400 transition-colors">Seller Portal Login</Link></li>
              <li><Link to="/seller/guidelines" className="hover:text-indigo-400 transition-colors">Seller Guidelines</Link></li>
              <li><Link to="/seller/settlements" className="hover:text-indigo-400 transition-colors">Settlement Architecture</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/support" className="hover:text-indigo-400 transition-colors">Help Center / Tickets</Link></li>
              <li><Link to="/orders" className="hover:text-indigo-400 transition-colors">Track Order Status</Link></li>
              <li><Link to="/returns" className="hover:text-indigo-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
