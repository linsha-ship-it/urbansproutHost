const Plant = require('../models/Plant');
const { AppError } = require('../middlewares/errorHandler');
const { asyncHandler } = require('../middlewares/errorHandler');
const fs = require('fs');
const path = require('path');

// Load plant database from CSV
let plantDatabase = [];
try {
  const csvPath = path.join(__dirname, '../../client/src/data/plant_database.csv');
  console.log('Loading plant database from:', csvPath);
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');
  
  plantDatabase = lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',');
    const plant = {};
    headers.forEach((header, index) => {
      plant[header.trim()] = values[index] ? values[index].trim() : '';
    });
    return plant;
  });
  console.log('Loaded', plantDatabase.length, 'plants from CSV');
} catch (error) {
  console.error('Error loading plant database:', error);
  // Fallback to basic plant data
  plantDatabase = [
    {
      name: 'Lettuce',
      type: 'vegetable',
      category: 'leafy_green',
      sunlight: 'low',
      maintenance: 'low',
      space: 'small',
      growTime: '30-45 days',
      description: 'Fast-growing leafy green that tolerates shade',
      tips: 'Harvest outer leaves first, Keep soil moist, Perfect for containers',
      image_url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop',
      features: 'salad,quick_growing,beginner_friendly'
    },
    {
      name: 'Radishes',
      type: 'vegetable',
      category: 'root',
      sunlight: 'full',
      maintenance: 'low',
      space: 'small',
      growTime: '25-30 days',
      description: 'Fastest growing vegetable, perfect for beginners',
      tips: 'Direct sow, Thin seedlings, Harvest when firm',
      image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop',
      features: 'quick_growing,beginner_friendly,root_vegetable'
    },
    {
      name: 'Microgreens',
      type: 'vegetable',
      category: 'leafy_green',
      sunlight: 'full',
      maintenance: 'low',
      space: 'small',
      growTime: '7-14 days',
      description: 'Nutrient-dense baby greens ready in days',
      tips: 'Harvest in 1-2 weeks, Multiple varieties, Year-round growing',
      image_url: 'https://images.unsplash.com/photo-1622207215132-edf4f6f5d8c4?w=300&h=200&fit=crop',
      features: 'superfood,quick_growing,indoor_growing'
    },
    {
      name: 'Cherry Tomatoes',
      type: 'fruit',
      category: 'solanaceae',
      sunlight: 'partial',
      maintenance: 'low',
      space: 'small',
      growTime: '60-80 days',
      description: 'Small sweet tomatoes perfect for containers',
      tips: 'Easier than large tomatoes, Harvest frequently, Support with stakes',
      image_url: 'https://images.unsplash.com/photo-1592841200221-21e1c4e6e8e5?w=300&h=200&fit=crop',
      features: 'container_friendly,sweet_flavor,snacking'
    },
    {
      name: 'Strawberries',
      type: 'fruit',
      category: 'berry',
      sunlight: 'partial',
      maintenance: 'low',
      space: 'small',
      growTime: '90-120 days',
      description: 'Sweet berries that tolerate partial shade',
      tips: 'Plant in spring, Remove runners, Protect from birds',
      image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop',
      features: 'sweet_berry,perennial,container_friendly'
    },
    {
      name: 'Basil',
      type: 'herb',
      category: 'culinary',
      sunlight: 'partial',
      maintenance: 'low',
      space: 'small',
      growTime: '30-60 days',
      description: 'Essential cooking herb with aromatic leaves',
      tips: 'Harvest regularly, Pinch flowers, Great for beginners',
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
      features: 'cooking_essential,aromatic,italian_cuisine'
    },
    {
      name: 'Spinach',
      type: 'vegetable',
      category: 'leafy_green',
      sunlight: 'low',
      maintenance: 'low',
      space: 'small',
      growTime: '40-50 days',
      description: 'Nutritious leafy green for shaded areas',
      tips: 'Cool weather crop, Harvest baby leaves, Succession plant',
      image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop',
      features: 'salad,superfood,low_maintenance'
    },
    {
      name: 'Green Onions',
      type: 'vegetable',
      category: 'allium',
      sunlight: 'low',
      maintenance: 'low',
      space: 'small',
      growTime: '60-90 days',
      description: 'Easy to grow, regrows from kitchen scraps',
      tips: 'Regrows from roots, Harvest green tops, Very low maintenance',
      image_url: 'https://images.unsplash.com/photo-1553395572-0b35b5d9b9b5?w=300&h=200&fit=crop',
      features: 'regrowable,cooking_essential,beginner_friendly'
    },
    {
      name: 'Arugula',
      type: 'vegetable',
      category: 'leafy_green',
      sunlight: 'partial',
      maintenance: 'low',
      space: 'small',
      growTime: '25-40 days',
      description: 'Peppery leafy green perfect for salads',
      tips: 'Quick growing, Harvest baby leaves, Peppery flavor',
      image_url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop',
      features: 'peppery_flavor,salad_green,quick_growing'
    },
    {
      name: 'Cilantro',
      type: 'herb',
      category: 'culinary',
      sunlight: 'partial',
      maintenance: 'low',
      space: 'small',
      growTime: '30-45 days',
      description: 'Fresh herb popular in Mexican and Asian cuisine',
      tips: 'Harvest leaves early, Goes to seed quickly, Cool weather crop',
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
      features: 'mexican_cuisine,asian_cuisine,fresh_flavor'
    },
    {
      name: 'Parsley',
      type: 'herb',
      category: 'culinary',
      sunlight: 'partial',
      maintenance: 'low',
      space: 'small',
      growTime: '40-60 days',
      description: 'Classic garnish herb with mild flavor',
      tips: 'Biennial plant, Harvest outer leaves, Rich in vitamins',
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
      features: 'garnish,mediterranean_cuisine,vitamin_rich'
    },
    {
      name: 'Mint',
      type: 'herb',
      category: 'culinary',
      sunlight: 'partial',
      maintenance: 'low',
      space: 'small',
      growTime: '30-45 days',
      description: 'Refreshing herb perfect for drinks and cooking',
      tips: 'Spreads quickly, Harvest regularly, Great for beverages',
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
      features: 'refreshing,beverage_herb,spreading_habit'
    },
    {
      name: 'Kale',
      type: 'vegetable',
      category: 'leafy_green',
      sunlight: 'low',
      maintenance: 'low',
      space: 'medium',
      growTime: '50-65 days',
      description: 'Hardy superfood that grows in partial shade',
      tips: 'Cold tolerant, Harvest outer leaves, Grows well in containers',
      image_url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=300&h=200&fit=crop',
      features: 'superfood,salad,smoothie_ingredient'
    },
    {
      name: 'Swiss Chard',
      type: 'vegetable',
      category: 'leafy_green',
      sunlight: 'low',
      maintenance: 'low',
      space: 'medium',
      growTime: '45-60 days',
      description: 'Colorful leafy green with edible stems',
      tips: 'Cut and come again, Colorful varieties, Heat tolerant',
      image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=200&fit=crop',
      features: 'colorful,salad,cooking_vegetable'
    },
    {
      name: 'Cucumber',
      type: 'vegetable',
      category: 'cucurbit',
      sunlight: 'full',
      maintenance: 'medium',
      space: 'medium',
      growTime: '50-70 days',
      description: 'Refreshing climbing vegetable for hot weather',
      tips: 'Climbing variety, Regular watering, Harvest frequently',
      image_url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300&h=200&fit=crop',
      features: 'refreshing,climbing_vine,salad_ingredient'
    },
    {
      name: 'Bell Peppers',
      type: 'vegetable',
      category: 'solanaceae',
      sunlight: 'full',
      maintenance: 'medium',
      space: 'medium',
      growTime: '70-90 days',
      description: 'Sweet colorful peppers perfect for cooking',
      tips: 'Warm season crop, Support heavy fruits, Harvest when colored',
      image_url: 'https://images.unsplash.com/photo-1583662017845-4bfb0b2b2e8e?w=300&h=200&fit=crop',
      features: 'sweet_flavor,cooking_vegetable,colorful'
    },
    {
      name: 'Zucchini',
      type: 'vegetable',
      category: 'cucurbit',
      sunlight: 'full',
      maintenance: 'medium',
      space: 'medium',
      growTime: '45-60 days',
      description: 'Prolific summer squash with versatile uses',
      tips: 'Harvest young fruits, Regular watering, Great for cooking',
      image_url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300&h=200&fit=crop',
      features: 'prolific,cooking_vegetable,summer_crop'
    },
    {
      name: 'Blueberries',
      type: 'fruit',
      category: 'berry',
      sunlight: 'partial',
      maintenance: 'medium',
      space: 'medium',
      growTime: '365+ days',
      description: 'Sweet antioxidant-rich berries',
      tips: 'Acidic soil needed, Prune annually, Multiple harvests',
      image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop',
      features: 'antioxidant_rich,perennial,sweet_berry'
    },
    {
      name: 'Raspberries',
      type: 'fruit',
      category: 'berry',
      sunlight: 'partial',
      maintenance: 'medium',
      space: 'medium',
      growTime: '365+ days',
      description: 'Sweet tart berries perfect for desserts',
      tips: 'Perennial canes, Prune after fruiting, Support needed',
      image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop',
      features: 'perennial,sweet_berry,climbing_habit'
    }
  ];
}

