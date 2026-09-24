import Order from '../models/Order.js';
import SellerOrder from '../models/SellerOrder.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Order State Machine Allowed Transitions
const ALLOWED_TRANSITIONS = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'REFUND_REQUESTED'],
  RETURNED: ['REFUND_REQUESTED'],
  REFUND_REQUESTED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

/**
 * @desc    Multi-Vendor Order Checkout Engine (Intelligently splits parent order into seller sub-orders)
 * @route   POST /api/v1/orders/checkout
 * @access  Private (Customer)
 */
export const checkoutOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress || !paymentMethod) {
    throw new ApiError(400, 'Shipping address and payment method are required.');
  }

  const cart = await Cart.findOne({ customer: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Your shopping cart is empty.');
  }

  // Group cart items by vendor seller ID
  const itemsBySeller = {};
  let itemsTotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product || product.status !== 'ACTIVE') {
      throw new ApiError(400, `Product '${product?.title || 'item'}' is no longer active or available.`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for '${product.title}'. Only ${product.stock} units available.`
      );
    }

    const sellerId = product.seller.toString();
    if (!itemsBySeller[sellerId]) {
      itemsBySeller[sellerId] = [];
    }

    const unitPrice = product.discountPrice || product.price;
    const totalItemPrice = unitPrice * item.quantity;
    itemsTotal += totalItemPrice;

    itemsBySeller[sellerId].push({
      product: product._id,
      title: product.title,
      sku: product.sku,
      image: product.images[0]?.url || '',
      price: unitPrice,
      quantity: item.quantity,
      totalItemPrice,
    });
  }

  const discountAmount = cart.discountAmount || 0;
  const shippingTotal = 50; // Standard flat shipping fee
  const finalAmount = Math.max(0, itemsTotal - discountAmount + shippingTotal);

  // Generate Unique Order Numbers
  const timestamp = Date.now().toString().slice(-6);
  const parentOrderNumber = `ORD-${timestamp}`;

  // Create Parent Order Shell
  const parentOrder = new Order({
    orderNumber: parentOrderNumber,
    customer: req.user._id,
    shippingAddress,
    itemsTotal,
    discountAmount,
    shippingTotal,
    finalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
    orderStatus: 'PLACED',
    couponCode: cart.couponCode,
  });

  const createdSellerOrders = [];
  const sellerKeys = Object.keys(itemsBySeller);

  // Split into Seller Specific Sub-Orders
  for (let i = 0; i < sellerKeys.length; i++) {
    const sellerId = sellerKeys[i];
    const sellerItems = itemsBySeller[sellerId];
    const sellerSubtotal = sellerItems.reduce((acc, it) => acc + it.totalItemPrice, 0);

    const sellerOrderNumber = `${parentOrderNumber}-${String.fromCharCode(65 + i)}`; // e.g. ORD-123456-A

    const sellerOrder = await SellerOrder.create({
      sellerOrderNumber,
      parentOrder: parentOrder._id,
      seller: sellerId,
      customer: req.user._id,
      items: sellerItems,
      subtotal: sellerSubtotal,
      shippingFee: Math.round(shippingTotal / sellerKeys.length),
      totalAmount: sellerSubtotal + Math.round(shippingTotal / sellerKeys.length),
      status: 'PLACED',
      statusHistory: [{ status: 'PLACED', note: 'Order placed by customer during checkout' }],
    });

    createdSellerOrders.push(sellerOrder._id);

    // Deduct stock and update inventory for each item
    for (const item of sellerItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });

      await Inventory.findOneAndUpdate(
        { product: item.product },
        {
          $inc: { stockQuantity: -item.quantity },
          $push: {
            history: {
              action: 'FULFILLED',
              quantityChanged: -item.quantity,
              previousQuantity: item.quantity,
              newQuantity: 0,
              reason: `Order ${sellerOrderNumber} checkout`,
            },
          },
        }
      );
    }

    // Send Notification to Seller
    await Notification.create({
      user: sellerId,
      title: 'New Sub-Order Received!',
      message: `You have received a new sub-order ${sellerOrderNumber} totaling ₹${sellerSubtotal}.`,
      type: 'ORDER_STATUS',
    });
  }

  parentOrder.sellerOrders = createdSellerOrders;
  await parentOrder.save();

  // Create Payment Record
  const payment = await Payment.create({
    order: parentOrder._id,
    customer: req.user._id,
    provider: paymentMethod === 'COD' ? 'COD' : 'MOCK_GATEWAY',
    transactionId: `TXN-${Date.now()}`,
    amount: finalAmount,
    currency: 'INR',
    status: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
  });

  // Empty Customer Cart
  cart.items = [];
  cart.couponCode = null;
  cart.discountAmount = 0;
  await cart.save();

  res.status(201).json(
    new ApiResponse(
      201,
      {
        order: parentOrder,
        sellerOrders: createdSellerOrders,
        payment,
      },
      'Order placed successfully with multi-vendor sub-order splitting.'
    )
  );
});

/**
 * @desc    Get orders list depending on role (Customer: own orders, Seller: own sub-orders, Admin: all orders)
 * @route   GET /api/v1/orders
 * @access  Private
 */
export const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  if (req.user.role === 'SELLER') {
    // Seller sees their specific SellerOrder sub-orders
    const query = { seller: req.user._id };
    const total = await SellerOrder.countDocuments(query);
    const sellerOrders = await SellerOrder.find(query)
      .populate('customer', 'name email phone')
      .populate('parentOrder', 'orderNumber shippingAddress paymentStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json(
      new ApiResponse(200, sellerOrders, 'Seller sub-orders fetched.', {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  }

  // Customer or Admin sees parent Orders
  const query = {};
  if (req.user.role === 'CUSTOMER') {
    query.customer = req.user._id;
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate({
      path: 'sellerOrders',
      populate: { path: 'seller', select: 'name email' },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(200, orders, 'Orders fetched successfully.', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  );
});

/**
 * @desc    Update Seller Order Status with State Machine Transition Validation
 * @route   PATCH /api/v1/orders/seller-orders/:id/status
 * @access  Private (Seller Owner or Admin)
 */
export const updateSellerOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, courierPartner, note } = req.body;

  const sellerOrder = await SellerOrder.findById(req.params.id);
  if (!sellerOrder) {
    throw new ApiError(404, 'Seller sub-order not found.');
  }

  // Ownership check
  if (req.user.role !== 'ADMIN' && sellerOrder.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Forbidden: You cannot modify another seller\'s sub-order.');
  }

  const currentStatus = sellerOrder.status;
  const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (req.user.role !== 'ADMIN' && !allowedNextStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Invalid order state transition from '${currentStatus}' to '${status}'. Allowed transitions: ${
        allowedNextStatuses.join(', ') || 'None'
      }`
    );
  }

  sellerOrder.status = status;
  if (trackingNumber) sellerOrder.trackingNumber = trackingNumber;
  if (courierPartner) sellerOrder.courierPartner = courierPartner;

  sellerOrder.statusHistory.push({
    status,
    updatedBy: req.user._id,
    note: note || `Status updated to ${status}`,
  });

  await sellerOrder.save();

  // Send Notification to Customer
  await Notification.create({
    user: sellerOrder.customer,
    title: `Order Update: ${status}`,
    message: `Your sub-order ${sellerOrder.sellerOrderNumber} status is now ${status}.`,
    type: 'ORDER_STATUS',
  });

  res.status(200).json(
    new ApiResponse(200, sellerOrder, `Order status updated to ${status}.`)
  );
});
