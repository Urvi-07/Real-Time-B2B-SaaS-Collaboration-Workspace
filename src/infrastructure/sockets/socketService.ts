import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { logger } from '../logging/logger';
import { config } from '../config/config';
import { registerMessageHandlers } from './messageSocket';

interface AuthenticatedUser {
  userId: string;
  email: string;
}

export class SocketService {
  private static io: SocketServer | null = null;

  public static init(httpServer: HttpServer): SocketServer {
    if (this.io) return this.io;

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
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        logger.warn(`Socket rejected: No token provided (${socket.id})`);
        return next(new Error('Authentication token is required'));
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'default_secret'
        ) as JwtPayload & AuthenticatedUser;

        socket.data.user = {
          userId: decoded.userId,
          email: decoded.email,
        };

        next();
      } catch {
        logger.warn(`Socket rejected: Invalid or expired token (${socket.id})`);
        return next(new Error('Invalid or expired authentication token'));
      }
    });

    logger.info('Socket.io Server initialized');

    registerMessageHandlers(this.io);

    return this.io;
  }

  public static getIO(): SocketServer {
    if (!this.io) {
      throw new Error('Socket.io has not been initialized. Call init() first.');
    }

    return this.io;
  }
}