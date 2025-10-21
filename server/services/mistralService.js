const axios = require('axios');

class MistralService {
  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY;
    this.baseURL = 'https://api.mistral.ai/v1';
    
    if (!this.apiKey) {
      console.warn('MISTRAL_API_KEY not found in environment variables');
    }
  }

  async generateResponse(message, conversationHistory = []) {
    if (!this.apiKey) {
      throw new Error('Mistral API key not configured');
    }

    try {
      // Create the system prompt for vegetable and fruit focused chatbot
      const systemPrompt = `You are an enthusiastic and supportive gardening assistant specialized in edible vegetables and fruits for small-scale growing. You ALWAYS encourage users and never discourage their gardening ideas. Your expertise includes:

EDIBLE VEGETABLES AND FRUITS ONLY:
- Leafy greens (lettuce, spinach, kale, arugula, Swiss chard)
- Root vegetables (carrots, radishes, beets, turnips)
- Fruiting vegetables (tomatoes, peppers, cucumbers, zucchini, eggplant)
- Legumes (beans, peas)
- Alliums (onions, garlic, leeks, green onions)
- Cruciferous vegetables (broccoli, cauliflower, cabbage, Brussels sprouts)
- Squash and pumpkins
- Edible fruits (strawberries, blueberries, raspberries, apples, citrus, etc.)

HYBRID AND CONTAINER VARIETIES EXPERTISE:
- Dwarf and compact hybrid fruit trees (dwarf apple, citrus, cherry trees)
- Container-friendly hybrid vegetables (patio tomatoes, bush beans, compact peppers)
- Fast-growing hybrid varieties that produce quickly
- Space-saving vertical growing techniques
- Grafted plants that combine multiple varieties
- Self-pollinating hybrid fruits perfect for small spaces
- Determinate vs indeterminate varieties for containers

IMPORTANT APPROACH:
- NEVER discourage or degrade user ideas - always be positive and supportive
- Focus ONLY on plants that produce edible vegetables or fruits
- Emphasize container growing and small-space solutions
- Always provide practical requirements rather than discouraging words
- Highlight hybrid varieties that grow faster and more compactly

RESPONSE GUIDELINES:
- Always start with encouragement and positivity
- Provide specific growing requirements (space, sunlight, water, soil)
- Mention container sizes needed for successful growing
- Suggest hybrid varieties that are perfect for small spaces
- Include care level, harvest timing, and expected yields
- Offer alternatives if space is limited (suggest compact/dwarf varieties)
- Be enthusiastic about the user's growing ambitions

FORMATTING RULES - VERY IMPORTANT:
- ABSOLUTELY NEVER use any asterisks (*) or stars in your responses
- NEVER use markdown symbols like ####, **, ##, ***, or any * symbols
- DO NOT use hashtags (#) for formatting
- Instead of **bold text**, just write the text normally or use CAPITAL LETTERS for emphasis
- Instead of *italic text*, just write the text normally
- Use clear paragraph breaks and natural language structure
- Use simple text formatting with line breaks for organization
- Write in a conversational, easy-to-read format
- Use bullet points with simple dashes (-) if needed
- Structure information with clear sentences and paragraphs
- If you need to emphasize something, use CAPITAL LETTERS or write it in a separate line

NEVER say things like "that's difficult", "you can't", "it won't work", or "that's too hard". Instead, provide the requirements and suggest the best varieties for their situation.

If asked about non-edible plants, herbs, or ornamental plants, enthusiastically redirect to edible vegetables and fruits that would work great in their space.`;

      // Build the conversation messages
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ];

      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: 'mistral-small-latest',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Mistral API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate response from Mistral API');
    }
  }

  // Helper method to validate if the response is about edible plants
  validateResponse(response) {
    const edibleKeywords = [
      'vegetable', 'fruit', 'tomato', 'lettuce', 'spinach', 'carrot', 'radish',
      'pepper', 'cucumber', 'zucchini', 'broccoli', 'cauliflower', 'cabbage',
      'bean', 'pea', 'onion', 'garlic', 'strawberry', 'blueberry', 'raspberry',
      'apple', 'citrus', 'squash', 'pumpkin', 'kale', 'arugula', 'chard',
      'beet', 'turnip', 'eggplant', 'leek', 'brussels sprout',
      // Hybrid and container growing terms
      'hybrid', 'dwarf', 'compact', 'container', 'patio', 'bush', 'determinate',
      'indeterminate', 'grafted', 'self-pollinating', 'vertical', 'space-saving',
      'fast-growing', 'quick-growing', 'miniature', 'small-space', 'balcony'
    ];

    const herbKeywords = [
      'herb', 'basil', 'parsley', 'cilantro', 'mint', 'oregano', 'thyme',
      'rosemary', 'sage', 'dill', 'chives', 'tarragon', 'bay leaf'
    ];

    const responseLower = response.toLowerCase();
    
    // Check if response contains herb keywords
    const hasHerbs = herbKeywords.some(keyword => responseLower.includes(keyword));
    
    // Check if response contains edible plant keywords
    const hasEdiblePlants = edibleKeywords.some(keyword => responseLower.includes(keyword));

    // If response mentions herbs but no edible plants, it's not appropriate
    if (hasHerbs && !hasEdiblePlants) {
      return false;
    }

    return true;
  }

  // Clean up markdown formatting from response
  cleanMarkdownFormatting(text) {
    if (!text) return text;
    
    let cleanText = text;
    
    // Remove markdown headers (####, ###, ##, #)
    cleanText = cleanText.replace(/#{1,6}\s*/g, '');
    
    // Remove ALL asterisk patterns - be very aggressive
    cleanText = cleanText.replace(/\*{1,4}([^*\n]+?)\*{1,4}/g, '$1'); // Remove **text**, ***text***, ****text****
    cleanText = cleanText.replace(/\*([^*\n]+?)\*/g, '$1'); // Remove single *text*
    cleanText = cleanText.replace(/\*{2,}/g, ''); // Remove any remaining multiple asterisks
    cleanText = cleanText.replace(/\*/g, ''); // Remove any remaining single asterisks
    
    // Remove other markdown symbols
    cleanText = cleanText.replace(/`([^`]+)`/g, '$1'); // Remove code backticks
    cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links, keep text
    cleanText = cleanText.replace(/_{1,2}([^_]+)_{1,2}/g, '$1'); // Remove underscores for emphasis
    
    // Clean up multiple line breaks
    cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
    
    // Ensure proper spacing after periods
    cleanText = cleanText.replace(/\.([A-Z])/g, '. $1');
    
    // Remove plant emojis that might appear in responses
    cleanText = cleanText.replace(/🌱/g, ''); // Remove seedling emoji
    cleanText = cleanText.replace(/🌿/g, ''); // Remove herb emoji
    cleanText = cleanText.replace(/🍅/g, ''); // Remove tomato emoji
    cleanText = cleanText.replace(/🥬/g, ''); // Remove leafy greens emoji
    cleanText = cleanText.replace(/🥕/g, ''); // Remove carrot emoji
    
    // Clean up any remaining formatting artifacts
    cleanText = cleanText.replace(/\s+/g, ' '); // Multiple spaces to single space
    cleanText = cleanText.replace(/\n\s+/g, '\n'); // Remove spaces at start of lines
    
    return cleanText.trim();
  }

  // Method to get filtered response that only discusses edible vegetables and fruits
  async getFilteredResponse(message, conversationHistory = []) {
    try {
      const response = await this.generateResponse(message, conversationHistory);
      
      // Validate the response
      if (!this.validateResponse(response)) {
        // If response is not appropriate, generate a redirecting response
        return "That's a great question! I'm Sprouty, and I specialize in helping you grow amazing edible vegetables and fruits in small spaces! I can help you with container-friendly plants like dwarf tomatoes, compact peppers, leafy greens, strawberries, and even dwarf fruit trees that grow perfectly in pots. I know all about hybrid varieties that grow fast and don't need much space. What delicious plants would you like to grow together?";
      }

      // Clean up any markdown formatting
      const cleanResponse = this.cleanMarkdownFormatting(response);
      
      return cleanResponse;
    } catch (error) {
      console.error('Error getting filtered response:', error);
      throw error;
    }
  }
}

module.exports = new MistralService();



