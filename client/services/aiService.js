import axios from 'axios';
// Temporarily comment out the env import to make UI work
import { OPENAI_API_KEY } from '@env';
import { API_URL } from '../config/constants';
import authService from './authService';


// Add retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateRecipes = async (ingredients, familyId) => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      // Get family members' health tags
      const familyHealthTags = await getFamilyHealthTags(familyId);
      
      // Generate health prompt
      const healthPrompt = generateHealthPrompt(familyHealthTags);
      
      const prompt = `Generate 5 healthy recipes based on the following ingredients and health considerations. Each recipe should include:
1. Recipe name
2. Required ingredients and quantities
3. Detailed steps
4. Cooking time
5. Difficulty level
6. Nutritional analysis (including calories, protein, carbs, fat, dietary fiber)

Available ingredients: ${ingredients.join(', ')}

Family health tags: ${healthPrompt}

Please ensure recipes:
- Use the provided ingredients
- Prioritize family members' health tag requirements
- If unable to meet all health tags, at least satisfy the most important ones
- Nutritionally balanced
- Suitable for home cooking
- Clear and easy-to-follow steps

Please return in JSON format as follows:
{
  "recipes": [
    {
      "name": "Recipe name",
      "ingredients": [
        { "name": "Ingredient name", "quantity": "Quantity" }
      ],
      "instructions": "Detailed steps",
      "cookingTime": "Cooking time",
      "difficulty": "Difficulty level",
      "nutrition": {
        "calories": number,
        "protein": "Protein content",
        "carbs": "Carbohydrate content",
        "fat": "Fat content",
        "fiber": "Dietary fiber content"
      }
    }
  ]
}`;

      console.log('Health prompt:', healthPrompt); // Add log for debugging

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional nutritionist and chef, skilled at creating healthy and delicious home recipes based on available ingredients while considering family members' health needs"
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Add response data validation and cleanup
      console.log('API Response:', response.data);
      
      if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        throw new Error('Invalid API response format');
      }

      const content = response.data.choices[0].message.content;
      console.log('API Response Content:', content);

      // Try to clean and parse JSON
      let cleanedContent = content;
      try {
        // If content is wrapped in ```json and ```, remove them
        if (content.includes('```json')) {
          cleanedContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
          cleanedContent = content.split('```')[1].split('```')[0].trim();
        }
        
        const recipes = JSON.parse(cleanedContent);
        
        // Validate returned data structure
        if (!recipes.recipes || !Array.isArray(recipes.recipes)) {
          throw new Error('Invalid data format returned');
        }
        
        return recipes.recipes;
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Original content:', content);
        console.error('Cleaned content:', cleanedContent);
        throw new Error(`JSON parsing error: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Failed to generate recipes:', error);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('Error status code:', status);
        console.error('Error message:', data);
        
        // If quota error, wait longer
        if (status === 429 || (data.error && data.error.code === 'insufficient_quota')) {
          const waitTime = RETRY_DELAY * Math.pow(2, retries); // Exponential backoff
          console.log(`Quota limit reached, waiting ${waitTime}ms before retry...`);
          await delay(waitTime);
          retries++;
          continue;
        }
      }
      
      // Increment retry count after error handling
      retries++;
      
      // If retries remaining, wait and retry
      if (retries < MAX_RETRIES) {
        const waitTime = RETRY_DELAY * Math.pow(2, retries);
        console.log(`Retry ${retries} failed, waiting ${waitTime}ms before next attempt...`);
        await delay(waitTime);
        continue;
      }
      
      // Max retries reached, throw error
      throw new Error('Failed to generate recipes: Maximum retries reached');
    }
  }
  
  throw new Error('Failed to generate recipes: Maximum retries reached');
};

// Use Microsoft AI for image recognition
export const recognizeFoodImage = async (imageUri) => {
  try {
    const response = await axios.post(
      `AZURE_AI_ENDPOINT/vision/v3.2/analyze`, // Placeholder - update with actual endpoint
      {
        url: imageUri
      },
      {
        params: {
          visualFeatures: 'Categories,Description,Objects',
          details: 'Celebrities,Landmarks'
        },
        headers: {
          'Ocp-Apim-Subscription-Key': 'AZURE_AI_KEY', // Placeholder - update with actual key
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Image recognition error:', error);
    throw error;
  }
};

// Use ChatGPT to get food suggestions
export const getFoodSuggestions = async (ingredients) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef assistant, please provide cooking suggestions based on the provided ingredients.'
          },
          {
            role: 'user',
            content: `I have the following ingredients: ${ingredients.join(', ')}. Please give me some cooking suggestions.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting suggestions:', error);
    throw error;
  }
};

// Use ChatGPT for food categorization
export const categorizeFood = async (foodName) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional food categorization assistant, please categorize food into: vegetables, fruits, meat, seafood, dairy, seasonings, others.'
          },
          {
            role: 'user',
            content: `Please categorize "${foodName}" into the above categories.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Categorization error:', error);
    throw error;
  }
};

// Use ChatGPT to generate expiry reminder
export const generateExpiryReminder = async (foodItem) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional food preservation assistant, please generate friendly reminders based on food expiration dates.'
          },
          {
            role: 'user',
            content: `My ${foodItem.name} will expire on ${foodItem.expiryDate}, please generate a reminder.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating reminder:', error);
    throw error;
  }
};

