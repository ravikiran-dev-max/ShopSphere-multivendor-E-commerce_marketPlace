import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get paginated list of all users with search, role & status filters
 * @route   GET /api/v1/users
 * @access  Private (Admin Only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const { search, role, status } = req.query;

  const query = {};

  if (role) query.role = role;
  if (status) query.status = status;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(
      200,
      users,
      'Users retrieved successfully.',
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    )
  );
});

/**
 * @desc    Get user details by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (Admin or Self)
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshTokens');

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // Non-admin users can only view their own details
  if (req.user.role !== 'ADMIN' && req.user._id.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Forbidden: You do not have permission to view this user.');
  }

  res.status(200).json(new ApiResponse(200, user, 'User details retrieved successfully.'));
});

/**
 * @desc    Update user status (ACTIVE, INACTIVE, SUSPENDED)
 * @route   PATCH /api/v1/users/:id/status
 * @access  Private (Admin Only)
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;

  if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
    throw new ApiError(400, 'Invalid status specified.');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const previousStatus = user.status;
  user.status = status;
  await user.save();

  // Create Audit Log
  await AuditLog.create({
    actor: req.user._id,
    action: 'USER_STATUS_CHANGE',
    targetModel: 'User',
    targetId: user._id,
    ipAddress: req.ip,
    metadata: { previousStatus, newStatus: status, reason },
  });

  res.status(200).json(new ApiResponse(200, user, `User status updated to ${status}.`));
});

/**
 * @desc    Update permitted user role (ADMIN, SELLER, CUSTOMER, SUPPORT, DELIVERY)
 * @route   PATCH /api/v1/users/:id/role
 * @access  Private (Admin Only)
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['ADMIN', 'SELLER', 'CUSTOMER', 'SUPPORT', 'DELIVERY'].includes(role)) {
    throw new ApiError(400, 'Invalid role specified.');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const previousRole = user.role;
  user.role = role;
  await user.save();

  await AuditLog.create({
    actor: req.user._id,
    action: 'USER_ROLE_CHANGE',
    targetModel: 'User',
    targetId: user._id,
    ipAddress: req.ip,
    metadata: { previousRole, newRole: role },
  });

  res.status(200).json(new ApiResponse(200, user, `User role updated to ${role}.`));
});

/**
 * @desc    Update profile details for current user
 * @route   PUT /api/v1/users/profile
 * @access  Private (Self)
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.password;
  delete updatedUser.refreshTokens;

  res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully.'));
});
