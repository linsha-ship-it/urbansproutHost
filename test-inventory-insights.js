const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urbansprout', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');

async function testInventoryInsights() {
  try {
    console.log('🔍 Testing Inventory Insights Calculation...\n');

    // Check if we have any orders
    const totalOrders = await Order.countDocuments();
    console.log(`📊 Total orders in database: ${totalOrders}`);

    if (totalOrders === 0) {
      console.log('⚠️ No orders found. Creating test orders...\n');
      
      // Find or create a test user
      let testUser = await User.findOne();
      if (!testUser) {
        testUser = new User({
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedpassword',
          role: 'beginner'
        });
        await testUser.save();
        console.log('✅ Created test user');
      }

      // Create test orders
      const testOrders = [
        {
          user: testUser._id,
          items: [
            { name: 'Test Product 1', price: 100, quantity: 2, productId: 'test-1' },
            { name: 'Test Product 2', price: 50, quantity: 3, productId: 'test-2' }
          ],
          shippingAddress: {
            fullName: 'Test User',
            address: 'Test Address',
            city: 'Test City',
            postalCode: '12345',
            country: 'Test Country'
          },
          subtotal: 350,
          total: 350,
          status: 'delivered'
        },
        {
          user: testUser._id,
          items: [
            { name: 'Test Product 3', price: 75, quantity: 1, productId: 'test-3' },
            { name: 'Test Product 4', price: 25, quantity: 4, productId: 'test-4' }
          ],
          shippingAddress: {
            fullName: 'Test User',
            address: 'Test Address',
            city: 'Test City',
            postalCode: '12345',
            country: 'Test Country'
          },
          subtotal: 175,
          total: 175,
          status: 'delivered'
        }
      ];

      for (const orderData of testOrders) {
        const order = new Order(orderData);
        await order.save();
        console.log(`✅ Created test order with ${orderData.items.reduce((sum, item) => sum + item.quantity, 0)} units`);
      }
    }

    // Now calculate total units sold
    const allOrders = await Order.find({}).select('items status');
    let totalUnitsSold = 0;
    let totalRevenue = 0;

    allOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        const orderUnits = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        totalUnitsSold += orderUnits;
        
        if (order.status === 'delivered') {
          // Calculate revenue from delivered orders
          const orderRevenue = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          totalRevenue += orderRevenue;
        }
      }
    });

    console.log('\n📈 CALCULATION RESULTS:');
    console.log(`   Total Orders: ${allOrders.length}`);
    console.log(`   Total Units Sold: ${totalUnitsSold}`);
    console.log(`   Total Revenue (delivered): ${totalRevenue}`);
    console.log(`   Average Order Value: ${allOrders.length > 0 ? (totalRevenue / allOrders.length).toFixed(2) : 0}`);

    // Test the API endpoint
    console.log('\n🌐 Testing API endpoint...');
    const response = await fetch('http://localhost:5001/api/admin/inventory-insights?period=30d', {
      headers: {
        'Authorization': 'Bearer your-admin-token-here' // You'll need to replace this with a valid token
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:');
      console.log(`   Total Units Sold: ${data.data.summary.totalUnitsSold}`);
      console.log(`   Total Revenue: ${data.data.summary.totalRevenue}`);
      console.log(`   Total Products: ${data.data.summary.totalProducts}`);
    } else {
      console.log('❌ API request failed:', response.status, response.statusText);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testInventoryInsights();
