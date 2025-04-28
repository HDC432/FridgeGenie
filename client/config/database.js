const config = {
    // 使用 localhost
    apiUrl: 'http://localhost:3001',
    debug: true, // 添加调试模式
    timeout: 30000, // 请求超时时间（毫秒）
    retryCount: 3, // 请求失败重试次数
    retryDelay: 1000 // 重试延迟（毫秒）
};

export const API_URL = config.apiUrl;
export const DEBUG = config.debug;
export const TIMEOUT = config.timeout;
export const RETRY_COUNT = config.retryCount;
export const RETRY_DELAY = config.retryDelay;

export default config; 