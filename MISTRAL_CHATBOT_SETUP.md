# Mistral AI Chatbot Setup Guide

## Overview
I've successfully integrated Mistral AI into your UrbanSprout chatbot to create a specialized assistant for edible vegetables and fruits. The chatbot now focuses exclusively on helping users grow vegetables and fruits in small-scale settings.

## What's Been Implemented

### 1. Mistral AI Service (`server/services/mistralService.js`)
- Integrated Mistral Small model for natural language processing
- Specialized system prompt focused on edible vegetables and fruits only
- Response validation to ensure only edible plant recommendations
- Conversation history management for context-aware responses

### 2. Updated Chatbot Controller (`server/controllers/chatbotController.js`)
- Enhanced with Mistral API integration
- Fallback to traditional processing if Mistral is unavailable
- Plant suggestion extraction from AI responses
- Improved conversation flow

### 3. Updated Frontend Component (`client/src/components/PlantChatbot.jsx`)
- Updated welcome message to focus on edible plants
- Changed header to "Edible Plant Assistant"
- Updated placeholder text and buttons
- Maintained existing UI/UX while focusing on vegetables and fruits

## Setup Instructions

### 1. Add Your Mistral API Key
Create a `.env` file in the server directory with your Mistral API key:

```bash
# In server/.env
MISTRAL_API_KEY=your_mistral_api_key_here
```

### 2. Install Dependencies (if needed)
The required `axios` package is already installed, but if you need to reinstall:

```bash
cd server
npm install axios
```

### 3. Start the Server
```bash
cd server
npm start
```

### 4. Test the Chatbot
Run the test script to verify everything works:

```bash
node test-mistral-chatbot.js
```

## Features

### ✅ What the Chatbot Does
- **Focuses on edible vegetables and fruits only**
- Provides growing advice for small-scale gardening
- Suggests specific plant varieties based on user needs
- Offers practical tips for containers, balconies, and small gardens
- Maintains conversation context for better responses
- Integrates with existing plant database for suggestions

### ❌ What the Chatbot Won't Do
- **Will NOT recommend herbs, spices, or ornamental plants**
- **Will NOT suggest medicinal plants**
- **Will NOT provide advice on non-edible plants**
- Will redirect users back to edible vegetables and fruits if asked about other plants

## Example Interactions

**User:** "I want to grow herbs in my kitchen"
**Bot:** "I specialize in helping with edible vegetables and fruits for small-scale growing! I can help you with plants like tomatoes, lettuce, carrots, peppers, strawberries, and other vegetables and fruits. What would you like to know about growing edible plants?"

**User:** "What vegetables can I grow in containers?"
**Bot:** "Great question! Many vegetables thrive in containers. Here are some excellent options for container gardening: [provides specific recommendations]"

## Technical Details

### API Integration
- Uses Mistral Small model (`mistral-small-latest`)
- Temperature: 0.7 for balanced creativity and accuracy
- Max tokens: 500 for concise responses
- Conversation history limited to 20 messages to manage token usage

### Fallback System
- If Mistral API is unavailable, falls back to traditional rule-based responses
- Ensures chatbot always works even without API key
- Graceful error handling and logging

### Response Validation
- Validates responses to ensure they focus on edible plants
- Filters out herb and ornamental plant recommendations
- Provides redirecting responses when users ask about non-edible plants

## Testing

The `test-mistral-chatbot.js` script tests:
- Basic conversation flow
- Vegetable and fruit recommendations
- Herb redirection (should redirect to edible plants)
- Plant suggestion extraction
- Error handling

## Next Steps

1. Add your Mistral API key to the server environment
2. Test the chatbot with the provided test script
3. Customize the system prompt if needed for your specific requirements
4. Monitor API usage and costs through Mistral dashboard

The chatbot is now ready to provide specialized advice on growing edible vegetables and fruits in small-scale settings!



