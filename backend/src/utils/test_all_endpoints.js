const BASE_URL = 'http://localhost:5000/api/v1';

let adminToken = '';
let seller1Token = '';
let seller2Token = '';
let customerToken = '';
let riderToken = '';
let supportToken = '';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  try {
    const res = await fetch(url, config);
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, data };
  } catch (err) {
    return { status: 500, error: err.message };
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING COMPREHENSIVE ENDPOINT AUDIT & TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - Detail: ${detail}`);
      failed++;
    }
  }

  // 1. Health check
  console.log('--- 1. Base Health & Discovery ---');
  let res = await request('/health');
  assert(res.status === 200 && res.data?.success, 'Health check endpoint', JSON.stringify(res.data));

  // 2. Auth Logins
  console.log('\n--- 2. Authentication & Sessions ---');
  res = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@shopsphere.dev', password: 'Admin@123456' },
  });
  assert(res.status === 200 && res.data?.data?.accessToken, 'Admin Login', res.data?.message);
  adminToken = res.data?.data?.accessToken;

  res = await request('/auth/login', {
    method: 'POST',
    body: { email: 'seller1@shopsphere.dev', password: 'Seller@123456' },
  });
  assert(res.status === 200 && res.data?.data?.accessToken, 'Seller 1 Login', res.data?.message);
  seller1Token = res.data?.data?.accessToken;

  res = await request('/auth/login', {
    method: 'POST',
    body: { email: 'seller2@shopsphere.dev', password: 'Seller@123456' },
  });
  assert(res.status === 200 && res.data?.data?.accessToken, 'Seller 2 Login', res.data?.message);
  seller2Token = res.data?.data?.accessToken;

  res = await request('/auth/login', {
    method: 'POST',
    body: { email: 'customer@shopsphere.dev', password: 'Customer@123456' },
  });
  assert(res.status === 200 && res.data?.data?.accessToken, 'Customer Login', res.data?.message);
  customerToken = res.data?.data?.accessToken;

  res = await request('/auth/login', {
    method: 'POST',
    body: { email: 'delivery@shopsphere.dev', password: 'Delivery@123456' },
  });
  assert(res.status === 200 && res.data?.data?.accessToken, 'Rider Login', res.data?.message);
  riderToken = res.data?.data?.accessToken;

  res = await request('/auth/login', {
    method: 'POST',
    body: { email: 'support@shopsphere.dev', password: 'Support@123456' },
  });
  assert(res.status === 200 && res.data?.data?.accessToken, 'Support Login', res.data?.message);
  supportToken = res.data?.data?.accessToken;

  // 3. Current User (/auth/me)
  res = await request('/auth/me', { token: customerToken });
  assert(res.status === 200 && res.data?.data?.user?.role === 'CUSTOMER', 'Get Authenticated User (/auth/me)', res.data?.message);

  // 4. Categories & Brands
  console.log('\n--- 3. Categories & Brands ---');
  res = await request('/categories');
  assert(res.status === 200 && Array.isArray(res.data?.data) && res.data?.data?.length > 0, 'Get Categories', `Count: ${res.data?.data?.length}`);

  res = await request('/brands');
  assert(res.status === 200 && Array.isArray(res.data?.data), 'Get Brands', `Count: ${res.data?.data?.length}`);

  // 5. Products Catalog
  console.log('\n--- 4. Products Catalog & Multi-Vendor Setup ---');
  res = await request('/products');
  assert(res.status === 200 && res.data?.data?.length >= 2, 'Get All Products', `Found: ${res.data?.data?.length}`);
  const allProducts = res.data?.data || [];

  // Find 1 product from Seller 1 and 1 product from Seller 2
  const seller1Prod = allProducts.find((p) => p.sellerProfile?.storeName?.includes('Apex'));
  const seller2Prod = allProducts.find((p) => p.sellerProfile?.storeName?.includes('Nova'));

  assert(seller1Prod && seller2Prod, 'Multi-Vendor Products Identified for Both Vendors');

  // Test Seller Products isolated endpoint
  res = await request('/products/my-products', { token: seller1Token });
  assert(res.status === 200 && Array.isArray(res.data?.data), 'Seller 1 Isolated Products', `Found: ${res.data?.data?.length}`);

  // 6. Sellers List & Storefront
  console.log('\n--- 5. Sellers & Storefronts ---');
  res = await request('/sellers');
  assert(res.status === 200 && res.data?.data?.length >= 2, 'Get Public Approved Sellers', `Found: ${res.data?.data?.length}`);
  const storeSlug = res.data?.data?.[0]?.storeSlug;

  res = await request(`/sellers/store/${storeSlug}`);
  assert(res.status === 200 && res.data?.data?.seller, 'Get Storefront Details by Slug', res.data?.message);

  res = await request('/sellers/dashboard-stats', { token: seller1Token });
  assert(res.status === 200 && res.data?.data?.totalProducts !== undefined, 'Seller 1 Dashboard Stats', JSON.stringify(res.data?.data));

  // 7. Multi-Vendor Cart Operations (Add items from BOTH vendors)
  console.log('\n--- 6. Multi-Vendor Cart Operations ---');
  // Clear cart first if any
  res = await request('/cart/items', {
    method: 'POST',
    token: customerToken,
    body: { productId: seller1Prod._id, quantity: 1 },
  });
  assert(res.status === 200, `Add Seller 1 Product (${seller1Prod.title}) to Cart`, res.data?.message);

  res = await request('/cart/items', {
    method: 'POST',
    token: customerToken,
    body: { productId: seller2Prod._id, quantity: 1 },
  });
  assert(res.status === 200, `Add Seller 2 Product (${seller2Prod.title}) to Cart`, res.data?.message);

  res = await request('/cart', { token: customerToken });
  assert(res.status === 200 && res.data?.data?.items?.length === 2, 'Multi-Vendor Cart has items from both sellers', `Items: ${res.data?.data?.items?.length}`);

  res = await request('/cart/coupon', {
    method: 'POST',
    token: customerToken,
    body: { code: 'WELCOME10' },
  });
  assert(res.status === 200 && res.data?.data?.couponCode === 'WELCOME10', 'Apply Coupon WELCOME10', res.data?.message);

  // 8. Checkout & Order Splitting
  console.log('\n--- 7. Order Placement & Multi-Vendor Splitting ---');
  res = await request('/orders/checkout', {
    method: 'POST',
    token: customerToken,
    body: {
      shippingAddress: {
        fullName: 'David Miller',
        phone: '9876543212',
        street: '42 Market Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
      },
      paymentMethod: 'COD',
    },
  });
  assert(res.status === 201 && res.data?.data?.order, 'Multi-Vendor Checkout Success', res.data?.message);
  const createdSubOrders = res.data?.data?.sellerOrders || [];
  assert(createdSubOrders.length === 2, 'Parent Order successfully split into 2 Vendor Sub-Orders', `Sub-orders count: ${createdSubOrders.length}`);

  // 9. Orders Retrieval by Role
  console.log('\n--- 8. Orders by Role & Vendor Isolation ---');
  res = await request('/orders', { token: customerToken });
  assert(res.status === 200 && res.data?.data?.length > 0, 'Customer Sees Parent Orders with Sub-Orders', `Orders: ${res.data?.data?.length}`);

  res = await request('/orders', { token: seller1Token });
  assert(res.status === 200 && res.data?.data?.length > 0, 'Seller 1 Sees Their Own Sub-Orders', `Sub-Orders: ${res.data?.data?.length}`);
  const seller1SubOrder = res.data?.data?.[0];

  res = await request('/orders', { token: seller2Token });
  assert(res.status === 200 && res.data?.data?.length > 0, 'Seller 2 Sees Their Own Sub-Orders', `Sub-Orders: ${res.data?.data?.length}`);
  const seller2SubOrder = res.data?.data?.[0];

  res = await request('/orders', { token: adminToken });
  assert(res.status === 200 && res.data?.data?.length > 0, 'Admin Sees All Marketplace Orders', `Orders: ${res.data?.data?.length}`);

  // 10. Vendor 1 State Transitions
  console.log('\n--- 9. Vendor Order State Transitions ---');
  res = await request(`/orders/seller-orders/${seller1SubOrder._id}/status`, {
    method: 'PATCH',
    token: seller1Token,
    body: { status: 'CONFIRMED', note: 'Seller 1 confirmed order' },
  });
  assert(res.status === 200 && res.data?.data?.status === 'CONFIRMED', 'Seller 1: PLACED -> CONFIRMED', res.data?.message);

  res = await request(`/orders/seller-orders/${seller1SubOrder._id}/status`, {
    method: 'PATCH',
    token: seller1Token,
    body: { status: 'PACKED', note: 'Seller 1 packed goods' },
  });
  assert(res.status === 200 && res.data?.data?.status === 'PACKED', 'Seller 1: CONFIRMED -> PACKED', res.data?.message);

  res = await request(`/orders/seller-orders/${seller1SubOrder._id}/status`, {
    method: 'PATCH',
    token: seller1Token,
    body: { status: 'SHIPPED', note: 'Seller 1 dispatched to courier hub' },
  });
  assert(res.status === 200 && res.data?.data?.status === 'SHIPPED', 'Seller 1: PACKED -> SHIPPED', res.data?.message);

  // 11. Rider Deliveries & OTP Handover
  console.log('\n--- 10. Rider Dispatch, OpenStreetMap Coordinates & OTP ---');
  res = await request('/deliveries/assigned', { token: riderToken });
  assert(res.status === 200 && res.data?.data?.length > 0, 'Rider Receives Dispatched Deliveries', `Deliveries: ${res.data?.data?.length}`);
  const activeDelivery = res.data?.data?.[0];

  res = await request(`/deliveries/${activeDelivery._id}`, { token: riderToken });
  assert(res.status === 200 && res.data?.data?.mapCoordinates, 'Delivery Navigation Details & Map Coordinates', res.data?.message);

  res = await request(`/deliveries/${activeDelivery._id}/generate-otp`, {
    method: 'POST',
    token: riderToken,
  });
  assert(res.status === 200 && res.data?.data?.devModeOtp, 'Generate 6-digit Delivery OTP', `OTP: ${res.data?.data?.devModeOtp}`);
  const deliveryOtp = res.data?.data?.devModeOtp;

  res = await request(`/deliveries/${activeDelivery._id}/verify-otp`, {
    method: 'POST',
    token: riderToken,
    body: { otp: deliveryOtp },
  });
  assert(res.status === 200, 'Verify OTP & Mark Delivery DELIVERED', res.data?.message);

  // 12. Support Desk
  console.log('\n--- 11. Customer Support Tickets ---');
  res = await request('/support/tickets', {
    method: 'POST',
    token: customerToken,
    body: {
      subject: 'Inquiry regarding package delivery tracking',
      description: 'Could you please confirm the courier delivery window for my order?',
      priority: 'MEDIUM',
    },
  });
  assert(res.status === 201 && res.data?.data?.ticketNumber, 'Create Support Ticket', `Ticket: ${res.data?.data?.ticketNumber}`);
  const testTicketId = res.data?.data?._id;

  res = await request('/support/tickets', { token: supportToken });
  assert(res.status === 200 && res.data?.data?.length > 0, 'Support Agent Get Tickets', `Tickets: ${res.data?.data?.length}`);

  res = await request(`/support/tickets/${testTicketId}/reply`, {
    method: 'POST',
    token: supportToken,
    body: { message: 'Hello! Your package has been verified and delivered by rider Robert Express.' },
  });
  assert(res.status === 200, 'Support Agent Reply to Ticket', res.data?.message);

  // 13. AI Services
  console.log('\n--- 12. AI Assistant & Insights ---');
  res = await request('/ai/generate-description', {
    method: 'POST',
    token: seller1Token,
    body: {
      title: 'UltraBass Wireless Earbuds',
      category: 'Electronics',
      keyFeatures: ['Active Noise Cancellation', '36 Hour Playtime', 'IPX7 Waterproof'],
    },
  });
  assert(res.status === 200 && res.data?.data?.generatedDescription, 'AI Generate Product Description', 'Generated description received');

  res = await request('/ai/seller-insights', { token: seller1Token });
  assert(res.status === 200 && res.data?.data?.insights?.length > 0, 'AI Seller Sales Insights', `Insights: ${res.data?.data?.insights?.length}`);

  // 14. Admin Moderation & Audit Logs
  console.log('\n--- 13. Admin Overview, Users, Sellers & Audit Logs ---');
  res = await request('/admin/overview', { token: adminToken });
  assert(res.status === 200 && res.data?.data?.totalRevenue !== undefined, 'Admin Overview Stats', `Revenue: ₹${res.data?.data?.totalRevenue}`);

  res = await request('/admin/audit-logs', { token: adminToken });
  assert(res.status === 200 && Array.isArray(res.data?.data), 'Admin Audit Logs', `Logs: ${res.data?.data?.length}`);

  res = await request('/users', { token: adminToken });
  assert(res.status === 200 && res.data?.data?.length > 0, 'Admin Users Management', `Users: ${res.data?.data?.length}`);

  res = await request('/sellers/admin/all', { token: adminToken });
  assert(res.status === 200 && res.data?.data?.length > 0, 'Admin Sellers Management', `Sellers: ${res.data?.data?.length}`);

  console.log('\n====================================================');
  console.log(`  AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  if (failed === 0) {
    console.log('🎉 ALL BACKEND APIS & CONTRACTS FUNCTIONING FLAWLESSLY!\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('[Audit Suite Error]', err);
  process.exit(1);
});
