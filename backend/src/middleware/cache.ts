import { Request, Response, NextFunction } from 'express';
import { cache } from '../config/cache';
import { AuthRequest } from './auth';

export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Skip cache for POST, PUT, DELETE requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return next();
    }

    // Skip cache if user is authenticated and viewing personal data
    if (req.user && req.path.includes('/my-')) {
      return next();
    }

    const cacheKey = `cache:${req.method}:${req.path}:${JSON.stringify(req.query)}`;
    
    try {
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        return res.status(200).json(cachedData);
      }

      // Store original json function
      const originalJson = res.json.bind(res);

      // Override json function to cache response
      res.json = function (data: any) {
        cache.set(cacheKey, data, ttl).catch(console.error);
        return originalJson(data);
      };

      next();
    } catch (error) {
      next();
    }
  };
};