import { ConfigKeys, env } from '../app/config';
import { OpenAI } from 'openai';

export const getOpenAiClient = () => {
  return new OpenAI({
    apiKey: env.getConfig(ConfigKeys.OPENAI_API_KEY)!,
  });
};
