import http from 'http';
import app from './app';
import { config } from './infrastructure/config/config';
import { logger } from './infrastructure/logging/logger';
import { SocketService } from './infrastructure/sockets/socketService';

const server = http.createServer(app);

// Initialize Socket.io server
SocketService.init(server);

// Start listening
server.listen(config.PORT, () => {
  logger.info(`⚡ Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('💥 Uncaught Exception! Shutting down...', err);
  process.exit(1);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('💥 Unhandled Promise Rejection! Shutting down...', reason as Error);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful Shut Down
const shutdownGracefully = (signal: string) => {
  logger.info(`👋 Received ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    logger.info('💤 HTTP server closed.');
    process.exit(0);
  });

  // Force shutdown if taking too long
  setTimeout(() => {
    logger.error('⚠️ Forcefully shutting down because connections took too long to close');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));
