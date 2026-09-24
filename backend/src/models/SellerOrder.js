import mongoose from 'mongoose';

const sellerOrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    default: null,
  },
  title: { type: String, required: true },
  sku: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalItemPrice: { type: Number, required: true },
});

const sellerOrderSchema = new mongoose.Schema(
  {
    sellerOrderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    parentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [sellerOrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PACKED',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RETURN_REQUESTED',
        'RETURNED',
        'REFUND_REQUESTED',
        'REFUNDED',
      ],
      default: 'PLACED',
      index: true,
    },
    trackingNumber: String,
    courierPartner: String,
    statusHistory: [
      {
        status: { type: String, required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const SellerOrder = mongoose.model('SellerOrder', sellerOrderSchema);

export default SellerOrder;
