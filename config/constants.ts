// System constants configuration
export const CONSTANTS = {
  // Magic value
  MAGIC_VALUE: {
    ACCESS_TOKEN: 'access_token',
    DATA: 'data',
    ERROR: 'error',
  } as const,

  // User status
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    SUSPENDED: 'suspended',
  } as const,

  // User gender
  GENDER: {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
  } as const,

  // Role type
  ROLE_TYPE: {
    SYSTEM: 'system',
    CUSTOM: 'custom',
  } as const,

  // Permission type
  PERMISSION_TYPE: {
    MENU: 'menu',
    BUTTON: 'button',
    API: 'api',
    DATA: 'data',
  } as const,

  // Action type
  ACTION_TYPE: {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    EXPORT: 'export',
    IMPORT: 'import',
  } as const,

  // Log type
  LOG_TYPE: {
    LOGIN: 'login',
    LOGOUT: 'logout',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    VIEW: 'view',
    EXPORT: 'export',
    IMPORT: 'import',
    ERROR: 'error',
  } as const,

  // Log level
  LOG_LEVEL: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
  } as const,

  // File type
  FILE_TYPE: {
    IMAGE: 'image',
    DOCUMENT: 'document',
    VIDEO: 'video',
    AUDIO: 'audio',
    ARCHIVE: 'archive',
    OTHER: 'other',
  } as const,

  // Upload status
  UPLOAD_STATUS: {
    UPLOADING: 'uploading',
    DONE: 'done',
    ERROR: 'error',
    REMOVED: 'removed',
  } as const,

  // Theme mode
  THEME_MODE: {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto',
  } as const,

  // Language
  LANGUAGE: {
    ZH: 'zh',
    EN: 'en',
  } as const,

  // HTTP method
  HTTP_METHOD: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
    HEAD: 'HEAD',
    OPTIONS: 'OPTIONS',
  } as const,

  // Response status
  RESPONSE_STATUS: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  } as const,

  // Data status
  DATA_STATUS: {
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
    EMPTY: 'empty',
  } as const,

  // Form validation rules
  VALIDATION_RULES: {
    REQUIRED: { required: true },
    EMAIL: { type: 'email' as const },
    URL: { type: 'url' as const },
    NUMBER: { type: 'number' as const },
    INTEGER: { type: 'integer' as const },
    MIN_LENGTH: (min: number) => ({ min }),
    MAX_LENGTH: (max: number) => ({ max }),
    PATTERN: (pattern: RegExp) => ({ pattern }),
  },

  // Regular expressions
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^1[3-9]\d{9}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    URL: /^https?:\/\/.+/,
    IP: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  },

  // Date format
  DATE_FORMAT: {
    DATE: 'YYYY-MM-DD',
    TIME: 'HH:mm:ss',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    TIMESTAMP: 'YYYY-MM-DD HH:mm:ss.SSS',
    MONTH: 'YYYY-MM',
    YEAR: 'YYYY',
  },

  // File size units
  FILE_SIZE_UNITS: ['B', 'KB', 'MB', 'GB', 'TB'] as const,

  // Color configuration
  COLORS: {
    PRIMARY: '#1890ff',
    SUCCESS: '#52c41a',
    WARNING: '#faad14',
    ERROR: '#ff4d4f',
    INFO: '#1890ff',
    TEXT_PRIMARY: 'rgba(0, 0, 0, 0.85)',
    TEXT_SECONDARY: 'rgba(0, 0, 0, 0.65)',
    TEXT_DISABLED: 'rgba(0, 0, 0, 0.25)',
    BORDER: '#d9d9d9',
    BACKGROUND: '#f5f5f5',
  },
} as const;

// Error code configuration
export const ERROR_CODES = {
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  LOGIN_FAILED: 'LOGIN_FAILED',

  // Permission errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSION: 'INSUFFICIENT_PERMISSION',

  // Data errors
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_DATA: 'DUPLICATE_DATA',
  INVALID_DATA: 'INVALID_DATA',
  DATA_CONFLICT: 'DATA_CONFLICT',

  // Business errors
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  OPERATION_FAILED: 'OPERATION_FAILED',

  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
} as const;

// Success message configuration
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  CREATE_SUCCESS: 'Created successfully',
  UPDATE_SUCCESS: 'Updated successfully',
  DELETE_SUCCESS: 'Deleted successfully',
  SAVE_SUCCESS: 'Saved successfully',
  UPLOAD_SUCCESS: 'Uploaded successfully',
  OPERATION_SUCCESS: 'Operation successful',
} as const;
