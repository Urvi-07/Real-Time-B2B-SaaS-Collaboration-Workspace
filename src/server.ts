import http from 'http';
import app from './app';
import { config } from './infrastructure/config/config';
import { logger } from './infrastructure/logging/logger';
import { SocketService } from './infrastructure/sockets/socketService';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/mongoose';

const server = http.createServer(app);

// Initialize Socket.io server
SocketService.init(server);

// Graceful Shut Down
const shutdownGracefully = (signal: string) => {
  logger.info(`👋 Received ${signal}. Shutting down server gracefully...`);
  server.close(async () => {
    logger.info('💤 HTTP server closed.');
    await disconnectDatabase();
    process.exit(0);
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

    // Start listening
    server.listen(config.PORT, () => {
      logger.info(`⚡ Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    });
  } catch (err) {
    logger.error('💥 Critical error during server startup:', err);
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
