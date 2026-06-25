/**
 * Domain interface representing a Chat Message in the workspace.
 * Decoupled from any database-specific schema libraries (such as Mongoose).
 */
export interface IMessage {
  id: string;
  workspaceId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
