const Redis = require('ioredis');
const env = require('./env.config');
const logger = require('../utils/logger');

/**
 * Redis client singleton.
 *
 * If REDIS_URL is not set, all Redis operations degrade gracefully:
 * cache misses return null, rate-limiting is skipped, etc.
 * This lets the core app work without Redis during development.
 */
let redisClient = null;

if (env.REDIS_URL) {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      // Exponential backoff: 200ms, 400ms, 800ms, then stop
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected successfully');
  });

  redisClient.on('error', (error) => {
    logger.error('❌ Redis connection error:', { error: error.message });
  });
} else {
  logger.warn('⚠️  REDIS_URL not set — Redis features disabled (cache, rate-limiting, token store)');
}

module.exports = redisClient;
