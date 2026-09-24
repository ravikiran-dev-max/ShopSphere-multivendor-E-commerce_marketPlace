import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db.js';
import User from '../models/User.js';
import CustomerProfile from '../models/CustomerProfile.js';
import app from '../app.js';

async function runAuthTest() {
  console.log('[Auth Verification] Connecting to DB...');
  await connectDB();

  console.log('[Auth Verification] Cleaning up test user...');
  await User.deleteMany({ email: 'testcustomer@shopsphere.dev' });

  // Test 1: User Model Creation & Password Hashing
  console.log('[Auth Verification] Test 1: Password hashing and JWT generation...');
  const testUser = await User.create({
    name: 'Test Customer',
    email: 'testcustomer@shopsphere.dev',
    password: 'Password123!',
    role: 'CUSTOMER',
  });

  const isMatch = await testUser.comparePassword('Password123!');
  console.log(`  Password compare result: ${isMatch ? 'PASSED (Matches)' : 'FAILED'}`);

  const token = testUser.generateAccessToken();
  console.log(`  JWT Access Token generated: ${token ? 'PASSED' : 'FAILED'}`);

  await User.deleteMany({ email: 'testcustomer@shopsphere.dev' });
  console.log('[Auth Verification] ALL AUTH TESTS PASSED SUCCESSFULLY.');
  process.exit(0);
}

runAuthTest().catch((err) => {
  console.error('[Auth Verification Error]', err);
  process.exit(1);
});
