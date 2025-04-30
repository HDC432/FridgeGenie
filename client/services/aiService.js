import axios from 'axios';
// Temporarily comment out the env import to make UI work
import { OPENAI_API_KEY } from '@env';
import { API_URL } from '../config/constants';
import authService from './authService';

// 使用环境变量中的API密钥
// const OPENAI_API_KEY = 'sk-placeholder-api-key-for-ui-development';

// 添加重试配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// export const generateRecipes = async (ingredients, familyId) => {
//   let retries = 0;
  
//   while (retries < MAX_RETRIES) {
//     try {
//       // 获取家庭成员的健康标签
//       const familyHealthTags = await getFamilyHealthTags(familyId);
      
//       // 生成健康提示词
//       const healthPrompt = generateHealthPrompt(familyHealthTags);
      
//       const prompt = `基于以下食材和健康考虑生成5个健康食谱 每个食谱需要包含
// 1. 食谱名称
// 2. 所需食材及用量
// 3. 详细步骤
// 4. 烹饪时间
// 5. 难度级别
// 6. 营养成分分析（包括卡路里、蛋白质、碳水化合物、脂肪、膳食纤维）

// 可用食材：${ingredients.join(', ')}

// 家庭成员健康标签：${healthPrompt}

// 请确保食谱：
// - 使用提供的食材
// - 优先考虑家庭成员的健康标签需求
// - 如果无法完全满足所有健康标签，至少满足最重要的标签
// - 营养均衡
// - 适合家庭制作
// - 步骤清晰易懂

// 请以JSON格式返回格式如下:
// {
//   "recipes": [
//     {
//       "name": "食谱名称",
//       "ingredients": [
//         { "name": "食材名称", "quantity": "用量" }
//       ],
//       "instructions": "详细步骤",
//       "cookingTime": "烹饪时间",
//       "difficulty": "难度级别",
//       "nutrition": {
//         "calories": 数字,
//         "protein": "蛋白质含量",
//         "carbs": "碳水化合物含量",
//         "fat": "脂肪含量",
//         "fiber": "膳食纤维含量"
//       }
//     }
//   ]
// }`;

//       console.log('健康提示词:', healthPrompt); // 添加日志以便调试

//       const response = await axios.post(
//         'https://api.openai.com/v1/chat/completions',
//         {
//           model: "gpt-3.5-turbo",
//           messages: [
//             {
//               role: "system",
//               content: "你是一个专业的营养师和厨师，擅长根据现有食材创造健康美味的家常菜食谱，并考虑家庭成员的健康需求"
//             },
//             {
//               role: "user",
//               content: prompt
//             }
//           ],
//           temperature: 0.7,
//           max_tokens: 2000,
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${OPENAI_API_KEY}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       // 添加响应数据验证和清理
//       console.log('API Response:', response.data);
      
//       if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
//         throw new Error('API 响应格式不正确');
//       }

//       const content = response.data.choices[0].message.content;
//       console.log('API Response Content:', content);

//       // 尝试清理和解析 JSON
//       let cleanedContent = content;
//       try {
//         // 如果内容被包裹在 ```json 和 ``` 中，移除它们
//         if (content.includes('```json')) {
//           cleanedContent = content.split('```json')[1].split('```')[0].trim();
//         } else if (content.includes('```')) {
//           cleanedContent = content.split('```')[1].split('```')[0].trim();
//         }
        
//         const recipes = JSON.parse(cleanedContent);
        
//         // 验证返回的数据结构
//         if (!recipes.recipes || !Array.isArray(recipes.recipes)) {
//           throw new Error('返回的数据格式不正确');
//         }
        
//         return recipes.recipes;
//       } catch (parseError) {
//         console.error('JSON 解析错误:', parseError);
//         console.error('原始内容:', content);
//         console.error('清理后的内容:', cleanedContent);
//         throw new Error(`JSON 解析错误: ${parseError.message}`);
//       }
//     } catch (error) {
//       console.error('生成食谱失败:', error);
      
