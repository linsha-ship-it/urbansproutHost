const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
  {
    plantName: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    benefits: { type: String, required: true },
    daysToGrow: { type: Number, required: true },
    maintenance: { type: String, required: true },
    sunlight: { type: String, required: true, index: true },
    space: { type: String, required: true, index: true },
    experience: { type: String, required: true, index: true },
    time: { type: String, required: true, index: true },
    goal: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

// Basic text index to support searching by name/description/benefits
plantSchema.index({ plantName: 'text', description: 'text', benefits: 'text' });

module.exports = mongoose.model('Plant', plantSchema);