// Session management for conversation flow
const userSessions = new Map();

// Conversation flow states
const conversationFlows = {
  INITIAL: 'initial',
  SUNLIGHT_QUESTION: 'sunlight_question',
  MAINTENANCE_QUESTION: 'maintenance_question', 
  SPACE_QUESTION: 'space_question',
  RECOMMENDATIONS: 'recommendations',
  BEGINNER_FOLLOWUP: 'beginner_followup',
  QUICK_FOLLOWUP: 'quick_followup'
};

// Session management functions
function getSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      step: conversationFlows.INITIAL,
      data: {},
      timestamp: Date.now()
    });
  }
  return userSessions.get(userId);
}

function updateSession(userId, step, data = {}) {
  const session = getSession(userId);
  session.step = step;
  session.data = { ...session.data, ...data };
  session.timestamp = Date.now();
  userSessions.set(userId, session);
}

// Plant recommendation function based on collected conditions
function getPlantRecommendations(sunlight, maintenance, space, preferences = {}) {
  let filteredPlants = [...plantDatabase];
  
  // Filter by sunlight
  if (sunlight) {
    filteredPlants = filteredPlants.filter(plant => 
      plant.sunlight === sunlight || 
      (sunlight === 'partial' && (plant.sunlight === 'low' || plant.sunlight === 'full'))
    );
  }
  
  // Filter by maintenance level
  if (maintenance) {
    filteredPlants = filteredPlants.filter(plant => plant.maintenance === maintenance);
  }
  
  // Filter by space
  if (space) {
    filteredPlants = filteredPlants.filter(plant => plant.space === space);
  }
  
  // Filter by specific preferences
  if (preferences.quickGrowing) {
    filteredPlants = filteredPlants.filter(plant => {
      const growTime = plant.growTime || '';
      const daysMatch = growTime.match(/(\d+)-?(\d+)?\s*days?/);
      if (daysMatch) {
        const maxDays = daysMatch[2] ? parseInt(daysMatch[2]) : parseInt(daysMatch[1]);
        return maxDays <= 60;
      }
      return false;
    });
  }
  
  if (preferences.beginner) {
    filteredPlants = filteredPlants.filter(plant => 
      plant.features.includes('beginner_friendly') || 
      plant.maintenance === 'low' ||
      plant.type === 'herb' ||
      (plant.type === 'vegetable' && plant.maintenance === 'low')
    );
  }
  
  // Return top 6 recommendations
  return filteredPlants.slice(0, 6);
}

