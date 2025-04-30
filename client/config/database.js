const config = {
    apiUrl: 'http://localhost:3001',
    debug: true,
    timeout: 30000,
    retryCount: 3, 
    retryDelay: 1000 
};

export const API_URL = config.apiUrl;
export const DEBUG = config.debug;
export const TIMEOUT = config.timeout;
export const RETRY_COUNT = config.retryCount;
export const RETRY_DELAY = config.retryDelay;

export default config; 