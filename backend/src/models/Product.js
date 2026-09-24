import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    images: [
      {
        url: { type: String, required: true },
        alt: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User with role SELLER
      required: true,
      index: true,
    },
    sellerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
    },
    price: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
      index: true,
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      default: null,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'MODERATION_BLOCKED'],
      default: 'ACTIVE',
      index: true,
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    tags: [{ type: String, trim: true, lowercase: true }],
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Create compound text index for full-text search capability
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