// Store item recommendation function - now returns actual product IDs
async function getStoreRecommendations(space, maintenance) {
  const Product = require('../models/Product');
  
  try {
    // Get chatbot recommended products
    const recommendedProducts = await Product.find({ chatbotRecommended: true })
      .select('_id name price description category image')
      .limit(4);
    
    return recommendedProducts.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      category: product.category,
      image: product.image
    }));
  } catch (error) {
    console.error('Error fetching store recommendations:', error);
    // Fallback to generic recommendations
    return [
      { name: "Small Ceramic Pots", description: "Perfect for herbs and small vegetables", category: "container" },
      { name: "Hand Trowel", description: "Essential for planting and transplanting", category: "tool" }
    ];
  }
}

// Specific recommendations based on user preferences
function getSpecificRecommendations(space, time, sunlight) {
  let plants = [];
  
  // Filter plants based on space, time, and sunlight
  if (space === 'small' || space === 'indoor') {
    plants = plantDatabase.filter(plant => 
      plant.space === 'small' && 
      plant.maintenance === 'low' &&
      (plant.sunlight === sunlight || plant.sunlight === 'partial')
    );
  } else if (space === 'medium') {
    plants = plantDatabase.filter(plant => 
      (plant.space === 'small' || plant.space === 'medium') &&
      (plant.maintenance === 'low' || plant.maintenance === 'medium') &&
      (plant.sunlight === sunlight || plant.sunlight === 'partial')
    );
  } else if (space === 'large') {
    plants = plantDatabase.filter(plant => 
      plant.maintenance !== 'high' &&
      (plant.sunlight === sunlight || plant.sunlight === 'partial' || plant.sunlight === 'full')
    );
  }
  
  return {
    plants: plants.slice(0, 6),
    space: space,
    time: time,
    sunlight: sunlight
  };
}

