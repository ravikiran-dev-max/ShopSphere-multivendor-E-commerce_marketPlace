import React, { useState } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiTruck,
  FiSave,
  FiLock,
  FiCheckCircle,
  FiShield,
  FiKey,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import useAuthStore from '../store/useAuthStore.js';
import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';

const RiderProfile = () => {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [vehicleNumber, setVehicleNumber] = useState('MH-02-EX-4892');
  const [vehicleType, setVehicleType] = useState('Motorcycle / Scooter');
  const [isUpdating, setIsUpdating] = useState(false);

  // Password update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Rider name cannot be empty');

    setIsUpdating(true);
    try {
      const res = await api.put('/users/profile', {
        name: name.trim(),
        phone: phone.trim(),
      });

      updateUser(res.data.data);
      toast.success('Rider operational profile saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update rider profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) return toast.error('Enter current password');
    if (!newPassword || newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsUpdatingPassword(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success(res.data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Rider Account & Duty Status</h1>
        <p className="text-sm text-slate-500">
          Manage your delivery fleet credentials, shift duty status, and security preferences.
        </p>
      </div>

      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/60 border border-indigo-400 flex items-center justify-center text-3xl font-black">
            <FiTruck />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black">{user?.name || 'Robert Express'}</h2>
              <Badge variant="success" size="sm">
                VERIFIED RIDER
              </Badge>
            </div>
            <p className="text-slate-300 text-xs flex items-center gap-2">
              <FiMail /> {user?.email}
            </p>
            <p className="text-emerald-400 text-xs flex items-center gap-1">
              <FiShield /> Certified Marketplace Courier Partner
            </p>
          </div>
        </div>

        {/* Duty Toggle Card */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4">
          <div>
            <p className="text-[11px] font-bold text-slate-300 uppercase">Operational Status</p>
            <p className="text-sm font-black text-white">{isOnDuty ? '🟢 On Duty (Active)' : '🔴 Off Duty'}</p>
          </div>
          <button
            onClick={() => {
              setIsOnDuty(!isOnDuty);
              toast.success(isOnDuty ? 'Shift ended. Marked OFF DUTY.' : 'Welcome back! Marked ON DUTY.');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              isOnDuty ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {isOnDuty ? 'Go Off Duty' : 'Go On Duty'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Vehicle Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FiUser className="text-indigo-600" /> Rider & Vehicle Profile
            </h3>
            <p className="text-xs text-slate-500">Contact information and vehicle registration details.</p>
          </div>

          <form onSubmit={handleUpdateDetails} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Dispatch Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Motorcycle / Scooter">Two-Wheeler (Motorcycle / Scooter)</option>
                <option value="Electric Bike">EV Delivery Bike</option>
                <option value="Delivery Van">Compact Delivery Van</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Vehicle Registration Number
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button type="submit" variant="primary" isLoading={isUpdating} icon={FiSave} className="w-full">
              Save Rider Profile
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FiLock className="text-indigo-600" /> Update Password
            </h3>
            <p className="text-xs text-slate-500">Keep your rider portal access secure.</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isUpdatingPassword}
              icon={FiSave}
              className="w-full"
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;
