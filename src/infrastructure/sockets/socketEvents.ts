/**
 * Centralized Socket.IO event constants used across the application.
 */
export const SOCKET_EVENTS = {
  JOIN_WORKSPACE: 'join-workspace',
  LEAVE_WORKSPACE: 'leave-workspace',
  SEND_MESSAGE: 'send-message',
  BROADCAST_MESSAGE: 'broadcast-message',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
