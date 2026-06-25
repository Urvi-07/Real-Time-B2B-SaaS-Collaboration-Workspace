import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { logger } from '../logging/logger';
import { config } from '../config/config';

// Interface for authenticated socket user
interface AuthenticatedUser {
  id: string;
  email: string;
}

// Extend Socket type to include authenticated user data
interface AuthenticatedSocket extends Socket {
  data: {
    user: AuthenticatedUser;
  };
}

// Interface for incoming message payload
interface SendMessagePayload {
  workspaceId: string;
  content: string;
}

// Interface for outgoing message broadcast
interface MessageBroadcast {
  senderId: string;
  senderEmail: string;
  workspaceId: string;
  content: string;
  timestamp: number;
}

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

    // ─── JWT Authentication Middleware ───────────────────────────────────────
    // Every socket connection must provide a valid JWT token.
    // If the token is missing or invalid, the connection is rejected immediately.
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token;

      if (!token) {
        logger.warn(`🚫 Socket connection rejected: No token provided (socketId: ${socket.id})`);
        return next(new Error('Authentication token is required'));
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'default_secret'
        ) as JwtPayload;

        // Attach authenticated user data to socket for use in all events
        socket.data.user = {
          id: decoded.userId,
          email: decoded.email,
        };

        logger.info(`✅ Socket authenticated: ${decoded.email} (socketId: ${socket.id})`);
        next();
      } catch {
        logger.warn(`🚫 Socket connection rejected: Invalid or expired token (socketId: ${socket.id})`);
        return next(new Error('Invalid or expired authentication token'));
      }
    });

    logger.info('🚀 Socket.io Server initialized');

    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;

      logger.info(
        `🔌 Socket connected: ${authSocket.id} as user ${authSocket.data.user?.email}`
      );

      // ─── Ping-Pong Test Event ──────────────────────────────────────────────
      // Used to verify that the socket connection and authentication are working.
      authSocket.on('ping-server', (data) => {
        logger.debug(
          `📩 Received ping-server from ${authSocket.id}: ${JSON.stringify(data)}`
        );

        authSocket.emit('pong-client', {
          message: 'hello from server',
          user: authSocket.data.user,
          timestamp: Date.now(),
        });
      });

      // ─── Join Workspace Room ───────────────────────────────────────────────
      // Authenticated users can join a workspace-specific Socket.IO room.
      // Only users with a valid JWT (verified above) can join rooms.
      // workspaceId is used as the room identifier so messages are
      // broadcast only to members of that workspace.
      authSocket.on('join-workspace', (workspaceId: string) => {
        // Validate that workspaceId was provided
        if (!workspaceId || typeof workspaceId !== 'string' || workspaceId.trim() === '') {
          logger.warn(
            `⚠️ join-workspace rejected: Missing workspaceId from ${authSocket.data.user?.email}`
          );
          authSocket.emit('error', {
            event: 'join-workspace',
            message: 'Workspace ID is required',
          });
          return;
        }

        // Join the workspace room
        authSocket.join(workspaceId);

        logger.info(
          `🏠 User ${authSocket.data.user?.email} joined workspace room: ${workspaceId}`
        );

        // Confirm to the client that they have joined successfully
        authSocket.emit('joined-workspace', {
          workspaceId,
          userId: authSocket.data.user?.id,
          message: `Successfully joined workspace ${workspaceId}`,
        });
      });

      // ─── Leave Workspace Room ──────────────────────────────────────────────
      // Allows authenticated users to leave a workspace room cleanly.
      authSocket.on('leave-workspace', (workspaceId: string) => {
        if (!workspaceId || typeof workspaceId !== 'string' || workspaceId.trim() === '') {
          authSocket.emit('error', {
            event: 'leave-workspace',
            message: 'Workspace ID is required',
          });
          return;
        }

        authSocket.leave(workspaceId);

        logger.info(
          `🚪 User ${authSocket.data.user?.email} left workspace room: ${workspaceId}`
        );

        authSocket.emit('left-workspace', {
          workspaceId,
          message: `Successfully left workspace ${workspaceId}`,
        });
      });

      // ─── Send Message Event ────────────────────────────────────────────────
      // Authenticated users can send a message to a workspace room.
      // Before broadcasting, we verify:
      //   1. The user is authenticated (socket.data.user exists)
      //   2. workspaceId and content are present and valid
      //   3. The user is actually in the workspace room
      // If all checks pass, the message is broadcast to all members of that room.
      authSocket.on('send-message', (payload: SendMessagePayload) => {
        // Check 1: Verify user is authenticated
        if (!authSocket.data.user || !authSocket.data.user.id) {
          logger.warn(`🚫 send-message rejected: Unauthenticated socket ${authSocket.id}`);
          authSocket.emit('error', {
            event: 'send-message',
            message: 'Unauthorized: You must be authenticated to send messages',
          });
          return;
        }

        // Check 2: Validate payload fields
        if (!payload || !payload.workspaceId || !payload.content) {
          logger.warn(
            `⚠️ send-message rejected: Missing fields from ${authSocket.data.user?.email}`
          );
          authSocket.emit('error', {
            event: 'send-message',
            message: 'workspaceId and content are required',
          });
          return;
        }

        // Check 3: Validate content is not empty or whitespace
        if (payload.content.trim().length === 0) {
          authSocket.emit('error', {
            event: 'send-message',
            message: 'Message content cannot be empty',
          });
          return;
        }

        // Check 4: Verify the user has joined this workspace room
        const rooms = authSocket.rooms;
        if (!rooms.has(payload.workspaceId)) {
          logger.warn(
            `🚫 send-message rejected: User ${authSocket.data.user?.email} not in workspace ${payload.workspaceId}`
          );
          authSocket.emit('error', {
            event: 'send-message',
            message: 'You must join the workspace before sending messages',
          });
          return;
        }

        // All checks passed — build and broadcast the message
        const message: MessageBroadcast = {
          senderId: authSocket.data.user.id,
          senderEmail: authSocket.data.user.email,
          workspaceId: payload.workspaceId,
          content: payload.content.trim(),
          timestamp: Date.now(),
        };

        // Broadcast to all users in the workspace room (including sender)
        this.io!.to(payload.workspaceId).emit('receive-message', message);

        logger.info(
          `💬 Message broadcast by ${authSocket.data.user?.email} in workspace ${payload.workspaceId}`
        );
      });

      // ─── Disconnect Handler ────────────────────────────────────────────────
      authSocket.on('disconnect', (reason) => {
        logger.info(
          `🔌 Socket disconnected: ${authSocket.id} | User: ${authSocket.data.user?.email} | Reason: ${reason}`
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
}