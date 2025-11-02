import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const useCachedAPI = <T,>(
  apiCall: () => Promise<T>,
  cacheKey: string,
  cacheTime: number = 5 * 60 * 1000 // 5 minutes default
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());

  const fetchData = useCallback(async (forceRefresh = false) => {
    const cached = cache.current.get(cacheKey);
    const now = Date.now();

    // Check cache
    if (!forceRefresh && cached && now - cached.timestamp < cacheTime) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // Fetch new data
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      
      // Update cache
      cache.current.set(cacheKey, {
        data: result,
        timestamp: now,
      });

      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [apiCall, cacheKey, cacheTime]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidateCache = useCallback(() => {
    cache.current.delete(cacheKey);
  }, [cacheKey]);

  return { data, loading, error, refetch: () => fetchData(true), invalidateCache };
};
