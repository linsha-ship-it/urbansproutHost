const express = require('express');
const router = express.Router();
const { suggestPlants, getPlantSuggestionsByCombination, getAllPlants, getPlantById } = require('../controllers/plantController');

// POST /api/plants/suggest - Get plant suggestions based on keyword and preferences
router.post('/suggest', suggestPlants);

// POST /api/plants/suggestions - Get plant suggestions based on user combination
router.post('/suggestions', getPlantSuggestionsByCombination);

// GET /api/plants - Get plants with filters (quiz answers)
router.get('/', getAllPlants);

// GET /api/plants/:id - Get specific plant by name
router.get('/:id', getPlantById);

module.exports = router;







