import mongoose from 'mongoose';

const sellerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    storeSlug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
    storeDescription: {
      type: String,
      trim: true,
    },
    storeLogo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=300&q=80',
    },
    storeBanner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    },
    businessEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    businessPhone: {
      type: String,
      required: true,
    },
    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
    },
    taxId: {
      type: String,
      trim: true,
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
      routingNumber: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
      index: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 10, // 10% platform commission default
    },
  },
  { timestamps: true }
);

const SellerProfile = mongoose.model('SellerProfile', sellerProfileSchema);

export default SellerProfile;
