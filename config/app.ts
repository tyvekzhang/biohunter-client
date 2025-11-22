import { ENV } from './env';

// 应用配置
export const APP_CONFIG = {
  // 基础信息
  NAME: ENV.APP_NAME,
  VERSION: ENV.APP_VERSION,
  DESCRIPTION: ENV.APP_DESCRIPTION,
  PREFIX_CLS: ENV.PREFIX_CLS,

  // 路由配置
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/',
    PROFILE: '/profile',
    USERS: '/admin/users',
    ROLES: '/admin/roles',
    PERMISSIONS: '/admin/permissions',
    SETTINGS: '/settings',
    NOT_FOUND: '/404',
    ERROR: '/error',
  },

  // 存储键名配置
  STORAGE_KEYS: {
    AUTH: 'login-storage',
    CONCERSATION_ID: 'conversation_id',
    THEME: 'theme-storage',
    USER_PREFERENCES: 'user-preferences',
    CACHE: 'app-cache',
  },

  // 分页配置
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: ENV.DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE: ENV.MAX_PAGE_SIZE,
    SHOW_SIZE_CHANGER: true,
    SHOW_QUICK_JUMPER: true,
    SHOW_TOTAL: true,
    PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
  },

  // 表格配置
  TABLE: {
    DEFAULT_SIZE: 'middle' as const,
    SCROLL_X: 800,
    ROW_SELECTION_TYPE: 'checkbox' as const,
    BORDERED: false,
    SHOW_HEADER: true,
  },

  // 表单配置
  FORM: {
    LAYOUT: 'vertical' as const,
    LABEL_COL: { span: 24 },
    WRAPPER_COL: { span: 24 },
    VALIDATE_TRIGGER: 'onBlur' as const,
    PRESERVE: false,
  },

  // 上传配置
  UPLOAD: {
    MAX_SIZE: ENV.UPLOAD_MAX_SIZE,
    ALLOWED_TYPES: ENV.UPLOAD_ALLOWED_TYPES,
    MAX_COUNT: 10,
    MULTIPLE: true,
    DRAG: true,
    SHOW_UPLOAD_LIST: true,
  },

  // 消息配置
  MESSAGE: {
    DURATION: 3,
    MAX_COUNT: 5,
    TOP: 24,
    GET_CONTAINER: () => document.body,
  },

  // 通知配置
  NOTIFICATION: {
    DURATION: 4.5,
    PLACEMENT: 'topRight' as const,
    MAX_COUNT: 10,
  },

  // 模态框配置
  MODAL: {
    MASK_CLOSABLE: false,
    KEYBOARD: true,
    CENTERED: true,
    DESTROY_ON_CLOSE: true,
  },

  // 抽屉配置
  DRAWER: {
    MASK_CLOSABLE: true,
    KEYBOARD: true,
    DESTROY_ON_CLOSE: true,
    PLACEMENT: 'right' as const,
  },
} as const;

// 主题配置
export const THEME_CONFIG = {
  DEFAULT_THEME: ENV.DEFAULT_THEME as 'light' | 'dark',
  DEFAULT_LANGUAGE: ENV.DEFAULT_LANGUAGE as 'zh' | 'en',

  // 主题色配置
  COLORS: {
    PRIMARY: '#1890ff',
    SUCCESS: '#52c41a',
    WARNING: '#faad14',
    ERROR: '#ff4d4f',
    INFO: '#1890ff',
  },

  // 布局配置
  LAYOUT: {
    HEADER_HEIGHT: 64,
    SIDER_WIDTH: 256,
    SIDER_COLLAPSED_WIDTH: 80,
    CONTENT_PADDING: 24,
  },

  // 动画配置
  ANIMATION: {
    DURATION: 0.3,
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// 权限配置
export const PERMISSION_CONFIG = {
  // 超级管理员角色
  SUPER_ADMIN_ROLE: 'super_admin',

  // 默认权限
  DEFAULT_PERMISSIONS: ['dashboard:view', 'profile:view', 'profile:update'],

  // 权限检查模式
  CHECK_MODE: 'strict' as 'strict' | 'loose',

  // 权限缓存时间（毫秒）
  CACHE_DURATION: 5 * 60 * 1000, // 5分钟
} as const;
