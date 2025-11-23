export interface OrderItem {
  field: string;
  order: 'asc' | 'desc';
}

export interface PaginationRequest {
  current: number;
  page_size: number;
  sort_str?: string;
}

export function createPaginationRequest(
  current: number = 1,
  page_size: number = 10,
  sort_str?: string,
): PaginationRequest {
  return {
    current,
    page_size,
    sort_str,
  };
}

export interface PageResult<T> {
  total: number;
  records: T[];
}
