import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiZap } from 'react-icons/fi';
import Button from '../components/common/Button.jsx';
import api from '../services/api.js';

const Home = () => {
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    api
      .get('/health')
      .then((res) => setHealthStatus(res.data))
      .catch((err) => console.log('Backend health check error:', err));
  }, []);

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold uppercase tracking-wider">
            <FiZap className="text-indigo-400" /> Multi-Vendor Marketplace Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Discover & Shop from Thousands of Verified Sellers.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            ShopSphere brings together top independent vendors, seamless order splitting, real-time tracking, and multi-vendor checkout into one unified shopping experience.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/products">
              <Button size="lg" variant="primary" icon={FiArrowRight}>
                Explore Products
              </Button>
            </Link>
            <Link to="/seller/register">
              <Button size="lg" variant="outline" className="text-white border-slate-700 hover:bg-slate-800">
                Become a Seller
              </Button>
            </Link>
          </div>

          {healthStatus && (
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Backend API Status: {healthStatus.message} ({healthStatus.data?.environment})
            </div>
          )}
        </div>

        {/* Decorative Grid */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Marketplace Value Value Proposition */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            <FiShield />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Verified Sellers</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            All vendors undergo rigorous identity, quality, and store verification before listing products on ShopSphere.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            <FiTruck />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Multi-Vendor Cart</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Add items from different sellers into one cart. Our backend automatically splits sub-orders for each seller.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            <FiRefreshCw />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Hassle-Free Returns</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Transparent return policies, automated seller settlement reconciliation, and instant customer refunds.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
