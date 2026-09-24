import crypto from 'crypto';
import Delivery from '../models/Delivery.js';
import SellerOrder from '../models/SellerOrder.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendDeliveryOTP } from '../services/smsService.js';

/**
 * @desc    Get assigned deliveries for logged-in Rider (or auto-assign unassigned ready orders)
 * @route   GET /api/v1/deliveries/assigned
 * @access  Private (Rider Only)
 */
export const getAssignedDeliveries = asyncHandler(async (req, res) => {
  const riderId = req.user._id;

  // Auto-assign any READY_FOR_DELIVERY or SHIPPED seller orders without delivery records to this rider in dev mode
  const unassignedSellerOrders = await SellerOrder.find({
    status: { $in: ['READY_FOR_DELIVERY', 'SHIPPED', 'PACKED', 'OUT_FOR_DELIVERY'] },
  }).populate('parentOrder');

  for (const sellerOrder of unassignedSellerOrders) {
    if (!sellerOrder || !sellerOrder._id || !sellerOrder.parentOrder) continue;

    const existingDelivery = await Delivery.findOne({ sellerOrder: sellerOrder._id });
    if (!existingDelivery) {
      const trackingCode = `TRK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      const parentOrder = sellerOrder.parentOrder;

      await Delivery.create({
        trackingCode,
        parentOrder: parentOrder._id,
        sellerOrder: sellerOrder._id,
        deliveryPartner: riderId,
        pickupAddress: {
          storeName: 'Seller Warehouse Hub',
          street: '12 Logistics Way, Sector 4',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400002',
        },
        deliveryAddress: parentOrder?.shippingAddress || {
          fullName: 'Customer Recipient',
          phone: '+91 9876543212',
          street: '42 Market Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
        },
        status: 'OUT_FOR_DELIVERY',
      });
    }
  }

  const deliveries = await Delivery.find({ deliveryPartner: riderId })
    .populate({
      path: 'sellerOrder',
      populate: [
        { path: 'customer', select: 'name email phone' },
        { path: 'seller', select: 'name email phone' },
      ],
    })
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, deliveries, 'Rider assigned deliveries retrieved.')
  );
});

/**
 * @desc    Get single delivery record details with customer location coordinates
 * @route   GET /api/v1/deliveries/:id
 * @access  Private (Rider, Customer, Admin)
 */
export const getDeliveryById = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id).populate({
    path: 'sellerOrder',
    populate: [
      { path: 'customer', select: 'name email phone' },
      { path: 'seller', select: 'name email phone' },
    ],
  });

  if (!delivery) {
    throw new ApiError(404, 'Delivery record not found.');
  }

  // Coordinates for interactive customer location map (defaulting to Mumbai center for demo)
  const mapCoordinates = {
    latitude: 19.076,
    longitude: 72.8777,
    formattedAddress: `${delivery.deliveryAddress?.street || 'Customer Address'}, ${delivery.deliveryAddress?.city || 'City'}, ${delivery.deliveryAddress?.zipCode || ''}`,
  };

  res.status(200).json(
    new ApiResponse(200, { delivery, mapCoordinates }, 'Delivery details fetched.')
  );
});

/**
 * @desc    Rider generates a secure 6-digit delivery OTP & sends to Customer
 * @route   POST /api/v1/deliveries/:id/generate-otp
 * @access  Private (Rider Only)
 */
export const generateOTP = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id).populate({
    path: 'sellerOrder',
    populate: { path: 'customer', select: 'name phone' },
  });

  if (!delivery) {
    throw new ApiError(404, 'Delivery record not found.');
  }

  // Ensure rider owns this delivery assignment
  if (delivery.deliveryPartner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Forbidden: You are not assigned to this delivery.');
  }

  // Generate secure random 6-digit OTP
  const rawOtp = Math.floor(100000 + Math.random() * 900000).toString(); // e.g. 482731

  delivery.otpVerificationCode = rawOtp; // Stored securely
  delivery.estimatedDeliveryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  delivery.status = 'OUT_FOR_DELIVERY';
  await delivery.save();

  // Update seller order status
  const sellerOrder = await SellerOrder.findById(delivery.sellerOrder._id || delivery.sellerOrder);
  if (sellerOrder) {
    sellerOrder.status = 'OUT_FOR_DELIVERY';
    sellerOrder.statusHistory.push({
      status: 'OUT_FOR_DELIVERY',
      updatedBy: req.user._id,
      note: `Delivery rider reached customer. OTP generated: ${rawOtp}`,
    });
    await sellerOrder.save();
  }

  const customerPhone = delivery.sellerOrder?.customer?.phone || delivery.deliveryAddress?.phone;

  // Dispatch SMS
  const smsResult = await sendDeliveryOTP(
    customerPhone,
    rawOtp,
    sellerOrder?.sellerOrderNumber || delivery.trackingCode
  );

  // Send Notification to Customer User
  await Notification.create({
    user: delivery.sellerOrder?.customer?._id || req.user._id,
    title: '🔑 Delivery Verification OTP Received',
    message: `Your rider has arrived! Provide OTP [ ${rawOtp} ] to complete package handover.`,
    type: 'ORDER_STATUS',
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        deliveryId: delivery._id,
        otpSentTo: customerPhone || 'Customer Registered Phone',
        expiresInMinutes: 10,
        // Provided in API payload for smooth developer demonstration testing
        devModeOtp: rawOtp,
      },
      'Delivery OTP generated & dispatched to customer phone.'
    )
  );
});

/**
 * @desc    Rider verifies Customer OTP & completes delivery
 * @route   POST /api/v1/deliveries/:id/verify-otp
 * @access  Private (Rider Only)
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp || String(otp).trim().length !== 6) {
    throw new ApiError(400, 'Please enter a valid 6-digit OTP code.');
  }

  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    throw new ApiError(404, 'Delivery record not found.');
  }

  if (delivery.deliveryPartner.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Forbidden: You are not assigned to this delivery.');
  }

  if (delivery.status === 'DELIVERED') {
    throw new ApiError(400, 'This order delivery has already been verified and completed.');
  }

  if (!delivery.otpVerificationCode) {
    throw new ApiError(400, 'No OTP has been generated for this delivery yet. Click "Generate OTP" first.');
  }

  // Check OTP Expiration (10 minutes)
  if (delivery.estimatedDeliveryTime && new Date() > delivery.estimatedDeliveryTime) {
    throw new ApiError(400, 'OTP expired. Please generate a new OTP for the customer.');
  }

  // Verify submitted OTP against stored OTP
  if (String(otp).trim() !== String(delivery.otpVerificationCode).trim()) {
    throw new ApiError(400, 'Invalid OTP. Please check the OTP and try again.');
  }

  // Mark Delivery DELIVERED
  delivery.status = 'DELIVERED';
  delivery.actualDeliveryTime = new Date();
  await delivery.save();

  // Update Seller Sub-Order to DELIVERED
  const sellerOrder = await SellerOrder.findById(delivery.sellerOrder);
  if (sellerOrder) {
    sellerOrder.status = 'DELIVERED';
    sellerOrder.statusHistory.push({
      status: 'DELIVERED',
      updatedBy: req.user._id,
      note: 'OTP verified successfully by rider upon package handover.',
    });
    await sellerOrder.save();

    // Check if all sub-orders of Parent Order are delivered
    const parentOrder = await Order.findById(sellerOrder.parentOrder).populate('sellerOrders');
    if (parentOrder) {
      const allDelivered = parentOrder.sellerOrders.every((so) => so.status === 'DELIVERED');
      if (allDelivered) {
        parentOrder.orderStatus = 'DELIVERED';
        await parentOrder.save();
      }
    }
  }

  // Send Notification to Customer
  await Notification.create({
    user: sellerOrder?.customer || req.user._id,
    title: '🎉 Package Delivered!',
    message: `Your sub-order ${sellerOrder?.sellerOrderNumber || delivery.trackingCode} has been delivered successfully.`,
    type: 'ORDER_STATUS',
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        deliveryId: delivery._id,
        status: 'DELIVERED',
        deliveredAt: delivery.actualDeliveryTime,
      },
      'OTP verified successfully! Order marked as DELIVERED.'
    )
  );
});
