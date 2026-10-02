import React, { useState } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiSave,
  FiPackage,
  FiHeart,
  FiLifeBuoy,
  FiMapPin,
  FiCheckCircle,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import useAuthStore from '../store/useAuthStore.js';
import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';

const Profile = () => {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Full name cannot be empty');

    setIsUpdating(true);
    try {
      const res = await api.put('/users/profile', {
        name,
        phone,
      });

      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Your Account Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your personal details, contact preferences, and marketplace activity.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-6 border border-indigo-800/50">
        <div className="w-24 h-24 rounded-2xl bg-indigo-600/50 border-2 border-indigo-400 flex items-center justify-center text-4xl font-black text-white shadow-inner">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-2xl font-black">{user?.name || 'Customer'}</h2>
            <Badge variant="success" size="sm">
              {user?.role || 'CUSTOMER'}
            </Badge>
          </div>
          <p className="text-slate-300 text-sm flex items-center justify-center md:justify-start gap-2">
            <FiMail className="text-indigo-400" /> {user?.email}
          </p>
          <p className="text-slate-400 text-xs flex items-center justify-center md:justify-start gap-2">
            <FiShield className="text-emerald-400" /> Verified Account • Member since 2026
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
          <Link to="/orders" className="flex-1">
            <Button variant="secondary" size="sm" icon={FiPackage} className="w-full">
              My Orders
            </Button>
          </Link>
          <Link to="/wishlist" className="flex-1">
            <Button variant="secondary" size="sm" icon={FiHeart} className="w-full">
              My Wishlist
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Edit Personal Details */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FiUser className="text-indigo-600" /> Personal Details
            </h3>
            <p className="text-xs text-slate-500">Update your public display name and phone number.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400">Account login emails cannot be changed directly.</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isUpdating}
              icon={FiSave}
              className="mt-2"
            >
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Quick Portal Navigation & Status */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Marketplace Hub
            </h4>
            <div className="space-y-2 text-sm">
              <Link
                to="/orders"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <FiPackage className="text-indigo-600" /> All Orders
                </span>
                <span className="text-xs text-slate-400">View &rarr;</span>
              </Link>

              <Link
                to="/wishlist"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <FiHeart className="text-rose-500" /> Saved Items
                </span>
                <span className="text-xs text-slate-400">View &rarr;</span>
              </Link>

              <Link
                to="/support"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <FiLifeBuoy className="text-emerald-600" /> Support Desk
                </span>
                <span className="text-xs text-slate-400">View &rarr;</span>
              </Link>
            </div>
          </div>

          <div className="bg-indigo-50/70 p-6 rounded-3xl border border-indigo-100 text-xs space-y-2 text-indigo-900">
            <div className="flex items-center gap-2 font-bold text-indigo-700">
              <FiCheckCircle className="text-base" /> Safe & Secure
            </div>
            <p className="leading-relaxed text-indigo-800/80">
              Your data is encrypted with enterprise-grade token security. Multi-vendor orders are independently dispatched with verified OTP confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
