export const API_CONFIG = {
  // Use relative path for API routes (works in both dev and production with Vercel)
  baseURL: '/api',
  apiKey: '', // API key is handled server-side in Vercel functions
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

export const REFRESH_INTERVALS = {
  MARKET_HOURS: 60000, // 1 minute during market hours
  EARNINGS_TIME: 30000, // 30 seconds during earnings release times
  OFF_HOURS: 300000, // 5 minutes during off hours
};

export const MARKET_HOURS = {
  PRE_MARKET_START: '04:00',
  MARKET_OPEN: '09:30',
  MARKET_CLOSE: '16:00',
  AFTER_HOURS_END: '20:00',
};
