import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';

import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import api from '../services/api.js';
import useAuthStore from '../store/useAuthStore.js';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { user, accessToken } = response.data.data;

      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);

      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'SELLER') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900">Sign in to ShopSphere</h2>
        <p className="text-sm text-slate-500">Access your account, orders & marketplace dashboard</p>
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
            Forgot password?
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
