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
  FiLock,
  FiCheckCircle,
  FiKey,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import useAuthStore from '../store/useAuthStore.js';
import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';

const Profile = () => {
  const { user, updateUser } = useAuthStore();

  // Profile details state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Full name cannot be empty');
    if (!email.trim()) return toast.error('Email cannot be empty');

    setIsUpdating(true);
    try {
      const res = await api.put('/users/profile', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      updateUser(res.data.data);
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) return toast.error('Please enter your current password.');
    if (!newPassword || newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match.');
    }

    setIsUpdatingPassword(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success(res.data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password. Verify your current password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Your Account Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your personal details, credentials, and marketplace activity securely.
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
        <div className="md:col-span-2 space-y-6">
          {/* Edit Personal Details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiUser className="text-indigo-600" /> Personal Information
              </h3>
              <p className="text-xs text-slate-500">Update your public name, primary email, and contact number.</p>
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
                  Account Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
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

          {/* Update Password Flow */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FiLock className="text-indigo-600" /> Security & Password
              </h3>
              <p className="text-xs text-slate-500">
                Change your account password securely by confirming your current password.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Current Password
                </label>
                <div className="relative">
                  <FiKey className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdatingPassword}
                icon={FiSave}
                className="mt-2"
              >
                Update Password
              </Button>
            </form>
          </div>
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
                  <FiPackage className="text-indigo-600" /> Orders & Inquiries
                </span>
                <span className="text-xs text-slate-400">&rarr;</span>
              </Link>

              <Link
                to="/wishlist"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <FiHeart className="text-rose-500" /> Saved Items
                </span>
                <span className="text-xs text-slate-400">&rarr;</span>
              </Link>

              <Link
                to="/support"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <FiLifeBuoy className="text-emerald-600" /> Help Desk
                </span>
                <span className="text-xs text-slate-400">&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="bg-indigo-50/70 p-6 rounded-3xl border border-indigo-100 text-xs space-y-2 text-indigo-900">
            <div className="flex items-center gap-2 font-bold text-indigo-700">
              <FiCheckCircle className="text-base" /> Safe & Secure
            </div>
            <p className="leading-relaxed text-indigo-800/80">
              Your credentials and personal information are protected by encrypted JWT sessions with audit tracking for all password events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
