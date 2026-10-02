import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiZap } from 'react-icons/fi';

import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import api from '../services/api.js';
import useAuthStore from '../store/useAuthStore.js';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@shopsphere.dev', pass: 'Admin@123456', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { role: 'Seller (Apex Tech)', email: 'seller1@shopsphere.dev', pass: 'Seller@123456', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { role: 'Customer', email: 'customer@shopsphere.dev', pass: 'Customer@123456', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { role: 'Rider', email: 'delivery@shopsphere.dev', pass: 'Delivery@123456', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { role: 'Support', email: 'support@shopsphere.dev', pass: 'Support@123456', color: 'bg-sky-100 text-sky-800 border-sky-200' },
];

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const handleLoginSuccess = (user, accessToken) => {
    setAuth(user, accessToken);
    toast.success(`Welcome back, ${user.name}!`);

    // Redirect based on role
    if (user.role === 'ADMIN') {
      navigate('/admin');
    } else if (user.role === 'SELLER') {
      navigate('/seller');
    } else if (user.role === 'DELIVERY' || user.role === 'RIDER') {
      navigate('/rider');
    } else if (user.role === 'SUPPORT') {
      navigate('/support-agent');
    } else {
      navigate('/');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { user, accessToken } = response.data.data;
      handleLoginSuccess(user, accessToken);
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (email, pass) => {
    setValue('email', email);
    setValue('password', pass);
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password: pass });
      const { user, accessToken } = response.data.data;
      handleLoginSuccess(user, accessToken);
    } catch (error) {
      toast.error('Quick demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900">Sign in to ShopSphere</h2>
        <p className="text-sm text-slate-500">Access your account, orders & marketplace dashboard</p>
      </div>

      {/* Quick Demo Credentials Switcher */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <FiZap className="text-amber-500" /> 1-Click Demo Login Roles:
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => handleQuickDemo(acc.email, acc.pass)}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-95 ${acc.color} hover:opacity-90`}
            >
              {acc.role}
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email Address"
          type="email"
          placeholder="user@example.com"
          icon={FiMail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={FiLock}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-indigo-600 font-semibold hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-600 font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
