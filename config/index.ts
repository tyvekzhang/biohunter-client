// Unified export of all configurations
export { API_ENDPOINTS, API_RESPONSE_FORMAT, HTTP_CONFIG } from './api';
export { APP_CONFIG, PERMISSION_CONFIG, THEME_CONFIG } from './app';
export { CONSTANTS, ERROR_CODES, SUCCESS_MESSAGES } from './constants';
export {
  ENV,
  isDebugEnabled,
  isDevelopment,
  isMockEnabled,
  isPerformanceMonitorEnabled,
  isProduction,
  isTest,
} from './env';

// Configuration validation function
export const validateConfig = () => {
  const requiredEnvVars = ['NEXT_PUBLIC_APP_NAME', 'NEXT_PUBLIC_API_HOST'];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
  }
};

// Configuration initialization
export const initConfig = () => {
  try {
    validateConfig();
    console.log('✅ Configuration initialized successfully');
  } catch (error) {
    console.error('❌ Configuration initialization failed:', error);
    throw error;
  }
};
