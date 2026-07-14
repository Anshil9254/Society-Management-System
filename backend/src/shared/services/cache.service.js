const logger = require('../utils/logger');

class CacheService {
  /**
   * @param {import('ioredis').Redis} redisClient 
   */
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /**
   * Retrieve a value from the cache
   * @param {string} key 
   * @returns {Promise<any>}
   */
  async get(key) {
    if (!this.redis) return null;
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Cache GET error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set a value in the cache with an expiration time
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlSeconds - Time to live in seconds (default 3600 = 1 hour)
   */
  async set(key, value, ttlSeconds = 3600) {
    if (!this.redis) return;
    try {
      const stringValue = JSON.stringify(value);
      await this.redis.set(key, stringValue, 'EX', ttlSeconds);
    } catch (error) {
      logger.error(`Cache SET error for key ${key}:`, error.message);
    }
  }

  /**
   * Delete a value from the cache
   * @param {string} key 
   */
  async del(key) {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error(`Cache DEL error for key ${key}:`, error.message);
    }
  }

  /**
   * Delete multiple keys matching a pattern (e.g. 'complaints:*')
   * Uses SCAN to avoid blocking Redis.
   * @param {string} pattern 
   */
  async deletePattern(pattern) {
    if (!this.redis) return;
    try {
      const stream = this.redis.scanStream({
        match: pattern,
        count: 100,
      });

      stream.on('data', async (keys) => {
        if (keys.length) {
          const pipeline = this.redis.pipeline();
          keys.forEach((key) => pipeline.del(key));
          await pipeline.exec();
        }
      });
    } catch (error) {
      logger.error(`Cache DELETE PATTERN error for pattern ${pattern}:`, error.message);
    }
  }

  /**
   * Wrap an async function with caching
   * @param {string} key 
   * @param {Function} fetchFunction - The async function to fetch data if cache misses
   * @param {number} ttlSeconds 
   */
  async getOrSet(key, fetchFunction, ttlSeconds = 3600) {
    const cachedData = await this.get(key);
    if (cachedData) {
      return cachedData;
    }

    const freshData = await fetchFunction();
    await this.set(key, freshData, ttlSeconds);
    return freshData;
  }
}

module.exports = CacheService;
