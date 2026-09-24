import SellerProfile from '../models/SellerProfile.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import SellerOrder from '../models/SellerOrder.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get all sellers for Public catalog
 * @route   GET /api/v1/sellers
 * @access  Public
 */
export const getAllSellers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const { search } = req.query;
  const query = { status: 'APPROVED' };

  if (search) {
    query.storeName = { $regex: search, $options: 'i' };
  }

  const total = await SellerProfile.countDocuments(query);
  const sellers = await SellerProfile.find(query)
    .populate('user', 'name email phone avatar createdAt')
    .sort({ ratingAverage: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(
      200,
      sellers,
      'Public approved sellers retrieved successfully.',
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    )
  );
});

/**
 * @desc    Get all seller profiles for Admin (Pending, Approved, Rejected, Suspended)
 * @route   GET /api/v1/sellers/admin/all
 * @access  Private (Admin Only)
 */
export const getAdminSellersList = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const { search, status } = req.query;

  const query = {};
  if (status && status !== 'ALL') {
    query.status = status;
  }

  if (search) {
    query.storeName = { $regex: search, $options: 'i' };
  }

  const total = await SellerProfile.countDocuments(query);
  const sellers = await SellerProfile.find(query)
    .populate('user', 'name email phone avatar createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(
      200,
      sellers,
      'Admin sellers list retrieved successfully.',
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    )
  );
});

/**
 * @desc    Get single seller details & store info by slug
 * @route   GET /api/v1/sellers/store/:slug
 * @access  Public
 */
export const getSellerBySlug = asyncHandler(async (req, res) => {
  const seller = await SellerProfile.findOne({ storeSlug: req.params.slug }).populate(
    'user',
    'name email avatar createdAt'
  );

  if (!seller) {
    throw new ApiError(404, 'Seller store not found.');
  }

  // Get active products for this seller
  const products = await Product.find({
    seller: seller.user._id,
    status: 'ACTIVE',
  })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(12);

  res.status(200).json(
    new ApiResponse(
      200,
      { seller, products },
      'Seller store details retrieved.'
    )
  );
});

/**
 * @desc    Approve / Reject / Suspend Seller Application
 * @route   PATCH /api/v1/sellers/:id/status
 * @access  Private (Admin Only)
 */
export const updateSellerStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;

  if (!['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
    throw new ApiError(400, 'Invalid seller status specified.');
  }

  const seller = await SellerProfile.findById(req.params.id);
  if (!seller) {
    throw new ApiError(404, 'Seller profile not found.');
  }

  const previousStatus = seller.status;
  seller.status = status;
  await seller.save();

  // Audit Log
  await AuditLog.create({
    actor: req.user._id,
    action: 'SELLER_STATUS_UPDATE',
    targetModel: 'SellerProfile',
    targetId: seller._id,
    ipAddress: req.ip,
    metadata: { previousStatus, newStatus: status, reason },
  });

  // Notification to Seller User
  await Notification.create({
    user: seller.user,
    title: `Store Application Update: ${status}`,
    message: `Your seller store '${seller.storeName}' status has been updated to ${status}.${
      reason ? ` Reason: ${reason}` : ''
    }`,
    type: 'SELLER_APPROVAL',
  });

  res.status(200).json(
    new ApiResponse(200, seller, `Seller status updated to ${status}.`)
  );
});

/**
 * @desc    Update Seller Store Profile (Self)
 * @route   PUT /api/v1/sellers/my-store
 * @access  Private (Seller Only)
 */
export const updateSellerProfile = asyncHandler(async (req, res) => {
  const seller = await SellerProfile.findOne({ user: req.user._id });

  if (!seller) {
    throw new ApiError(404, 'Seller profile not found for this user.');
  }

  const { storeName, storeDescription, storeLogo, storeBanner, businessEmail, businessPhone, businessAddress, bankDetails, taxId } = req.body;

  if (storeName) seller.storeName = storeName;
  if (storeDescription) seller.storeDescription = storeDescription;
  if (storeLogo) seller.storeLogo = storeLogo;
  if (storeBanner) seller.storeBanner = storeBanner;
  if (businessEmail) seller.businessEmail = businessEmail;
  if (businessPhone) seller.businessPhone = businessPhone;
  if (businessAddress) seller.businessAddress = businessAddress;
  if (bankDetails) seller.bankDetails = bankDetails;
  if (taxId) seller.taxId = taxId;

  await seller.save();

  res.status(200).json(new ApiResponse(200, seller, 'Store details updated successfully.'));
});

/**
 * @desc    Get Seller Dashboard Sales & Analytics Stats (Strictly Isolated to Logged-in Seller)
 * @route   GET /api/v1/sellers/dashboard-stats
 * @access  Private (Seller Only)
 */
export const getSellerDashboardStats = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const totalProducts = await Product.countDocuments({ seller: sellerId });
  const totalOrders = await SellerOrder.countDocuments({ seller: sellerId });

  // Calculate gross sales & revenue
  const salesResult = await SellerOrder.aggregate([
    { $match: { seller: sellerId, status: { $ne: 'CANCELLED' } } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
  ]);

  const grossRevenue = salesResult[0]?.totalRevenue || 0;

  const recentOrders = await SellerOrder.find({ seller: sellerId })
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  const sellerProfile = await SellerProfile.findOne({ user: sellerId });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalProducts,
        totalOrders,
        grossRevenue,
        sellerStatus: sellerProfile?.status || 'PENDING',
        ratingAverage: sellerProfile?.ratingAverage || 0,
        recentOrders,
      },
      'Seller dashboard statistics fetched successfully.'
    )
  );
});
