import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiCheckCircle, FiClock, FiMapPin, FiArrowRight } from 'react-icons/fi';
import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';

const RiderDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/deliveries/assigned');
      setDeliveries(res.data.data);
    } catch (e) {
      console.log('Rider deliveries fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading assigned deliveries..." />;

  const activeDeliveries = deliveries.filter((d) => d.status !== 'DELIVERED');
  const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Rider Operational Duty Overview</h2>
        <p className="text-sm text-slate-500">View active packages, customer map locations, and OTP delivery verifications.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            <FiTruck />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Active Deliveries</p>
            <p className="text-2xl font-extrabold text-slate-900">{activeDeliveries.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            <FiCheckCircle />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Completed Deliveries</p>
            <p className="text-2xl font-extrabold text-slate-900">{completedDeliveries.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <FiClock />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Pending Verification</p>
            <p className="text-2xl font-extrabold text-slate-900">{activeDeliveries.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 className="text-lg font-bold">Ready for Delivery Verification?</h3>
          <p className="text-xs text-slate-300">Navigate to customer address, generate secure 6-digit OTP, and collect customer code.</p>
        </div>
        <Link to="/rider/deliveries">
          <Button variant="primary" icon={FiArrowRight}>
            Go to Assigned Packages
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default RiderDashboard;
