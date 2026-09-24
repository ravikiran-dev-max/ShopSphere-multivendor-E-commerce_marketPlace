import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parentCategory } = req.body;

  if (!name) {
    throw new ApiError(400, 'Category name is required.');
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existingCategory = await Category.findOne({ $or: [{ name }, { slug }] });
  if (existingCategory) {
    throw new ApiError(409, 'Category with this name already exists.');
  }

  const category = await Category.create({
    name,
    slug,
    description,
    image,
    parentCategory: parentCategory || null,
  });

  res.status(201).json(new ApiResponse(201, category, 'Category created successfully.'));
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parentCategory', 'name slug')
    .sort({ name: 1 });

  res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved.'));
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }
  res.status(200).json(new ApiResponse(200, category, 'Category details retrieved.'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  const { name, description, image, parentCategory, isActive } = req.body;

  if (name) {
    category.name = name;
    category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (description !== undefined) category.description = description;
  if (image) category.image = image;
  if (parentCategory !== undefined) category.parentCategory = parentCategory;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  res.status(200).json(new ApiResponse(200, category, 'Category updated.'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }
  res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully.'));
});
