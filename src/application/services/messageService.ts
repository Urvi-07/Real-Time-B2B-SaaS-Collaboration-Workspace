import { MessageModel, IMessageDocument } from '../../infrastructure/database/models/Message';
import { IMessage } from '../../domain/interfaces/IMessage';
import { Types } from 'mongoose';
import { BadRequestError } from '../../infrastructure/errors/AppError';

/**
 * Converts a database Mongoose document to a database-agnostic domain entity.
 */
const mapToDomain = (doc: IMessageDocument): IMessage => {
  return {
    id: (doc._id as Types.ObjectId).toString(),
    workspaceId: doc.workspaceId.toString(),
    senderId: doc.senderId.toString(),
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

/**
 * Stores a new chat message in MongoDB for a specific workspace.
 * 
 * @param workspaceId The MongoDB identifier of the target workspace.
 * @param senderId The MongoDB identifier of the message sender.
 * @param content The text body of the chat message.
 */
export const createMessage = async (
  workspaceId: string,
  senderId: string,
  content: string
): Promise<IMessage> => {
  if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
    throw new BadRequestError('Invalid workspace ID');
  }
  if (!senderId || !Types.ObjectId.isValid(senderId)) {
    throw new BadRequestError('Invalid sender ID');
  }
  if (!content || content.trim().length === 0) {
    throw new BadRequestError('Message content cannot be empty');
  }

  const doc = await MessageModel.create({
    workspaceId: new Types.ObjectId(workspaceId),
    senderId: new Types.ObjectId(senderId),
    content: content.trim(),
  });

  return mapToDomain(doc);
};

/**
 * Retrieves a paginated list of chat history for a workspace, sorted chronologically.
 * 
 * @param workspaceId The MongoDB identifier of the target workspace.
 * @param page The requested page number (1-indexed).
 * @param limit The maximum number of messages to return per page.
 */
export const getWorkspaceMessages = async (
  workspaceId: string,
  page = 1,
  limit = 20
): Promise<{ messages: IMessage[]; total: number }> => {
  if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
    throw new BadRequestError('Invalid workspace ID');
  }

  const query = { workspaceId: new Types.ObjectId(workspaceId) };
  
  const [total, docs] = await Promise.all([
    MessageModel.countDocuments(query),
    MessageModel.find(query)
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return {
    messages: docs.map(mapToDomain),
    total,
  };
};
