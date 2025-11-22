export interface TokenResponse {
  access_token: string;
  token_type: string;
  expired_at: number;
  refresh_token: string;
  re_expired_at: number;
}

export interface StandardResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
}

export type ApiResponse<T = any> = TokenResponse | StandardResponse<T>;

export interface PaginationParams {
  page?: number;
  page_size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
  totalPages: number;
}

// 错误类型定义
export interface ApiError {
  error: {
    code: number;
    message: string;
    details?: unknown;
  };
}
export class HttpError extends Error {
  public code: number;
  public details?: any;

  constructor(message: string, code: number, details?: any) {
    super(message);
    this.name = 'HttpError';
    this.code = code;
    this.details = details;
  }
}
