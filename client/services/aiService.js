import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

// 添加重试配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateRecipes = async (ingredients) => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const prompt = `基于以下食材生成3个健康食谱，每个食谱需要包含：
1. 食谱名称
2. 所需食材及用量
3. 详细步骤
4. 烹饪时间
5. 难度级别
6. 营养成分分析（包括卡路里、蛋白质、碳水化合物、脂肪、膳食纤维）

可用食材：${ingredients.join(', ')}

请以JSON格式返回，格式如下：
{
  "recipes": [
    {
      "name": "食谱名称",
      "ingredients": [
        { "name": "食材名称", "quantity": "用量" }
      ],
      "instructions": "详细步骤",
      "cookingTime": "烹饪时间",
      "difficulty": "难度级别",
      "nutrition": {
        "calories": 数字,
        "protein": "蛋白质含量",
        "carbs": "碳水化合物含量",
        "fat": "脂肪含量",
        "fiber": "膳食纤维含量"
      }
    }
  ]
}`;

      console.log('Using API Key:', OPENAI_API_KEY);
      console.log('Request URL:', 'https://api.openai.com/v1/chat/completions');
      console.log('Request Headers:', {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      });
      console.log('Request Body:', {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一个专业的营养师和厨师，擅长根据现有食材创造健康美味的食谱。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "你是一个专业的营养师和厨师，擅长根据现有食材创造健康美味的食谱。"
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

      // 添加响应数据验证和清理
      console.log('API Response:', response.data);
      
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
        
        const recipes = JSON.parse(cleanedContent);
        
        // 验证返回的数据结构
        if (!recipes.recipes || !Array.isArray(recipes.recipes)) {
          throw new Error('返回的数据格式不正确');
        }
        
        return recipes.recipes;
      } catch (parseError) {
        console.error('JSON 解析错误:', parseError);
        console.error('原始内容:', content);
        console.error('清理后的内容:', cleanedContent);
        throw new Error(`JSON 解析错误: ${parseError.message}`);
      }
    } catch (error) {
      console.error('生成食谱失败:', error);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('错误状态码:', status);
        console.error('错误信息:', data);
        
        // 如果是配额错误，等待更长时间
        if (status === 429 || (data.error && data.error.code === 'insufficient_quota')) {
          const waitTime = RETRY_DELAY * Math.pow(2, retries); // 指数退避
          console.log(`配额限制，等待 ${waitTime}ms 后重试...`);
          await delay(waitTime);
          retries++;
          continue;
        }
        
        throw new Error(`生成食谱失败: ${status} - ${JSON.stringify(data)}`);
      } else if (error.request) {
        console.error('未收到响应:', error.request);
        throw new Error('生成食谱失败: 服务器未响应');
      } else {
        console.error('请求错误:', error.message);
        throw new Error(`生成食谱失败: ${error.message}`);
      }
    }
  }
  
  throw new Error('生成食谱失败: 已达到最大重试次数');
};

// 使用微软 AI 进行图像识别
export const recognizeFoodImage = async (imageUri) => {
  try {
    const response = await axios.post(
      `${env.AZURE_AI_ENDPOINT}/vision/v3.2/analyze`,
      {
        url: imageUri
      },
      {
        params: {
          visualFeatures: 'Categories,Description,Objects',
          details: 'Celebrities,Landmarks'
        },
        headers: {
          'Ocp-Apim-Subscription-Key': env.AZURE_AI_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('图像识别错误:', error);
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
            content: '你是一个专业的厨师助手，请根据提供的食材给出烹饪建议。'
          },
          {
            role: 'user',
            content: `我有以下食材：${ingredients.join(', ')}。请给我一些烹饪建议。`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('获取建议错误:', error);
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
            content: '你是一个专业的食材分类助手，请将食材分类为：蔬菜、水果、肉类、海鲜、乳制品、调味料、其他。'
          },
          {
            role: 'user',
            content: `请将"${foodName}"分类到上述类别中。`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('分类错误:', error);
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
            content: '你是一个专业的食品保鲜助手，请根据食材的保质期生成友好的提醒。'
          },
          {
            role: 'user',
            content: `我的${foodItem.name}将在${foodItem.expiryDate}过期，请生成一个提醒。`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('生成提醒错误:', error);
    throw error;
  }
}; 