// Get family members' health tags
const getFamilyHealthTags = async (familyId) => {
    try {
        const token = await authService.getToken();
        const response = await axios.get(`${API_URL}/families/${familyId}/health-tags`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Failed to get family health tags:', error);
        return [];
    }
};

// Generate health tag prompt
const generateHealthPrompt = (healthTags) => {
    if (!healthTags || healthTags.length === 0) return '';

    // Ensure all tags are strings
    const tags = healthTags.flat().map(tag => {
        if (typeof tag === 'string') return tag;
        if (tag && typeof tag === 'object') return tag.name || tag.tag || '';
        return '';
    }).filter(tag => tag !== '');

    const uniqueTags = [...new Set(tags)];
    
    // Categorize health tags
    const dietaryRestrictions = uniqueTags.filter(tag => 
        ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'allergies'].some(keyword => tag === keyword)
    );
    
    const healthConditions = uniqueTags.filter(tag => 
        ['blood sugar control', 'blood pressure control', 'heart health', 'kidney health'].some(keyword => tag === keyword)
    );
    
    const weightGoals = uniqueTags.filter(tag => 
        ['weight loss', 'muscle gain', 'weight maintenance'].some(keyword => tag === keyword)
    );

    const activityLevels = uniqueTags.filter(tag => 
        ['sedentary', 'lightly active', 'moderately active', 'active', 'very active'].some(keyword => tag === keyword)
    );

    let prompt = 'Please consider the following health factors:\n';
    
    if (dietaryRestrictions.length > 0) {
        prompt += `- Dietary restrictions: ${dietaryRestrictions.join(', ')}\n`;
    }
    
    if (healthConditions.length > 0) {
        prompt += `- Health conditions: ${healthConditions.join(', ')}\n`;
    }
    
    if (weightGoals.length > 0) {
        prompt += `- Weight goals: ${weightGoals.join(', ')}\n`;
    }

    if (activityLevels.length > 0) {
        prompt += `- Activity levels: ${activityLevels.join(', ')}\n`;
    }

    return prompt;
};

// Generate dietary advice
export const generateDietaryAdvice = async (familyId) => {
    try {
        // Get family members' health tags
        const familyHealthTags = await getFamilyHealthTags(familyId);
        
        // Generate health prompt
        const healthPrompt = generateHealthPrompt(familyHealthTags);
        
        // Build prompt
        const prompt = `
You are a professional nutritionist. Please provide dietary advice for this family based on the following health information:

${healthPrompt}

Please provide:
1. Daily dietary recommendations
2. Nutritional balance principles
3. Foods to avoid
4. Recommended foods
5. Meal timing suggestions
6. Special considerations

Please ensure recommendations are:
- Scientifically sound
- Practical and feasible
- Consider all health factors
- Suitable for family implementation
`;

        const response = await axios.post(`${API_URL}/api/ai/generate`, {
            prompt,
            max_tokens: 800,
            temperature: 0.7
        });

        return response.data;
    } catch (error) {
        console.error('Failed to generate dietary advice:', error);
        throw error;
    }
};

export const getRecommendedItems = async ({ familyId }) => {
  try {
    // Get family members' health tags
    const familyHealthTags = await getFamilyHealthTags(familyId);
    
    // Get favorite recipes
    const token = await authService.getToken();
    const favoritesResponse = await axios.get(`${API_URL}/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const favoriteRecipes = favoritesResponse.data.data || [];

    // Generate health prompt
    const healthPrompt = generateHealthPrompt(familyHealthTags);

    // Build prompt
    const prompt = `You are a professional nutritionist and shopping assistant. Please recommend ingredients to purchase based on the following information:

Family health tags:
${healthPrompt}

Favorite recipes:
${favoriteRecipes.map(recipe => recipe.recipeData.name).join(', ')}

Please recommend ingredients to purchase, considering:
1. Family members' health needs
2. Ingredients needed for favorite recipes
3. Nutritional balance
4. Seasonal ingredients
5. Ingredient shelf life

Please return in JSON format as follows:
{
  "recommendedItems": [
    {
      "id": "unique identifier",
      "name": "ingredient name",
      "reason": "recommendation reason",
      "recommendedQuantity": "recommended quantity",
      "priority": "priority (high/medium/low)"
    }
  ]
}`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist and shopping assistant, skilled at recommending ingredients to purchase based on family members' health needs and favorite recipes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('Invalid API response format');
    }

    const content = response.data.choices[0].message.content;
    console.log('API Response Content:', content);

    // Try to clean and parse JSON
    let cleanedContent = content;
    try {
      // If content is wrapped in ```json and ```, remove them
      if (content.includes('```json')) {
        cleanedContent = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        cleanedContent = content.split('```')[1].split('```')[0].trim();
      }
      
      const data = JSON.parse(cleanedContent);
      
      // Validate returned data structure
      if (!data.recommendedItems || !Array.isArray(data.recommendedItems)) {
        throw new Error('Invalid data format returned');
      }
      
      return data.recommendedItems;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Original content:', content);
      console.error('Cleaned content:', cleanedContent);
      throw new Error(`JSON parsing error: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Failed to get recommended items:', error);
    throw error;
  }
}; 