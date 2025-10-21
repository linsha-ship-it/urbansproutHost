#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./server/models/Order');
const analyticsService = require('./server/utils/analyticsService');

async function testCategoryData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urbansprout');
    console.log('✅ Connected to MongoDB');

    // Test category performance
    console.log('\n📊 Testing Category Performance...');
    const categoryPerformance = await analyticsService.getCategoryPerformance('30d');
    console.log('Category Performance:', categoryPerformance);

    // Test simple aggregation
    console.log('\n📊 Testing Simple Aggregation...');
    const simpleData = await Order.aggregate([
      { $unwind: '$items' },
      { $group: {
        _id: '$items.name',
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);
    console.log('Simple Data:', simpleData);

    // Create category map
    const categoryMap = {};
    simpleData.forEach(item => {
      const category = item._id;
      if (!categoryMap[category]) {
        categoryMap[category] = {
          category: category,
          totalSold: 0,
          totalRevenue: 0,
          uniqueProducts: 0
        };
      }
      categoryMap[category].totalSold += item.totalSold;
      categoryMap[category].totalRevenue += item.totalRevenue;
      categoryMap[category].uniqueProducts += 1;
    });

    const finalCategoryData = Object.values(categoryMap).sort((a, b) => b.totalSold - a.totalSold);
    console.log('\n📊 Final Category Data:');
    console.log(JSON.stringify(finalCategoryData, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testCategoryData();
























