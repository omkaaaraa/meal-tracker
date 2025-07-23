// Google Gemini AI service for nutrition analysis

// Get the API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Main function to analyze meal using Gemini AI
export const analyzeNutrition = async (mealDescription) => {
  try {
    console.log('🔍 Analyzing meal with Gemini AI:', mealDescription);
    console.log('🔑 API Key present:', !!GEMINI_API_KEY);
    console.log('🔑 API Key first 10 chars:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'none');

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('⚠️ Gemini API key not configured, using fallback');
      const fallbackResult = getFallbackAnalysis(mealDescription);
      console.log('📊 Using fallback analysis result:', fallbackResult);
      return fallbackResult;
    }

    console.log('🚀 Calling Gemini API...');
    const response = await callGeminiAPI(mealDescription);
    console.log('✅ Gemini API response received:', response);
    return response;
  } catch (error) {
    console.error('❌ Error with Gemini API:', error);
    // Fallback to local analysis if API fails
    const fallbackResult = getFallbackAnalysis(mealDescription);
    console.log('📊 Using fallback analysis result due to error:', fallbackResult);
    return fallbackResult;
  }
};

// Call Google Gemini API with structured prompt
const callGeminiAPI = async (mealDescription) => {
  const prompt = `Analyze the nutrition for this meal: "${mealDescription}"

Please provide a detailed breakdown with accurate nutrition information. Format your response as JSON with this exact structure:

{
  "success": true,
  "items": [
    {
      "name": "specific food item name",
      "quantity": number,
      "unit": "piece/cup/slice/etc",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fats": number
    }
  ],
  "totalCalories": total_number,
  "totalProtein": total_number,
  "totalCarbs": total_number,
  "totalFats": total_number
}

Parse each food item separately (e.g., "2 eggs" and "1 slice toast" as separate items).
Use realistic USDA nutrition data.
Be accurate with quantities and calculations.
Return ONLY the JSON, no additional text.`;

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.1,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    }
  };

  console.log('📡 Making Gemini API request to:', GEMINI_API_URL.substring(0, 100) + '...');
  console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  console.log('📡 Gemini API response status:', response.status);
  console.log('📡 Gemini API response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Gemini API error response:', errorText);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('📦 Gemini API raw response:', JSON.stringify(data, null, 2));
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    console.error('Invalid Gemini response structure:', data);
    throw new Error('Invalid response format from Gemini API');
  }

  const aiResponse = data.candidates[0].content.parts[0].text;
  console.log('🤖 Gemini AI text response:', aiResponse);

  // Parse the JSON response from Gemini
  try {
    // Clean the response - remove any markdown formatting
    let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Find JSON object in the response
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in Gemini response:', cleanResponse);
      throw new Error('No JSON found in Gemini response');
    }
    
    const rawJsonResponse = JSON.parse(jsonMatch[0]);
    console.log('📊 Raw parsed JSON from Gemini:', rawJsonResponse);
    
    // Convert Gemini's format to our expected format
    let processedResponse;
    
    if (rawJsonResponse.success && rawJsonResponse.items) {
      // Already in our expected format
      processedResponse = rawJsonResponse;
    } else if (rawJsonResponse.nutrients || rawJsonResponse.meal) {
      // Gemini's natural format - convert it
      console.log('🔄 Converting Gemini format to our format...');
      
      // Extract nutrition values from Gemini's format
      const nutrients = rawJsonResponse.nutrients || {};
      const calories = nutrients.calories?.value || 0;
      const protein = nutrients.protein?.value || 0;
      const carbs = nutrients.carbohydrates?.value || nutrients.carbs?.value || 0;
      const fats = nutrients.fats?.value || nutrients.fat?.value || 0;
      
      // Create items array with the meal as a single item
      const items = [{
        name: rawJsonResponse.meal || "Analyzed meal",
        quantity: 1,
        unit: "serving",
        calories: calories,
        protein: protein,
        carbs: carbs,
        fats: fats
      }];
      
      processedResponse = {
        success: true,
        items: items,
        totalCalories: calories,
        totalProtein: protein,
        totalCarbs: carbs,
        totalFats: fats
      };
    } else {
      console.error('❌ Unexpected JSON structure from Gemini:', rawJsonResponse);
      throw new Error('Unexpected response structure from Gemini');
    }
    
    console.log('✅ Final processed response:', processedResponse);
    return processedResponse;
  } catch (parseError) {
    console.error('Error parsing Gemini response:', parseError);
    console.error('Raw response was:', aiResponse);
    throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
  }
};

