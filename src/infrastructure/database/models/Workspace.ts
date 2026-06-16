import { Schema, model, Document } from 'mongoose';

export interface IWorkspaceDocument extends Document {
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspaceDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    members: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const WorkspaceModel = model<IWorkspaceDocument>('Workspace', workspaceSchema);
