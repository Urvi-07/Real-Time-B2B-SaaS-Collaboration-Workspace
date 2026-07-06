/* eslint-disable @typescript-eslint/no-explicit-any */
import { createWorkspace, getWorkspaces, getWorkspaceById, updateWorkspace, deleteWorkspace, addWorkspaceMember } from './workspaceController';
import { WorkspaceModel } from '../../../infrastructure/database/models/Workspace';
import { NotFoundError, ForbiddenError, UnauthorizedError, BadRequestError, ConflictError } from '../../../infrastructure/errors/AppError';
import { users } from './authController';

jest.mock('../../../infrastructure/database/models/Workspace');

describe('Workspace Controller', () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('createWorkspace', () => {
    it('should create a workspace and return 201', async () => {
      mockRequest.body = { name: 'New Workspace', description: 'Some description' };
      mockRequest.user = { userId: 'owner1', email: 'owner@workspace.com' };

      const mockWorkspace = {
        _id: 'ws1',
        name: 'New Workspace',
        description: 'Some description',
        ownerId: 'owner1',
        members: ['owner1'],
      };

      (WorkspaceModel.create as jest.Mock).mockResolvedValue(mockWorkspace);

      await createWorkspace(mockRequest, mockResponse, nextFunction);

      expect(WorkspaceModel.create).toHaveBeenCalledWith({
        name: 'New Workspace',
        description: 'Some description',
        ownerId: 'owner1',
        members: ['owner1'],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Workspace created successfully',
        data: mockWorkspace,
      });
    });

    it('should call next with UnauthorizedError if auth is missing', async () => {
      mockRequest.body = { name: 'New Workspace' };

      await createWorkspace(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with BadRequestError if name is missing', async () => {
      mockRequest.body = { description: 'No Name' };
      mockRequest.user = { userId: 'owner1' };

      await createWorkspace(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('getWorkspaces', () => {
    it('should return workspaces the user owns or belongs to', async () => {
      mockRequest.user = { userId: 'user1' };
      const mockWorkspaces = [
        { _id: 'ws1', name: 'WS 1', ownerId: 'user1', members: ['user1'] },
        { _id: 'ws2', name: 'WS 2', ownerId: 'other', members: ['other', 'user1'] },
      ];

      (WorkspaceModel.find as jest.Mock).mockResolvedValue(mockWorkspaces);

      await getWorkspaces(mockRequest, mockResponse, nextFunction);

      expect(WorkspaceModel.find).toHaveBeenCalledWith({
        $or: [{ ownerId: 'user1' }, { members: 'user1' }],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Workspaces retrieved successfully',
        data: mockWorkspaces,
      });
    });
  });

  describe('getWorkspaceById', () => {
    it('should return the workspace if user is a member', async () => {
      mockRequest.params = { id: 'ws1' };
      mockRequest.user = { userId: 'user1' };
      const mockWorkspace = { _id: 'ws1', name: 'WS 1', ownerId: 'other', members: ['user1'] };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

      await getWorkspaceById(mockRequest, mockResponse, nextFunction);

      expect(WorkspaceModel.findById).toHaveBeenCalledWith('ws1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should call next with ForbiddenError if user is not a member', async () => {
      mockRequest.params = { id: 'ws1' };
      mockRequest.user = { userId: 'unauthorized_user' };
      const mockWorkspace = { _id: 'ws1', name: 'WS 1', ownerId: 'other', members: ['user1'] };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

      await getWorkspaceById(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should call next with NotFoundError if workspace does not exist', async () => {
      mockRequest.params = { id: 'invalid_ws' };
      mockRequest.user = { userId: 'user1' };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(null);

      await getWorkspaceById(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });

  describe('updateWorkspace', () => {
    it('should save updates if user is the owner', async () => {
      mockRequest.params = { id: 'ws1' };
      mockRequest.body = { name: 'Updated Name', description: 'Updated Desc' };
      mockRequest.user = { userId: 'owner1' };

      const mockWorkspaceSave = jest.fn().mockResolvedValue({
        _id: 'ws1',
        name: 'Updated Name',
        description: 'Updated Desc',
        ownerId: 'owner1',
      });

      const mockWorkspace = {
        _id: 'ws1',
        name: 'WS 1',
        description: 'Old Desc',
        ownerId: 'owner1',
        save: mockWorkspaceSave,
      };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

      await updateWorkspace(mockRequest, mockResponse, nextFunction);

      expect(mockWorkspace.name).toBe('Updated Name');
      expect(mockWorkspace.description).toBe('Updated Desc');
      expect(mockWorkspaceSave).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should call next with ForbiddenError if non-owner attempts update', async () => {
      mockRequest.params = { id: 'ws1' };
      mockRequest.body = { name: 'New Name' };
      mockRequest.user = { userId: 'non-owner' };

      const mockWorkspace = {
        _id: 'ws1',
        name: 'WS 1',
        ownerId: 'owner1',
      };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

      await updateWorkspace(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete the workspace if user is the owner', async () => {
      mockRequest.params = { id: 'ws1' };
      mockRequest.user = { userId: 'owner1' };

      const mockWorkspace = {
        _id: 'ws1',
        name: 'WS 1',
        ownerId: 'owner1',
      };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);
      (WorkspaceModel.findByIdAndDelete as jest.Mock).mockResolvedValue(true);

      await deleteWorkspace(mockRequest, mockResponse, nextFunction);

      expect(WorkspaceModel.findByIdAndDelete).toHaveBeenCalledWith('ws1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Workspace deleted successfully',
        data: { id: 'ws1' },
      });
    });

    it('should call next with ForbiddenError if non-owner attempts delete', async () => {
      mockRequest.params = { id: 'ws1' };
      mockRequest.user = { userId: 'non-owner' };

      const mockWorkspace = {
        _id: 'ws1',
        ownerId: 'owner1',
      };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

      await deleteWorkspace(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(WorkspaceModel.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });

  describe('addWorkspaceMember', () => {
    const targetUserId = 'targetUser123';

    beforeEach(() => {
      // Clear users list and seed target user
      users.length = 0;
      users.push({
        id: targetUserId,
        name: 'Target User',
        email: 'target@test.com',
        password: 'hashedpassword',
      });
    });

    afterEach(() => {
      users.length = 0;
    });

    it('should successfully add a member and return 200', async () => {
      mockRequest.params = { workspaceId: 'ws1' };
      mockRequest.body = { userId: targetUserId };
      mockRequest.user = { userId: 'owner1' };

      const mockWorkspaceSave = jest.fn().mockResolvedValue({
        _id: 'ws1',
        name: 'WS 1',
        ownerId: 'owner1',
        members: ['owner1', targetUserId],
      });

      const mockWorkspace = {
        _id: 'ws1',
        name: 'WS 1',
        ownerId: 'owner1',
        members: ['owner1'],
        save: mockWorkspaceSave,
      };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

      await addWorkspaceMember(mockRequest, mockResponse, nextFunction);

      expect(WorkspaceModel.findById).toHaveBeenCalledWith('ws1');
      expect(mockWorkspace.members).toContain(targetUserId);
      expect(mockWorkspaceSave).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Member added successfully',
        data: {
          workspaceId: 'ws1',
          memberId: targetUserId,
        },
      });
    });

    it('should call next with UnauthorizedError if auth is missing', async () => {
      mockRequest.params = { workspaceId: 'ws1' };
      mockRequest.body = { userId: targetUserId };

      await addWorkspaceMember(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with NotFoundError if workspace is not found', async () => {
      mockRequest.params = { workspaceId: 'ws_invalid' };
      mockRequest.body = { userId: targetUserId };
      mockRequest.user = { userId: 'owner1' };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(null);

      await addWorkspaceMember(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with ForbiddenError if non-owner attempts to add member', async () => {
      mockRequest.params = { workspaceId: 'ws1' };
      mockRequest.body = { userId: targetUserId };
      mockRequest.user = { userId: 'non-owner' };

      const mockWorkspace = {
        _id: 'ws1',
        ownerId: 'owner1',
        members: ['owner1'],
      };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

      await addWorkspaceMember(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should call next with NotFoundError if user does not exist', async () => {
      mockRequest.params = { workspaceId: 'ws1' };
      mockRequest.body = { userId: 'non-existent-user' };
      mockRequest.user = { userId: 'owner1' };

      const mockWorkspace = {
        _id: 'ws1',
        ownerId: 'owner1',
        members: ['owner1'],
      };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

      await addWorkspaceMember(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it('should call next with ConflictError if user is already a member', async () => {
      mockRequest.params = { workspaceId: 'ws1' };
      mockRequest.body = { userId: targetUserId };
      mockRequest.user = { userId: 'owner1' };

      const mockWorkspace = {
        _id: 'ws1',
        ownerId: 'owner1',
        members: ['owner1', targetUserId],
      };

      (WorkspaceModel.findById as jest.Mock).mockResolvedValue(mockWorkspace);

      await addWorkspaceMember(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ConflictError));
    });
  });
});
