import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiKey, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!token.trim()) return toast.error('Please enter the reset token.');
    if (!newPassword || newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      });

      toast.success(res.data.message || 'Password successfully reset!');
      setIsSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Token may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          <FiLock />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Set New Password</h2>
        <p className="text-sm text-slate-500">
          Enter your verification token and select a new strong password.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-4 text-center">
          <FiCheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-emerald-900">Password Updated!</h3>
            <p className="text-xs text-emerald-700">
              Your password has been changed securely and old sessions have been revoked.
            </p>
          </div>

          <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>
            Sign In with New Password
          </Button>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <Input
            label="Reset Token"
            type="text"
            placeholder="Paste your 64-character token"
            icon={FiKey}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            icon={FiLock}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            icon={FiLock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      )}

      <div className="text-center pt-4 border-t border-slate-100">
        <Link
          to="/login"
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1.5"
        >
          <FiArrowLeft /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
