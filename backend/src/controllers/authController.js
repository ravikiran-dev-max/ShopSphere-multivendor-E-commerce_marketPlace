import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import CustomerProfile from '../models/CustomerProfile.js';
import SellerProfile from '../models/SellerProfile.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/authValidator.js';

// Cookie options for Refresh Token
const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * @desc    Register a new user (Customer or Seller)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map((e) => e.message);
    throw new ApiError(400, 'Validation Error: ' + errorMessages.join(', '), errorMessages);
  }

  const { name, email, password, role, phone, storeName, storeDescription, businessEmail, businessPhone } =
    validation.data;

  // Prevent self-registering as ADMIN
  if (role === 'ADMIN') {
    throw new ApiError(403, 'Platform ADMIN accounts cannot be registered publicly.');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email address already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'CUSTOMER',
    phone,
  });

  // Create role-specific profiles
  if (user.role === 'CUSTOMER') {
    await CustomerProfile.create({ user: user._id });
    await Cart.create({ customer: user._id, items: [] });
    await Wishlist.create({ customer: user._id, products: [] });
  } else if (user.role === 'SELLER') {
    const slug = (storeName || `${name} Store`).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await SellerProfile.create({
      user: user._id,
      storeName: storeName || `${name}'s Store`,
      storeSlug: `${slug}-${user._id.toString().slice(-4)}`,
      storeDescription: storeDescription || 'Quality goods sold on ShopSphere.',
      businessEmail: businessEmail || email,
      businessPhone: businessPhone || phone || '1234567890',
      status: 'PENDING', // Requires admin approval
    });
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  res.cookie('shopsphere_refresh_token', refreshToken, getRefreshTokenCookieOptions());

  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;

  res.status(201).json(
    new ApiResponse(
      201,
      { user: userObject, accessToken },
      'User registered successfully.'
    )
  );
});

/**
 * @desc    Log in user & issue short-lived JWT + HttpOnly refresh cookie
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, 'Please provide valid email and password.');
  }

  const { email, password } = validation.data;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  if (user.status === 'SUSPENDED') {
    throw new ApiError(403, 'Your account has been suspended by administration.');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Manage refresh token list (max 5 active sessions)
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens.shift();
  }
  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  res.cookie('shopsphere_refresh_token', refreshToken, getRefreshTokenCookieOptions());

  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;

  res.status(200).json(
    new ApiResponse(
      200,
      { user: userObject, accessToken },
      'Logged in successfully.'
    )
  );
});

/**
 * @desc    Log out user & clear refresh cookies
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.shopsphere_refresh_token;

  if (refreshToken && req.user) {
    req.user.refreshTokens = req.user.refreshTokens.filter((t) => t.token !== refreshToken);
    await req.user.save();
  }

  res.clearCookie('shopsphere_refresh_token', getRefreshTokenCookieOptions());

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully.'));
});

/**
 * @desc    Rotate access token using HttpOnly Refresh Cookie
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshSession = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.shopsphere_refresh_token;

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token cookie missing.');
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'shopsphere_jwt_refresh_secret_super_secure_key_67890'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token.');
    }

    const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken);
    if (!tokenExists) {
      // Token reuse detected -> revoke all sessions
      user.refreshTokens = [];
      await user.save();
      throw new ApiError(401, 'Security alert: Refresh token reuse detected. All sessions revoked.');
    }

    // Issue new Access Token and rotate Refresh Token
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    res.cookie('shopsphere_refresh_token', newRefreshToken, getRefreshTokenCookieOptions());

    res.status(200).json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken },
        'Session token refreshed successfully.'
      )
    );
  } catch (error) {
    res.clearCookie('shopsphere_refresh_token', getRefreshTokenCookieOptions());
    throw new ApiError(401, 'Refresh token invalid or expired. Please sign in again.');
  }
});

/**
 * @desc    Get current authenticated user profile details
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user.toObject();
  delete user.password;
  delete user.refreshTokens;

  let extraProfile = null;
  if (user.role === 'SELLER') {
    extraProfile = await SellerProfile.findOne({ user: user._id });
  } else if (user.role === 'CUSTOMER') {
    extraProfile = await CustomerProfile.findOne({ user: user._id }).populate('defaultAddress');
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { user, profile: extraProfile },
      'User profile fetched successfully.'
    )
  );
});

/**
 * @desc    Request Password Reset Token
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const validation = forgotPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, 'Invalid email address.');
  }

  const { email } = validation.data;
  const user = await User.findOne({ email });

  if (!user) {
    // Return generic success to prevent email enumeration
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'If an account exists, a reset link has been dispatched.'));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 mins
  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { resetToken }, // Returned in dev mode for testing
      'Password reset token generated.'
    )
  );
});

/**
 * @desc    Reset Password using token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const validation = resetPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, 'Invalid token or password payload.');
  }

  const { token, newPassword } = validation.data;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset token.');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshTokens = []; // Revoke previous sessions
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password reset successful. Please sign in.'));
});

/**
 * @desc    Change password for logged-in user
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const validation = changePasswordSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, 'Invalid current or new password formatting.');
  }

  const { currentPassword, newPassword } = validation.data;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Incorrect current password.');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password updated successfully.'));
});
