import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { logger } from '../logging/logger';
import { config } from '../config/config';

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

    logger.info('🚀 Socket.io Server initialized');

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
