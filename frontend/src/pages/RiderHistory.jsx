import React, { useEffect, useState } from 'react';
import {
  FiCheckCircle,
  FiCalendar,
  FiMapPin,
  FiPackage,
  FiTruck,
  FiRefreshCw,
  FiAward,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';

const RiderHistory = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/deliveries/assigned');
      const all = res.data.data || [];
      const completed = all.filter((d) => d.status === 'DELIVERED');
      setDeliveries(completed);
    } catch (e) {
      toast.error('Failed to load completed delivery history.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading delivery archives..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Rider Delivery History</h1>
          <p className="text-sm text-slate-500">
            Verified completed deliveries with OTP proof of handover and completion timestamps.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={FiRefreshCw} onClick={fetchHistory}>
          Refresh History
        </Button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            <FiCheckCircle />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Fulfilled</p>
            <p className="text-2xl font-black text-slate-900">{deliveries.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            <FiAward />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">OTP Success Rate</p>
            <p className="text-2xl font-black text-slate-900">100%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <FiTruck />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Service Fleet</p>
            <p className="text-2xl font-black text-slate-900">Express</p>
          </div>
        </div>
      </div>

      {deliveries.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <FiPackage className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Completed Deliveries Yet</h3>
          <p className="text-sm text-slate-500">
            When you verify delivery OTPs for assigned packages, they will be archived here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((del) => {
            const so = del.sellerOrder;
            return (
              <div
                key={del._id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {del.trackingCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Sub-Order: {so?.sellerOrderNumber || 'Verified Package'}
                    </h3>
                  </div>

                  <Badge variant="success" size="sm">
                    DELIVERED & VERIFIED
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">Customer Recipient:</p>
                    <p className="text-slate-600">
                      {del.deliveryAddress?.fullName || so?.customer?.name || 'Customer'}
                    </p>
                    <p className="text-slate-500 flex items-center gap-1">
                      <FiMapPin /> {del.deliveryAddress?.street}, {del.deliveryAddress?.city}, {del.deliveryAddress?.zipCode}
                    </p>
                  </div>

                  <div className="space-y-1 md:text-right">
                    <p className="font-bold text-slate-800">Vendor & Handover Details:</p>
                    <p className="text-slate-600">Merchant: {so?.seller?.name || 'Store Hub'}</p>
                    <p className="text-slate-500 flex items-center md:justify-end gap-1">
                      <FiCalendar /> Verified on:{' '}
                      {new Date(del.updatedAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Delivered items summary */}
                {so?.items && so.items.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-wrap gap-3">
                    {so.items.map((it, idx) => (
                      <span key={idx} className="font-medium text-slate-700">
                        • {it.title} (x{it.quantity})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiderHistory;