// Fruit recommendations
function getFruitRecommendations(space, time, sunlight) {
  const fruits = [
    {
      name: "Strawberries",
      type: "fruit",
      growTime: "60-90 days",
      sunlight: "partial",
      maintenance: "low",
      space: "small",
      description: "Sweet, juicy berries perfect for containers. Produces runners for easy propagation.",
      features: ["beginner_friendly", "container_growing", "perennial"],
      image: "🍓"
    },
    {
      name: "Cherry Tomatoes",
      type: "fruit",
      growTime: "75-85 days",
      sunlight: "full",
      maintenance: "medium",
      space: "medium",
      description: "Small, sweet tomatoes that are easier to grow than large varieties. Great for snacking!",
      features: ["beginner_friendly", "container_growing", "high_yield"],
      image: "🍅"
    },
    {
      name: "Blueberries",
      type: "fruit",
      growTime: "2-3 years",
      sunlight: "partial",
      maintenance: "medium",
      space: "medium",
      description: "Nutrient-rich berries that thrive in acidic soil. Perfect for health-conscious gardeners.",
      features: ["perennial", "nutrient_dense", "acidic_soil"],
      image: "🫐"
    },
    {
      name: "Raspberries",
      type: "fruit",
      growTime: "1-2 years",
      sunlight: "partial",
      maintenance: "medium",
      space: "large",
      description: "Delicate, sweet berries that spread easily. Great for jams and fresh eating.",
      features: ["perennial", "spreading", "high_yield"],
      image: "🫐"
    },
    {
      name: "Lemon Tree",
      type: "fruit",
      growTime: "2-3 years",
      sunlight: "full",
      maintenance: "medium",
      space: "medium",
      description: "Dwarf varieties perfect for containers. Fresh lemons year-round!",
      features: ["perennial", "container_growing", "citrus"],
      image: "🍋"
    },
    {
      name: "Fig Tree",
      type: "fruit",
      growTime: "2-3 years",
      sunlight: "full",
      maintenance: "low",
      space: "large",
      description: "Sweet, unique fruits that are surprisingly easy to grow. Drought tolerant.",
      features: ["perennial", "drought_tolerant", "unique_flavor"],
      image: "🍯"
    }
  ];
  
  // Filter based on user preferences
  let filteredFruits = fruits;
  
  if (space === 'small' || space === 'indoor') {
    filteredFruits = fruits.filter(fruit => fruit.space === 'small');
  } else if (space === 'medium') {
    filteredFruits = fruits.filter(fruit => fruit.space !== 'large');
  }
  
  if (time === 'low') {
    filteredFruits = filteredFruits.filter(fruit => fruit.maintenance === 'low');
  } else if (time === 'medium') {
    filteredFruits = filteredFruits.filter(fruit => fruit.maintenance !== 'high');
  }
  
  if (sunlight === 'low') {
    filteredFruits = filteredFruits.filter(fruit => fruit.sunlight === 'partial');
  } else if (sunlight === 'partial') {
    filteredFruits = filteredFruits.filter(fruit => fruit.sunlight !== 'full');
  }
  
  return filteredFruits.slice(0, 4);
}

