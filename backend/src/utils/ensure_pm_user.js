import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db.js';
import User from '../models/User.js';

async function ensureProductManager() {
  await connectDB();
  const existing = await User.findOne({ email: 'pm@shopsphere.dev' });
  if (existing) {
    existing.role = 'PRODUCT_MANAGER';
    existing.password = 'Manager@123456';
    await existing.save();
    console.log('[ShopSphere] Product Manager user updated:', existing.email);
  } else {
    const pm = await User.create({
      name: 'Elena Rostova (Product Manager)',
      email: 'pm@shopsphere.dev',
      password: 'Manager@123456',
      role: 'PRODUCT_MANAGER',
      status: 'ACTIVE',
      phone: '+91 9876543215',
    });
    console.log('[ShopSphere] Product Manager user created:', pm.email);
  }
  process.exit(0);
}

ensureProductManager().catch((e) => {
  console.error(e);
  process.exit(1);
});
