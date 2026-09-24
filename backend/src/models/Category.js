import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
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
      trim: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80',
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
