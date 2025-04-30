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
            content: `You are an AI assistant that helps users manage their food inventory. When users want to manage items, please respond in the following format:
            - For adding items: "ADD {quantity} {item}", e.g., "ADD 100 avocados"
            - For deleting items: "DELETE {item}", e.g., "DELETE avocados"
            - For updating quantities: "UPDATE {item} TO {quantity}", e.g., "UPDATE avocados TO 50"
            - For querying items: "QUERY {item}", e.g., "QUERY avocados"
            Please strictly follow these formats so the system can process the commands correctly.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
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