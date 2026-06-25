import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createMessage } from '../../application/services/messageService';
import { logger } from '../logging/logger';

interface DecodedToken {
  userId: string;
  email: string;
}

/**
 * Registers message-related real-time Socket.io event handlers and authentication middleware.
 * 
 * @param io The initialized Socket.io Server instance.
 */
export const registerMessageHandlers = (io: SocketServer) => {
  // Middleware to authenticate socket connections using JWT tokens
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      logger.warn(`🔌 Connection rejected: No authentication token provided. Socket: ${socket.id}`);
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default_secret'
      ) as DecodedToken;
      socket.data.user = decoded;
      next();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.warn(`🔌 Connection rejected: Invalid token. Socket: ${socket.id}. Error: ${errorMessage}`);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.userId;
    logger.info(`🔌 Chat Socket connected: ${socket.id} (User: ${userId})`);

    // Handle join-workspace room join request
    socket.on('join-workspace', (workspaceId: string) => {
      if (!workspaceId) {
        return socket.emit('error', { message: 'Workspace ID is required to join' });
      }
      socket.join(workspaceId);
      logger.info(`🚪 User ${userId} joined room: ${workspaceId}`);
      socket.to(workspaceId).emit('user-joined', { userId });
    });

    // Handle leave-workspace room leave request
    socket.on('leave-workspace', (workspaceId: string) => {
      if (!workspaceId) {
        return socket.emit('error', { message: 'Workspace ID is required to leave' });
      }
      socket.leave(workspaceId);
      logger.info(`🚪 User ${userId} left room: ${workspaceId}`);
      socket.to(workspaceId).emit('user-left', { userId });
    });

    // Handle send-message payload request from client
    socket.on('send-message', async (data: { workspaceId: string; content: string }) => {
      try {
        const { workspaceId, content } = data;
        const senderId = socket.data.user?.userId;

        if (!senderId) {
          return socket.emit('error', { message: 'Authentication required' });
        }

        // Store message in MongoDB using the messageService
        const savedMessage = await createMessage(workspaceId, senderId, content);

        // Broadcast the saved message to all users in the same workspace room (including the sender)
        io.to(workspaceId).emit('broadcast-message', savedMessage);
        logger.debug(`📤 Broadcasted message in workspace ${workspaceId} from user ${senderId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process message';
        logger.error(`❌ Socket send-message error: ${errorMessage}`);
        socket.emit('error', { message: errorMessage });
      }
    });

    // Handle custom broadcast-message triggers directly
    socket.on('broadcast-message', (data: { workspaceId: string; message: unknown }) => {
      const { workspaceId, message } = data;
      if (workspaceId && message) {
        socket.to(workspaceId).emit('broadcast-message', message);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`🔌 Chat Socket disconnected: ${socket.id} (User: ${userId}). Reason: ${reason}`);
    });
  });
};
