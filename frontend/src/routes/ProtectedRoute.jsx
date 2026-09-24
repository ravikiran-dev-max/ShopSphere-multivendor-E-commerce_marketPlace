import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore.js';
import Loader from '../components/common/Loader.jsx';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <Loader fullScreen text="Verifying authentication..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
