import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';

import api from '../services/api.js';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your account email.');

    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success(res.data.message || 'Password reset link dispatched!');
      if (res.data.data?.resetToken) {
        setResetToken(res.data.data.resetToken);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
          <FiKey />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Forgot Password?</h2>
        <p className="text-sm text-slate-500">
          Enter your registered email and we'll generate a secure token to reset your password.
        </p>
      </div>

      {resetToken ? (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-4 text-center">
          <FiCheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-emerald-900">Reset Token Generated</h3>
            <p className="text-xs text-emerald-700">
              For security and rapid testing in this environment, your token is ready:
            </p>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-300 font-mono text-xs text-slate-800 break-all select-all">
              {resetToken}
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate(`/reset-password?token=${resetToken}`)}
          >
            Proceed to Reset Password &rarr;
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Account Email"
            type="email"
            placeholder="you@domain.com"
            icon={FiMail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading}>
            Send Reset Instructions
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

export default ForgotPassword;
