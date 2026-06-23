import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
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

    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'default_secret'
        ) as JwtPayload;

        socket.data.user = {
          id: decoded.userId,
          email: decoded.email,
        };

        next();
      } catch {
        return next(new Error('Invalid or expired authentication token'));
      }
    });

    logger.info('🚀 Socket.io Server initialized');

    this.io.on('connection', (socket: Socket) => {
      logger.info(
        `🔌 Socket connected: ${socket.id} as user ${socket.data.user?.email}`
      );

      socket.on('disconnect', (reason) => {
        logger.info(`🔌 Socket disconnected: ${socket.id} (Reason: ${reason})`);
      });

      socket.on('ping-server', (data) => {
        logger.debug(
          `📩 Received ping-server from ${socket.id}: ${JSON.stringify(data)}`
        );

        socket.emit('pong-client', {
          message: 'hello from server',
          user: socket.data.user,
          timestamp: Date.now(),
        });
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