import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer aria-label="Site Footer" className="bg-black text-gray-400 text-sm border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-gray-300">
                <img
                  src="/WHITEZA.png"   // ✅ adjust path if logo is in public folder
                  alt="WHITEZA Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white leading-none">
                  WHITE<span className="text-gray-400">ZA</span>
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
                  Find Your Fashion Here
                </span>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              WHITEZA is a next-generation fashion marketplace connecting verified sellers with buyers globally. Seamless order splitting, secure payments, and fast fulfillment.
            </p>
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} WHITEZA Inc. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">Featured Categories</Link></li>
              <li><Link to="/sellers" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">Verified Sellers</Link></li>
              <li><Link to="/deals" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">Hot Deals</Link></li>
            </ul>
          </div>

          {/* Seller Portal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">For Sellers</h4>
            <ul className="space-y-2">
              <li><Link to="/seller/register" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">Sell on WHITEZA</Link></li>
              <li><Link to="/seller/login" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">Seller Portal Login</Link></li>
              <li><Link to="/seller/guidelines" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">Seller Guidelines</Link></li>
              <li><Link to="/seller/settlements" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">Settlement Architecture</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/support" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">Help Center / Tickets</Link></li>
              <li><Link to="/orders" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">Track Order Status</Link></li>
              <li><Link to="/returns" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">Returns & Refunds</Link></li>
              <li><Link to="/terms" className="hover:text-white hover:underline underline-offset-4 transition-all duration-300">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
