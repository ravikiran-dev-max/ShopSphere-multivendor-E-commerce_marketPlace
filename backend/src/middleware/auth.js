import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

/**
 * Middleware to authenticate user via JWT Access Token
 */
export const authenticateUser = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.shopsphere_access_token) {
    token = req.cookies.shopsphere_access_token;
  }

  if (!token) {
    throw new ApiError(401, 'Authentication token missing. Please log in to access this resource.');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'shopsphere_jwt_access_secret_super_secure_key_12345'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User associated with this token no longer exists.');
    }

    if (user.status === 'SUSPENDED') {
      throw new ApiError(403, 'Your account has been suspended. Please contact marketplace support.');
    }

    if (user.status === 'INACTIVE') {
      throw new ApiError(403, 'Your account is currently inactive. Please activate your account.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired. Please refresh your session.');
    }
    throw new ApiError(401, 'Invalid authentication token.');
  }
});

/**
 * Middleware to authorize specific RBAC roles
 * @param  {...string} roles Allowed roles (e.g., 'ADMIN', 'SELLER')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'User authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};

// Role-specific shortcut middlewares
export const requireAdmin = [authenticateUser, authorizeRoles('ADMIN')];
export const requireSeller = [authenticateUser, authorizeRoles('SELLER')];
export const requireCustomer = [authenticateUser, authorizeRoles('CUSTOMER')];
export const requireSupport = [authenticateUser, authorizeRoles('SUPPORT')];
export const requireDelivery = [authenticateUser, authorizeRoles('DELIVERY')];
export const requireStaff = [authenticateUser, authorizeRoles('ADMIN', 'SUPPORT')];
export const requireSellerOrAdmin = [authenticateUser, authorizeRoles('SELLER', 'ADMIN')];
