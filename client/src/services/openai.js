import axios from 'axios';
import env from '../../config/env';

const OPENAI_API_KEY = env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const sendMessageToAI = async (message) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `你是一个帮助用户管理食品库存的AI助手。请严格按照以下规则处理用户输入：

            1. 日期处理规则：
               - 今天 = 当前日期
               - 明天 = 当前日期+1天
               - 后天 = 当前日期+2天
               - X天后 = 当前日期+X天
               - 下周 = 当前日期+7天
               - 下个月 = 当前日期+30天
               - 具体日期必须保持原样，不要进行任何修改或转换
               - 如果用户指定了具体日期（比如2025年5月30号），必须精确使用这个日期

            2. 输出格式：
               A. 添加物品（有到期日）：
                  "ADD {数量} {物品名} EXPIRES {YYYY-MM-DD}"
                  例如：
                  - "ADD 2 milk EXPIRES 2024-03-20"
                  - "ADD 1 bread EXPIRES 2024-03-15"
               
               B. 添加物品（无到期日）：
                  "ADD {数量} {物品名}"
                  例如："ADD 3 apple"
               
               C. 其他命令：
                  - 删除："DELETE {物品名}"
                  - 更新："UPDATE {物品名} TO {数量}"
                  - 查询："QUERY {物品名}"

            3. 严格要求：
               - 必须使用英文单词
               - 数量必须是数字
               - 日期必须是完整的YYYY-MM-DD格式
               - 不要添加任何额外文字
               - 如果听不懂或无法处理，返回"UNKNOWN_COMMAND"
               - 用户指定的具体日期必须保持不变，不要进行任何调整

            4. 示例转换：
               - "添加2瓶牛奶，明天到期" → "ADD 2 milk EXPIRES 2024-03-15"
               - "Add 3 apples expiring in 5 days" → "ADD 3 apple EXPIRES 2024-03-19"
               - "添加1个面包，下周过期" → "ADD 1 bread EXPIRES 2024-03-21"
               - "加入2个鸡蛋" → "ADD 2 egg"
               - "添加1个玉米，2025年5月30号到期" → "ADD 1 corn EXPIRES 2025-05-30"`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    throw error;
  }
};

export const estimateExpiryDate = async (itemName) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `你是一个食品保鲜专家。请根据以下规则估算食品在冰箱中的保质期：

            规则：
            1. 新鲜蔬菜：
               - 叶菜类（生菜、菠菜等）：3-5天
               - 根茎类（胡萝卜、土豆等）：7-14天
            2. 新鲜水果：
               - 浆果类（草莓、蓝莓等）：3-5天
               - 柑橘类：7-14天
               - 苹果、梨：14-21天
            3. 新鲜肉类：
               - 绞肉：1-2天
               - 整块肉：2-3天
               - 腌制肉：3-5天
            4. 海鲜：
               - 新鲜鱼：1-2天
               - 贝类：2-3天
            5. 乳制品：
               - 牛奶（开封后）：5-7天
               - 酸奶：7-10天
               - 奶酪：7-14天
            6. 熟食：
               - 剩菜：3-4天
               - 熟肉：3-4天
            7. 包装食品：
               - 按包装上标注时间
               - 开封后一般7天内食用

            请根据食品类型返回保守估计的天数（整数）。
            只返回数字，不要有任何其他文字。`,
          },
          {
            role: 'user',
            content: `${itemName}在冰箱中能保存多少天？`,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const days = parseInt(response.data.choices[0].message.content.trim());
    return isNaN(days) ? 7 : days; // 如果AI返回的不是数字，默认为7天
  } catch (error) {
    console.error('Error estimating expiry date:', error);
    return 7; // 发生错误时返回默认值
  }
}; 