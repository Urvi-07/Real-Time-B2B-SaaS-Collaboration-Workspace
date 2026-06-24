import { Request, Response, NextFunction } from 'express';
import { createMessage, getWorkspaceMessages } from '../../../application/services/messageService';
import { sendSuccess } from '../utils/apiResponse';
import { UnauthorizedError } from '../../../infrastructure/errors/AppError';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Send a message to a workspace.
 */
export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId, content } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const message = await createMessage(workspaceId, senderId, content);

    return sendSuccess(res, 'Message sent successfully', message, 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieve paginated message history for a workspace.
 */
export const getWorkspaceMessagesHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { workspaceId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));

    const { messages, total } = await getWorkspaceMessages(workspaceId as string, page, limit);
    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, 'Messages retrieved successfully', {
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};
