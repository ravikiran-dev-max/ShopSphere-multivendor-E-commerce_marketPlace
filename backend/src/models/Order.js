import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    sellerOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerOrder',
      },
    ],
    itemsTotal: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    shippingTotal: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE', 'COD'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PROCESSING',
        'PARTIALLY_SHIPPED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PLACED',
      index: true,
    },
    couponCode: String,
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
