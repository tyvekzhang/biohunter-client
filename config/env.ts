// Environment Configuration Management
export const ENV = {
  // Application Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',

  // Application Basic Information
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'FastWeb',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  APP_DESCRIPTION:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    'One of the best scaffold in PyWeb',
  PREFIX_CLS: process.env.NEXT_PREFIX_CLS || 'fw',

  // API Configuration
  API_HOST: process.env.NEXT_PUBLIC_API_HOST || 'http://127.0.0.1:13000',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  API_TIMEOUT: Number.parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'), // 10 seconds

  // Authentication Configuration
  JWT_SECRET: process.env.NEXT_PUBLIC_JWT_SECRET || 'default-secret',
  TOKEN_EXPIRE_TIME: Number.parseInt(
    process.env.NEXT_PUBLIC_TOKEN_EXPIRE_TIME || '7200000',
  ), // 2 hours in ms

  // Upload Configuration
  UPLOAD_MAX_SIZE: Number.parseInt(
    process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE || '10485760',
  ), // 10MB in bytes
  UPLOAD_ALLOWED_TYPES: process.env.NEXT_PUBLIC_UPLOAD_ALLOWED_TYPES?.split(
    ',',
  ) || ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

  // Pagination Configuration
  DEFAULT_PAGE_SIZE: Number.parseInt(
    process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '10',
  ),
  MAX_PAGE_SIZE: Number.parseInt(
    process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100',
  ),

  // Theme Configuration
  DEFAULT_THEME: process.env.NEXT_PUBLIC_DEFAULT_THEME || 'light',
  DEFAULT_LANGUAGE: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'zh', // Chinese

  // Feature Flags
  ENABLE_MOCK: process.env.NEXT_PUBLIC_ENABLE_MOCK === 'true',
  ENABLE_DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  ENABLE_PERFORMANCE_MONITOR:
    process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITOR === 'true',
  ENABLE_CSP: process.env.NEXT_PUBLIC_ENABLE_CSP === 'true',

  // Logging Configuration
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
} as const;

// Environment Check Functions
export const isDevelopment = () => ENV.IS_DEVELOPMENT;
export const isProduction = () => ENV.IS_PRODUCTION;
export const isTest = () => ENV.IS_TEST;

// Feature Flag Check Functions
export const isMockEnabled = () => ENV.ENABLE_MOCK;
export const isDebugEnabled = () => ENV.ENABLE_DEBUG;
export const isPerformanceMonitorEnabled = () => ENV.ENABLE_PERFORMANCE_MONITOR;
