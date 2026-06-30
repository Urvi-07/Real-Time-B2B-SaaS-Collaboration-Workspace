import http from 'http';
import app from './app';
import { config } from './infrastructure/config/config';
import { logger } from './infrastructure/logging/logger';
import { SocketService } from './infrastructure/sockets/socketService';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/mongoose';
import { disconnectRedis, getRedisClient, waitForRedis } from './infrastructure/redis/redisClient';

const server = http.createServer(app);

// Graceful Shut Down
const shutdownGracefully = (signal: string) => {
  logger.info(`👋 Received ${signal}. Shutting down server gracefully...`);
  server.close(async () => {
    logger.info('💤 HTTP server closed.');
    try {
      await SocketService.close();
      await disconnectRedis();
      await disconnectDatabase();
      logger.info('🎉 Graceful shutdown complete. Exiting process.');
      process.exit(0);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error(`💥 Error during graceful shutdown: ${errMsg}`);
      process.exit(1);
    }
  });

  // Force shutdown if taking too long
  setTimeout(() => {
    logger.error('⚠️ Forcefully shutting down because connections took too long to close');
    process.exit(1);
  }, 10000);
};

const startServer = async () => {
  try {
    // Establish database connection first (fails startup on error)
    await connectDatabase();

    // Initialize Socket.io server
    SocketService.init(server);

    // Verify Redis connection is ready (fails startup on error)
    try {
      const pubClient = getRedisClient();
      logger.info('⏳ Verifying Redis connection readiness...');
      await waitForRedis(pubClient, 5000);
      logger.info('🎉 Redis connection verified.');
    } catch (redisError) {
      const errMsg = redisError instanceof Error ? redisError.message : String(redisError);
      logger.error(`❌ Redis connection verification failed: ${errMsg}`);
      throw new Error(`Critical startup failure: Redis is not reachable. ${errMsg}`, { cause: redisError });
    }

    // Start listening
    server.listen(config.PORT, () => {
      logger.info(`⚡ Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    });
  } catch (err) {
    logger.error('💥 Critical error during server startup:', err);
    // Ensure graceful shutdown of any initialized resources before exit
    try {
      await SocketService.close();
      await disconnectRedis();
      await disconnectDatabase();
    } catch (cleanupErr) {
      logger.error('💥 Secondary error during crash cleanup:', cleanupErr);
    }
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('💥 Uncaught Exception! Shutting down...', err);
  process.exit(1);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('💥 Unhandled Promise Rejection! Shutting down...', reason as Error);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(1);
  });
});

process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));
