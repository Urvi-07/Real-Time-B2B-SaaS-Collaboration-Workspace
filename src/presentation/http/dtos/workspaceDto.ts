import { z } from 'zod';
import { Types } from 'mongoose';

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Workspace name is required',
    })
    .min(3, 'Workspace name must be at least 3 characters')
    .max(100, 'Workspace name cannot exceed 100 characters'),
    description: z.string()
    .max(500, 'Workspace description cannot exceed 500 characters')
    .optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string()
    .min(3, 'Workspace name must be at least 3 characters')
    .max(100, 'Workspace name cannot exceed 100 characters')
    .optional(),
    description: z.string()
    .max(500, 'Workspace description cannot exceed 500 characters')
    .optional(),
  }),
});

export const addMemberSchema = z.object({
  params: z.object({
    workspaceId: z
      .string({
        message: 'Workspace ID is required',
      })
      .refine((val) => Types.ObjectId.isValid(val), {
        message: 'Invalid workspace ID format',
      }),
  }),
  body: z.object({
    userId: z
      .string({
        message: 'User ID is required',
      })
      .min(1, 'User ID cannot be empty'),
  }),
});
