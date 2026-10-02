import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import SellerLayout from '../layouts/SellerLayout.jsx';
import RiderLayout from '../layouts/RiderLayout.jsx';
import SupportLayout from '../layouts/SupportLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import Products from '../pages/Products.jsx';
import ProductDetails from '../pages/ProductDetails.jsx';
import Cart from '../pages/Cart.jsx';
import Checkout from '../pages/Checkout.jsx';
import Orders from '../pages/Orders.jsx';
import SellersList from '../pages/SellersList.jsx';
import SellerStore from '../pages/SellerStore.jsx';
import Wishlist from '../pages/Wishlist.jsx';
import Profile from '../pages/Profile.jsx';
import SupportCenter from '../pages/SupportCenter.jsx';

import AdminDashboard from '../pages/AdminDashboard.jsx';
import AdminUsers from '../pages/AdminUsers.jsx';
import AdminSellers from '../pages/AdminSellers.jsx';
import AdminCategories from '../pages/AdminCategories.jsx';
import AdminProducts from '../pages/AdminProducts.jsx';
import AdminOrders from '../pages/AdminOrders.jsx';
import AdminAuditLogs from '../pages/AdminAuditLogs.jsx';

import SellerDashboard from '../pages/SellerDashboard.jsx';
import SellerProducts from '../pages/SellerProducts.jsx';
import SellerOrders from '../pages/SellerOrders.jsx';

import RiderDashboard from '../pages/RiderDashboard.jsx';
import RiderDeliveries from '../pages/RiderDeliveries.jsx';
import RiderHistory from '../pages/RiderHistory.jsx';
import RiderProfile from '../pages/RiderProfile.jsx';


import SupportDashboard from '../pages/SupportDashboard.jsx';

import PlaceholderView from '../components/common/PlaceholderView.jsx';
import NotFound from '../pages/NotFound.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer / Public Marketplace Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="seller/register" element={<Register defaultRole="SELLER" />} />
        <Route path="products" element={<Products />} />
        <Route path="products/item/:slug" element={<ProductDetails />} />
        <Route path="sellers" element={<SellersList />} />
        <Route path="sellers/store/:slug" element={<SellerStore />} />
        <Route path="wishlist" element={<Wishlist />} />

        {/* Customer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
          <Route path="support" element={<SupportCenter />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="returns" element={<PlaceholderView title="Admin Returns & Refunds" description="Moderate return requests." />} />
          <Route path="settlements" element={<PlaceholderView title="Admin Seller Settlements" description="Reconcile merchant sales revenue." />} />
          <Route path="deliveries" element={<PlaceholderView title="Admin Delivery Dispatch" description="Monitor rider assignments." />} />
          <Route path="support" element={<PlaceholderView title="Admin Support Desk" description="Manage customer issue tickets." />} />
          <Route path="reviews" element={<PlaceholderView title="Admin Review Moderation" description="Review customer ratings." />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<PlaceholderView title="Platform Settings" description="Configure global parameters." />} />
        </Route>
      </Route>

      {/* Seller Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/new" element={<SellerProducts />} />
          <Route path="inventory" element={<PlaceholderView title="Merchant Inventory Control" description="Track stock alert thresholds." />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="returns" element={<PlaceholderView title="Merchant Returns" description="Process customer exchanges." />} />
          <Route path="reviews" element={<PlaceholderView title="Customer Reviews" description="View customer ratings." />} />
          <Route path="coupons" element={<PlaceholderView title="Seller Store Coupons" description="Create promotional vouchers." />} />
          <Route path="analytics" element={<PlaceholderView title="Merchant Sales Analytics" description="Detailed revenue breakdown." />} />
          <Route path="settlements" element={<PlaceholderView title="Merchant Payouts" description="Track payout history." />} />
          <Route path="settings" element={<PlaceholderView title="Store Settings" description="Update store profile." />} />
        </Route>
      </Route>

      {/* Rider Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['DELIVERY', 'RIDER']} />}>
        <Route path="/rider" element={<RiderLayout />}>
          <Route index element={<RiderDashboard />} />
          <Route path="deliveries" element={<RiderDeliveries />} />
          <Route path="history" element={<RiderHistory />} />
          <Route path="profile" element={<RiderProfile />} />
        </Route>
      </Route>

      {/* Support Agent Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SUPPORT']} />}>
        <Route path="/support-agent" element={<SupportLayout />}>
          <Route index element={<SupportDashboard />} />
          <Route path="issues" element={<SupportDashboard />} />
          <Route path="orders" element={<PlaceholderView title="Support Order Inquiry" description="Inspect customer order issues." />} />
          <Route path="tickets" element={<SupportDashboard />} />
          <Route path="profile" element={<PlaceholderView title="Support Agent Profile" description="Manage agent details." />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
