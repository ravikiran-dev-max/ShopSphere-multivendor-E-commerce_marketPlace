import React, { useEffect, useState } from 'react';
import { FiTruck, FiMapPin, FiKey, FiCheckCircle, FiPhone, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import LeafletMap from '../components/common/LeafletMap.jsx';

const RiderDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // OTP Verification Modal State
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [inputOtp, setInputOtp] = useState('');
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [generatedDevOtp, setGeneratedDevOtp] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/deliveries/assigned');
      setDeliveries(res.data.data);
    } catch (e) {
      toast.error('Failed to load assigned deliveries.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateOtp = async (delivery) => {
    setIsGeneratingOtp(true);
    try {
      const res = await api.post(`/deliveries/${delivery._id}/generate-otp`);
      const { devModeOtp, otpSentTo } = res.data.data;

      setGeneratedDevOtp(devModeOtp || '');
      setActiveDelivery(delivery);
      setInputOtp('');

      toast.success(`Delivery OTP generated & sent to customer (${otpSentTo})!`);
      fetchDeliveries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate delivery OTP');
    } finally {
      setIsGeneratingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!inputOtp || inputOtp.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await api.post(`/deliveries/${activeDelivery._id}/verify-otp`, {
        otp: inputOtp.trim(),
      });
      toast.success('🎉 OTP Verified! Delivery marked as COMPLETED.');
      setActiveDelivery(null);
      setInputOtp('');
      setGeneratedDevOtp('');
      fetchDeliveries();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid OTP. Please check the OTP and try again.';
      toast.error(errorMsg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  if (isLoading) return <Loader fullScreen text="Loading assigned delivery assignments..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assigned Delivery Packages</h1>
        <p className="text-sm text-slate-500">Navigate to customer location, generate delivery OTP, and verify code.</p>
      </div>

      {deliveries.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <FiTruck className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No active delivery assignments</h3>
          <p className="text-sm text-slate-500">Assigned package deliveries will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deliveries.map((delivery) => {
            const isCompleted = delivery.status === 'DELIVERED';
            const customer = delivery.sellerOrder?.customer;
            const address = delivery.deliveryAddress;

            return (
              <div
                key={delivery._id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs space-y-4 p-6 transition-all ${
                  isCompleted ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:shadow-md'
                }`}
              >
                {/* Delivery Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Tracking Code</span>
                    <h3 className="text-base font-black text-slate-900">{delivery.trackingCode}</h3>
                  </div>
                  <Badge variant={isCompleted ? 'success' : 'primary'}>
                    {delivery.status}
                  </Badge>
                </div>

                {/* Customer Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">Recipient Customer:</span>
                    <span className="font-bold text-slate-900">{address?.fullName || customer?.name || 'Customer'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <FiPhone className="text-indigo-600" /> Phone:
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800">{address?.phone || customer?.phone || '+91 9876543212'}</span>
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-1">
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 shrink-0">
                      <FiMapPin className="text-rose-500" /> Delivery Address:
                    </span>
                    <span className="text-xs text-slate-800 text-right font-medium">
                      {address?.street}, {address?.city}, {address?.state} - {address?.zipCode}
                    </span>
                  </div>
                </div>

                {/* Interactive OpenStreetMap Navigation */}
                <div className="pt-2">
                  <LeafletMap
                    latitude={19.0760}
                    longitude={72.8777}
                    address={`${address?.street || 'Destination Location'}, ${address?.city || 'Mumbai'}`}
                    recipientName={address?.fullName || customer?.name || 'Customer'}
                  />
                </div>

                {/* Action Buttons */}
                {!isCompleted ? (
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="primary"
                      icon={FiKey}
                      className="flex-1"
                      isLoading={isGeneratingOtp}
                      onClick={() => handleGenerateOtp(delivery)}
                    >
                      Generate Delivery OTP
                    </Button>

                    <Button
                      size="sm"
                      variant="success"
                      icon={FiCheckCircle}
                      className="flex-1"
                      onClick={() => {
                        setActiveDelivery(delivery);
                        setInputOtp('');
                      }}
                    >
                      Enter Customer OTP
                    </Button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
                    <span>Handover Verified & Completed at {new Date(delivery.actualDeliveryTime || Date.now()).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* OTP Input Verification Modal */}
      {activeDelivery && (
        <Modal
          isOpen={!!activeDelivery}
          onClose={() => setActiveDelivery(null)}
          title={`Delivery OTP Verification - ${activeDelivery.trackingCode}`}
        >
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">Customer: {activeDelivery.deliveryAddress?.fullName}</p>
              <p className="text-slate-500">Phone: {activeDelivery.deliveryAddress?.phone}</p>
            </div>

            {generatedDevOtp && (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-3 rounded-xl text-xs font-mono text-center space-y-1">
                <span className="font-bold uppercase tracking-wider block text-[10px] text-indigo-600">Dev Testing Mode OTP</span>
                <span className="text-2xl font-black tracking-widest text-indigo-700">{generatedDevOtp}</span>
              </div>
            )}

            <div className="space-y-2 text-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Enter 6-Digit Customer OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="482731"
                className="w-full text-center text-3xl font-black tracking-[0.5em] py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono bg-slate-50/50"
                required
              />
            </div>

            <Button type="submit" variant="success" size="lg" className="w-full" isLoading={isVerifyingOtp} icon={FiCheckCircle}>
              Verify & Complete Delivery
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default RiderDeliveries;
