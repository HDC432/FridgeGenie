import env from '../config/env';

// API 配置
export const API_URL = 'http://localhost:3001';

// Azure Speech Services 配置
export const AZURE_SPEECH = {
  SUBSCRIPTION_KEY: env.AZURE_SPEECH_KEY,
  REGION: 'eastus', // 例如: 'eastus', 'westeurope' 等
  LANGUAGE: 'zh-CN', // 语音识别语言
  RECOGNITION_MODE: 'conversation', // 识别模式：conversation, dictation, interactive
  OUTPUT_FORMAT: 'simple', // 输出格式：simple, detailed
  AUDIO_CONFIG: {
    sampleRateHz: 16000,
    bitsPerSample: 16,
    channels: 1,
  },
};

// 应用配置
export const APP_CONFIG = {
  THEME: {
    PRIMARY_COLOR: '#007AFF',
    SECONDARY_COLOR: '#5856D6',
    BACKGROUND_COLOR: '#FFFFFF',
    TEXT_COLOR: '#000000',
  },
  CHAT: {
    MAX_MESSAGE_LENGTH: 1000,
    AUTO_SCROLL: true,
    MESSAGE_DELAY: 1000, // 消息发送延迟（毫秒）
  },
  VOICE: {
    ENABLED: true,
    AUTO_PLAY: true,
    VOLUME: 1.0,
    RATE: 1.0,
    PITCH: 1.0,
  },
  STORAGE: {
    MESSAGE_HISTORY_LIMIT: 100, // 保存的消息历史记录数量
    CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 缓存过期时间（毫秒）
  },
};

// 错误消息配置
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed, please check your network settings',
  SPEECH_RECOGNITION_ERROR: 'Speech recognition failed, please try again',
  PERMISSION_DENIED: 'Microphone permission is required to use voice features',
  INVALID_INPUT: 'Invalid input, please try again',
  SERVER_ERROR: 'Server error, please try again later',
};

// 功能开关配置
export const FEATURE_FLAGS = {
  ENABLE_VOICE_INPUT: true,
  ENABLE_VOICE_OUTPUT: true,
  ENABLE_IMAGE_RECOGNITION: false,
  ENABLE_LOCATION_SERVICES: false,
  ENABLE_NOTIFICATIONS: true,
}; 