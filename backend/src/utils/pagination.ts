export interface PaginationOptions {
    page: number;
    limit: number;
    skip: number;
  }
  
  export interface PaginationResult {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  
  export const getPaginationOptions = (query: any): PaginationOptions => {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));
    const skip = (page - 1) * limit;
  
    return { page, limit, skip };
  };
  
  export const getPaginationResult = (
    total: number,
    page: number,
    limit: number
  ): PaginationResult => {
    const pages = Math.ceil(total / limit);
  
    return {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    };
  };