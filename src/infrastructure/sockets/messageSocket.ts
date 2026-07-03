import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createMessage } from '../../application/services/messageService';
import { logger } from '../logging/logger';
import { SOCKET_EVENTS } from './socketEvents';
import { WorkspaceModel } from '../database/models/Workspace';
import { Types } from 'mongoose';

interface DecodedToken {
  userId: string;
  email: string;
}

const userWorkspaceMap = new Map<string, Set<string>>();

const isWorkspaceMember = async (workspaceId: string, userId: string) => {
  if (!Types.ObjectId.isValid(workspaceId)) {
    return { allowed: false, message: 'Invalid workspace ID' };
  }

  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    return { allowed: false, message: 'Workspace not found' };
  }

  const isMember =
    workspace.members.includes(userId) || workspace.ownerId === userId;

  if (!isMember) {
    return {
      allowed: false,
      message: 'Access to this workspace is forbidden',
    };
  }

  return { allowed: true };
};

export const registerMessageHandlers = (io: SocketServer) => {
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      logger.warn(
        `🔌 Connection rejected: No authentication token provided. Socket: ${socket.id}`
      );
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

      logger.warn(
        `🔌 Connection rejected: Invalid token. Socket: ${socket.id}. Error: ${errorMessage}`
      );

      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.userId;

    logger.info(`🔌 Chat Socket connected: ${socket.id} (User: ${userId})`);

    const previousWorkspaces = userWorkspaceMap.get(userId);

    if (previousWorkspaces && previousWorkspaces.size > 0) {
      previousWorkspaces.forEach((workspaceId) => {
        socket.join(workspaceId);
      });

      socket.emit('reconnected-workspaces', {
        workspaces: Array.from(previousWorkspaces),
        message: 'Successfully rejoined previous workspaces',
      });

      logger.info(
        `🔁 User ${userId} automatically rejoined ${previousWorkspaces.size} workspace(s)`
      );
    }

    socket.on(SOCKET_EVENTS.JOIN_WORKSPACE, async (workspaceId: string) => {
      if (!workspaceId) {
        return socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Workspace ID is required to join',
        });
      }

      if (!userId) {
        return socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Authentication required',
        });
      }

      try {
        const access = await isWorkspaceMember(workspaceId, userId);

        if (!access.allowed) {
          return socket.emit(SOCKET_EVENTS.ERROR, {
            message: access.message,
          });
        }

        if (socket.rooms.has(workspaceId)) {
          logger.warn(
            `⚠️ User ${userId} attempted duplicate join for workspace ${workspaceId}`
          );

          return socket.emit(SOCKET_EVENTS.ERROR, {
            message: 'Already connected to this workspace',
          });
        }

        socket.join(workspaceId);

        if (!userWorkspaceMap.has(userId)) {
          userWorkspaceMap.set(userId, new Set<string>());
        }

        userWorkspaceMap.get(userId)?.add(workspaceId);

        logger.info(`🚪 User ${userId} joined room: ${workspaceId}`);

        socket.to(workspaceId).emit(SOCKET_EVENTS.USER_JOINED, { userId });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to join workspace';

        logger.error(`❌ Socket join-workspace error: ${errorMessage}`);
        socket.emit(SOCKET_EVENTS.ERROR, { message: errorMessage });
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_WORKSPACE, (workspaceId: string) => {
      if (!workspaceId) {
        return socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Workspace ID is required to leave',
        });
      }

      if (!socket.rooms.has(workspaceId)) {
        logger.warn(
          `⚠️ User ${userId} attempted to leave workspace ${workspaceId} without joining`
        );

        return socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'You are not connected to this workspace',
        });
      }

      socket.leave(workspaceId);

      userWorkspaceMap.get(userId)?.delete(workspaceId);

      if (userWorkspaceMap.get(userId)?.size === 0) {
        userWorkspaceMap.delete(userId);
      }

      logger.info(`🚪 User ${userId} left room: ${workspaceId}`);

      socket.to(workspaceId).emit(SOCKET_EVENTS.USER_LEFT, { userId });
    });

    socket.on(
      SOCKET_EVENTS.SEND_MESSAGE,
      async (data: { workspaceId: string; content: string }) => {
        try {
          const { workspaceId, content } = data;
          const senderId = socket.data.user?.userId;

          if (!senderId) {
            return socket.emit(SOCKET_EVENTS.ERROR, {
              message: 'Authentication required',
            });
          }

          if (!workspaceId || !content) {
            return socket.emit(SOCKET_EVENTS.ERROR, {
              message: 'Workspace ID and content are required',
            });
          }

          if (content.trim().length === 0) {
            return socket.emit(SOCKET_EVENTS.ERROR, {
              message: 'Message content cannot be empty',
            });
          }

          if (content.trim().length > 1000) {
            return socket.emit(SOCKET_EVENTS.ERROR, {
              message: 'Message content cannot exceed 1000 characters',
            });
          }

          const access = await isWorkspaceMember(workspaceId, senderId);

          if (!access.allowed) {
            return socket.emit(SOCKET_EVENTS.ERROR, {
              message: access.message,
            });
          }

          if (!socket.rooms.has(workspaceId)) {
            return socket.emit(SOCKET_EVENTS.ERROR, {
              message: 'Join the workspace before sending messages',
            });
          }

          const savedMessage = await createMessage(
            workspaceId,
            senderId,
            content.trim()
          );

          io.to(workspaceId).emit(SOCKET_EVENTS.BROADCAST_MESSAGE, savedMessage);

          logger.debug(
            `📤 Broadcasted message in workspace ${workspaceId} from user ${senderId}`
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to process message';

          logger.error(`❌ Socket send-message error: ${errorMessage}`);
          socket.emit(SOCKET_EVENTS.ERROR, { message: errorMessage });
        }
      }
    );

    socket.on(
      SOCKET_EVENTS.BROADCAST_MESSAGE,
      async (data: { workspaceId: string; message: unknown }) => {
        const { workspaceId, message } = data;

        if (!userId) {
          return socket.emit(SOCKET_EVENTS.ERROR, {
            message: 'Authentication required',
          });
        }

        if (!workspaceId || !message) {
          return socket.emit(SOCKET_EVENTS.ERROR, {
            message: 'Workspace ID and message are required',
          });
        }

        try {
          const access = await isWorkspaceMember(workspaceId, userId);

          if (!access.allowed) {
            return socket.emit(SOCKET_EVENTS.ERROR, {
              message: access.message,
            });
          }

          if (!socket.rooms.has(workspaceId)) {
            return socket.emit(SOCKET_EVENTS.ERROR, {
              message: 'Join the workspace before broadcasting messages',
            });
          }

          socket
            .to(workspaceId)
            .emit(SOCKET_EVENTS.BROADCAST_MESSAGE, message);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to broadcast message';

          logger.error(`❌ Socket broadcast-message error: ${errorMessage}`);
          socket.emit(SOCKET_EVENTS.ERROR, { message: errorMessage });
        }
      }
    );

    socket.on(SOCKET_EVENTS.TYPING_START, async (workspaceId: string) => {
      if (!workspaceId) {
        return socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Workspace ID is required for typing start',
        });
      }

      if (!userId) {
        return socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Authentication required',
        });
      }

      try {
        const access = await isWorkspaceMember(workspaceId, userId);

        if (!access.allowed) {
          return socket.emit(SOCKET_EVENTS.ERROR, {
            message: access.message,
          });
        }

        if (!socket.rooms.has(workspaceId)) {
          return socket.emit(SOCKET_EVENTS.ERROR, {
            message: 'Join the workspace before sending typing status',
          });
        }

        socket
          .to(workspaceId)
          .emit(SOCKET_EVENTS.TYPING_START, { userId, workspaceId });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to handle typing start';

        logger.error(`❌ Socket typing-start error: ${errorMessage}`);
        socket.emit(SOCKET_EVENTS.ERROR, { message: errorMessage });
      }
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, async (workspaceId: string) => {
      if (!workspaceId) {
        return socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Workspace ID is required for typing stop',
        });
      }

      if (!userId) {
        return socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Authentication required',
        });
      }

      try {
        const access = await isWorkspaceMember(workspaceId, userId);

        if (!access.allowed) {
          return socket.emit(SOCKET_EVENTS.ERROR, {
            message: access.message,
          });
        }

        if (!socket.rooms.has(workspaceId)) {
          return socket.emit(SOCKET_EVENTS.ERROR, {
            message: 'Join the workspace before sending typing status',
          });
        }

        socket
          .to(workspaceId)
          .emit(SOCKET_EVENTS.TYPING_STOP, { userId, workspaceId });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to handle typing stop';

        logger.error(`❌ Socket typing-stop error: ${errorMessage}`);
        socket.emit(SOCKET_EVENTS.ERROR, { message: errorMessage });
      }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logger.info(
        `🔌 Chat Socket disconnected: ${socket.id} (User: ${userId}). Reason: ${reason}`
      );
    });
  });
};