import { ENV, isDevelopment } from './env';

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/login/login',
    LOGOUT: '/login/logout',
    REFRESH: '/login/refresh',
    ME: '/login/me',
    CHANGE_PASSWORD: '/login/change-password',
  },

  // User Management
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    DETAIL: (id: string) => `/users/${id}`,
    BATCH_DELETE: '/users/batch-delete',
    RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
    TOGGLE_STATUS: (id: string) => `/users/${id}/status`,
  },

  // Role Management
  ROLES: {
    LIST: '/roles',
    CREATE: '/roles',
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
    DETAIL: (id: string) => `/roles/${id}`,
    PERMISSIONS: (id: string) => `/roles/${id}/permissions`,
  },

  // Permission Management
  PERMISSIONS: {
    LIST: '/permissions',
    CREATE: '/permissions',
    UPDATE: (id: string) => `/permissions/${id}`,
    DELETE: (id: string) => `/permissions/${id}`,
    TREE: '/permissions/tree',
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ACTIVITIES: '/dashboard/activities',
    SYSTEM_HEALTH: '/dashboard/system-health',
    CHARTS: '/dashboard/charts',
  },

  // File Upload
  UPLOAD: {
    SINGLE: '/upload/single',
    MULTIPLE: '/upload/multiple',
    AVATAR: '/upload/avatar',
  },

  // System Settings
  SYSTEM: {
    SETTINGS: '/system/settings',
    LOGS: '/system/logs',
    BACKUP: '/system/backup',
    RESTORE: '/system/restore',
  },
} as const;

// HTTP Configuration
export const HTTP_CONFIG = {
  HOST: ENV.API_HOST,
  API_BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: ENV.API_TIMEOUT,
  WITH_CREDENTIALS: isDevelopment(),

  // Request Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'X-Client-Version': ENV.APP_VERSION,
    'X-Client-Platform': 'web',
  },

  // Status Codes
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOKEN_EXPIRED: 409,
    INTERNAL_SERVER_ERROR: 500,
  },
} as const;

// API Response Format
export const API_RESPONSE_FORMAT = {
  SUCCESS_CODE: 0,
  ERROR_CODE: -1,

  // Standard Response Structure
  STRUCTURE: {
    code: 'number',
    message: 'string',
    data: 'any',
    success: 'boolean',
    timestamp: 'number',
  },
} as const;
