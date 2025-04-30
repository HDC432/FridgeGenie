import axios from 'axios';
// Temporarily comment out the env import to make UI work
import { OPENAI_API_KEY } from '@env';
import { API_URL } from '../config/constants';
import authService from './authService';

// Use API key from environment variables
// const OPENAI_API_KEY = 'sk-placeholder-api-key-for-ui-development';

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
      
      const prompt = `Based on the following ingredients and health considerations, generate 5 healthy recipes each including:
1. Recipe Name
2. Required Ingredients and Quantities
3. Detailed Steps
4. Cooking Time
5. Difficulty Level
6. Nutrition Analysis (including calories, protein, carbs, fat, fiber)

Available Ingredients: ${ingredients.join(', ')}

Family Member Health Tags: ${healthPrompt}

Please ensure the recipes:
- Use provided ingredients
- Prioritize family member health tag needs
- If you cannot fully satisfy all health tags, at least satisfy the most important ones
- Nutrient balance
- Suitable for family preparation
- Clear and easy steps

Please return in JSON format as follows:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "ingredients": [
        { "name": "Ingredient Name", "quantity": "Quantity" }
      ],
      "instructions": "Detailed Steps",
      "cookingTime": "Cooking Time",
      "difficulty": "Difficulty Level",
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

      console.log('Health Prompt:', healthPrompt); // Add log for debugging

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional nutritionist and chef, skilled at creating healthy and delicious home recipes based on existing ingredients and considering family member health needs"
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
          throw new Error('Invalid returned data format');
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
          console.log(`Quota limit, waiting ${waitTime}ms before retry...`);
          await delay(waitTime);
          retries++;
          continue;
        }
      }
      
      // Increase retry count after error handling
      retries++;
      
      // If still have retries left, wait and retry
      if (retries < MAX_RETRIES) {
        const waitTime = RETRY_DELAY * Math.pow(2, retries);
        console.log(`Retry ${retries} failed, waiting ${waitTime}ms before next try...`);
        await delay(waitTime);
        continue;
      }
      
      // Throw error if max retries reached
      throw new Error('Failed to generate recipes: Max retries reached');
    }
  }
  
  throw new Error('Failed to generate recipes: Max retries reached');
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
            content: 'You are a professional chef assistant. Please provide cooking suggestions based on the provided ingredients.'
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
            content: 'You are a professional food categorization assistant. Please categorize food items into: vegetables, fruits, meat, seafood, dairy products, seasonings, and others.'
          },
          {
            role: 'user',
            content: `Please categorize "${foodName}" into one of the above categories.`
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

// Use ChatGPT to generate expiry reminders
export const generateExpiryReminder = async (foodItem) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional food preservation assistant. Please generate friendly reminders based on food expiration dates.'
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
        console.error('Failed to get family member health tags:', error);
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
        ['vegetarian', 'vegan', 'gluten-free', 'lactose-free', 'allergies'].some(keyword => tag.includes(keyword))
    );
    
    const healthConditions = uniqueTags.filter(tag => 
        ['blood sugar control', 'blood pressure control', 'heart health attention', 'kidney health attention'].some(keyword => tag.includes(keyword))
    );
    
    const weightGoals = uniqueTags.filter(tag => 
        ['fat reduction', 'muscle building', 'weight maintenance'].some(keyword => tag.includes(keyword))
    );

    const activityLevels = uniqueTags.filter(tag => 
        ['sedentary', 'light activity', 'moderate activity', 'active', 'very active'].some(keyword => tag.includes(keyword))
    );

    let prompt = 'Please consider the following health factors:\n';
    
    if (dietaryRestrictions.length > 0) {
        prompt += `- Dietary Restrictions: ${dietaryRestrictions.join(', ')}\n`;
    }
    
    if (healthConditions.length > 0) {
        prompt += `- Health Conditions: ${healthConditions.join(', ')}\n`;
    }
    
    if (weightGoals.length > 0) {
        prompt += `- Weight Goals: ${weightGoals.join(', ')}\n`;
    }

    if (activityLevels.length > 0) {
        prompt += `- Activity Level: ${activityLevels.join(', ')}\n`;
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
1. Daily Diet Advice
2. Nutrient Combination Principles
3. Foods to Avoid
4. Recommended Foods
5. Diet Time Advice
6. Special Considerations

Please ensure the advice:
- Scientific and Reasonable
- Practical and Feasible
- Consider All Health Factors
- Suitable for Family Execution
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
    const prompt = `You are a professional nutritionist and shopping assistant. Please recommend ingredients to buy based on the following information:

Family Member Health Tags:
${healthPrompt}

Favorite Recipes:
${favoriteRecipes.map(recipe => recipe.recipeData.name).join(', ')}

Please recommend ingredients to buy, considering the following factors:
1. Family Member Health Needs
2. Ingredients Needed for Favorite Recipes
3. Nutrient Balance
4. Seasonal Ingredients
5. Food Expiration Dates

Please return the response in JSON format as follows:
{
  "recommendedItems": [
    {
      "id": "Unique Identifier",
      "name": "Ingredient Name",
      "reason": "Recommendation Reason",
      "recommendedQuantity": "Recommended Quantity",
      "priority": "Priority (High/Medium/Low)"
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
            content: "You are a professional nutritionist and shopping assistant, skilled at recommending ingredients to buy based on family member health needs and favorite recipes."
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
        throw new Error('Invalid returned data format');
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