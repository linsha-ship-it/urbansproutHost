const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.error('Please create a .env file with your MongoDB connection string');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Please check your MongoDB connection string and network connectivity');
    console.warn('⚠️  Server will continue running without database connection');
    console.warn('⚠️  Some features may not work properly');
    // Don't exit - let the server continue running
  }
};

// Handle connection events
// mongoose connection events kept minimal

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});



// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;