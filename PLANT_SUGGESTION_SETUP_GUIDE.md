# Plant Suggestion System Setup Guide

## Overview
This guide will help you set up and use the plant suggestion system with MongoDB and Postman for testing.

## 🗄️ MongoDB Setup & Access

### 1. Connect to Your MongoDB Database

#### Option A: Using MongoDB Compass (GUI)
1. Download and install [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Open MongoDB Compass
3. Connect using your connection string (usually from your `.env` file)
4. Navigate to your database (likely named `urbansprout` or similar)
5. Find the `plants` collection

#### Option B: Using MongoDB Shell (Command Line)
```bash
# Connect to your MongoDB instance
mongosh "your_connection_string"

# Switch to your database
use your_database_name

# View collections
show collections

# Access the plants collection
db.plants.find()
```

#### Option C: Using VS Code MongoDB Extension
1. Install the "MongoDB for VS Code" extension
2. Connect to your MongoDB instance
3. Browse your database and collections

### 2. View Your Plants Collection
Once connected, you can:
- View all plants: `db.plants.find()`
- Count plants: `db.plants.countDocuments()`
- Find specific plants: `db.plants.find({category: "herbs"})`

## 🚀 API Endpoints for Postman Testing

### Base URL
```
http://localhost:5000/api/plants
```

### 1. Create a New Plant (POST)
**Endpoint:** `POST /api/plants`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "plantName": "Cherry Tomato",
  "imageUrl": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop&q=80",
  "description": "Small, sweet tomatoes perfect for containers.",
  "benefits": "Rich in vitamin C, lycopene, and antioxidants.",
  "daysToGrow": 75,
  "maintenance": "Regular watering, occasional pruning",
  "sunlight": "full_sun",
  "space": "small",
  "experience": "beginner",
  "time": "medium",
  "category": "vegetables",
  "price": "₹30-50",
  "difficulty": "Easy",
  "growingTime": "60-75 days"
}
```

### 2. Get Plant Suggestions by Quiz (GET)
**Endpoint:** `GET /api/plants/quiz`

**Query Parameters:**
```
?sunlight=full_sun&space=small&experience=beginner&time=low
```

**Example URL:**
```
http://localhost:5000/api/plants/quiz?sunlight=full_sun&space=small&experience=beginner&time=low
```

### 3. Get All Plants (GET)
**Endpoint:** `GET /api/plants`

**Query Parameters (optional):**
```
?page=1&limit=10&category=herbs&sunlight=full_sun
```

### 4. Get Plant by ID (GET)
**Endpoint:** `GET /api/plants/:id`

**Example:**
```
http://localhost:5000/api/plants/64a1b2c3d4e5f6789012345
```

### 5. Update a Plant (PUT)
**Endpoint:** `PUT /api/plants/:id`

**Body (JSON):**
```json
{
  "plantName": "Updated Plant Name",
  "price": "₹40-60"
}
```

### 6. Delete a Plant (DELETE)
**Endpoint:** `DELETE /api/plants/:id`

### 7. Search Plants (GET)
**Endpoint:** `GET /api/plants/search`

**Query Parameters:**
```
?q=tomato&page=1&limit=5
```

### 8. Get Plants by Category (GET)
**Endpoint:** `GET /api/plants/category/:category`

**Example:**
```
http://localhost:5000/api/plants/category/herbs
```

## 📝 Postman Collection Setup

### 1. Create a New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it "UrbanSprout Plants API"

### 2. Add Environment Variables
1. Click the gear icon (top right)
2. Add new environment "UrbanSprout Local"
3. Add variables:
   - `base_url`: `http://localhost:5000/api/plants`
   - `plant_id`: (leave empty, will be set after creating a plant)

### 3. Create Requests

#### Create Plant Request
- Method: POST
- URL: `{{base_url}}`
- Headers: `Content-Type: application/json`
- Body: Use the JSON example above

#### Get Quiz Suggestions Request
- Method: GET
- URL: `{{base_url}}/quiz?sunlight=full_sun&space=small&experience=beginner&time=low`

#### Get All Plants Request
- Method: GET
- URL: `{{base_url}}`

## 🧪 Testing the Quiz System

### Test Different Quiz Combinations

1. **Beginner, Small Space, Full Sun, Low Maintenance:**
   ```
   GET /api/plants/quiz?sunlight=full_sun&space=small&experience=beginner&time=low
   ```

2. **Intermediate, Medium Space, Partial Sun, Medium Maintenance:**
   ```
   GET /api/plants/quiz?sunlight=partial_sun&space=medium&experience=intermediate&time=medium
   ```

3. **Advanced, Large Space, Shade, High Maintenance:**
   ```
   GET /api/plants/quiz?sunlight=shade&space=large&experience=advanced&time=high
   ```

## 📊 Valid Field Values

### Sunlight Options:
- `full_sun`
- `partial_sun`
- `shade`

### Space Options:
- `small`
- `medium`
- `large`

### Experience Options:
- `beginner`
- `intermediate`
- `advanced`

### Time Options:
- `low`
- `medium`
- `high`

### Category Options:
- `vegetables`
- `fruits`
- `herbs`
- `flowers`
- `succulents`

### Difficulty Options:
- `Easy`
- `Moderate`
- `Hard`

## 🔧 Quick Setup Steps

1. **Start your server:**
   ```bash
   cd server
   npm start
   ```

2. **Import sample data using Postman:**
   - Use the sample-plants.json file
   - Create POST requests for each plant

3. **Test the quiz endpoint:**
   - Try different combinations
   - Verify results match your criteria

4. **Test the frontend:**
   - Go to `/plant-suggestion` page
   - Take the quiz
   - Verify it fetches from your API

## 🐛 Troubleshooting

### Common Issues:

1. **"No plants found" error:**
   - Make sure you have plants in your database
   - Check that field values match exactly (case-sensitive)

2. **Connection errors:**
   - Verify your server is running on port 5000
   - Check your MongoDB connection string

3. **Validation errors:**
   - Ensure all required fields are provided
   - Check that enum values are correct

### Debug Commands:

```bash
# Check if server is running
curl http://localhost:5000/api/plants

# Check MongoDB connection
node server/check-db.js

# View server logs
npm run dev
```

## 📈 Next Steps

1. Add more plants to your database
2. Test different quiz combinations
3. Customize the suggestion algorithm
4. Add more plant categories
5. Implement user preferences saving

## 🎯 Success Criteria

You'll know everything is working when:
- ✅ You can create plants via Postman
- ✅ You can view plants in MongoDB
- ✅ The quiz returns appropriate plants
- ✅ The frontend displays results correctly
- ✅ Different quiz combinations return different results

Happy gardening! 🌱