// Fallback function when Gemini API is not available or fails
const getFallbackAnalysis = (mealDescription) => {
  console.log('Using fallback analysis for:', mealDescription);
  
  const lowerMeal = mealDescription.toLowerCase();
  const items = [];
  
  // Enhanced food database for better fallback analysis
  const foodPatterns = [
    { patterns: ['egg', 'eggs'], nutrition: { calories: 70, protein: 6, carbs: 0.5, fats: 5 } },
    { patterns: ['rice', 'white rice', 'brown rice'], nutrition: { calories: 205, protein: 4.3, carbs: 45, fats: 0.4 } },
    { patterns: ['chicken', 'chicken breast'], nutrition: { calories: 165, protein: 31, carbs: 0, fats: 3.6 } },
    { patterns: ['bread', 'toast', 'slice'], nutrition: { calories: 80, protein: 2.3, carbs: 15, fats: 1 } },
    { patterns: ['banana'], nutrition: { calories: 105, protein: 1.3, carbs: 27, fats: 0.4 } },
    { patterns: ['apple'], nutrition: { calories: 95, protein: 0.5, carbs: 25, fats: 0.3 } },
    { patterns: ['milk'], nutrition: { calories: 150, protein: 8, carbs: 12, fats: 8 } },
    { patterns: ['pasta'], nutrition: { calories: 220, protein: 8, carbs: 44, fats: 1.1 } },
    { patterns: ['cheese'], nutrition: { calories: 113, protein: 7, carbs: 1, fats: 9 } },
    { patterns: ['beef', 'steak'], nutrition: { calories: 250, protein: 26, carbs: 0, fats: 15 } },
    { patterns: ['salmon', 'fish'], nutrition: { calories: 208, protein: 22, carbs: 0, fats: 12 } },
    { patterns: ['oatmeal', 'oats'], nutrition: { calories: 150, protein: 5, carbs: 27, fats: 3 } },
    { patterns: ['yogurt', 'greek yogurt'], nutrition: { calories: 100, protein: 17, carbs: 6, fats: 0 } },
    { patterns: ['avocado'], nutrition: { calories: 234, protein: 3, carbs: 12, fats: 21 } },
    { patterns: ['almonds', 'nuts'], nutrition: { calories: 164, protein: 6, carbs: 6, fats: 14 } },
    { patterns: ['potato', 'potatoes'], nutrition: { calories: 161, protein: 4, carbs: 37, fats: 0.2 } },
    { patterns: ['broccoli'], nutrition: { calories: 34, protein: 3, carbs: 7, fats: 0.4 } },
    { patterns: ['spinach'], nutrition: { calories: 23, protein: 3, carbs: 4, fats: 0.4 } },
    { patterns: ['quinoa'], nutrition: { calories: 222, protein: 8, carbs: 39, fats: 4 } },
    { patterns: ['turkey'], nutrition: { calories: 189, protein: 29, carbs: 0, fats: 7 } }
  ];
  
  // Simple pattern matching for fallback
  const foundItems = [];
  
  for (const foodPattern of foodPatterns) {
    for (const pattern of foodPattern.patterns) {
      const regex = new RegExp(`\\b${pattern}\\b`, 'i');
      if (regex.test(lowerMeal)) {
        const quantityRegex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:cups?|pieces?|slices?|g|grams?)?\\s*${pattern}\\b`, 'i');
        const quantityMatch = lowerMeal.match(quantityRegex);
        const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
        
        const nutrition = { ...foodPattern.nutrition };
        nutrition.calories = Math.round(nutrition.calories * quantity);
        nutrition.protein = Math.round(nutrition.protein * quantity * 10) / 10;
        nutrition.carbs = Math.round(nutrition.carbs * quantity * 10) / 10;
        nutrition.fats = Math.round(nutrition.fats * quantity * 10) / 10;
        
        foundItems.push({
          name: `${quantity > 1 ? quantity + ' ' : ''}${pattern}${quantity > 1 && !pattern.endsWith('s') ? 's' : ''}`,
          quantity: quantity,
          unit: 'serving',
          ...nutrition
        });
        break;
      }
    }
  }
  
  // If no items found, create a placeholder
  if (foundItems.length === 0) {
    foundItems.push({
      name: `"${mealDescription}" - Please get Gemini API key for better analysis`,
      quantity: 1,
      unit: 'serving',
      calories: 200,
      protein: 10,
      carbs: 20,
      fats: 5
    });
  }
  
  return {
    success: true,
    items: foundItems,
    totalCalories: foundItems.reduce((sum, item) => sum + item.calories, 0),
    totalProtein: Math.round(foundItems.reduce((sum, item) => sum + item.protein, 0) * 10) / 10,
    totalCarbs: Math.round(foundItems.reduce((sum, item) => sum + item.carbs, 0) * 10) / 10,
    totalFats: Math.round(foundItems.reduce((sum, item) => sum + item.fats, 0) * 10) / 10
  };
};
