const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const {
  createRazorpayOrder,
  verifyPayment,
  getCart,
  saveCart,
  getWishlist,
  saveWishlist
} = require('../controllers/storeController');

// GET /store - Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      sort = 'name', 
      order = 'asc', 
      minPrice, 
      maxPrice, 
      search,
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object - only show published, non-archived products, exclude placeholders
    const filter = {
      published: true,
      archived: false,
      name: { $not: /^Placeholder for/ }
    };
    
    if (category && category !== 'all') {
      // Handle URL decoding for emoji characters
      const decodedCategory = decodeURIComponent(category);
      filter.category = decodedCategory;
    }
    
    if (minPrice || maxPrice) {
      filter.$or = [
        { regularPrice: {} },
        { discountPrice: {} }
      ];
      
      if (minPrice) {
        filter.$or[0].regularPrice.$gte = parseFloat(minPrice);
        filter.$or[1].discountPrice.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.$or[0].regularPrice.$lte = parseFloat(maxPrice);
        filter.$or[1].discountPrice.$lte = parseFloat(maxPrice);
      }
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    if (sort === 'price') {
      sortObj.regularPrice = order === 'desc' ? -1 : 1;
    } else if (sort === 'name') {
      sortObj.name = order === 'desc' ? -1 : 1;
    } else if (sort === 'rating') {
      sortObj.rating = order === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = -1; // Default: newest first
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Get categories for filter sidebar
    const categories = await Product.distinct('category');
    
    // Get price range
    const priceRange = await Product.aggregate([
      { $match: { published: true, archived: false } },
      { $group: { 
        _id: null, 
        minPrice: { $min: '$regularPrice' }, 
        maxPrice: { $max: '$regularPrice' } 
      }}
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        },
        filters: {
          categories,
          priceRange: priceRange[0] || { minPrice: 0, maxPrice: 100 }
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// GET /store/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $match: {
          published: true,
          archived: false,
          name: { $not: /^Placeholder for/ }
        }
      },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// GET /store/:id - Get single product details
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get related products (same category, different product)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4).lean();

    res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// POST /store/orders - Create order with hardcoded products
router.post('/orders', auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'Cash on Delivery',
      subtotal,
      shipping = 0,
      tax = 0,
      total,
      status = 'pending',
      notes
    } = req.body;

    // Validate required fields
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total amount'
      });
    }

    // Debug: Log items structure
    console.log('Order items received:', JSON.stringify(items, null, 2));

    // Create order with hardcoded products - SIMPLIFIED
    const order = new Order({
      user: req.user._id,
      items: items.map((item, index) => {
        // Simple, safe ID extraction
        const productId = String(item.id || item._id || item.productId || `temp_${Date.now()}_${index}`);
        
        console.log(`Item ${index}: ${item.name} -> productId: ${productId}`);
        
        return {
          productId: productId,
          name: String(item.name || 'Unknown Product'),
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          image: String(item.image || '')
        };
      }),
      shippingAddress,
      paymentMethod,
      subtotal: subtotal || total,
      shipping,
      tax,
      total,
      status,
      notes
    });

    await order.save();

    // Send order confirmation email (only to non-admin users)
    try {
      const user = await User.findById(req.user._id);
      if (user && user.email && user.role !== 'admin') {
        const orderDetails = {
          orderId: order._id.toString().slice(-8),
          orderNumber: order.orderNumber,
          orderDate: order.createdAt,
          totalAmount: order.total,
          items: order.items.map(item => ({
            name: item.name || 'Plant',
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress: `${order.shippingAddress.fullName}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state || order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          paymentMethod: order.paymentMethod || 'Cash on Delivery',
          paymentStatus: order.paymentMethod === 'Cash on Delivery' ? 'Pending - Pay on Delivery' : 'Paid'
        };

        // Send order confirmation email
        await sendOrderConfirmationEmail(user.email, user.name, orderDetails);
        console.log(`✅ Order confirmation email sent to ${user.email} (${user.role})`);
      } else if (user && user.role === 'admin') {
        console.log(`ℹ️ Skipping email for admin user: ${user.email} (${user.role})`);
      } else {
        console.log(`⚠️ Could not send email - user not found or no email: ${req.user._id}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${validationErrors}`,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// POST /store/order - Create order (dummy checkout)
router.post('/order', auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'Credit Card',
      paymentDetails,
      notes
    } = req.body;

    // Validate required fields
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Validate products and calculate totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Calculate shipping and tax (dummy values)
    const shipping = subtotal > 50 ? 0 : 10; // Free shipping over ₹50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // Create order
    const order = new Order({
      user: req.user._id,
      items: validatedItems,
      shippingAddress,
      paymentMethod,
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      notes
    });

    await order.save();

    // Update product stock (in a real app, this would be in a transaction)
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate product details for response
    await order.populate('items.product', 'name image');

    res.status(201).json({
      success: true,
      data: {
        order,
        message: 'Order placed successfully!'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// GET /store/orders/my - Get user's orders
router.get('/orders/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Razorpay Payment Routes
router.post('/create-order', auth, createRazorpayOrder);
router.post('/verify-payment', auth, verifyPayment);

// Cart Routes
router.get('/cart', auth, getCart);
router.post('/cart', auth, saveCart);

// Wishlist Routes
router.get('/wishlist', auth, getWishlist);
router.post('/wishlist', auth, saveWishlist);

module.exports = router;