/* eslint-disable @typescript-eslint/no-explicit-any */
import type { registerMessageHandlers as registerMessageHandlersType } from './messageSocket';
import { SOCKET_EVENTS } from './socketEvents';
import type { WorkspaceModel as WorkspaceModelType } from '../database/models/Workspace';
import type { createMessage as createMessageType } from '../../application/services/messageService';
import type jwtType from 'jsonwebtoken';

jest.mock('../database/models/Workspace');
jest.mock('../../application/services/messageService');
jest.mock('jsonwebtoken');

describe('Message Socket', () => {
  let registerMessageHandlers: typeof registerMessageHandlersType;
  let WorkspaceModel: typeof WorkspaceModelType;
  let createMessage: typeof createMessageType;
  let jwt: typeof jwtType;
  let mockIo: any;
  let mockSocket: any;
  let middleware: any;
  let connectionHandler: any;
  let eventListeners: Record<string, (...args: any[]) => any>;

  beforeEach(() => {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    registerMessageHandlers = require('./messageSocket').registerMessageHandlers;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    WorkspaceModel = require('../database/models/Workspace').WorkspaceModel;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    createMessage = require('../../application/services/messageService').createMessage;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    jwt = require('jsonwebtoken');
    eventListeners = {};
    mockIo = {
      use: jest.fn().mockImplementation((fn) => {
        middleware = fn;
      }),
      on: jest.fn().mockImplementation((event, fn) => {
        if (event === 'connection') {
          connectionHandler = fn;
        }
      }),
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    };

    mockSocket = {
      id: 'socket-id',
      handshake: {
        auth: { token: 'mock-token' },
      },
      data: {
        user: { userId: 'user-123', email: 'user@test.com' },
      },
      rooms: new Set<string>(),
      join: jest.fn().mockImplementation((room) => {
        mockSocket.rooms.add(room);
      }),
      leave: jest.fn().mockImplementation((room) => {
        mockSocket.rooms.delete(room);
      }),
      emit: jest.fn(),
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
      on: jest.fn().mockImplementation((event, fn) => {
        eventListeners[event] = fn;
      }),
    };

    jest.clearAllMocks();
  });

  it('should register middleware and connection handlers', () => {
    registerMessageHandlers(mockIo);
    expect(mockIo.use).toHaveBeenCalled();
    expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
  });

  describe('middleware authentication', () => {
    beforeEach(() => {
      registerMessageHandlers(mockIo);
    });

    it('should authenticate connection with valid token', () => {
      const mockDecoded = { userId: 'user-123', email: 'user@test.com' };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      const next = jest.fn();
      middleware(mockSocket, next);

      expect(jwt.verify).toHaveBeenCalledWith('mock-token', expect.any(String));
      expect(mockSocket.data.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalledWith();
    });

    it('should reject connection without token', () => {
      mockSocket.handshake.auth.token = null;
      const next = jest.fn();
      middleware(mockSocket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Authentication error: No token provided');
    });

    it('should reject connection with invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      const next = jest.fn();
      middleware(mockSocket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Authentication error: Invalid token');
    });
  });

  describe('event handlers', () => {
    beforeEach(() => {
      registerMessageHandlers(mockIo);
      connectionHandler(mockSocket);
    });

    describe('join-workspace', () => {
      it('should allow member to join workspace room', async () => {
        const workspaceId = '507f1f77bcf86cd799439011';
        const mockWorkspace = {
          _id: workspaceId,
          ownerId: 'other-user',
          members: [mockSocket.data.user.userId],
        };

        (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

        await eventListeners[SOCKET_EVENTS.JOIN_WORKSPACE](workspaceId);

        expect(WorkspaceModel.findById).toHaveBeenCalledWith(workspaceId);
        expect(mockSocket.join).toHaveBeenCalledWith(workspaceId);
        expect(mockSocket.to).toHaveBeenCalledWith(workspaceId);
      });

      it('should allow owner to join workspace room', async () => {
        const workspaceId = '507f1f77bcf86cd799439011';
        const mockWorkspace = {
          _id: workspaceId,
          ownerId: mockSocket.data.user.userId,
          members: [],
        };

        (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

        await eventListeners[SOCKET_EVENTS.JOIN_WORKSPACE](workspaceId);

        expect(WorkspaceModel.findById).toHaveBeenCalledWith(workspaceId);
        expect(mockSocket.join).toHaveBeenCalledWith(workspaceId);
      });

      it('should reject non-member from joining', async () => {
        const workspaceId = '507f1f77bcf86cd799439011';
        const mockWorkspace = {
          _id: workspaceId,
          ownerId: 'other-user',
          members: ['different-user'],
        };

        (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

        await eventListeners[SOCKET_EVENTS.JOIN_WORKSPACE](workspaceId);

        expect(WorkspaceModel.findById).toHaveBeenCalledWith(workspaceId);
        expect(mockSocket.join).not.toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.ERROR, {
          message: 'Access to this workspace is forbidden',
        });
      });

      it('should emit error if workspace is not found', async () => {
        const workspaceId = '507f1f77bcf86cd799439011';
        (WorkspaceModel.findById as jest.Mock).mockResolvedValue(null);

        await eventListeners[SOCKET_EVENTS.JOIN_WORKSPACE](workspaceId);

        expect(mockSocket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.ERROR, {
          message: 'Workspace not found',
        });
      });

      it('should emit error if workspace ID is invalid', async () => {
        const workspaceId = 'invalid-id';

        await eventListeners[SOCKET_EVENTS.JOIN_WORKSPACE](workspaceId);

        expect(mockSocket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.ERROR, {
          message: 'Invalid workspace ID',
        });
      });
    });

    describe('send-message', () => {
      it('should allow member to send message and store/broadcast it', async () => {
        const workspaceId = '507f1f77bcf86cd799439011';
        mockSocket.rooms.add(workspaceId);
        const mockWorkspace = {
          _id: workspaceId,
          ownerId: 'other-user',
          members: [mockSocket.data.user.userId],
        };
        const mockSavedMessage = {
          id: 'msg-1',
          workspaceId,
          senderId: mockSocket.data.user.userId,
          content: 'Hello world',
        };

        (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);
        (createMessage as jest.Mock).mockResolvedValue(mockSavedMessage);

        await eventListeners[SOCKET_EVENTS.SEND_MESSAGE]({
          workspaceId,
          content: 'Hello world',
        });

        expect(createMessage).toHaveBeenCalledWith(workspaceId, mockSocket.data.user.userId, 'Hello world');
        expect(mockIo.to).toHaveBeenCalledWith(workspaceId);
      });

      it('should reject non-member from sending message', async () => {
        const workspaceId = '507f1f77bcf86cd799439011';
        mockSocket.rooms.add(workspaceId);
        const mockWorkspace = {
          _id: workspaceId,
          ownerId: 'other-user',
          members: [],
        };

        (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

        await eventListeners[SOCKET_EVENTS.SEND_MESSAGE]({
          workspaceId,
          content: 'Hello world',
        });

        expect(createMessage).not.toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.ERROR, {
          message: 'Access to this workspace is forbidden',
        });
      });
    });

    describe('typing-start', () => {
      it('should allow member to emit typing-start and broadcast to room', async () => {
        const workspaceId = '507f1f77bcf86cd799439011';
        mockSocket.rooms.add(workspaceId);
        const mockWorkspace = {
          _id: workspaceId,
          ownerId: 'other-user',
          members: [mockSocket.data.user.userId],
        };

        (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

        await eventListeners[SOCKET_EVENTS.TYPING_START](workspaceId);

        expect(WorkspaceModel.findById).toHaveBeenCalledWith(workspaceId);
        expect(mockSocket.to).toHaveBeenCalledWith(workspaceId);
      });

      it('should reject non-member from emitting typing-start', async () => {
        const workspaceId = '507f1f77bcf86cd799439011';
        mockSocket.rooms.add(workspaceId);
        const mockWorkspace = {
          _id: workspaceId,
          ownerId: 'other-user',
          members: [],
        };

        (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

        await eventListeners[SOCKET_EVENTS.TYPING_START](workspaceId);

        expect(mockSocket.to).not.toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.ERROR, {
          message: 'Access to this workspace is forbidden',
        });
      });
    });

    describe('typing-stop', () => {
      it('should allow member to emit typing-stop and broadcast to room', async () => {
        const workspaceId = '507f1f77bcf86cd799439011';
        mockSocket.rooms.add(workspaceId);
        const mockWorkspace = {
          _id: workspaceId,
          ownerId: 'other-user',
          members: [mockSocket.data.user.userId],
        };

        (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

        await eventListeners[SOCKET_EVENTS.TYPING_STOP](workspaceId);

        expect(WorkspaceModel.findById).toHaveBeenCalledWith(workspaceId);
        expect(mockSocket.to).toHaveBeenCalledWith(workspaceId);
      });

      it('should reject non-member from emitting typing-stop', async () => {
        const workspaceId = '507f1f77bcf86cd799439011';
        mockSocket.rooms.add(workspaceId);
        const mockWorkspace = {
          _id: workspaceId,
          ownerId: 'other-user',
          members: [],
        };

        (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

        await eventListeners[SOCKET_EVENTS.TYPING_STOP](workspaceId);

        expect(mockSocket.to).not.toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalledWith(SOCKET_EVENTS.ERROR, {
          message: 'Access to this workspace is forbidden',
        });
      });
    });
  });
});
