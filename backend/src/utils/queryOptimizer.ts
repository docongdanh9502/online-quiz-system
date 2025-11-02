import { Model, Document, FilterQuery, QueryOptions } from 'mongoose';

export interface OptimizedQueryOptions {
  populate?: string | Array<{ path: string; select?: string }>;
  select?: string;
  lean?: boolean;
}

export const optimizedFind = async <T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>,
  options: OptimizedQueryOptions & {
    page?: number;
    limit?: number;
    sort?: any;
  } = {}
): Promise<{
  data: T[];
  total: number;
  pagination: any;
}> => {
  const { page, limit, sort, populate, select, lean } = options;

  // Use lean() for better performance if not needing Mongoose documents
  let query = model.find(filter);

  if (select) {
    query = query.select(select);
  }

  if (sort) {
    query = query.sort(sort);
  }

  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((pop) => {
        query = query.populate(pop.path, pop.select);
      });
    } else {
      query = query.populate(populate);
    }
  }

  if (lean) {
    query = query.lean();
  }

  // Parallel execution: count and data query
  const [total, data] = await Promise.all([
    model.countDocuments(filter),
    page && limit
      ? query.skip((page - 1) * limit).limit(limit)
      : query,
  ]);

  const pagination = page && limit
    ? {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    : null;

  return { data: data as T[], total, pagination };
};

// Aggregation helper for complex queries
export const optimizedAggregate = async <T extends Document>(
  model: Model<T>,
  pipeline: any[],
  cacheKey?: string,
  cacheTTL?: number
): Promise<T[]> => {
  // Check cache if key provided
  if (cacheKey) {
    const { cache } = await import('../config/cache');
    const cached = await cache.get(cacheKey);
    if (cached) return cached;
  }

  const results = await model.aggregate(pipeline);

  // Cache results if key provided
  if (cacheKey && results.length > 0) {
    const { cache } = await import('../config/cache');
    await cache.set(cacheKey, results, cacheTTL || 300);
  }

  return results;
};