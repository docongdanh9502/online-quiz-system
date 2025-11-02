import Redis from 'ioredis';

let redisClient: Redis | null = null;

export const initRedis = (): Redis | null => {
  try {
    if (!redisClient) {
      redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis đã kết nối thành công');
      });

      redisClient.on('error', (err) => {
        console.error('❌ Lỗi Redis:', err);
      });
    }
    return redisClient;
  } catch (error) {
    console.error('❌ Lỗi khởi tạo Redis:', error);
    return null;
  }
};

export const getRedisClient = (): Redis | null => {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};

export const cache = {
  get: async (key: string): Promise<any> => {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Lỗi khi get cache:', error);
      return null;
    }
  },

  set: async (key: string, value: any, ttl: number = 3600): Promise<void> => {
    const client = getRedisClient();
    if (!client) return;

    try {
      await client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Lỗi khi set cache:', error);
    }
  },

  del: async (key: string): Promise<void> => {
    const client = getRedisClient();
    if (!client) return;

    try {
      await client.del(key);
    } catch (error) {
      console.error('Lỗi khi xóa cache:', error);
    }
  },

  delPattern: async (pattern: string): Promise<void> => {
    const client = getRedisClient();
    if (!client) return;

    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      console.error('Lỗi khi xóa cache pattern:', error);
    }
  },
};