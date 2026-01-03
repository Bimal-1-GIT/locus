import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Function to get Gemini model (lazy initialization)
function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Gemini API Key exists:', !!apiKey, apiKey ? `(${apiKey.substring(0, 10)}...)` : '');
  
  if (!apiKey) {
    console.log('No Gemini API key found');
    return null;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash which has generous free tier
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  } catch (err) {
    console.error('Error creating Gemini model:', err);
    return null;
  }
}

// System prompt for the Locus chatbot
const SYSTEM_PROMPT = `You are "Locus Assistant" (लोकस सहायक), a friendly and knowledgeable AI assistant for Locus, a modern real estate platform focused on Nepal.

🏔️ ABOUT LOCUS:
- Locus is a premium real estate platform serving Nepal
- Users can search for properties to rent or buy across Nepal
- Property owners can list their properties for sale or rent
- Features include smart AI-powered search, verified listings, and direct owner contact
- The platform has a beautiful Nepali-inspired design with maroon, gold, and cream colors

🏠 KEY FEATURES YOU CAN HELP WITH:

1. **Property Search**
   - Help users find properties by location, price range, bedrooms, property type
   - Explain filters and smart match features
   - Guide them to /search page

2. **Listing Properties**
   - Guide owners on how to list properties at /create-listing
   - Explain the listing process: photos, details, pricing, verification
   - Help with editing listings at /my-listings

3. **Account Management**
   - Login/Register at /login and /register
   - Saved properties at /saved
   - Profile management at /profile
   - View applications and messages at /messages

4. **Smart Match**
   - Explain the AI-powered property matching feature
   - Help users describe what they're looking for

📍 LOCATIONS IN NEPAL YOU SHOULD KNOW:

Kathmandu Valley:
- Kathmandu: Thamel, Lazimpat, Baluwatar, Maharajgunj, Baneshwor, Koteshwor, Kalanki, Chabahil
- Lalitpur (Patan): Jhamsikhel, Sanepa, Kupondole, Pulchowk, Satdobato, Lagankhel
- Bhaktapur: Suryabinayak, Thimi, Lokanthali

Other Major Cities:
- Pokhara: Lakeside, Baidam, Prithvi Chowk, Mahendrapul
- Chitwan: Bharatpur, Sauraha
- Biratnagar, Birgunj, Dharan, Butwal, Hetauda, Nepalgunj

💰 PRICING CONTEXT (in NPR - Nepali Rupees):

Rental Properties (Monthly):
- Budget: NPR 8,000 - 20,000 (basic rooms/apartments)
- Mid-range: NPR 20,000 - 50,000 (2-3 BHK apartments)
- Premium: NPR 50,000 - 150,000 (modern apartments, good locations)
- Luxury: NPR 150,000+ (bungalows, premium areas)

Sale Properties:
- Apartments: NPR 50 Lakh - 3 Crore+ (depending on location/size)
- Houses: NPR 1 Crore - 10 Crore+ (depending on area and land)
- Land: Varies greatly by location (NPR 5-50 Lakh per anna in city areas)

Note: 1 Lakh = 100,000 | 1 Crore = 10,000,000

🌐 WEBSITE NAVIGATION:
- Home: / - Main landing page with featured properties
- Search: /search - Find properties with advanced filters
- Property Details: /property/:id - View specific property
- List Property: /create-listing - Add new property listing
- Edit Listing: /edit-listing/:id - Edit your property
- My Listings: /my-listings - Manage your properties
- Saved: /saved - Your saved/favorite properties
- Messages: /messages - Chat with property owners/seekers
- Login: /login - Sign in to your account
- Register: /register - Create new account
- Profile: /profile - Manage your profile

🗣️ COMMUNICATION STYLE:
- Be warm, friendly, and helpful - like a knowledgeable Nepali friend
- Use both English and Nepali phrases naturally
- Start responses with relevant greetings when appropriate (नमस्ते, धन्यवाद)
- Use emojis sparingly but effectively (🏠 🏔️ 🙏 ✨)
- Keep responses concise but informative
- If you don't know something specific, guide them to contact support or explore the website
- Be encouraging and positive about their property search journey

📝 RESPONSE FORMAT:
- Use bullet points for lists
- Bold important information using **text**
- Keep paragraphs short
- Include relevant page links when helpful
- End with a helpful follow-up question when appropriate

🚫 LIMITATIONS:
- You cannot access real property listings or prices - guide users to search
- You cannot make bookings or transactions
- You cannot access user account details
- For specific property questions, direct them to the property page or owner

Remember: You are the friendly face of Locus, helping users navigate Nepal's real estate market with confidence! 🇳🇵`;

// Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory = [], currentPage } = req.body;
    console.log('Chatbot request received:', message);

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build context-aware user message
    let contextualMessage = message;
    if (currentPage) {
      contextualMessage = `[User is currently on page: ${currentPage}]\n\n${message}`;
    }

    // Get Gemini model
    const model = getGeminiModel();

    // Check if model is available
    if (!model) {
      console.log('No Gemini model available, using fallback');
      return res.json({
        response: getFallbackResponse(message),
        fallback: true
      });
    }

    console.log('Using Gemini API...');

    // Build conversation history for Gemini
    const historyForGemini = conversationHistory.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start chat with history and system instruction
    const chat = model.startChat({
      history: historyForGemini,
      systemInstruction: {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }],
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(contextualMessage);
    const response = await result.response;
    const assistantMessage = response.text() || 'I apologize, I could not generate a response.';

    console.log('Gemini response received');
    res.json({ response: assistantMessage });

  } catch (error) {
    console.error('Chatbot error:', error.message || error);
    
    // Return fallback response on error
    res.json({
      response: getFallbackResponse(req.body?.message || ''),
      fallback: true
    });
  }
});

// Fallback responses when API is unavailable
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('property') || lowerMessage.includes('looking')) {
    return `🏠 **Finding Properties on Locus**

I'd love to help you find your perfect property! Here's how:

1. Go to the **Search** page (/search)
2. Use filters to narrow down by:
   - Location (city, area)
   - Price range
   - Number of bedrooms
   - Property type (apartment, house, etc.)
3. Save properties you like with the ❤️ button

You can also use our **Smart Match** feature to describe what you're looking for in natural language!

What type of property are you looking for? 🏔️`;
  }

  if (lowerMessage.includes('list') || lowerMessage.includes('sell') || lowerMessage.includes('rent out')) {
    return `📝 **Listing Your Property on Locus**

Great! Here's how to list your property:

1. **Login** to your account (or register if new)
2. Click **"List Property"** in the navigation
3. Add your property details:
   - Upload quality photos 📸
   - Enter location & address
   - Set your price (rent or sale)
   - Add features & amenities
4. Submit for review

Your listing will be live once verified! You can manage all your listings at **/my-listings**.

Would you like tips on creating an attractive listing? 🙏`;
  }

  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('expensive')) {
    return `💰 **Property Prices in Nepal**

Here's a general guide (in NPR):

**Rentals (Monthly):**
- Budget: रू 8,000 - 20,000
- Mid-range: रू 20,000 - 50,000
- Premium: रू 50,000 - 1,50,000
- Luxury: रू 1,50,000+

**For Sale:**
- Apartments: रू 50 Lakh - 3 Crore+
- Houses: रू 1 - 10 Crore+
- Prices vary greatly by location!

**Popular areas in Kathmandu:**
Lazimpat, Baluwatar (premium) | Baneshwor, Koteshwor (mid-range) | Kalanki, Chabahil (affordable)

Use our **Search** with price filters to find properties in your budget! 🏔️`;
  }

  if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('use'))) {
    return `✨ **How Locus Works**

**For Property Seekers:**
1. 🔍 **Search** - Browse properties with smart filters
2. ❤️ **Save** - Bookmark favorites to compare later
3. 💬 **Connect** - Message owners directly
4. 🏠 **Visit** - Schedule property visits

**For Property Owners:**
1. 📝 **List** - Add your property with photos
2. ✅ **Verify** - Get verified for more trust
3. 📩 **Receive** - Get inquiries from interested parties
4. 🤝 **Close** - Finalize rent or sale

**Special Features:**
- Smart Match AI search
- Verified listings badge
- Direct messaging
- Saved properties

Need help with something specific? 🙏`;
  }

  // Default fallback
  return `नमस्ते! 🙏 I'm the Locus Assistant!

I can help you with:
• 🏠 **Finding properties** - Search rentals or homes for sale
• 📝 **Listing property** - Add your property to Locus
• 💰 **Pricing info** - Understand Nepal's market
• ❓ **How it works** - Learn about our features

What would you like to know? Feel free to ask in English or नेपाली! 🏔️`;
}

export default router;