// Vegetable recommendations
function getVegetableRecommendations(space, time, sunlight) {
  const vegetables = [
    {
      name: "Lettuce",
      type: "vegetable",
      growTime: "30-45 days",
      sunlight: "partial",
      maintenance: "low",
      space: "small",
      description: "Fast-growing leafy green perfect for salads. Harvest outer leaves for continuous growth.",
      features: ["beginner_friendly", "quick_growing", "continuous_harvest"],
      image: "🥬"
    },
    {
      name: "Spinach",
      type: "vegetable",
      growTime: "40-50 days",
      sunlight: "partial",
      maintenance: "low",
      space: "small",
      description: "Nutrient-packed leafy green that grows well in cool weather. Great for smoothies!",
      features: ["beginner_friendly", "nutrient_dense", "cool_weather"],
      image: "🥬"
    },
    {
      name: "Carrots",
      type: "vegetable",
      growTime: "70-80 days",
      sunlight: "partial",
      maintenance: "low",
      space: "medium",
      description: "Sweet, crunchy root vegetables. Choose shorter varieties for containers.",
      features: ["beginner_friendly", "root_vegetable", "sweet_flavor"],
      image: "🥕"
    },
    {
      name: "Bell Peppers",
      type: "vegetable",
      growTime: "75-90 days",
      sunlight: "full",
      maintenance: "medium",
      space: "medium",
      description: "Colorful, sweet peppers perfect for cooking. Start with green varieties.",
      features: ["colorful", "sweet_flavor", "versatile_cooking"],
      image: "🫑"
    },
    {
      name: "Zucchini",
      type: "vegetable",
      growTime: "50-60 days",
      sunlight: "full",
      maintenance: "medium",
      space: "large",
      description: "High-yielding summer squash. One plant can feed a family!",
      features: ["high_yield", "summer_crop", "versatile_cooking"],
      image: "🥒"
    },
    {
      name: "Broccoli",
      type: "vegetable",
      growTime: "60-80 days",
      sunlight: "partial",
      maintenance: "medium",
      space: "medium",
      description: "Nutrient-rich cruciferous vegetable. Great for cool weather growing.",
      features: ["nutrient_dense", "cool_weather", "cruciferous"],
      image: "🥦"
    },
    {
      name: "Green Beans",
      type: "vegetable",
      growTime: "50-60 days",
      sunlight: "full",
      maintenance: "low",
      space: "medium",
      description: "Easy-to-grow legumes that fix nitrogen in soil. Great for beginners!",
      features: ["beginner_friendly", "nitrogen_fixing", "high_yield"],
      image: "🫛"
    },
    {
      name: "Radishes",
      type: "vegetable",
      growTime: "25-30 days",
      sunlight: "partial",
      maintenance: "low",
      space: "small",
      description: "Super fast-growing root vegetable. Perfect for impatient gardeners!",
      features: ["quick_growing", "beginner_friendly", "spicy_flavor"],
      image: "🥕"
    }
  ];
  
  // Filter based on user preferences
  let filteredVegetables = vegetables;
  
  if (space === 'small' || space === 'indoor') {
    filteredVegetables = vegetables.filter(veg => veg.space === 'small');
  } else if (space === 'medium') {
    filteredVegetables = vegetables.filter(veg => veg.space !== 'large');
  }
  
  if (time === 'low') {
    filteredVegetables = filteredVegetables.filter(veg => veg.maintenance === 'low');
  } else if (time === 'medium') {
    filteredVegetables = filteredVegetables.filter(veg => veg.maintenance !== 'high');
  }
  
  if (sunlight === 'low') {
    filteredVegetables = filteredVegetables.filter(veg => veg.sunlight === 'partial');
  } else if (sunlight === 'partial') {
    filteredVegetables = filteredVegetables.filter(veg => veg.sunlight !== 'full');
  }
  
  return filteredVegetables.slice(0, 6);
}

