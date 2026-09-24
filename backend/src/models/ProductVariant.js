import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    variantName: {
      type: String, // e.g., "XL / Red", "256GB / Midnight Black"
      required: true,
    },
    attributes: [
      {
        name: { type: String, required: true }, // e.g., "Color", "Size", "Storage"
        value: { type: String, required: true }, // e.g., "Red", "XL", "256GB"
      },
    ],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    image: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);

export default ProductVariant;
