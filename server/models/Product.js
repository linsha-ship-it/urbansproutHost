const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  regularPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: null
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: true
  },
  archived: {
    type: Boolean,
    default: false
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  specifications: {
    type: Map,
    of: String
  },
  // Discount linking
  linkedDiscount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discount',
    default: null
  },
  // Analytics fields
  salesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  lastSoldAt: {
    type: Date,
    default: null
  },
  // Auto-calculated discount fields (for performance)
  appliedDiscount: {
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
      default: null
    },
    discountName: {
      type: String,
      default: null
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: null
    },
    discountValue: {
      type: Number,
      default: null
    },
    calculatedPrice: {
      type: Number,
      default: null
    },
    appliedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
productSchema.index({ category: 1, published: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ sku: 1 });
productSchema.index({ featured: 1, published: 1 });
productSchema.index({ archived: 1 });

// Virtual for current price (applied discount price if available, otherwise regular price)
productSchema.virtual('currentPrice').get(function() {
  if (this.appliedDiscount && this.appliedDiscount.calculatedPrice) {
    return this.appliedDiscount.calculatedPrice;
  }
  return this.discountPrice || this.regularPrice;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.appliedDiscount && this.appliedDiscount.calculatedPrice && this.regularPrice) {
    return Math.round(((this.regularPrice - this.appliedDiscount.calculatedPrice) / this.regularPrice) * 100);
  }
  if (this.discountPrice && this.regularPrice) {
    return Math.round(((this.regularPrice - this.discountPrice) / this.regularPrice) * 100);
  }
  return 0;
});

// Virtual for active discount info
productSchema.virtual('activeDiscount').get(function() {
  if (this.appliedDiscount && this.appliedDiscount.discountId) {
    return {
      id: this.appliedDiscount.discountId,
      name: this.appliedDiscount.discountName,
      type: this.appliedDiscount.discountType,
      value: this.appliedDiscount.discountValue,
      calculatedPrice: this.appliedDiscount.calculatedPrice,
      appliedAt: this.appliedDiscount.appliedAt
    };
  }
  return null;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);