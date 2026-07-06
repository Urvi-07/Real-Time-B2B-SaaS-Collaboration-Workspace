import { createMessage, getWorkspaceMessages } from './messageService';
import { MessageModel } from '../../infrastructure/database/models/Message';
import { BadRequestError } from '../../infrastructure/errors/AppError';
import { Types } from 'mongoose';

jest.mock('../../infrastructure/database/models/Message');

describe('Message Service', () => {
  const validWorkspaceId = new Types.ObjectId().toString();
  const validSenderId = new Types.ObjectId().toString();
  const validContent = 'Hello B2B World!';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should successfully store a message and return the domain object', async () => {
      const mockDoc = {
        _id: new Types.ObjectId(),
        workspaceId: new Types.ObjectId(validWorkspaceId),
        senderId: validSenderId,
        content: validContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (MessageModel.create as jest.Mock).mockResolvedValue(mockDoc);

      const result = await createMessage(validWorkspaceId, validSenderId, validContent);

      expect(MessageModel.create).toHaveBeenCalledWith({
        workspaceId: new Types.ObjectId(validWorkspaceId),
        senderId: validSenderId,
        content: validContent,
      });
      expect(result.content).toBe(validContent);
      expect(result.workspaceId).toBe(validWorkspaceId);
      expect(result.senderId).toBe(validSenderId);
      expect(result.id).toBe(mockDoc._id.toString());
    });

    it('should successfully store a message with a string sender ID like "1783225905344"', async () => {
      const stringSenderId = '1783225905344';
      const mockDoc = {
        _id: new Types.ObjectId(),
        workspaceId: new Types.ObjectId(validWorkspaceId),
        senderId: stringSenderId,
        content: validContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (MessageModel.create as jest.Mock).mockResolvedValue(mockDoc);

      const result = await createMessage(validWorkspaceId, stringSenderId, validContent);

      expect(MessageModel.create).toHaveBeenCalledWith({
        workspaceId: new Types.ObjectId(validWorkspaceId),
        senderId: stringSenderId,
        content: validContent,
      });
      expect(result.senderId).toBe(stringSenderId);
    });

    it('should throw BadRequestError if workspaceId is invalid', async () => {
      await expect(createMessage('invalid-id', validSenderId, validContent))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if senderId is empty', async () => {
      await expect(createMessage(validWorkspaceId, '', validContent))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if content is empty', async () => {
      await expect(createMessage(validWorkspaceId, validSenderId, '   '))
        .rejects.toThrow(BadRequestError);
    });
  });

  describe('getWorkspaceMessages', () => {
    it('should fetch workspace messages in chronological order with pagination', async () => {
      const mockDocs = [
        {
          _id: new Types.ObjectId(),
          workspaceId: new Types.ObjectId(validWorkspaceId),
          senderId: new Types.ObjectId(validSenderId),
          content: 'First Msg',
          createdAt: new Date(Date.now() - 1000),
          updatedAt: new Date(Date.now() - 1000),
        },
        {
          _id: new Types.ObjectId(),
          workspaceId: new Types.ObjectId(validWorkspaceId),
          senderId: new Types.ObjectId(validSenderId),
          content: 'Second Msg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDocs),
      };

      (MessageModel.countDocuments as jest.Mock).mockResolvedValue(2);
      (MessageModel.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await getWorkspaceMessages(validWorkspaceId, 1, 2);

      expect(MessageModel.countDocuments).toHaveBeenCalledWith({
        workspaceId: new Types.ObjectId(validWorkspaceId),
      });
      expect(MessageModel.find).toHaveBeenCalledWith({
        workspaceId: new Types.ObjectId(validWorkspaceId),
      });
      expect(mockQuery.select).toHaveBeenCalledWith('_id workspaceId senderId content createdAt updatedAt');
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: 1 });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(2);
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(result.total).toBe(2);
      expect(result.messages.length).toBe(2);
      expect(result.messages[0].content).toBe('First Msg');
      expect(result.messages[1].content).toBe('Second Msg');
    });

    it('should throw BadRequestError if workspaceId is invalid', async () => {
      await expect(getWorkspaceMessages('invalid-id'))
        .rejects.toThrow(BadRequestError);
    });
  });
});
