// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Middleware
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
];
const envOrigins = (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []);
const normalizedEnvOrigins = envOrigins.map(o => o && o.trim()).filter(Boolean);
const allowedOrigins = Array.from(new Set([ ...defaultAllowedOrigins, ...normalizedEnvOrigins ]));

// CORS middleware
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    if (!res.get('Access-Control-Allow-Origin')) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
    }
    if (!res.get('Access-Control-Allow-Credentials')) {
      res.header('Access-Control-Allow-Credentials', 'true');
    }
  }
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    return res.sendStatus(204);
  }
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if ((process.env.NODE_ENV || 'development') === 'development') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with caching for serverless
let cachedDb = null;

async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not configured');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    cachedDb = conn;
    console.log('✅ MongoDB Connected');
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

// Base test route
app.get('/api/test', async (req, res) => {
  try {
    await connectDB();
    res.json({
      success: true,
      message: '🌱 UrbanSprout Backend is running on Vercel!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Import routes
const authRoutes = require('../routes/auth');
const blogRoutes = require('../routes/blog');
const storeRoutes = require('../routes/store');
const adminRoutes = require('../routes/admin');
const adminAuthRoutes = require('../routes/adminAuth');
const chatbotRoutes = require('../routes/chatbot');
const notificationRoutes = require('../routes/notifications');
const plantRoutes = require('../routes/plants');
const gardenRoutes = require('../routes/garden');
const statsRoutes = require('../routes/stats');
const profilePhotoRoutes = require('../routes/profilePhoto');

// Middleware to ensure DB connection for all API routes
app.use('/api/*', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/store', storeRoutes);

// Debug route for inventory insights (no auth required)
const { getInventoryInsightsDebug } = require('../controllers/adminController');
app.get('/api/admin/inventory-insights-debug', getInventoryInsightsDebug);

app.use('/api/admin', adminRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/garden', gardenRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/profile-photo', profilePhotoRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  const statusCode = typeof err.statusCode === 'number'
    ? err.statusCode
    : (typeof err.status === 'number' ? err.status : 500);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export for Vercel
module.exports = app;