//       if (error.response) {
//         const status = error.response.status;
//         const data = error.response.data;
        
//         console.error('错误状态码:', status);
//         console.error('错误信息:', data);
        
//         // 如果是配额错误，等待更长时间
//         if (status === 429 || (data.error && data.error.code === 'insufficient_quota')) {
//           const waitTime = RETRY_DELAY * Math.pow(2, retries); // 指数退避
//           console.log(`配额限制，等待 ${waitTime}ms 后重试...`);
//           await delay(waitTime);
//           retries++;
//           continue;
//         }
//       }
      
//       // 错误处理后增加重试次数
//       retries++;
      
//       // 如果还有重试机会，则等待后重试
//       if (retries < MAX_RETRIES) {
//         const waitTime = RETRY_DELAY * Math.pow(2, retries);
//         console.log(`第 ${retries} 次重试失败，等待 ${waitTime}ms 后再试...`);
//         await delay(waitTime);
//         continue;
//       }
      
//       // 重试次数用完，抛出错误
//       throw new Error('生成食谱失败: 已达到最大重试次数');
//     }
//   }
  
//   throw new Error('生成食谱失败: 已达到最大重试次数');
// };

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
        "protein": "Protein Content",
        "carbs": "Carbohydrate Content",
        "fat": "Fat Content",
        "fiber": "Fiber Content"
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
          throw new Error('Invalid data format returned');
        }
        
        return recipes.recipes;
      } catch (error) {
        console.error('JSON parsing error:', error);
        console.error('Original content:', content);
        console.error('Cleaned content:', cleanedContent);
        throw new Error(`JSON parsing error: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to generate recipes:', error);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('Error status code:', status);
        console.error('Error message:', data);
        
        // If it's a quota error, wait longer
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
      
      // If there are more retries left, wait and retry
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

// 使用微软 AI 进行图像识别
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

// 使用 ChatGPT 获取食材建议
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

// 使用 ChatGPT 进行食材分类
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

// 使用 ChatGPT 生成过期提醒
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

// 获取家庭成员的健康标签
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

// 生成健康标签提示词
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


// 生成饮食建议
export const generateDietaryAdvice = async (familyId) => {
    try {
        // 获取家庭成员的健康标签
        const familyHealthTags = await getFamilyHealthTags(familyId);
        
        // 生成健康提示词
        const healthPrompt = generateHealthPrompt(familyHealthTags);
        
        // 构建提示词
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
    // 获取家庭成员的健康标签
    const familyHealthTags = await getFamilyHealthTags(familyId);
    
    // 获取收藏的菜谱
    const token = await authService.getToken();
    const favoritesResponse = await axios.get(`${API_URL}/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const favoriteRecipes = favoritesResponse.data.data || [];

    // 生成健康提示词
    const healthPrompt = generateHealthPrompt(familyHealthTags);

    // 构建提示词
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
      throw new Error('API 响应格式不正确');
    }

    const content = response.data.choices[0].message.content;
    console.log('API Response Content:', content);

    // 尝试清理和解析 JSON
    let cleanedContent = content;
    try {
      // 如果内容被包裹在 ```json 和 ``` 中，移除它们
      if (content.includes('```json')) {
        cleanedContent = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        cleanedContent = content.split('```')[1].split('```')[0].trim();
      }
      
      const data = JSON.parse(cleanedContent);
      
      // 验证返回的数据结构
      if (!data.recommendedItems || !Array.isArray(data.recommendedItems)) {
        throw new Error('返回的数据格式不正确');
      }
      
      return data.recommendedItems;
    } catch (parseError) {
      console.error('JSON 解析错误:', parseError);
      console.error('原始内容:', content);
      console.error('清理后的内容:', cleanedContent);
      throw new Error(`JSON 解析错误: ${parseError.message}`);
    }
  } catch (error) {
    console.error('获取推荐食材失败:', error);
    throw error;
  }
}; 