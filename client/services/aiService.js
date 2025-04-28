import axios from 'axios';
import env from '../config/env';

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