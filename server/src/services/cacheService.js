import { EventEmitter } from 'events';

class CacheService extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.memoryCache = new Map();
    this.isRedisEnabled = false;
    this.initialize();
  }

  async initialize() {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;

    if (redisUrl || (redisHost && redisPort)) {
      try {
        // Dynamic import keeps the package optional until installed
        const redis = await import('redis');
        const config = redisUrl ? { url: redisUrl } : { socket: { host: redisHost, port: parseInt(redisPort || '6379') } };
        
        this.client = redis.createClient(config);
        
        this.client.on('error', (err) => {
          console.error('Redis Client Error:', err);
          this.isRedisEnabled = false;
        });

        this.client.on('connect', () => {
          console.log('Successfully connected to Redis cache.');
          this.isRedisEnabled = true;
        });

        await this.client.connect();
      } catch (err) {
        console.warn('Redis client import or connection failed. Using in-memory fallback cache.', err.message);
        this.isRedisEnabled = false;
      }
    } else {
      console.log('Redis env configurations not set. Using modular in-memory fallback cache.');
    }
  }

  async get(key) {
    if (this.isRedisEnabled && this.client) {
      try {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        console.error(`Error reading key ${key} from Redis:`, err);
      }
    }
    return this.memoryCache.get(key) || null;
  }

  async set(key, value, ttlSeconds = 300) {
    if (this.isRedisEnabled && this.client) {
      try {
        await this.client.set(key, JSON.stringify(value), {
          EX: ttlSeconds
        });
        return;
      } catch (err) {
        console.error(`Error writing key ${key} to Redis:`, err);
      }
    }
    this.memoryCache.set(key, value);
    // Automatic cleanup for in-memory TTL
    setTimeout(() => {
      this.memoryCache.delete(key);
    }, ttlSeconds * 1000);
  }

  async del(key) {
    if (this.isRedisEnabled && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        console.error(`Error deleting key ${key} from Redis:`, err);
      }
    }
    this.memoryCache.delete(key);
  }

  async delPattern(pattern) {
    if (this.isRedisEnabled && this.client) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
        return;
      } catch (err) {
        console.error(`Error clearing pattern ${pattern} from Redis:`, err);
      }
    }
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regexPattern.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  async clearUserCache(userId) {
    await this.delPattern(`user:${userId}:*`);
  }
}

export default new CacheService();
