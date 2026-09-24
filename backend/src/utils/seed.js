import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db.js';
import User from '../models/User.js';
import SellerProfile from '../models/SellerProfile.js';
import CustomerProfile from '../models/CustomerProfile.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Coupon from '../models/Coupon.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';

async function seedDatabase() {
  console.log('[ShopSphere Seed] Connecting to database...');
  await connectDB();

  console.log('[ShopSphere Seed] Wiping existing data...');
  await User.deleteMany({});
  await SellerProfile.deleteMany({});
  await CustomerProfile.deleteMany({});
  await Category.deleteMany({});
  await Brand.deleteMany({});
  await Product.deleteMany({});
  await Inventory.deleteMany({});
  await Coupon.deleteMany({});
  await Cart.deleteMany({});
  await Wishlist.deleteMany({});

  console.log('[ShopSphere Seed] Creating Users...');
  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@shopsphere.dev',
    password: 'Admin@123456',
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  const seller1User = await User.create({
    name: 'Alex Vance (Apex Tech)',
    email: 'seller1@shopsphere.dev',
    password: 'Seller@123456',
    role: 'SELLER',
    status: 'ACTIVE',
    phone: '+91 9876543210',
  });

  const seller2User = await User.create({
    name: 'Sarah Connor (Nova Apparel)',
    email: 'seller2@shopsphere.dev',
    password: 'Seller@123456',
    role: 'SELLER',
    status: 'ACTIVE',
    phone: '+91 9876543211',
  });

  const customerUser = await User.create({
    name: 'David Miller',
    email: 'customer@shopsphere.dev',
    password: 'Customer@123456',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    phone: '+91 9876543212',
  });

  const supportUser = await User.create({
    name: 'Jane Smith (Support Agent)',
    email: 'support@shopsphere.dev',
    password: 'Support@123456',
    role: 'SUPPORT',
    status: 'ACTIVE',
  });

  const deliveryUser = await User.create({
    name: 'Robert Express (Rider)',
    email: 'delivery@shopsphere.dev',
    password: 'Delivery@123456',
    role: 'DELIVERY',
    status: 'ACTIVE',
  });

  console.log('[ShopSphere Seed] Creating Profiles...');
  const seller1Profile = await SellerProfile.create({
    user: seller1User._id,
    storeName: 'Apex Tech Store',
    storeSlug: 'apex-tech-store',
    storeDescription: 'Premier flagship electronics, premium headphones & gaming gear vendor.',
    businessEmail: 'contact@apextech.com',
    businessPhone: '+91 9876543210',
    status: 'APPROVED',
    ratingAverage: 4.8,
    ratingCount: 42,
  });

  const seller2Profile = await SellerProfile.create({
    user: seller2User._id,
    storeName: 'Nova Apparel',
    storeSlug: 'nova-apparel',
    storeDescription: 'Contemporary streetwear, sustainable denim & urban fashion trends.',
    businessEmail: 'support@novaapparel.com',
    businessPhone: '+91 9876543211',
    status: 'APPROVED',
    ratingAverage: 4.6,
    ratingCount: 29,
  });

  await CustomerProfile.create({ user: customerUser._id });
  await Cart.create({ customer: customerUser._id, items: [] });
  await Wishlist.create({ customer: customerUser._id, products: [] });

  console.log('[ShopSphere Seed] Creating Categories & Brands...');
  const electronicsCat = await Category.create({
    name: 'Electronics & Gadgets',
    slug: 'electronics-gadgets',
    description: 'Smartphones, audio, laptops & gaming gear',
    image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
  });

  const fashionCat = await Category.create({
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    description: 'Designer apparel, footwear & accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
  });

  const homeCat = await Category.create({
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Modern decor, kitchenware & furniture',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  });

  const techBrand = await Brand.create({
    name: 'TechTron',
    slug: 'techtron',
    description: 'High-end audio and smart accessories',
  });

  const urbanBrand = await Brand.create({
    name: 'UrbanVibe',
    slug: 'urbanvibe',
    description: 'Minimalist streetwear & accessories',
  });

  console.log('[ShopSphere Seed] Creating Sample Products...');
  const prod1 = await Product.create({
    title: 'TechTron Pro Wireless ANC Headphones',
    slug: 'techtron-pro-wireless-anc-headphones',
    description: 'Active Noise Cancelling over-ear wireless headphones with 40-hour battery life and spatial audio driver technology.',
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', alt: 'Headphones' }
    ],
    category: electronicsCat._id,
    brand: techBrand._id,
    seller: seller1User._id,
    sellerProfile: seller1Profile._id,
    price: 4999,
    discountPrice: 3999,
    stock: 50,
    sku: 'APEX-AUD-001',
    specifications: [
      { key: 'Battery', value: '40 Hours' },
      { key: 'Bluetooth', value: 'v5.3' }
    ],
    tags: ['headphones', 'audio', 'wireless', 'anc'],
    ratingAverage: 4.9,
    ratingCount: 15,
    isFeatured: true,
    status: 'ACTIVE',
  });

  await Inventory.create({
    product: prod1._id,
    seller: seller1User._id,
    stockQuantity: 50,
  });

  const prod2 = await Product.create({
    title: 'UrbanVibe Oversized Organic Denim Jacket',
    slug: 'urbanvibe-oversized-organic-denim-jacket',
    description: 'Classic vintage-washed 100% organic cotton oversized denim jacket designed for versatile daily streetwear styling.',
    images: [
      { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80', alt: 'Denim Jacket' }
    ],
    category: fashionCat._id,
    brand: urbanBrand._id,
    seller: seller2User._id,
    sellerProfile: seller2Profile._id,
    price: 2999,
    discountPrice: 2499,
    stock: 35,
    sku: 'NOVA-CLO-002',
    specifications: [
      { key: 'Material', value: '100% Organic Cotton' },
      { key: 'Fit', value: 'Oversized Streetwear Fit' }
    ],
    tags: ['jacket', 'denim', 'streetwear', 'fashion'],
    ratingAverage: 4.7,
    ratingCount: 10,
    isFeatured: true,
    status: 'ACTIVE',
  });

  await Inventory.create({
    product: prod2._id,
    seller: seller2User._id,
    stockQuantity: 35,
  });

  console.log('[ShopSphere Seed] Creating Coupons...');
  await Coupon.create({
    code: 'WELCOME10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 999,
    maxDiscount: 500,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true,
  });

  console.log('\n==================================================');
  console.log('  SHOPSPHERE DATABASE SEEDED SUCCESSFULLY!');
  console.log('==================================================');
  console.log('Demo Credentials for Development Testing:');
  console.log('--------------------------------------------------');
  console.log('  1. ADMIN:    admin@shopsphere.dev    / Admin@123456');
  console.log('  2. SELLER 1: seller1@shopsphere.dev  / Seller@123456 (Apex Tech)');
  console.log('  3. SELLER 2: seller2@shopsphere.dev  / Seller@123456 (Nova Apparel)');
  console.log('  4. CUSTOMER: customer@shopsphere.dev / Customer@123456');
  console.log('  5. SUPPORT:  support@shopsphere.dev  / Support@123456');
  console.log('  6. RIDER:    delivery@shopsphere.dev / Delivery@123456');
  console.log('==================================================\n');

  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
