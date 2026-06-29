import Redis from 'ioredis';
import { logger } from '../logging/logger';

let redisClient: Redis | null = null;

/**
 * Establishes a connection to the Redis server.
 * Returns the connected Redis client instance.
 */
export const connectRedis = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  const redisHost = process.env.REDIS_HOST || '127.0.0.1';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const redisPassword = process.env.REDIS_PASSWORD;

  logger.info(`⏳ Connecting to Redis at ${redisHost}:${redisPort}...`);

  redisClient = new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    maxRetriesPerRequest: null, // Essential setting for Socket.io adapter support
  });

  redisClient.on('connect', () => {
    logger.info('🚀 Redis client connected successfully');
  });

  redisClient.on('error', (error: Error) => {
    logger.error(`❌ Redis connection error: ${error.message}`);
  });

  return redisClient;
};

/**
 * Retrieves the initialized Redis client instance.
 * Throws an error if connectRedis() has not been called first.
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client has not been initialized. Call connectRedis() first.');
  }
  return redisClient;
};

/**
 * Cleanly disconnects the Redis client.
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info('🔌 Redis connection closed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`💥 Error closing Redis connection: ${errorMessage}`);
    }
  }
};
