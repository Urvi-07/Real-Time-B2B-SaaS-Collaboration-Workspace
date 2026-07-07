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
    return { allowed: false, message: 'Access to this workspace is forbidden' };
  }

  return { allowed: true };
};

export const registerMessageHandlers = (io: SocketServer) => {
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      logger.warn(`🔌 Connection rejected: No token | Socket: ${socket.id}`);
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
      logger.warn(`🔌 Invalid token | Socket: ${socket.id} | Error: ${errorMessage}`);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.userId;

    logger.info(`🔌 Chat socket connected | User: ${userId} | Socket: ${socket.id}`);

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
        `🔁 User ${userId} rejoined ${previousWorkspaces.size} workspace(s) | Socket: ${socket.id}`
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
          return socket.emit(SOCKET_EVENTS.ERROR, { message: access.message });
        }

        if (socket.rooms.has(workspaceId)) {
          logger.warn(
            `⚠️ Duplicate join attempt | User: ${userId} | Workspace: ${workspaceId} | Socket: ${socket.id}`
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

        logger.info(
          `🚪 User joined workspace | User: ${userId} | Workspace: ${workspaceId} | Socket: ${socket.id}`
        );

        socket.to(workspaceId).emit(SOCKET_EVENTS.USER_JOINED, { userId });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to join workspace';

        logger.error(`❌ Join workspace error | Socket: ${socket.id} | Error: ${errorMessage}`);
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
          `⚠️ Invalid leave attempt | User: ${userId} | Workspace: ${workspaceId} | Socket: ${socket.id}`
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

      logger.info(
        `🚪 User left workspace | User: ${userId} | Workspace: ${workspaceId} | Socket: ${socket.id}`
      );

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
            `📤 Message broadcasted | Workspace: ${workspaceId} | Sender: ${senderId} | Socket: ${socket.id}`
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to process message';

          logger.error(`❌ Send message error | Socket: ${socket.id} | Error: ${errorMessage}`);
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
            message: 'Join the workspace before emitting typing status',
          });
        }

        socket.to(workspaceId).emit(SOCKET_EVENTS.TYPING_START, {
          userId,
          workspaceId,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to handle typing start';

        logger.error(`❌ Typing start error | Socket: ${socket.id} | Error: ${errorMessage}`);
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
            message: 'Join the workspace before emitting typing status',
          });
        }

        socket.to(workspaceId).emit(SOCKET_EVENTS.TYPING_STOP, {
          userId,
          workspaceId,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to handle typing stop';

        logger.error(`❌ Typing stop error | Socket: ${socket.id} | Error: ${errorMessage}`);
        socket.emit(SOCKET_EVENTS.ERROR, { message: errorMessage });
      }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logger.info(
        `🔌 Chat socket disconnected | User: ${userId} | Socket: ${socket.id} | Reason: ${reason}`
      );
    });
  });
};