// Enhanced conversation processing
async function processConversationMessage(userId, message) {
  const msg = message.toLowerCase().trim();
  
  // Restart/Start over
  if (msg.includes('start over') || msg.includes('restart') || (msg.includes('begin') && !msg.includes('beginner'))) {
    return {
      message: "Let's start fresh! I'll help you find the perfect plants to grow. 🌱",
      buttons: ["Beginner plants", "Quick growing plants", "Fruits", "Vegetables", "Herbs", "Outdoor plants"],
      step: "initial"
    };
  }
  
  // Beginner plants
  if (msg.includes('beginner') || msg.includes('easy') || msg.includes('simple')) {
    const beginnerPlants = getPlantRecommendations(null, 'low', 'small', { beginner: true });
    const beginnerStoreItems = await getStoreRecommendations('small', 'low');
    
    return {
      message: "Perfect! Here are easy plants for beginners:",
      plants: beginnerPlants,
      storeItems: beginnerStoreItems,
      buttons: ["Quick growing plants", "Fruits", "Vegetables", "Herbs", "Start over"],
      step: "beginner"
    };
  }
  
  // Quick growing plants
  if (msg.includes('quick') || msg.includes('fast') || msg.includes('speed')) {
    const quickPlants = getPlantRecommendations(null, 'low', 'small', { quickGrowing: true });
    const quickStoreItems = await getStoreRecommendations('small', 'low');
    
    return {
      message: "Great choice! Here are fast-growing plants:",
      plants: quickPlants,
      storeItems: quickStoreItems,
      buttons: ["Beginner plants", "Fruits", "Vegetables", "Herbs", "Start over"],
      step: "quick"
    };
  }
  
  // Fruits
  if (msg.includes('fruits') || msg.includes('fruit')) {
    const fruitPlants = getFruitRecommendations('medium', 'medium', 'partial');
    const fruitStoreItems = await getStoreRecommendations('medium', 'medium');
    
    return {
      message: "Delicious! Here are great fruits to grow:",
      plants: fruitPlants,
      storeItems: fruitStoreItems,
      buttons: ["Beginner plants", "Quick growing plants", "Vegetables", "Herbs", "Start over"],
      step: "fruits"
    };
  }
  
  // Outdoor plants
  if (msg.includes('outdoor') || msg.includes('garden') || msg.includes('yard')) {
    const outdoorPlants = getPlantRecommendations('full', 'medium', 'large', { outdoor: true });
    const outdoorStoreItems = await getStoreRecommendations('large', 'medium');
    
        return {
      message: "Great for outdoor growing! Here are excellent outdoor plants:",
      plants: outdoorPlants,
      storeItems: outdoorStoreItems,
      buttons: ["Beginner plants", "Quick growing plants", "Fruits", "Vegetables", "Start over"],
      step: "outdoor"
    };
  }
  
  // Herbs
  if (msg.includes('herb') || msg.includes('spice') || msg.includes('cooking')) {
    const herbPlants = getPlantRecommendations('partial', 'low', 'small', { herbs: true });
    const herbStoreItems = await getStoreRecommendations('small', 'low');
        
        return {
      message: "Delicious herbs for cooking! Here are great herbs to grow:",
      plants: herbPlants,
      storeItems: herbStoreItems,
      buttons: ["Beginner plants", "Quick growing plants", "Fruits", "Vegetables", "Start over"],
      step: "herbs"
    };
  }
  
  // Specific recommendations - enhanced flow
  if (msg.includes('specific') || msg.includes('custom') || msg.includes('recommendations')) {
        return {
      message: "Perfect! Let's find the ideal plants for your specific situation. First, tell me about your available space:",
      buttons: ["Small space (balcony/windowsill)", "Medium space (patio/small garden)", "Large space (backyard/garden)", "Indoor only"],
      step: "space_question"
    };
  }
  
  // Space questions
  if (msg.includes('small space') || msg.includes('balcony') || msg.includes('windowsill')) {
        return {
      message: "Great! Small spaces are perfect for container gardening. Now, how much time can you dedicate to gardening?",
      buttons: ["Very little time (5-10 min/week)", "Some time (15-30 min/week)", "Moderate time (30-60 min/week)", "Lots of time (1+ hours/week)"],
      step: "time_question",
      userData: { space: 'small' }
    };
  }
  
  if (msg.includes('medium space') || msg.includes('patio') || msg.includes('small garden')) {
        return {
      message: "Excellent! Medium spaces offer great flexibility. How much time can you dedicate to gardening?",
      buttons: ["Very little time (5-10 min/week)", "Some time (15-30 min/week)", "Moderate time (30-60 min/week)", "Lots of time (1+ hours/week)"],
      step: "time_question",
      userData: { space: 'medium' }
    };
  }
  
  if (msg.includes('large space') || msg.includes('backyard') || msg.includes('garden')) {
        return {
      message: "Fantastic! Large spaces give you endless possibilities. How much time can you dedicate to gardening?",
      buttons: ["Very little time (5-10 min/week)", "Some time (15-30 min/week)", "Moderate time (30-60 min/week)", "Lots of time (1+ hours/week)"],
      step: "time_question",
      userData: { space: 'large' }
    };
  }
  
  if (msg.includes('indoor only') || msg.includes('indoor')) {
        return {
      message: "Perfect! Indoor gardening is wonderful. How much time can you dedicate to plant care?",
      buttons: ["Very little time (5-10 min/week)", "Some time (15-30 min/week)", "Moderate time (30-60 min/week)", "Lots of time (1+ hours/week)"],
      step: "time_question",
      userData: { space: 'indoor' }
    };
  }
  
  // Time questions
  if (msg.includes('very little time') || msg.includes('5-10 min')) {
        return {
      message: "Perfect! Low-maintenance plants are ideal for busy schedules. Finally, what's your sunlight situation?",
      buttons: ["Low sunlight (shade/indoor)", "Partial sunlight (morning sun)", "Full sunlight (6+ hours)", "I'm not sure"],
      step: "sunlight_question",
      userData: { space: 'small', time: 'low' }
    };
  }
  
  if (msg.includes('some time') || msg.includes('15-30 min')) {
        return {
      message: "Great! You have enough time for regular care. What's your sunlight situation?",
      buttons: ["Low sunlight (shade/indoor)", "Partial sunlight (morning sun)", "Full sunlight (6+ hours)", "I'm not sure"],
      step: "sunlight_question",
      userData: { space: 'medium', time: 'medium' }
    };
  }
  
  if (msg.includes('moderate time') || msg.includes('30-60 min')) {
        return {
      message: "Excellent! You can handle more demanding plants. What's your sunlight situation?",
      buttons: ["Low sunlight (shade/indoor)", "Partial sunlight (morning sun)", "Full sunlight (6+ hours)", "I'm not sure"],
      step: "sunlight_question",
      userData: { space: 'medium', time: 'high' }
    };
  }
  
  if (msg.includes('lots of time') || msg.includes('1+ hours')) {
        return {
      message: "Wonderful! You can grow almost anything! What's your sunlight situation?",
      buttons: ["Low sunlight (shade/indoor)", "Partial sunlight (morning sun)", "Full sunlight (6+ hours)", "I'm not sure"],
      step: "sunlight_question",
      userData: { space: 'large', time: 'very_high' }
    };
  }
  
  // Sunlight questions - provide final recommendations
  if (msg.includes('low sunlight') || msg.includes('shade') || msg.includes('indoor')) {
    const recommendations = getSpecificRecommendations('small', 'low', 'low');
    const storeItems = await getStoreRecommendations('small', 'low');
    
        return {
      message: "Perfect! Based on your preferences (small space, low maintenance, low light), here are my top recommendations:",
      plants: recommendations.plants,
      storeItems: storeItems,
      buttons: ["Show me different options", "What about fruits?", "What about vegetables?", "Start over"],
      step: "recommendations_complete"
    };
  }
  
  if (msg.includes('partial sunlight') || msg.includes('morning sun')) {
    const recommendations = getSpecificRecommendations('medium', 'medium', 'partial');
    const storeItems = await getStoreRecommendations('medium', 'medium');
    
        return {
      message: "Great choice! Based on your preferences (medium space, moderate time, partial sun), here are my recommendations:",
      plants: recommendations.plants,
      storeItems: storeItems,
      buttons: ["Show me different options", "What about fruits?", "What about vegetables?", "Start over"],
      step: "recommendations_complete"
    };
  }
  
  if (msg.includes('full sunlight') || msg.includes('6+ hours')) {
    const recommendations = getSpecificRecommendations('large', 'high', 'full');
    const storeItems = await getStoreRecommendations('large', 'high');
    
        return {
      message: "Excellent! Based on your preferences (large space, plenty of time, full sun), here are my recommendations:",
      plants: recommendations.plants,
      storeItems: storeItems,
      buttons: ["Show me different options", "What about fruits?", "What about vegetables?", "Start over"],
      step: "recommendations_complete"
    };
  }
  
  if (msg.includes('not sure')) {
    return {
      message: "No worries! Let's start with versatile plants that adapt to different light conditions. Based on your space and time preferences:",
      plants: getSpecificRecommendations('medium', 'medium', 'partial').plants,
      storeItems: await getStoreRecommendations('medium', 'medium'),
      buttons: ["Show me different options", "What about fruits?", "What about vegetables?", "Start over"],
      step: "recommendations_complete"
    };
  }
  
  // Fruit and vegetable specific requests
  if (msg.includes('fruits') || msg.includes('fruit')) {
    const fruitRecommendations = getFruitRecommendations('medium', 'medium', 'partial');
    const storeItems = await getStoreRecommendations('medium', 'medium');
        
        return {
      message: "Delicious! Here are the best fruits for your growing conditions:",
      plants: fruitRecommendations,
          storeItems: storeItems,
      buttons: ["Show me vegetables", "Show me herbs", "Show me different fruits", "Start over"],
      step: "fruit_recommendations"
    };
  }
  
  if (msg.includes('vegetables') || msg.includes('veggie')) {
    const vegetableRecommendations = getVegetableRecommendations('medium', 'medium', 'partial');
    const storeItems = await getStoreRecommendations('medium', 'medium');
        
        return {
      message: "Nutritious! Here are the best vegetables for your growing conditions:",
      plants: vegetableRecommendations,
          storeItems: storeItems,
      buttons: ["Show me fruits", "Show me herbs", "Show me different vegetables", "Start over"],
      step: "vegetable_recommendations"
    };
  }
  
  // Simple fallback - if no keywords match, show initial options
  return {
    message: "I'd love to help you find the perfect plants! Choose what interests you:",
    buttons: ["Beginner plants", "Quick growing plants", "Fruits", "Vegetables", "Herbs", "Outdoor plants"],
    step: "initial"
  };
}

