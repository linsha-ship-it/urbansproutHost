const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Journal entry cannot exceed 1000 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: [200, 'Image caption cannot exceed 200 characters']
    }
  }],
  growthStage: {
    type: String,
    enum: ['planted', 'germinating', 'growing', 'flowering', 'fruiting', 'harvested'],
    default: 'planted'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

const userGardenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plant: {
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Vegetables', 'Herbs', 'Fruits']
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    growingTime: {
      type: String,
      required: true
    },
    sunlight: {
      type: String,
      required: true
    },
    space: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard']
    },
    price: {
      type: String,
      required: true
    }
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['planted', 'growing', 'harvested', 'completed'],
    default: 'planted'
  },
  journalEntries: [journalEntrySchema],
  currentGrowthStage: {
    type: String,
    enum: ['planted', 'germinating', 'growing', 'flowering', 'fruiting', 'harvested'],
    default: 'planted'
  },
  lastWatered: {
    type: Date
  },
  lastFertilized: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
userGardenSchema.index({ user: 1 });
userGardenSchema.index({ user: 1, 'plant.category': 1 });
userGardenSchema.index({ user: 1, status: 1 });
userGardenSchema.index({ user: 1, addedDate: -1 });

// Ensure one plant per user (no duplicates)
userGardenSchema.index({ user: 1, 'plant.name': 1 }, { unique: true });

module.exports = mongoose.model('UserGarden', userGardenSchema);






