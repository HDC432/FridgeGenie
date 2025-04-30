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
            content: 'You are a helpful AI assistant that can help users manage their food inventory and generate recipes. You can also engage in casual conversation.',
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