// @desc    Process chatbot message
// @route   POST /api/chatbot/message
// @access  Public
const processMessage = asyncHandler(async (req, res) => {
  const { message, userId } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  // Use the enhanced conversation processing
  const response = await processConversationMessage(userId || 'anonymous', message);

  res.json({
    success: true,
    data: response
  });
});

// @desc    Get plant care tips
// @route   GET /api/chatbot/tips
// @access  Public
const getCareTips = asyncHandler(async (req, res) => {
  const tips = [
    {
      category: 'Watering',
      tip: "Check soil moisture with your finger before watering. Most plants prefer to dry out slightly between waterings.",
      icon: '💧'
    },
    {
      category: 'Light',
      tip: "Rotate your plants weekly to ensure even growth and prevent them from leaning toward the light source.",
      icon: '☀️'
    },
    {
      category: 'Humidity',
      tip: "Group plants together or use a pebble tray with water to increase humidity around your plants.",
      icon: '💨'
    },
    {
      category: 'Cleaning',
      tip: "Dust plant leaves regularly with a damp cloth to help them photosynthesize more efficiently.",
      icon: '🧽'
    },
    {
      category: 'Observation',
      tip: "Check your plants regularly for signs of pests, disease, or stress. Early detection makes treatment easier.",
      icon: '👀'
    }
  ];

  // Return a random tip
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  res.json({
    success: true,
    data: {
      tip: randomTip,
      allTips: tips
    }
  });
});

