const axios = require('axios');

// Test the Mistral-powered chatbot
async function testMistralChatbot() {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🌱 Testing Mistral-Powered Edible Plant Chatbot\n');
  
  const testMessages = [
    "I want to grow vegetables in my small balcony",
    "What fruits can I grow in containers?",
    "I'm a beginner, help me start with tomatoes",
    "Can you tell me about growing herbs?", // This should be redirected
    "What's the best way to grow lettuce?"
  ];
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n--- Test ${i + 1} ---`);
    console.log(`User: ${message}`);
    
    try {
      const response = await axios.post(`${baseURL}/chatbot`, {
        message: message,
        userId: `test_user_${Date.now()}`
      });
      
      if (response.data.success) {
        const botResponse = response.data.data;
        console.log(`Bot: ${botResponse.message}`);
        
        if (botResponse.plants && botResponse.plants.length > 0) {
          console.log(`\nSuggested Plants:`);
          botResponse.plants.forEach(plant => {
            console.log(`- ${plant.name} (${plant.type})`);
          });
        }
        
        if (botResponse.buttons && botResponse.buttons.length > 0) {
          console.log(`\nQuick Options: ${botResponse.buttons.join(', ')}`);
        }
      } else {
        console.log(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error(`Request failed: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ Test completed!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:5000/api/chatbot/questions');
    console.log('✅ Server is running and chatbot endpoint is accessible');
    return true;
  } catch (error) {
    console.error('❌ Server is not running or chatbot endpoint is not accessible');
    console.error('Please make sure the server is running on port 5000');
    return false;
  }
}

// Main test function
async function main() {
  console.log('Starting Mistral Chatbot Test...\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('\nTo start the server, run: cd server && npm start');
    process.exit(1);
  }
  
  await testMistralChatbot();
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testMistralChatbot, checkServer };



