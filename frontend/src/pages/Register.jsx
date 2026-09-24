import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiShoppingBag, FiPhone } from 'react-icons/fi';

import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import api from '../services/api.js';
import useAuthStore from '../store/useAuthStore.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'SELLER']),
  phone: z.string().optional(),
  storeName: z.string().optional(),
  storeDescription: z.string().optional(),
});

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CUSTOMER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      const { user, accessToken } = response.data.data;

      setAuth(user, accessToken);
      toast.success('Account created successfully!');

      if (user.role === 'SELLER') {
        toast.info('Your seller store application is PENDING admin approval.');
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900">Create Your Account</h2>
        <p className="text-sm text-slate-500">Join ShopSphere customer marketplace or sell products</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={FiUser}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          icon={FiMail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+91 9876543210"
          icon={FiPhone}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={FiLock}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Account Role</label>
          <select
            {...register('role')}
            className="w-full rounded-lg border border-slate-300 bg-white text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="CUSTOMER">Customer (Buy Products)</option>
            <option value="SELLER">Merchant Seller (Sell Products)</option>
          </select>
        </div>

        {selectedRole === 'SELLER' && (
          <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Store Application Details</p>
            <Input
              label="Store Name"
              type="text"
              placeholder="e.g. Apex Electronics"
              icon={FiShoppingBag}
              error={errors.storeName?.message}
              {...register('storeName')}
            />
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Store Description</label>
              <textarea
                placeholder="Brief summary of products you sell..."
                rows={2}
                {...register('storeDescription')}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              ></textarea>
            </div>
          </div>
        )}

        <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
