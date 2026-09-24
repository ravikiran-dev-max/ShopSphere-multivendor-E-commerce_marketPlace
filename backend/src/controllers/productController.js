import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import SellerProfile from '../models/SellerProfile.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Create a new product (Seller or Admin)
 * @route   POST /api/v1/products
 * @access  Private (Seller or Admin)
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    images,
    category,
    brand,
    price,
    discountPrice,
    stock,
    sku,
    specifications,
    tags,
    isFeatured,
  } = req.body;

  if (!title || !description || !category || price === undefined || stock === undefined || !sku) {
    throw new ApiError(400, 'Title, description, category, price, stock, and SKU are required.');
  }

  // Determine Seller ownership
  let sellerId = req.user._id;
  if (req.user.role === 'ADMIN' && req.body.seller) {
    sellerId = req.body.seller;
  }

  // Check seller profile approval status
  const sellerProfile = await SellerProfile.findOne({ user: sellerId });
  if (req.user.role === 'SELLER') {
    if (!sellerProfile || sellerProfile.status !== 'APPROVED') {
      throw new ApiError(
        403,
        'Your merchant seller profile is not APPROVED yet. Product creation is restricted.'
      );
    }
  }

  // Check unique SKU
  const existingSku = await Product.findOne({ sku: sku.trim() });
  if (existingSku) {
    throw new ApiError(409, `SKU '${sku}' already exists. Please use a unique SKU.`);
  }

  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

  const product = await Product.create({
    title,
    slug,
    description,
    images: images || [
      {
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        alt: title,
      },
    ],
    category,
    brand: brand || null,
    seller: sellerId,
    sellerProfile: sellerProfile?._id || null,
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : null,
    stock: Number(stock),
    sku: sku.trim(),
    specifications: specifications || [],
    tags: tags || [],
    isFeatured: isFeatured || false,
    status: 'ACTIVE',
  });

  // Automatically initialize Inventory record
  await Inventory.create({
    product: product._id,
    seller: sellerId,
    stockQuantity: Number(stock),
    reservedQuantity: 0,
    lowStockThreshold: 5,
    history: [
      {
        action: 'RESTOCK',
        quantityChanged: Number(stock),
        previousQuantity: 0,
        newQuantity: Number(stock),
        reason: 'Initial product creation stock setup',
      },
    ],
  });

  res.status(201).json(new ApiResponse(201, product, 'Product created successfully.'));
});

/**
 * @desc    Get all marketplace products (Search, Filter, Sort, Pagination)
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const { search, category, brand, seller, minPrice, maxPrice, minRating, sort, status } = req.query;

  const query = {};

  // Default to ACTIVE products for public, allow status override for admin
  if (req.user && req.user.role === 'ADMIN' && status) {
    query.status = status;
  } else {
    query.status = 'ACTIVE';
  }

  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (seller) query.seller = seller;

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  if (minRating) {
    query.ratingAverage = { $gte: Number(minRating) };
  }

  if (search) {
    query.$text = { $search: search };
  }

  // Sorting
  let sortOptions = { createdAt: -1 };
  if (sort === 'price_asc') sortOptions = { price: 1 };
  if (sort === 'price_desc') sortOptions = { price: -1 };
  if (sort === 'rating') sortOptions = { ratingAverage: -1 };
  if (sort === 'popular') sortOptions = { ratingCount: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .populate('seller', 'name email avatar')
    .populate('sellerProfile', 'storeName storeSlug ratingAverage')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(
      200,
      products,
      'Products retrieved successfully.',
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    )
  );
});

/**
 * @desc    Get single product details by slug
 * @route   GET /api/v1/products/item/:slug
 * @access  Public
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .populate('seller', 'name email avatar phone')
    .populate('sellerProfile', 'storeName storeSlug storeLogo ratingAverage ratingCount totalSales');

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  res.status(200).json(new ApiResponse(200, product, 'Product details retrieved successfully.'));
});

/**
 * @desc    Get products belonging strictly to logged-in seller
 * @route   GET /api/v1/products/my-products
 * @access  Private (Seller Only)
 */
export const getSellerProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const query = { seller: req.user._id };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('brand', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(
      200,
      products,
      'Seller products retrieved.',
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    )
  );
});

/**
 * @desc    Update product details (Seller owner or Admin)
 * @route   PUT /api/v1/products/:id
 * @access  Private (Seller Owner or Admin)
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  // Strict ownership check
  if (req.user.role !== 'ADMIN' && product.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Forbidden: You cannot modify another seller\'s product.');
  }

  const {
    title,
    description,
    images,
    category,
    brand,
    price,
    discountPrice,
    stock,
    specifications,
    tags,
    status,
    isFeatured,
  } = req.body;

  if (title) {
    product.title = title;
    product.slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${product._id.toString().slice(-4)}`;
  }
  if (description) product.description = description;
  if (images) product.images = images;
  if (category) product.category = category;
  if (brand !== undefined) product.brand = brand;
  if (price !== undefined) product.price = Number(price);
  if (discountPrice !== undefined) product.discountPrice = discountPrice ? Number(discountPrice) : null;
  if (specifications) product.specifications = specifications;
  if (tags) product.tags = tags;
  if (status) product.status = status;
  if (isFeatured !== undefined) product.isFeatured = isFeatured;

  // Handle stock update & inventory sync
  if (stock !== undefined && Number(stock) !== product.stock) {
    const previousStock = product.stock;
    const newStock = Number(stock);
    const diff = newStock - previousStock;
    product.stock = newStock;

    let inventory = await Inventory.findOne({ product: product._id });
    if (inventory) {
      inventory.stockQuantity = newStock;
      inventory.history.push({
        action: 'MANUAL_ADJUSTMENT',
        quantityChanged: diff,
        previousQuantity: previousStock,
        newQuantity: newStock,
        reason: 'Seller manual stock update',
      });
      await inventory.save();
    }
  }

  await product.save();

  res.status(200).json(new ApiResponse(200, product, 'Product updated successfully.'));
});

/**
 * @desc    Delete product (Seller owner or Admin)
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Seller Owner or Admin)
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  if (req.user.role !== 'ADMIN' && product.seller.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Forbidden: You cannot delete another seller\'s product.');
  }

  await product.deleteOne();
  await Inventory.deleteOne({ product: req.params.id });

  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully.'));
});
