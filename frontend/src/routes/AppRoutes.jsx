import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import SellerLayout from '../layouts/SellerLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import SellerDashboard from '../pages/SellerDashboard.jsx';
import NotFound from '../pages/NotFound.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer / Public Marketplace Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Seller Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<SellerDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
