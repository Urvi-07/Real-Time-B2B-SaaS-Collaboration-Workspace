import { Schema, model, Document, Types } from 'mongoose';

export interface IMessageDocument extends Document {
  workspaceId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessageDocument>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      minlength: [1, 'Message content cannot be empty'],
      maxlength: [5000, 'Message content cannot exceed 5000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Optimize query index for fetching workspace chat history sorted by creation time
messageSchema.index({ workspaceId: 1, createdAt: 1 });

export const MessageModel = model<IMessageDocument>('Message', messageSchema);
