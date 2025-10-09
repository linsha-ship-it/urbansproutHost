const UserGarden = require('../models/UserGarden');
const authenticateToken = require('../middleware/auth');

// Add plant to user's garden
const addPlantToGarden = async (req, res) => {
  try {
    const { plant } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!plant) {
      return res.status(400).json({
        success: false,
        message: 'Plant data is required'
      });
    }

    // Check if plant already exists in user's garden
    const existingPlant = await UserGarden.findOne({
      user: userId,
      'plant.name': plant.name
    });

    if (existingPlant) {
      return res.status(400).json({
        success: false,
        message: `${plant.name} is already in your garden!`
      });
    }

    // Normalize plant fields to match schema if coming from dynamic Plant API
    const normalizedPlant = plant.name ? plant : {
      name: plant.plantName,
      category: 'Herbs',
      description: plant.description,
      image: plant.imageUrl,
      growingTime: `${plant.daysToGrow} days`,
      sunlight: plant.sunlight,
      space: plant.space,
      difficulty: plant.maintenance || 'Easy',
      price: '—'
    };

    // Create new garden entry
    const gardenEntry = new UserGarden({
      user: userId,
      plant: normalizedPlant,
      addedDate: new Date(),
      status: 'planted',
      currentGrowthStage: 'planted'
    });

    await gardenEntry.save();

    res.json({
      success: true,
      message: `Added ${plant.name} to your garden! 🌱`,
      gardenEntry
    });

  } catch (error) {
    console.error('Error adding plant to garden:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding plant to garden',
      error: error.message
    });
  }
};

// Get user's garden
const getUserGarden = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const garden = await UserGarden.find({
      user: userId,
      isActive: true
    }).sort({ addedDate: -1 });

    res.json({
      success: true,
      garden,
      total: garden.length
    });

  } catch (error) {
    console.error('Error fetching user garden:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching garden',
      error: error.message
    });
  }
};

// Add journal entry to a plant
const addJournalEntry = async (req, res) => {
  try {
    const { plantId } = req.params;
    const { content, images, growthStage, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Journal content is required'
      });
    }

    const gardenEntry = await UserGarden.findOne({
      _id: plantId,
      user: userId,
      isActive: true
    });

    if (!gardenEntry) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found in your garden'
      });
    }

    const journalEntry = {
      content,
      images: images || [],
      growthStage: growthStage || 'growing',
      notes: notes || ''
    };

    gardenEntry.journalEntries.push(journalEntry);
    
    // Update current growth stage if provided
    if (growthStage) {
      gardenEntry.currentGrowthStage = growthStage;
    }

    await gardenEntry.save();

    res.json({
      success: true,
      message: 'Journal entry added successfully',
      journalEntry: gardenEntry.journalEntries[gardenEntry.journalEntries.length - 1]
    });

  } catch (error) {
    console.error('Error adding journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding journal entry',
      error: error.message
    });
  }
};

// Get journal entries for a plant
const getJournalEntries = async (req, res) => {
  try {
    const { plantId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const gardenEntry = await UserGarden.findOne({
      _id: plantId,
      user: userId,
      isActive: true
    });

    if (!gardenEntry) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found in your garden'
      });
    }

    res.json({
      success: true,
      plant: gardenEntry.plant,
      journalEntries: gardenEntry.journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date)),
      currentGrowthStage: gardenEntry.currentGrowthStage,
      addedDate: gardenEntry.addedDate
    });

  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching journal entries',
      error: error.message
    });
  }
};

// Update plant status
const updatePlantStatus = async (req, res) => {
  try {
    const { plantId } = req.params;
    const { status, currentGrowthStage, lastWatered, lastFertilized, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const gardenEntry = await UserGarden.findOne({
      _id: plantId,
      user: userId,
      isActive: true
    });

    if (!gardenEntry) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found in your garden'
      });
    }

    // Update fields if provided
    if (status) gardenEntry.status = status;
    if (currentGrowthStage) gardenEntry.currentGrowthStage = currentGrowthStage;
    if (lastWatered) gardenEntry.lastWatered = new Date(lastWatered);
    if (lastFertilized) gardenEntry.lastFertilized = new Date(lastFertilized);
    if (notes) gardenEntry.notes = notes;

    await gardenEntry.save();

    res.json({
      success: true,
      message: 'Plant status updated successfully',
      gardenEntry
    });

  } catch (error) {
    console.error('Error updating plant status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating plant status',
      error: error.message
    });
  }
};

// Remove plant from garden
const removePlantFromGarden = async (req, res) => {
  try {
    const { plantId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const gardenEntry = await UserGarden.findOne({
      _id: plantId,
      user: userId,
      isActive: true
    });

    if (!gardenEntry) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found in your garden'
      });
    }

    gardenEntry.isActive = false;
    await gardenEntry.save();

    res.json({
      success: true,
      message: 'Plant removed from garden successfully'
    });

  } catch (error) {
    console.error('Error removing plant from garden:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing plant from garden',
      error: error.message
    });
  }
};

module.exports = {
  addPlantToGarden,
  getUserGarden,
  addJournalEntry,
  getJournalEntries,
  updatePlantStatus,
  removePlantFromGarden
};

