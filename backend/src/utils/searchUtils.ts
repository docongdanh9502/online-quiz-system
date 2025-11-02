export interface SearchOptions {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    [key: string]: any;
  }
  
  export const buildSearchFilter = (query: any, searchFields: string[]): any => {
    const filter: any = {};
  
    if (query.search) {
      filter.$or = searchFields.map((field) => ({
        [field]: { $regex: query.search as string, $options: 'i' },
      }));
    }
  
    return filter;
  };
  
  export const buildDateRangeFilter = (
    query: any,
    fieldName: string = 'createdAt'
  ): any => {
    const filter: any = {};
  
    if (query[`${fieldName}From`] || query[`${fieldName}To`]) {
      filter[fieldName] = {};
      if (query[`${fieldName}From`]) {
        filter[fieldName].$gte = new Date(query[`${fieldName}From`] as string);
      }
      if (query[`${fieldName}To`]) {
        filter[fieldName].$lte = new Date(query[`${fieldName}To`] as string);
      }
    }
  
    return filter;
  };
  
  export const buildRangeFilter = (
    query: any,
    fieldName: string,
    minKey?: string,
    maxKey?: string
  ): any => {
    const filter: any = {};
    const minField = minKey || `${fieldName}Min`;
    const maxField = maxKey || `${fieldName}Max`;
  
    if (query[minField] || query[maxField]) {
      filter[fieldName] = {};
      if (query[minField]) {
        filter[fieldName].$gte = parseFloat(query[minField] as string);
      }
      if (query[maxField]) {
        filter[fieldName].$lte = parseFloat(query[maxField] as string);
      }
    }
  
    return filter;
  };
  
  export const buildArrayFilter = (query: any, fieldName: string): any => {
    const filter: any = {};
  
    if (query[fieldName]) {
      const values = Array.isArray(query[fieldName])
        ? query[fieldName]
        : [query[fieldName]];
      filter[fieldName] = { $in: values };
    }
  
    return filter;
  };
  
  export const buildSortOptions = (query: any, defaultSort: string = 'createdAt'): any => {
    const sortBy = (query.sortBy as string) || defaultSort;
    const sortOrder = (query.sortOrder as string) === 'asc' ? 1 : -1;
    return { [sortBy]: sortOrder };
  };
  
  export const getPaginationOptions = (query: any) => {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;
  
    return { page, limit, skip };
  };