import axios from 'axios';
// Temporarily comment out the env import to make UI work
import { OPENAI_API_KEY } from '@env';
import { API_URL } from '../config/constants';
import authService from '../services/authService';

// 使用环境变量中的API密钥
// const OPENAI_API_KEY = 'sk-placeholder-api-key-for-ui-development';

// 添加重试配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateRecipes = async (ingredients, familyId) => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      // 获取家庭成员的健康标签
      const familyHealthTags = await getFamilyHealthTags(familyId);
      
      // 生成健康提示词
      const healthPrompt = generateHealthPrompt(familyHealthTags);
      
      const prompt = `基于以下食材和健康考虑生成5个健康食谱 每个食谱需要包含
1. 食谱名称
2. 所需食材及用量
3. 详细步骤
4. 烹饪时间
5. 难度级别
6. 营养成分分析（包括卡路里、蛋白质、碳水化合物、脂肪、膳食纤维）

可用食材：${ingredients.join(', ')}

家庭成员健康标签：${healthPrompt}

请确保食谱：
- 使用提供的食材
- 优先考虑家庭成员的健康标签需求
- 如果无法完全满足所有健康标签，至少满足最重要的标签
- 营养均衡
- 适合家庭制作
- 步骤清晰易懂

请以JSON格式返回格式如下:
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

      console.log('健康提示词:', healthPrompt); // 添加日志以便调试

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "你是一个专业的营养师和厨师，擅长根据现有食材创造健康美味的家常菜食谱，并考虑家庭成员的健康需求"
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
      }
      
      // 错误处理后增加重试次数
      retries++;
      
      // 如果还有重试机会，则等待后重试
      if (retries < MAX_RETRIES) {
        const waitTime = RETRY_DELAY * Math.pow(2, retries);
        console.log(`第 ${retries} 次重试失败，等待 ${waitTime}ms 后再试...`);
        await delay(waitTime);
        continue;
      }
      
      // 重试次数用完，抛出错误
      throw new Error('生成食谱失败: 已达到最大重试次数');
    }
  }
  
  throw new Error('生成食谱失败: 已达到最大重试次数');
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
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
        console.error('获取家庭成员健康标签失败:', error);
        return [];
    }
};

// 生成健康标签提示词
const generateHealthPrompt = (healthTags) => {
    if (!healthTags || healthTags.length === 0) return '';

    // 确保所有标签都是字符串
    const tags = healthTags.flat().map(tag => {
        if (typeof tag === 'string') return tag;
        if (tag && typeof tag === 'object') return tag.name || tag.tag || '';
        return '';
    }).filter(tag => tag !== '');

    const uniqueTags = [...new Set(tags)];
    
    // 分类处理健康标签
    const dietaryRestrictions = uniqueTags.filter(tag => 
        ['素食', '纯素', '无麸质', '无乳糖', '过敏'].some(keyword => tag.includes(keyword))
    );
    
    const healthConditions = uniqueTags.filter(tag => 
        ['控制血糖', '控制血压', '注意心脏健康', '注意肾脏健康'].some(keyword => tag.includes(keyword))
    );
    
    const weightGoals = uniqueTags.filter(tag => 
        ['减脂需求', '增肌需求', '维持体重'].some(keyword => tag.includes(keyword))
    );

    const activityLevels = uniqueTags.filter(tag => 
        ['久坐', '轻度活动', '中度活动', '活跃', '非常活跃'].some(keyword => tag.includes(keyword))
    );

    let prompt = '请考虑以下健康因素：\n';
    
    if (dietaryRestrictions.length > 0) {
        prompt += `- 饮食限制：${dietaryRestrictions.join('，')}\n`;
    }
    
    if (healthConditions.length > 0) {
        prompt += `- 健康状况：${healthConditions.join('，')}\n`;
    }
    
    if (weightGoals.length > 0) {
        prompt += `- 体重目标：${weightGoals.join('，')}\n`;
    }

    if (activityLevels.length > 0) {
        prompt += `- 活动水平：${activityLevels.join('，')}\n`;
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
你是一个专业的营养师。请根据以下健康信息为这个家庭提供饮食建议：

${healthPrompt}

请提供：
1. 每日饮食建议
2. 营养搭配原则
3. 需要避免的食物
4. 推荐的食物
5. 饮食时间建议
6. 特殊注意事项

请确保建议：
- 科学合理
- 实用可行
- 考虑所有健康因素
- 适合家庭执行
`;

        const response = await axios.post(`${API_URL}/api/ai/generate`, {
            prompt,
            max_tokens: 800,
            temperature: 0.7
        });

        return response.data;
    } catch (error) {
        console.error('生成饮食建议失败:', error);
        throw error;
    }
}; 