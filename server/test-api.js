const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const testAPI = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database successfully!');

    // Check if we have an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('👤 Creating admin user...');
      const newAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@urbansprout.com',
        password: 'hashedpassword',
        role: 'admin'
      });
      console.log('✅ Created admin user:', newAdmin.email);
    } else {
      console.log('👤 Admin user exists:', adminUser.email);
    }

    // Check products and orders
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log('📊 Current data:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Orders: ${orderCount}`);

    if (productCount === 0) {
      console.log('📦 Creating sample products...');
      const sampleProducts = [
        {
          name: 'Snake Plant',
          category: 'Indoor Plants',
          sku: 'PLANT-SNAKE-001',
          regularPrice: 24.99,
          description: 'Perfect for beginners',
          images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop'],
          stock: 15,
          featured: true
        },
        {
          name: 'Garden Trowel',
          category: 'Tools',
          sku: 'TOOL-TROWEL-001',
          regularPrice: 24.99,
          description: 'Professional garden tool',
          images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop'],
          stock: 30,
          featured: true
        }
      ];
      
      await Product.insertMany(sampleProducts);
      console.log('✅ Created sample products');
    }

    if (orderCount === 0) {
      console.log('📦 Creating sample orders...');
      const products = await Product.find();
      const user = await User.findOne();
      
      if (products.length > 0 && user) {
        const sampleOrder = {
          orderNumber: 'ORD-TEST-001',
          user: user._id,
          items: [
            {
              product: products[0]._id,
              name: products[0].name,
              price: products[0].regularPrice,
              quantity: 2
            }
          ],
          shippingAddress: {
            fullName: 'Test User',
            address: '123 Test St',
            city: 'Test City',
            postalCode: '12345',
            country: 'India'
          },
          subtotal: 49.98,
          total: 49.98,
          status: 'delivered',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        };
        
        await Order.create(sampleOrder);
        console.log('✅ Created sample order');
      }
    }

    console.log('🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

testAPI();






