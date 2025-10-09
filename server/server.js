const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const connectDB = require('./config/database');
const setupSocketIO = require('./utils/socketIO');

// Load env from project root first (for MONGODB_URI), then server/.env for others
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
// Allow common local dev origins if CORS_ORIGIN is not explicitly set
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
];
const allowedOrigins = (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : defaultAllowedOrigins);

app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (removed verbose logs)
app.use((req, res, next) => {
  next();
});

// Base test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '🌱 UrbanSprout Backend is running successfully!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const storeRoutes = require('./routes/store');
const adminRoutes = require('./routes/admin');
const chatbotRoutes = require('./routes/chatbot');
const notificationRoutes = require('./routes/notifications');
const plantRoutes = require('./routes/plants');
const gardenRoutes = require('./routes/garden');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/garden', gardenRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage()
  });
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
  
  // Prefer AppError's statusCode if available, fallback to numeric status, else 500
  const statusCode = typeof err.statusCode === 'number'
    ? err.statusCode
    : (typeof err.status === 'number' ? err.status : 500);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const DEFAULT_PORT = Number(process.env.PORT) || 5001;

function startServer(port, attemptsLeft = 3) {
  const server = http.createServer(app);
  
  // Setup Socket.IO
  const io = setupSocketIO(server);
  
  // Make io available globally for other modules
  app.set('io', io);
  
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📡 Socket.IO server initialized`);
    console.log(`🌱 UrbanSprout Backend is ready!`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use.`);
      if (attemptsLeft > 0) {
        const nextPort = port + 1;
        console.warn(`🔁 Retrying on port ${nextPort} (remaining attempts: ${attemptsLeft})...`);
        setTimeout(() => startServer(nextPort, attemptsLeft - 1), 500);
      } else {
        console.error('💥 All retry attempts failed.');
        console.error('To free the port on macOS:');
        console.error(`1) lsof -i :${port}`);
        console.error('2) kill -9 <PID>');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

startServer(DEFAULT_PORT);