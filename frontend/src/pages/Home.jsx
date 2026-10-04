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
  <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-black via-gray-900 to-black text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
    <div className="relative z-10 max-w-2xl space-y-6 animate-fadeIn">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/40 text-gray-300 border border-gray-600/30 text-xs font-semibold uppercase tracking-wider animate-pulse">
        <FiZap className="text-gray-400" /> Multi-Vendor Marketplace Platform
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight transition-transform duration-500 hover:scale-105">
        Discover & Shop from Thousands of Verified Sellers.
      </h1>
      <p className="text-gray-300 text-base sm:text-lg leading-relaxed animate-slideUp">
        WhiteZa brings together top independent vendors, seamless order splitting, real-time tracking, and multi-vendor checkout into one unified shopping experience.
      </p>
      <div className="flex flex-wrap gap-4 pt-2">
        <Link to="/products">
          <Button size="lg" variant="primary" icon={FiArrowRight} className="transition-transform duration-300 hover:translate-x-1 bg-black text-white hover:bg-gray-700">
            Explore Products
          </Button>
        </Link>
        <Link to="/seller/register">
          <Button size="lg" variant="outline" className="text-white border-gray-700 hover:bg-gray-800 transition-colors duration-300">
            Become a Seller
          </Button>
        </Link>
      </div>

    {/*  {healthStatus && (
        <div className="pt-4 border-t border-gray-800 flex items-center gap-3 text-xs text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Backend API Status: {healthStatus.message} ({healthStatus.data?.environment})
        </div> 
      )}*/}
    </div>

    {/* Decorative Glow */}
    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-gray-600/20 rounded-full blur-3xl pointer-events-none animate-spin-slow"></div>
  </section>

  {/* Marketplace Value Proposition */}
  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[
      { icon: <FiShield />, title: "Verified Sellers", text: "All vendors undergo rigorous identity, quality, and store verification before listing products on ShopSphere." },
      { icon: <FiTruck />, title: "Multi-Vendor Cart", text: "Add items from different sellers into one cart. Our backend automatically splits sub-orders for each seller." },
      { icon: <FiRefreshCw />, title: "Hassle-Free Returns", text: "Transparent return policies, automated seller settlement reconciliation, and instant customer refunds." }
    ].map((item, idx) => (
      <div
        key={idx}
        className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 transition-transform duration-500 hover:scale-105 hover:shadow-lg animate-fadeIn"
      >
        <div className="w-12 h-12 rounded-xl bg-gray-100 text-black flex items-center justify-center text-xl font-bold">
          {item.icon}
        </div>
        <h3 className="text-lg font-bold text-black">{item.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
      </div>
    ))}
  </section>
</div>

  );
};

export default Home;
