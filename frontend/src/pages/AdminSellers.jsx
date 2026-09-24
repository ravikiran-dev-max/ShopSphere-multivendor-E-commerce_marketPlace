import React, { useEffect, useState } from 'react';
import { FiShoppingBag, FiCheck, FiX, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('PENDING'); // Default to PENDING for fast admin review

  useEffect(() => {
    fetchSellers();
  }, [selectedTab]);

  const fetchSellers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/sellers/admin/all?status=${selectedTab}`);
      setSellers(res.data.data);
    } catch (error) {
      toast.error('Failed to load seller store profiles.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (sellerId, newStatus) => {
    try {
      await api.patch(`/sellers/${sellerId}/status`, {
        status: newStatus,
        reason: `Admin application ${newStatus.toLowerCase()}`,
      });
      toast.success(`Merchant store status updated to ${newStatus}!`);
      fetchSellers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update seller status.');
    }
  };

  const pendingCount = sellers.filter((s) => s.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Merchant Store Approvals & Verification</h1>
          <p className="text-sm text-slate-500">Review pending vendor applications and manage marketplace status.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTab === tab
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Loader size="lg" text="Fetching seller store applications..." />
      ) : sellers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <FiShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No {selectedTab.toLowerCase()} seller store applications</h3>
          <p className="text-sm text-slate-500">Registered merchant applications will appear here for admin moderation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sellers.map((s) => (
            <div key={s._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{s.storeName}</h3>
                  <p className="text-xs text-slate-500">Applicant: {s.user?.name} ({s.user?.email})</p>
                </div>
                <Badge
                  variant={
                    s.status === 'APPROVED' ? 'success' : s.status === 'PENDING' ? 'warning' : 'danger'
                  }
                >
                  {s.status}
                </Badge>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{s.storeDescription || 'No description provided.'}</p>

              <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p><span className="font-semibold text-slate-700">Business Email:</span> {s.businessEmail || s.user?.email}</p>
                <p><span className="font-semibold text-slate-700">Business Phone:</span> {s.businessPhone || s.user?.phone || 'Not provided'}</p>
                <p><span className="font-semibold text-slate-700">Registration Date:</span> {new Date(s.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                {s.status !== 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="success"
                    icon={FiCheck}
                    className="flex-1"
                    onClick={() => handleUpdateStatus(s._id, 'APPROVED')}
                  >
                    Approve Store
                  </Button>
                )}

                {s.status !== 'REJECTED' && (
                  <Button
                    size="sm"
                    variant="danger"
                    icon={FiX}
                    className="flex-1"
                    onClick={() => handleUpdateStatus(s._id, 'REJECTED')}
                  >
                    Reject Application
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSellers;
