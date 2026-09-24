import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiCheckCircle } from 'react-icons/fi';

import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import api from '../services/api.js';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid Zip Code is required'),
  paymentMethod: z.enum(['COD', 'RAZORPAY', 'STRIPE']),
});

const Checkout = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: 'David Miller',
      phone: '9876543210',
      street: '42 Market Street, Sector 15',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      paymentMethod: 'COD',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: 'India',
        },
        paymentMethod: data.paymentMethod,
      };

      const res = await api.post('/orders/checkout', payload);
      toast.success('Order placed successfully! Sub-orders created for vendors.');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Checkout & Order Placement</h1>
        <p className="text-sm text-slate-500">
          Enter your delivery destination. Our system automatically routes items to respective vendors.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Shipping Address Section */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FiMapPin className="text-indigo-600" /> Shipping Destination Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Recipient Full Name"
              placeholder="John Doe"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="Phone Number"
              placeholder="+91 9876543210"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <Input
            label="Street Address"
            placeholder="House/Flat No., Building, Street Name"
            error={errors.street?.message}
            {...register('street')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="City" placeholder="Mumbai" error={errors.city?.message} {...register('city')} />
            <Input label="State" placeholder="Maharashtra" error={errors.state?.message} {...register('state')} />
            <Input label="Zip Code" placeholder="400001" error={errors.zipCode?.message} {...register('zipCode')} />
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FiCreditCard className="text-indigo-600" /> Payment Selection
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border rounded-xl border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="radio" value="COD" {...register('paymentMethod')} className="text-indigo-600 focus:ring-indigo-500" />
              <div>
                <p className="text-sm font-bold text-slate-900">Cash on Delivery (COD)</p>
                <p className="text-xs text-slate-500">Pay cash upon package arrival at your door</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-xl border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="radio" value="RAZORPAY" {...register('paymentMethod')} className="text-indigo-600 focus:ring-indigo-500" />
              <div>
                <p className="text-sm font-bold text-slate-900">Razorpay Online Gateway</p>
                <p className="text-xs text-slate-500">UPI, NetBanking, Credit/Debit Cards</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-xl border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="radio" value="STRIPE" {...register('paymentMethod')} className="text-indigo-600 focus:ring-indigo-500" />
              <div>
                <p className="text-sm font-bold text-slate-900">Stripe Global Checkout</p>
                <p className="text-xs text-slate-500">International Visa, Mastercard, AMEX</p>
              </div>
            </label>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting} icon={FiCheckCircle}>
          Confirm & Place Multi-Vendor Order
        </Button>
      </form>
    </div>
  );
};

export default Checkout;
