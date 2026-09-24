import User from '../models/User.js';
import SellerProfile from '../models/SellerProfile.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ReturnRequest from '../models/ReturnRequest.js';
import AuditLog from '../models/AuditLog.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAdminOverviewStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalSellers = await SellerProfile.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  const revenueResult = await Order.aggregate([
    { $match: { paymentStatus: 'PAID' } },
    { $group: { _id: null, total: { $sum: '$finalAmount' } } },
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;
  const pendingSellerApprovals = await SellerProfile.countDocuments({ status: 'PENDING' });
  const pendingReturns = await ReturnRequest.countDocuments({ status: 'REQUESTED' });

  const recentUsers = await User.find()
    .select('name email role status createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentOrders = await Order.find()
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingSellerApprovals,
        pendingReturns,
        recentUsers,
        recentOrders,
      },
      'Admin marketplace statistics fetched successfully.'
    )
  );
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const total = await AuditLog.countDocuments();
  const logs = await AuditLog.find()
    .populate('actor', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(200, logs, 'Audit logs retrieved.', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  );
});
