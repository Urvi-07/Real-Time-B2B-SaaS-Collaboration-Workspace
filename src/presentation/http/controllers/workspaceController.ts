import { Request, Response, NextFunction } from 'express';
import { WorkspaceModel } from '../../../infrastructure/database/models/Workspace';
import { sendSuccess } from '../utils/apiResponse';
import { NotFoundError, ForbiddenError, UnauthorizedError, BadRequestError, ConflictError } from '../../../infrastructure/errors/AppError';
import { users } from './authController';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Create a new workspace.
 * Automatically adds the creator as the owner and first member.
 */
export const createWorkspace = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user?.userId;

    if (!ownerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    if (!name) {
      throw new BadRequestError('Workspace name is required');
    }

    const workspace = await WorkspaceModel.create({
      name,
      description,
      ownerId,
      members: [ownerId],
    });

    return sendSuccess(res, 'Workspace created successfully', workspace, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieve all workspaces the authenticated user belongs to (as owner or member).
 */
export const getWorkspaces = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const workspaces = await WorkspaceModel.find({
      $or: [{ ownerId: userId }, { members: userId }],
    });

    return sendSuccess(res, 'Workspaces retrieved successfully', workspaces);
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieve a workspace by ID.
 * Access is restricted to workspace owners or members.
 */
export const getWorkspaceById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const workspace = await WorkspaceModel.findById(id);

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const isMember = workspace.members.includes(userId) || workspace.ownerId === userId;
    if (!isMember) {
      throw new ForbiddenError('Access to this workspace is forbidden');
    }

    return sendSuccess(res, 'Workspace retrieved successfully', workspace);
  } catch (error) {
    return next(error);
  }
};

/**
 * Update an existing workspace.
 * Only the owner is permitted to perform updates.
 */
export const updateWorkspace = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const workspace = await WorkspaceModel.findById(id);

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenError('Only the workspace owner can update details');
    }

    if (name !== undefined) workspace.name = name;
    if (description !== undefined) workspace.description = description;

    const updatedWorkspace = await workspace.save();

    return sendSuccess(res, 'Workspace updated successfully', updatedWorkspace);
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete a workspace.
 * Only the owner is permitted to delete the workspace.
 */
export const deleteWorkspace = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const workspace = await WorkspaceModel.findById(id);

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenError('Only the workspace owner can delete this workspace');
    }

    await WorkspaceModel.findByIdAndDelete(id);

    return sendSuccess(res, 'Workspace deleted successfully', { id });
  } catch (error) {
    return next(error);
  }
};

/**
 * Add a member to a workspace.
 * Only the owner is permitted to add members.
 */
export const addWorkspaceMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.ownerId !== currentUserId) {
      throw new ForbiddenError('Only the workspace owner can add members');
    }

    // Verify target user exists
    const userExists = users.find((user) => user.id === userId);
    if (!userExists) {
      throw new NotFoundError('User not found');
    }

    // Prevent duplicate members
    if (workspace.members.includes(userId)) {
      throw new ConflictError('User is already a member');
    }

    workspace.members.push(userId);
    await workspace.save();

    return sendSuccess(res, 'Member added successfully', {
      workspaceId: workspace._id.toString(),
      memberId: userId,
    });
  } catch (error) {
    return next(error);
  }
};
