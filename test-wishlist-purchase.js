#!/usr/bin/env node

/**
 * Test script for wishlist purchase functionality
 * This script tests the complete wishlist purchase flow including:
 * 1. Adding items to wishlist
 * 2. Purchasing from wishlist
 * 3. Verifying stock updates
 * 4. Checking order creation
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = '';
let userId = '';
let testProductId = '';
let wishlistId = '';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const config = {
    url: `${BASE_URL}${endpoint}`,
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  };

  if (options.body) {
    config.data = options.body;
  }

  try {
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || error.message,
      error: error.response?.data || error.message
    };
  }
};

// Test functions
const loginUser = async () => {
  console.log('🔐 Logging in test user...');
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(TEST_USER)
  });

  if (response.success) {
    authToken = response.data.token;
    userId = response.data.user._id;
    console.log('✅ User logged in successfully');
    return true;
  } else {
    console.error('❌ Login failed:', response.message);
    return false;
  }
};

const getTestProduct = async () => {
  console.log('📦 Getting test product...');
  const response = await apiCall('/store');
  
  if (response.success && response.data.products && response.data.products.length > 0) {
    testProductId = response.data.products[0]._id;
    console.log(`✅ Found test product: ${response.data.products[0].name} (ID: ${testProductId})`);
    return response.data.products[0];
  } else {
    console.error('❌ No products found');
    return null;
  }
};

const addToWishlist = async (productId) => {
  console.log('❤️ Adding product to wishlist...');
  const response = await apiCall('/store/wishlist', {
    method: 'POST',
    body: JSON.stringify({
      items: [{ id: productId }]
    })
  });

  if (response.success) {
    console.log('✅ Product added to wishlist');
    return true;
  } else {
    console.error('❌ Failed to add to wishlist:', response.message);
    return false;
  }
};

const getWishlist = async () => {
  console.log('📋 Getting wishlist...');
  const response = await apiCall('/store/wishlist');
  
  if (response.success) {
    console.log(`✅ Wishlist retrieved: ${response.data.length} items`);
    return response.data;
  } else {
    console.error('❌ Failed to get wishlist:', response.message);
    return [];
  }
};

const purchaseFromWishlist = async (items) => {
  console.log('💳 Purchasing from wishlist...');
  const response = await apiCall('/store/wishlist/purchase', {
    method: 'POST',
    body: JSON.stringify({
      items: items.map(item => ({
        id: item.id || item._id,
        quantity: 1
      })),
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test Street',
        city: 'Test City',
        postalCode: '12345',
        country: 'India',
        phone: '1234567890'
      },
      paymentMethod: 'Credit Card'
    })
  });

  if (response.success) {
    console.log(`✅ Purchase successful! Order ID: ${response.data.order.orderNumber}`);
    return response.data.order;
  } else {
    console.error('❌ Purchase failed:', response.message);
    return null;
  }
};

const verifyWishlistEmpty = async () => {
  console.log('🔍 Verifying wishlist is empty after purchase...');
  const wishlist = await getWishlist();
  
  if (wishlist.length === 0) {
    console.log('✅ Wishlist is empty after purchase');
    return true;
  } else {
    console.log(`❌ Wishlist still has ${wishlist.length} items`);
    return false;
  }
};

const checkAdminOrders = async () => {
  console.log('👨‍💼 Checking admin orders...');
  const response = await apiCall('/admin/orders');
  
  if (response.success) {
    console.log(`✅ Admin orders retrieved: ${response.data.orders.length} orders`);
    return response.data.orders;
  } else {
    console.error('❌ Failed to get admin orders:', response.message);
    return [];
  }
};

const checkProductStock = async (productId) => {
  console.log('📊 Checking product stock...');
  const response = await apiCall(`/store/product/${productId}`);
  
  if (response.success) {
    console.log(`✅ Product stock: ${response.data.stock}`);
    return response.data.stock;
  } else {
    console.error('❌ Failed to get product stock:', response.message);
    return null;
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting wishlist purchase tests...\n');

  try {
    // Step 1: Login
    const loginSuccess = await loginUser();
    if (!loginSuccess) {
      console.error('❌ Test failed: Could not login');
      return;
    }

    // Step 2: Get test product
    const product = await getTestProduct();
    if (!product) {
      console.error('❌ Test failed: No test product available');
      return;
    }

    // Step 3: Check initial stock
    const initialStock = await checkProductStock(testProductId);
    if (initialStock === null) {
      console.error('❌ Test failed: Could not get initial stock');
      return;
    }

    // Step 4: Add to wishlist
    const wishlistSuccess = await addToWishlist(testProductId);
    if (!wishlistSuccess) {
      console.error('❌ Test failed: Could not add to wishlist');
      return;
    }

    // Step 5: Verify wishlist
    const wishlist = await getWishlist();
    if (wishlist.length === 0) {
      console.error('❌ Test failed: Wishlist is empty after adding product');
      return;
    }

    // Step 6: Purchase from wishlist
    const order = await purchaseFromWishlist(wishlist);
    if (!order) {
      console.error('❌ Test failed: Purchase failed');
      return;
    }

    // Step 7: Verify wishlist is empty
    const wishlistEmpty = await verifyWishlistEmpty();
    if (!wishlistEmpty) {
      console.error('❌ Test failed: Wishlist not empty after purchase');
      return;
    }

    // Step 8: Check stock reduction
    const finalStock = await checkProductStock(testProductId);
    if (finalStock === null) {
      console.error('❌ Test failed: Could not get final stock');
      return;
    }

    if (finalStock < initialStock) {
      console.log(`✅ Stock reduced: ${initialStock} -> ${finalStock}`);
    } else {
      console.error('❌ Test failed: Stock was not reduced');
      return;
    }

    // Step 9: Check admin orders
    const adminOrders = await checkAdminOrders();
    const foundOrder = adminOrders.find(o => o._id === order._id);
    if (foundOrder) {
      console.log('✅ Order found in admin orders');
    } else {
      console.error('❌ Test failed: Order not found in admin orders');
      return;
    }

    console.log('\n🎉 All tests passed! Wishlist purchase functionality is working correctly.');
    console.log('\n📋 Test Summary:');
    console.log(`- User logged in: ${loginSuccess}`);
    console.log(`- Product added to wishlist: ${wishlistSuccess}`);
    console.log(`- Purchase completed: ${order ? 'Yes' : 'No'}`);
    console.log(`- Wishlist cleared: ${wishlistEmpty}`);
    console.log(`- Stock reduced: ${finalStock < initialStock}`);
    console.log(`- Order visible in admin: ${foundOrder ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  loginUser,
  getTestProduct,
  addToWishlist,
  getWishlist,
  purchaseFromWishlist,
  verifyWishlistEmpty,
  checkAdminOrders,
  checkProductStock
};

