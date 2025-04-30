/**
 * @module openai
 * @description Service module for handling OpenAI API interactions
 */

import axios from 'axios';
import env from '../../config/env';

/**
 * OpenAI API key from environment variables
 * @constant {string}
 */
const OPENAI_API_KEY = env.OPENAI_API_KEY;

/**
 * OpenAI API endpoint for chat completions
 * @constant {string}
 */
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Sends a message to the AI assistant and processes the response
 * @async
 * @param {string} message - The user's input message about food items
 * @returns {Promise<string>} The AI's processed response with standardized command format
 * @throws {Error} If there's an error communicating with OpenAI API
 */
export const sendMessageToAI = async (message) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant helping users manage their food inventory. Please strictly follow these rules when processing user input:

            1. Date Processing Rules:
               - Today = Current date
               - Tomorrow = Current date + 1 day
               - Day after tomorrow = Current date + 2 days
               - X days later = Current date + X days
               - Next week = Current date + 7 days
               - Next month = Current date + 30 days
               - Specific dates must remain unchanged
               - If a specific date is provided (e.g., May 30, 2025), use that exact date
               - If no year is specified, use 2025 as the default year
               - If a date in the current year has already passed, use 2025

            2. Output Format:
               A. Add item (with expiry date):
                  "ADD {quantity} {item_name} EXPIRES {YYYY-MM-DD}"
                  Examples:
                  - "ADD 2 milk EXPIRES 2025-03-20"
                  - "ADD 1 bread EXPIRES 2025-03-15"
               
               B. Add item (without expiry date):
                  "ADD {quantity} {item_name}"
                  Example: "ADD 3 apple"
               
               C. Other commands:
                  - Delete: "DELETE {item_name}"
                  - Update: "UPDATE {item_name} TO {quantity}"
                  - Query: "QUERY {item_name}"

            3. Response Rules:
               - For inventory management commands (add, delete, update, query), use the exact formats specified above
               - For all other conversations, respond naturally and conversationally
               - Must use English words
               - Quantity must be a number
               - Date must be in full YYYY-MM-DD format
               - Keep user-specified dates exactly as provided
               - Default to 2025 for dates without a year

            4. Example Conversions:
               - "Add 2 bottles of milk, expires tomorrow" → "ADD 2 milk EXPIRES 2025-03-15"
               - "Add 3 apples expiring in 5 days" → "ADD 3 apple EXPIRES 2025-03-19"
               - "Add 1 bread, expires next week" → "ADD 1 bread EXPIRES 2025-03-21"
               - "Add 2 eggs" → "ADD 2 egg"
               - "Add 1 corn, expires May 30, 2025" → "ADD 1 corn EXPIRES 2025-05-30"
               - "How are you?" → Respond naturally with a greeting
               - "What can you do?" → Explain your capabilities conversationally`,
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

    // Process the response
    const content = response.data.choices[0].message.content;
    
    // Check for date in the response
    if (content.includes('EXPIRES')) {
      // Extract the date part from the message
      const dateMatch = content.match(/EXPIRES\s+(\d{4}-\d{2}-\d{2})/i);
      if (dateMatch) {
        const dateStr = dateMatch[1];
        // Parse the date and add one day
        const date = new Date(dateStr);
        date.setDate(date.getDate() + 1);
        // Format the new date
        const newDateStr = date.toISOString().split('T')[0];
        // Replace the original date with the new date
        return content.replace(dateStr, newDateStr);
      }
    }

    return content;
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    throw error;
  }
};

/**
 * Estimates the expiry date for a food item based on its type
 * @async
 * @param {string} itemName - The name of the food item to estimate expiry for
 * @returns {Promise<number>} The estimated number of days until expiry
 * @throws {Error} If there's an error communicating with OpenAI API
 * @default 7 Returns 7 days if estimation fails or returns non-numeric value
 */
export const estimateExpiryDate = async (itemName) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a food preservation expert. Please estimate the shelf life of food items in the refrigerator based on these rules:

            Rules:
            1. Fresh Vegetables:
               - Leafy greens (lettuce, spinach, etc.): 3-5 days
               - Root vegetables (carrots, potatoes, etc.): 7-14 days
            2. Fresh Fruits:
               - Berries (strawberries, blueberries, etc.): 3-5 days
               - Citrus fruits: 7-14 days
               - Apples, pears: 14-21 days
            3. Fresh Meat:
               - Ground meat: 1-2 days
               - Whole cuts: 2-3 days
               - Cured meat: 3-5 days
            4. Seafood:
               - Fresh fish: 1-2 days
               - Shellfish: 2-3 days
            5. Dairy Products:
               - Milk (opened): 5-7 days
               - Yogurt: 7-10 days
               - Cheese: 7-14 days
            6. Cooked Food:
               - Leftovers: 3-4 days
               - Cooked meat: 3-4 days
            7. Packaged Food:
               - Follow package expiration date
               - Generally 7 days after opening

            Please return a conservative estimate of days (integer) based on the food type.
            Return only the number, no additional text.`,
          },
          {
            role: 'user',
            content: `How many days can ${itemName} be stored in the refrigerator?`,
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
    return isNaN(days) ? 7 : days; // Default to 7 days if AI returns non-numeric value
  } catch (error) {
    console.error('Error estimating expiry date:', error);
    return 7; // Return default value on error
  }
}; 