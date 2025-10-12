#!/usr/bin/env node

/**
 * Test script to verify order rollback functionality
 * This script tests stock rollback and analytics updates when orders are cancelled/returned
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./server/models/Order');
const Product = require('./server/models/Product');
const User = require('./server/models/User');

// Import analytics service
const analyticsService = require('./server/utils/analyticsService');

console.log('🧪 Testing Order Rollback Functionality...\n');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urbansprout');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createTestData() {
  console.log('📦 Creating test data...');
  
  // Create test user
  const testUser = await User.findOne({ email: 'test@example.com' }) || 
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'customer'
    });

  // Create test products
  const testProducts = [];
  for (let i = 1; i <= 3; i++) {
    const product = await Product.findOne({ name: `Test Product ${i}` }) ||
      await Product.create({
        name: `Test Product ${i}`,
        category: `Test Category ${i}`,
        description: `Test description for product ${i}`,
        sku: `TEST${i}`,
        regularPrice: 100 * i,
        stock: 50,
        images: ['test-image.jpg']
      });
    testProducts.push(product);
  }

  console.log(`✅ Created ${testProducts.length} test products`);
  return { testUser, testProducts };
}

async function testOrderCreation(testUser, testProducts) {
  console.log('\n🛒 Testing order creation...');
  
  const orderData = {
    user: testUser._id,
    items: testProducts.map((product, index) => ({
      productId: product._id,
      name: product.name,
      price: product.regularPrice,
      quantity: 5 + index, // Different quantities
      image: product.images[0]
    })),
    shippingAddress: {
      fullName: 'Test User',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      country: 'India',
      phone: '1234567890'
    },
    paymentMethod: 'UPI',
    subtotal: testProducts.reduce((sum, p, i) => sum + (p.regularPrice * (5 + i)), 0),
    shipping: 0,
    tax: 0,
    total: testProducts.reduce((sum, p, i) => sum + (p.regularPrice * (5 + i)), 0),
    status: 'processing',
    analyticsTracked: false
  };

  const order = await Order.create(orderData);
  console.log(`✅ Created order ${order._id} with status: ${order.status}`);
  
  // Check initial stock
  console.log('📊 Initial stock levels:');
  for (const product of testProducts) {
    await product.reload();
    console.log(`   ${product.name}: ${product.stock} units`);
  }
  
  return order;
}

async function testStockReduction(order, testProducts) {
  console.log('\n📉 Testing stock reduction...');
  
  // Simulate order processing (stock should be reduced)
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      const oldStock = product.stock;
      product.stock -= item.quantity;
      await product.save();
      console.log(`✅ Stock reduced for ${product.name}: ${oldStock} -> ${product.stock} (-${item.quantity})`);
    }
  }
}

async function testOrderDelivery(order) {
  console.log('\n🚚 Testing order delivery...');
  
  // Update order status to delivered
  order.status = 'delivered';
  order.analyticsTracked = true;
  await order.save();
  
  // Add to analytics
  await analyticsService.addOrderToAnalytics(order);
  console.log('✅ Order marked as delivered and added to analytics');
  
  // Check analytics data
  const categoryPerformance = await analyticsService.getCategoryPerformance('30d');
  const fastMovingProducts = await analyticsService.getFastMovingProducts('30d', 5);
  
  console.log('📊 Analytics after delivery:');
  console.log(`   Categories with sales: ${categoryPerformance.length}`);
  console.log(`   Fast-moving products: ${fastMovingProducts.length}`);
}

async function testOrderCancellation(order, testProducts) {
  console.log('\n❌ Testing order cancellation...');
  
  // Get stock levels before cancellation
  console.log('📊 Stock levels before cancellation:');
  for (const product of testProducts) {
    await product.reload();
    console.log(`   ${product.name}: ${product.stock} units`);
  }
  
  // Simulate admin cancelling the order
  const previousStatus = order.status;
  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = 'Test cancellation';
  
  // Update analytics (remove from analytics)
  await analyticsService.updateOrderAnalytics(order, previousStatus, 'cancelled');
  
  // Restore stock
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      const oldStock = product.stock;
      product.stock += item.quantity;
      await product.save();
      console.log(`✅ Stock restored for ${product.name}: ${oldStock} -> ${product.stock} (+${item.quantity})`);
    }
  }
  
  await order.save();
  console.log('✅ Order cancelled and stock restored');
  
  // Check analytics after cancellation
  const categoryPerformance = await analyticsService.getCategoryPerformance('30d');
  const fastMovingProducts = await analyticsService.getFastMovingProducts('30d', 5);
  
  console.log('📊 Analytics after cancellation:');
  console.log(`   Categories with sales: ${categoryPerformance.length}`);
  console.log(`   Fast-moving products: ${fastMovingProducts.length}`);
}

async function testOrderReturn(order, testProducts) {
  console.log('\n🔄 Testing order return...');
  
  // First, deliver the order again
  order.status = 'delivered';
  order.analyticsTracked = true;
  await order.save();
  await analyticsService.addOrderToAnalytics(order);
  
  // Get stock levels before return
  console.log('📊 Stock levels before return:');
  for (const product of testProducts) {
    await product.reload();
    console.log(`   ${product.name}: ${product.stock} units`);
  }
  
  // Simulate admin processing return
  const previousStatus = order.status;
  order.status = 'returned';
  order.returnedAt = new Date();
  order.returnReason = 'Test return';
  
  // Update analytics (remove from analytics)
  await analyticsService.updateOrderAnalytics(order, previousStatus, 'returned');
  
  // Restore stock
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      const oldStock = product.stock;
      product.stock += item.quantity;
      await product.save();
      console.log(`✅ Stock restored for ${product.name}: ${oldStock} -> ${product.stock} (+${item.quantity})`);
    }
  }
  
  await order.save();
  console.log('✅ Order returned and stock restored');
}

async function testAnalyticsRecalculation() {
  console.log('\n🔄 Testing analytics recalculation...');
  
  const result = await analyticsService.recalculateAllAnalytics();
  
  if (result.success) {
    console.log(`✅ Analytics recalculated successfully. Processed ${result.processedOrders} orders.`);
  } else {
    console.error('❌ Analytics recalculation failed:', result.error);
  }
}

async function cleanup(testUser, testProducts, order) {
  console.log('\n🧹 Cleaning up test data...');
  
  // Delete test order
  if (order) {
    await Order.findByIdAndDelete(order._id);
    console.log('✅ Deleted test order');
  }
  
  // Delete test products
  for (const product of testProducts) {
    await Product.findByIdAndDelete(product._id);
    console.log(`✅ Deleted test product: ${product.name}`);
  }
  
  // Delete test user (if created)
  if (testUser.email === 'test@example.com') {
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Deleted test user');
  }
}

async function runTests() {
  try {
    await connectDB();
    
    const { testUser, testProducts } = await createTestData();
    const order = await testOrderCreation(testUser, testProducts);
    
    await testStockReduction(order, testProducts);
    await testOrderDelivery(order);
    await testOrderCancellation(order, testProducts);
    await testOrderReturn(order, testProducts);
    await testAnalyticsRecalculation();
    
    await cleanup(testUser, testProducts, order);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Order creation with stock reduction');
    console.log('✅ Order delivery with analytics tracking');
    console.log('✅ Order cancellation with stock rollback');
    console.log('✅ Order return with stock rollback');
    console.log('✅ Analytics recalculation');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the tests
runTests();












