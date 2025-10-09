const PlantSuggestion = require('../models/PlantSuggestion');
const Plant = require('../models/Plant');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Load plant data from CSV
let plantData = [];

const loadPlantData = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, '../data/plants.csv'))
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        plantData = results;
        resolve(results);
      })
      .on('error', reject);
  });
};

// Initialize plant data on startup
loadPlantData().catch(console.error);

// New function for getting plant suggestions based on user combinations
const getPlantSuggestionsByCombination = async (req, res) => {
  try {
    const { space, sunlight, experience, time, purpose } = req.body;

    // Validate required fields
    if (!space || !sunlight || !experience || !time || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'All combination parameters are required: space, sunlight, experience, time, purpose'
      });
    }

    // Create combination key
    const combinationKey = `${space}_${sunlight}_${experience}_${time}_${purpose}`;

    // Find plant suggestions for this combination
    const plantSuggestion = await PlantSuggestion.findOne({ 
      combinationKey,
      isActive: true 
    });

    if (!plantSuggestion) {
      // If no specific combination found, try to find a similar one or return default
      const fallbackSuggestion = await PlantSuggestion.findOne({
        space,
        sunlight,
        experience,
        isActive: true
      });

      if (!fallbackSuggestion) {
        // Return a default combination
        const defaultSuggestion = await PlantSuggestion.findOne({
          space: 'small',
          sunlight: 'full_sun',
          experience: 'beginner',
          time: 'low',
          purpose: 'food',
          isActive: true
        });

        if (!defaultSuggestion) {
          return res.status(404).json({
            success: false,
            message: 'No plant suggestions found for this combination'
          });
        }

        return res.json({
          success: true,
          plants: defaultSuggestion.plants,
          recommendationMessage: defaultSuggestion.recommendationMessage,
          combinationKey: defaultSuggestion.combinationKey,
          isDefault: true
        });
      }

      return res.json({
        success: true,
        plants: fallbackSuggestion.plants,
        recommendationMessage: fallbackSuggestion.recommendationMessage,
        combinationKey: fallbackSuggestion.combinationKey,
        isFallback: true
      });
    }

    res.json({
      success: true,
      plants: plantSuggestion.plants,
      recommendationMessage: plantSuggestion.recommendationMessage,
      combinationKey: plantSuggestion.combinationKey
    });

  } catch (error) {
    console.error('Error getting plant suggestions by combination:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plant suggestions',
      error: error.message
    });
  }
};

const suggestPlants = async (req, res) => {
  try {
    const { keyword, preferences = {} } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Keyword is required'
      });
    }

    let filteredPlants = [...plantData];

    // Filter based on keyword and preferences
    switch (keyword) {
      case 'specific':
        // Return all plants for specific recommendations
        break;
      
      case 'quick':
      case 'quick_growing':
        filteredPlants = plantData.filter(plant => plant.quick_growing === 'Yes');
        break;
      
      case 'salad':
      case 'salad_plants':
        filteredPlants = plantData.filter(plant => plant.salad_suitable === 'Yes');
        break;
      
      case 'smoothie':
      case 'smoothie_plants':
        filteredPlants = plantData.filter(plant => plant.smoothie_suitable === 'Yes');
        break;
      
      case 'small_space':
        filteredPlants = plantData.filter(plant => 
          plant.space_needed === 'Small' && plant.container_friendly === 'Yes'
        );
        break;
      
      case 'medium_space':
        filteredPlants = plantData.filter(plant => plant.space_needed === 'Medium');
        break;
      
      case 'large_space':
        filteredPlants = plantData.filter(plant => plant.space_needed === 'Large');
        break;
      
      case 'full_sun':
        filteredPlants = plantData.filter(plant => plant.sunlight_requirement === 'Full Sun');
        break;
      
      case 'partial_shade':
        filteredPlants = plantData.filter(plant => plant.sunlight_requirement === 'Partial Shade');
        break;
      
      case 'slow_growing':
        filteredPlants = plantData.filter(plant => parseInt(plant.growing_time_days) > 90);
        break;
      
      case 'indoor':
        filteredPlants = plantData.filter(plant => plant.indoor_suitable === 'Yes');
        break;
      
      case 'outdoor':
        filteredPlants = plantData.filter(plant => plant.indoor_suitable === 'No');
        break;
      
      case 'herbs':
        filteredPlants = plantData.filter(plant => plant.category === 'Herb');
        break;
      
      case 'vegetables':
        filteredPlants = plantData.filter(plant => plant.category === 'Vegetable');
        break;
      
      case 'fruits':
        filteredPlants = plantData.filter(plant => plant.category === 'Fruit');
        break;
      
      default:
        // For unknown keywords, return a mix of popular plants
        filteredPlants = plantData.filter(plant => 
          plant.quick_growing === 'Yes' || plant.salad_suitable === 'Yes'
        );
    }

    // Apply additional filters based on preferences
    if (preferences.space) {
      filteredPlants = filteredPlants.filter(plant => 
        plant.space_needed.toLowerCase() === preferences.space.toLowerCase()
      );
    }

    if (preferences.sunlight) {
      filteredPlants = filteredPlants.filter(plant => 
        plant.sunlight_requirement.toLowerCase() === preferences.sunlight.toLowerCase()
      );
    }

    if (preferences.time) {
      const maxDays = parseInt(preferences.time);
      filteredPlants = filteredPlants.filter(plant => 
        parseInt(plant.growing_time_days) <= maxDays
      );
    }

    if (preferences.indoor) {
      filteredPlants = filteredPlants.filter(plant => 
        plant.indoor_suitable === 'Yes'
      );
    }

    // Sort by growing time for better recommendations
    filteredPlants.sort((a, b) => parseInt(a.growing_time_days) - parseInt(b.growing_time_days));

    // Limit results
    const limitedPlants = filteredPlants.slice(0, 12);

    res.json({
      success: true,
      plants: limitedPlants,
      total: limitedPlants.length,
      keyword,
      preferences
    });

  } catch (error) {
    console.error('Error suggesting plants:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plant suggestions',
      error: error.message
    });
  }
};

const getAllPlants = async (req, res) => {
  try {
    const {
      plantName,
      sunlight,
      space,
      experience,
      time,
      goal,
      maintenance,
      minDays,
      maxDays,
      search,
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true };
    if (plantName) query.plantName = { $regex: plantName, $options: 'i' };
    if (sunlight) query.sunlight = sunlight;
    if (space) query.space = space;
    if (experience) query.experience = experience;
    if (time) query.time = time;
    if (goal) query.goal = goal;
    if (maintenance) query.maintenance = maintenance;
    if (minDays || maxDays) {
      query.daysToGrow = {};
      if (minDays) query.daysToGrow.$gte = Number(minDays);
      if (maxDays) query.daysToGrow.$lte = Number(maxDays);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [plants, total] = await Promise.all([
      Plant.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Plant.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        plants,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all plants:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plants',
      error: error.message
    });
  }
};

const getPlantById = async (req, res) => {
  try {
    const { id } = req.params;
    const plant = plantData.find(p => p.name.toLowerCase() === id.toLowerCase());
    
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    res.json({
      success: true,
      plant
    });
  } catch (error) {
    console.error('Error fetching plant:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plant',
      error: error.message
    });
  }
};

module.exports = {
  suggestPlants,
  getPlantSuggestionsByCombination,
  getAllPlants,
  getPlantById
};