// @desc    Get plant identification help
// @route   POST /api/chatbot/identify
// @access  Public
const identifyPlant = asyncHandler(async (req, res) => {
  const { description, characteristics } = req.body;

  if (!description) {
    return res.status(400).json({
      success: false,
      message: 'Plant description is required'
    });
  }

  // Simple plant identification based on keywords
  const identificationGuide = {
    'thick leaves': ['succulent', 'jade plant', 'aloe vera'],
    'heart shaped': ['pothos', 'philodendron', 'monstera'],
    'long thin leaves': ['snake plant', 'spider plant', 'dracaena'],
    'split leaves': ['monstera', 'fiddle leaf fig'],
    'trailing': ['pothos', 'ivy', 'string of pearls'],
    'spiky': ['snake plant', 'aloe vera', 'cactus']
  };

  const desc = description.toLowerCase();
  let possiblePlants = [];

  for (const [characteristic, plants] of Object.entries(identificationGuide)) {
    if (desc.includes(characteristic)) {
      possiblePlants.push(...plants);
    }
  }

  // Remove duplicates
  possiblePlants = [...new Set(possiblePlants)];

  let response = "Based on your description, here are some possible matches:";
  if (possiblePlants.length === 0) {
    response = "I couldn't identify your plant from that description. Try describing the leaf shape, size, or growth pattern.";
    possiblePlants = ['pothos', 'snake plant', 'spider plant']; // Default suggestions
  }

  // Try to find these plants in the database
  let matchingPlants = [];
  try {
    for (const plantName of possiblePlants.slice(0, 3)) {
      const plants = await Plant.find({
        name: { $regex: plantName, $options: 'i' },
        isActive: true
      }).limit(1).select('name scientificName images description careInstructions');
      
      matchingPlants.push(...plants);
    }
  } catch (error) {
    console.error('Error fetching matching plants:', error);
  }

  res.json({
    success: true,
    data: {
      response,
      possibleMatches: possiblePlants,
      plants: matchingPlants,
      suggestions: [
        "Can you describe the leaf shape?",
        "How big is the plant?",
        "Does it have flowers?",
        "Is it a trailing or upright plant?"
      ]
    }
  });
});

// @desc    Get seasonal care advice
// @route   GET /api/chatbot/seasonal
// @access  Public
const getSeasonalAdvice = asyncHandler(async (req, res) => {
  const currentMonth = new Date().getMonth(); // 0-11
  let season, advice;

  if (currentMonth >= 2 && currentMonth <= 4) {
    season = 'Spring';
    advice = {
      title: 'Spring Plant Care',
      tips: [
        'Start fertilizing your plants as they enter their growing season',
        'This is the best time for repotting most houseplants',
        'Increase watering frequency as plants become more active',
        'Begin taking cuttings for propagation'
      ],
      icon: '🌸'
    };
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    season = 'Summer';
    advice = {
      title: 'Summer Plant Care',
      tips: [
        'Water more frequently but check soil moisture first',
        'Provide extra humidity during hot, dry weather',
        'Move plants away from air conditioning vents',
        'Continue regular fertilizing schedule'
      ],
      icon: '☀️'
    };
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    season = 'Fall';
    advice = {
      title: 'Fall Plant Care',
      tips: [
        'Reduce fertilizing as plant growth slows down',
        'Begin reducing watering frequency',
        'Bring outdoor plants inside before first frost',
        'Check for pests that may have developed over summer'
      ],
      icon: '🍂'
    };
  } else {
    season = 'Winter';
    advice = {
      title: 'Winter Plant Care',
      tips: [
        'Water less frequently as plants are dormant',
        'Stop fertilizing until spring',
        'Provide extra light with grow lamps if needed',
        'Keep plants away from cold drafts and heating vents'
      ],
      icon: '❄️'
    };
  }

  res.json({
    success: true,
    data: {
      season,
      advice,
      month: new Date().toLocaleString('default', { month: 'long' })
    }
  });
});

module.exports = {
  processMessage,
  getCareTips,
  identifyPlant,
  getSeasonalAdvice
};