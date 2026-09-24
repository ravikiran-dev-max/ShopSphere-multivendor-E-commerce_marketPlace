import Brand from '../models/Brand.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createBrand = asyncHandler(async (req, res) => {
  const { name, logo, description } = req.body;

  if (!name) {
    throw new ApiError(400, 'Brand name is required.');
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existingBrand = await Brand.findOne({ $or: [{ name }, { slug }] });
  if (existingBrand) {
    throw new ApiError(409, 'Brand with this name already exists.');
  }

  const brand = await Brand.create({
    name,
    slug,
    logo,
    description,
  });

  res.status(201).json(new ApiResponse(201, brand, 'Brand created successfully.'));
});

export const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, brands, 'Brands retrieved.'));
});

export const getBrandBySlug = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug, isActive: true });
  if (!brand) {
    throw new ApiError(404, 'Brand not found.');
  }
  res.status(200).json(new ApiResponse(200, brand, 'Brand details retrieved.'));
});

export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    throw new ApiError(404, 'Brand not found.');
  }

  const { name, logo, description, isActive } = req.body;

  if (name) {
    brand.name = name;
    brand.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (logo) brand.logo = logo;
  if (description !== undefined) brand.description = description;
  if (isActive !== undefined) brand.isActive = isActive;

  await brand.save();

  res.status(200).json(new ApiResponse(200, brand, 'Brand updated.'));
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) {
    throw new ApiError(404, 'Brand not found.');
  }
  res.status(200).json(new ApiResponse(200, null, 'Brand deleted.'));
});
