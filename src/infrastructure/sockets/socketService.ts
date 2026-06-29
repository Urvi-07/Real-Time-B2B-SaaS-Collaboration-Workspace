import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { logger } from '../logging/logger';
import { config } from '../config/config';
import { registerMessageHandlers } from './messageSocket';
import { createAdapter } from '@socket.io/redis-adapter';
import { connectRedis } from '../redis/redisClient';

export class SocketService {
  private static io: SocketServer | null = null;

  public static init(httpServer: HttpServer): SocketServer {
    if (this.io) {
      return this.io;
    }

    this.io = new SocketServer(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    try {
      logger.info('⏳ Initializing Redis Socket.IO Adapter...');
      const pubClient = connectRedis();
      const subClient = pubClient.duplicate();

      subClient.on('error', (err) => {
        logger.error(`❌ Redis Socket.IO adapter subClient error: ${err.message}`);
      });

      this.io.adapter(createAdapter(pubClient, subClient));
      logger.info('🚀 Socket.io Redis Adapter initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`💥 Failed to initialize Redis Socket.IO Adapter: ${errorMessage}`);
    }

    logger.info('🚀 Socket.io Server initialized');

    // Register real-time messaging event handlers and socket auth middleware
    registerMessageHandlers(this.io);

    this.io.on('connection', (socket: Socket) => {
      logger.info(`🔌 Socket connected: ${socket.id}`);

      socket.on('disconnect', (reason) => {
        logger.info(`🔌 Socket disconnected: ${socket.id} (Reason: ${reason})`);
      });

      // Basic diagnosis route to verify real-time connection
      socket.on('ping-server', (data) => {
        logger.debug(`📩 Received ping-server from ${socket.id}: ${JSON.stringify(data)}`);
        socket.emit('pong-client', { message: 'hello from server', timestamp: Date.now() });
      });
    });

    return this.io;
  }

  public static getIO(): SocketServer {
    if (!this.io) {
      throw new Error('Socket.io has not been initialized. Call init() first.');
    }
    return this.io;
  }
}
