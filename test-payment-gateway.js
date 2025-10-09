#!/usr/bin/env node

/**
 * Test script to verify Razorpay payment gateway configuration
 * Run this script to check if your payment gateway is properly configured
 */

const Razorpay = require('razorpay');
require('dotenv').config();

console.log('🔍 Testing Razorpay Payment Gateway Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing');
console.log('');

// Initialize Razorpay
try {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RH9Kx0Ibt9neI6',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'CjIJyaqKbJzhUNR9J0zu4KjI'
  });

  console.log('🔧 Razorpay Instance:');
  console.log('Key ID:', razorpay.key_id);
  console.log('Key Secret:', razorpay.key_secret ? '***' + razorpay.key_secret.slice(-4) : 'undefined');
  console.log('');

  // Test creating a small order
  console.log('🧪 Testing Order Creation...');
  
  const testOrder = {
    amount: 100, // ₹1.00 in paise
    currency: 'INR',
    receipt: `test_${Date.now()}`,
    notes: {
      test: true,
      description: 'Payment gateway test order'
    }
  };

  console.log('Test order data:', testOrder);

  razorpay.orders.create(testOrder)
    .then(order => {
      console.log('✅ Order created successfully!');
      console.log('Order ID:', order.id);
      console.log('Amount:', order.amount);
      console.log('Currency:', order.currency);
      console.log('Receipt:', order.receipt);
      console.log('Status:', order.status);
      console.log('');
      console.log('🎉 Payment gateway is working correctly!');
      console.log('');
      console.log('📝 Next steps:');
      console.log('1. Make sure your server is running');
      console.log('2. Test the payment flow in your application');
      console.log('3. Check browser console for any client-side errors');
    })
    .catch(error => {
      console.error('❌ Order creation failed:');
      console.error('Error:', error.message);
      console.error('Status Code:', error.statusCode);
      console.error('Response:', error.response?.data);
      console.log('');
      console.log('🔧 Troubleshooting:');
      console.log('1. Check if your Razorpay credentials are correct');
      console.log('2. Verify your Razorpay account is active');
      console.log('3. Check your internet connection');
      console.log('4. Try using different test credentials');
    });

} catch (error) {
  console.error('❌ Failed to initialize Razorpay:');
  console.error('Error:', error.message);
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('1. Check if razorpay package is installed: npm list razorpay');
  console.log('2. Verify your environment variables');
  console.log('3. Check your .env file in the server directory');
}




