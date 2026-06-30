import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { logger } from '../logging/logger';
import { config } from '../config/config';
import { registerMessageHandlers } from './messageSocket';
import { createAdapter } from '@socket.io/redis-adapter';
import { connectRedis } from '../redis/redisClient';
import Redis from 'ioredis';

interface AuthenticatedUser {
  id: string;
  email: string;
}

interface AuthenticatedSocket extends Socket {
  data: {
    user: AuthenticatedUser;
  };
}

interface SendMessagePayload {
  workspaceId: string;
  content: string;
}

interface MessageBroadcast {
  senderId: string;
  senderEmail: string;
  workspaceId: string;
  content: string;
  timestamp: number;
}

export class SocketService {
  private static io: SocketServer | null = null;
  private static pubClient: Redis | null = null;
  private static subClient: Redis | null = null;

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

    try {
      logger.info('⏳ Initializing Redis Socket.IO Adapter...');
      this.pubClient = connectRedis();
      this.subClient = this.pubClient.duplicate();

      this.subClient.on('error', (err) => {
        logger.error(`❌ Redis Socket.IO adapter subClient error: ${err.message}`);
      });

      this.io.adapter(createAdapter(this.pubClient, this.subClient));
      logger.info('🚀 Socket.io Redis Adapter initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`💥 Failed to initialize Redis Socket.IO Adapter: ${errorMessage}`);
    }

    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token;

      if (!token) {
        logger.warn(`Socket rejected: No token provided (${socket.id})`);
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
        logger.warn(`Socket rejected: Invalid or expired token (${socket.id})`);
        return next(new Error('Invalid or expired authentication token'));
      }
    });

    logger.info('🚀 Socket.io Server initialized');

    // Register real-time messaging event handlers and socket auth middleware
    registerMessageHandlers(this.io);

    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      const joinedWorkspaces = new Set<string>();

      logger.info(
        `Socket connected: ${authSocket.id} as ${authSocket.data.user.email}`
      );

      authSocket.on('ping-server', (data) => {
        logger.debug(
          `Received ping-server from ${authSocket.id}: ${JSON.stringify(data)}`
        );

        authSocket.emit('pong-client', {
          message: 'hello from server',
          user: authSocket.data.user,
          timestamp: Date.now(),
        });
      });

      authSocket.on('join-workspace', (workspaceId: string) => {
        if (!workspaceId || typeof workspaceId !== 'string' || workspaceId.trim() === '') {
          authSocket.emit('error', {
            event: 'join-workspace',
            message: 'Workspace ID is required',
          });
          return;
        }

        const roomId = workspaceId.trim();
        authSocket.join(roomId);
        joinedWorkspaces.add(roomId);

        logger.info(
          `User ${authSocket.data.user.email} joined workspace room: ${roomId}`
        );

        authSocket.emit('joined-workspace', {
          workspaceId: roomId,
          userId: authSocket.data.user.id,
          message: `Successfully joined workspace ${roomId}`,
        });

        authSocket.to(roomId).emit('user-joined', {
          workspaceId: roomId,
          userId: authSocket.data.user.id,
          email: authSocket.data.user.email,
          joinedAt: Date.now(),
        });
      });

      authSocket.on('leave-workspace', (workspaceId: string) => {
        if (!workspaceId || typeof workspaceId !== 'string' || workspaceId.trim() === '') {
          authSocket.emit('error', {
            event: 'leave-workspace',
            message: 'Workspace ID is required',
          });
          return;
        }

        const roomId = workspaceId.trim();

        authSocket.to(roomId).emit('user-left', {
          workspaceId: roomId,
          userId: authSocket.data.user.id,
          email: authSocket.data.user.email,
          leftAt: Date.now(),
        });

        authSocket.leave(roomId);
        joinedWorkspaces.delete(roomId);

        logger.info(
          `User ${authSocket.data.user.email} left workspace room: ${roomId}`
        );

        authSocket.emit('left-workspace', {
          workspaceId: roomId,
          message: `Successfully left workspace ${roomId}`,
        });
      });

      authSocket.on('send-message', (payload: SendMessagePayload) => {
        if (!authSocket.data.user || !authSocket.data.user.id) {
          authSocket.emit('error', {
            event: 'send-message',
            message: 'Unauthorized: You must be authenticated to send messages',
          });
          return;
        }

        if (!payload || !payload.workspaceId || !payload.content) {
          authSocket.emit('error', {
            event: 'send-message',
            message: 'workspaceId and content are required',
          });
          return;
        }

        const workspaceId = payload.workspaceId.trim();
        const content = payload.content.trim();

        if (!workspaceId) {
          authSocket.emit('error', {
            event: 'send-message',
            message: 'Workspace ID is required',
          });
          return;
        }

        if (content.length === 0) {
          authSocket.emit('error', {
            event: 'send-message',
            message: 'Message content cannot be empty',
          });
          return;
        }

        if (content.length > 1000) {
          authSocket.emit('error', {
            event: 'send-message',
            message: 'Message content cannot exceed 1000 characters',
          });
          return;
        }

        if (!authSocket.rooms.has(workspaceId)) {
          authSocket.emit('error', {
            event: 'send-message',
            message: 'You must join the workspace before sending messages',
          });
          return;
        }

        const message: MessageBroadcast = {
          senderId: authSocket.data.user.id,
          senderEmail: authSocket.data.user.email,
          workspaceId,
          content,
          timestamp: Date.now(),
        };

        this.io!.to(workspaceId).emit('receive-message', message);

        logger.info(
          `Message broadcast by ${authSocket.data.user.email} in workspace ${workspaceId}`
        );
      });

      authSocket.on('disconnect', (reason) => {
        joinedWorkspaces.forEach((workspaceId) => {
          authSocket.to(workspaceId).emit('user-left', {
            workspaceId,
            userId: authSocket.data.user.id,
            email: authSocket.data.user.email,
            leftAt: Date.now(),
          });
        });

        logger.info(
          `Socket disconnected: ${authSocket.id} | User: ${authSocket.data.user.email} | Reason: ${reason}`
        );
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

  /**
   * Cleanly closes the Socket.io server and the subscriber Redis connection.
   */
  public static async close(): Promise<void> {
    if (this.io) {
      logger.info('⏳ Closing Socket.io server...');
      await new Promise<void>((resolve) => {
        this.io!.close(() => {
          logger.info('🔌 Socket.io server closed.');
          resolve();
        });
      });
      this.io = null;
    }

    if (this.subClient) {
      try {
        logger.info('⏳ Disconnecting Redis Socket.IO subClient...');
        await this.subClient.quit();
        logger.info('🔌 Redis Socket.IO subClient disconnected.');
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        logger.error(`💥 Error disconnecting Redis subClient: ${errMsg}`);
      }
      this.subClient = null;
    }

    if (this.pubClient) {
      this.pubClient = null;
    }
  }
}
