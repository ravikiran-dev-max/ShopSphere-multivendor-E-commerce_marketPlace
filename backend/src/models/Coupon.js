import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null, // Only applicable for PERCENTAGE discounts
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null, // Null means unlimited
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Null for global platform coupons, seller user ID for vendor coupons
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
