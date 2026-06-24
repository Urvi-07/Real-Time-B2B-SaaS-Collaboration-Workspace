import { z } from 'zod';
import { Types } from 'mongoose';

/**
 * Validation schema for sending a new message.
 */
export const sendMessageSchema = z.object({
  body: z.object({
    workspaceId: z
      .string({
        message: 'Workspace ID is required',
      })
      .refine((val) => Types.ObjectId.isValid(val), {
        message: 'Invalid workspace ID format',
      }),
    content: z
      .string({
        message: 'Message content is required',
      })
      .min(1, 'Message content cannot be empty')
      .max(5000, 'Message content cannot exceed 5000 characters'),
  }),
});

/**
 * Validation schema for retrieving messages in a workspace.
 */
export const getWorkspaceMessagesSchema = z.object({
  params: z.object({
    workspaceId: z
      .string({
        message: 'Workspace ID is required',
      })
      .refine((val) => Types.ObjectId.isValid(val), {
        message: 'Invalid workspace ID format',
      }),
  }),
});
