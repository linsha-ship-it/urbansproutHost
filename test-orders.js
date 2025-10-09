const mongoose = require('mongoose');
const Order = require('./server/models/Order');
const Product = require('./server/models/Product');

async function testOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urbansprout');
    console.log('Connected to MongoDB');

    // Check total orders
    const totalOrders = await Order.countDocuments();
    console.log(`Total orders in database: ${totalOrders}`);

    // Get a sample order
    const sampleOrder = await Order.findOne().populate('items.product');
    if (sampleOrder) {
      console.log('Sample order structure:');
      console.log(JSON.stringify(sampleOrder, null, 2));
    } else {
      console.log('No orders found');
    }

    // Check products
    const totalProducts = await Product.countDocuments();
    console.log(`Total products in database: ${totalProducts}`);

    // Get sample products with categories
    const sampleProducts = await Product.find().limit(5).select('name category');
    console.log('Sample products with categories:');
    sampleProducts.forEach(p => console.log(`- ${p.name}: ${p.category}`));

    // Test simple category aggregation
    const categoryTest = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $match: { product: { $ne: [] } } },
      {
        $group: {
          _id: { $arrayElemAt: ['$product.category', 0] },
          totalSold: { $sum: '$items.quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Category aggregation result:');
    console.log(JSON.stringify(categoryTest, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testOrders();




