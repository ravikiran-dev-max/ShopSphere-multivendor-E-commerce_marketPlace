import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get customer multi-vendor cart with subtotal & discount calculation
 * @route   GET /api/v1/cart
 * @access  Private (Customer)
 */
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ customer: req.user._id })
    .populate('items.product', 'title slug price discountPrice images stock seller status')
    .populate('items.seller', 'name email');

  if (!cart) {
    cart = await Cart.create({ customer: req.user._id, items: [] });
  }

  // Calculate Subtotal
  let itemsSubtotal = 0;
  cart.items = cart.items.filter((item) => item.product && item.product.status === 'ACTIVE');

  cart.items.forEach((item) => {
    const unitPrice = item.product.discountPrice || item.product.price;
    item.price = unitPrice;
    itemsSubtotal += unitPrice * item.quantity;
  });

  // Calculate Coupon Discount
  let discountAmount = 0;
  if (cart.couponCode) {
    const coupon = await Coupon.findOne({ code: cart.couponCode, isActive: true });
    if (coupon && coupon.validUntil > new Date() && itemsSubtotal >= coupon.minOrderValue) {
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (itemsSubtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }
    } else {
      // Coupon no longer valid -> remove
      cart.couponCode = null;
    }
  }

  cart.discountAmount = discountAmount;
  await cart.save();

  const grandTotal = Math.max(0, itemsSubtotal - discountAmount);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        cartId: cart._id,
        items: cart.items,
        itemsSubtotal,
        discountAmount,
        grandTotal,
        couponCode: cart.couponCode,
      },
      'Cart details retrieved.'
    )
  );
});

/**
 * @desc    Add product to customer cart
 * @route   POST /api/v1/cart/items
 * @access  Private (Customer)
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity, 10) || 1;

  const product = await Product.findById(productId);
  if (!product || product.status !== 'ACTIVE') {
    throw new ApiError(404, 'Product not found or unavailable.');
  }

  if (product.stock < qty) {
    throw new ApiError(400, `Insufficient stock available. Only ${product.stock} units left.`);
  }

  let cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) {
    cart = await Cart.create({ customer: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  const unitPrice = product.discountPrice || product.price;

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + qty;
    if (newQty > product.stock) {
      throw new ApiError(400, `Cannot add more units. Total in cart exceeds available stock (${product.stock}).`);
    }
    cart.items[existingItemIndex].quantity = newQty;
    cart.items[existingItemIndex].price = unitPrice;
  } else {
    cart.items.push({
      product: product._id,
      seller: product.seller, // Attach vendor ID for multi-vendor checkout splitting
      quantity: qty,
      price: unitPrice,
    });
  }

  await cart.save();

  res.status(200).json(new ApiResponse(200, cart, 'Item added to cart successfully.'));
});

/**
 * @desc    Update quantity of item in cart
 * @route   PUT /api/v1/cart/items/:itemId
 * @access  Private (Customer)
 */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const qty = parseInt(quantity, 10);

  if (qty < 1) {
    throw new ApiError(400, 'Quantity must be at least 1.');
  }

  const cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found.');
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    throw new ApiError(404, 'Cart item not found.');
  }

  const product = await Product.findById(item.product);
  if (qty > product.stock) {
    throw new ApiError(400, `Cannot update quantity. Only ${product.stock} units available.`);
  }

  item.quantity = qty;
  await cart.save();

  res.status(200).json(new ApiResponse(200, cart, 'Cart item updated.'));
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/items/:itemId
 * @access  Private (Customer)
 */
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found.');
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
  await cart.save();

  res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart.'));
});

/**
 * @desc    Apply coupon discount code to cart
 * @route   POST /api/v1/cart/coupon
 * @access  Private (Customer)
 */
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) {
    throw new ApiError(400, 'Coupon code is required.');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon || coupon.validUntil < new Date()) {
    throw new ApiError(400, 'Invalid or expired coupon code.');
  }

  const cart = await Cart.findOne({ customer: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Your cart is empty.');
  }

  let itemsSubtotal = 0;
  cart.items.forEach((item) => {
    itemsSubtotal += (item.product.discountPrice || item.product.price) * item.quantity;
  });

  if (itemsSubtotal < coupon.minOrderValue) {
    throw new ApiError(
      400,
      `Minimum order value for coupon '${coupon.code}' is ₹${coupon.minOrderValue}.`
    );
  }

  cart.couponCode = coupon.code;
  await cart.save();

  res.status(200).json(new ApiResponse(200, cart, `Coupon '${coupon.code}' applied successfully.`));
});
