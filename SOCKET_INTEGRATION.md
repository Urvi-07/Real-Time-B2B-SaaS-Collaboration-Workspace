# Socket.IO Integration Guide

## Overview

The project uses Socket.IO to provide real-time communication between workspace members. Users can join workspace rooms, exchange messages instantly, and receive typing indicators.

---

## Authentication

- Socket connections require a valid JWT.
- JWT is verified during the Socket.IO handshake.
- Unauthorized connections are rejected.

---

## Workspace Events

### join-workspace

Allows an authenticated user to join a workspace room.

Validation:
- User must be authenticated.
- Workspace ID must be valid.
- User must belong to the workspace.
- Duplicate joins are prevented.

---

### leave-workspace

Removes the user from the workspace room.

Validation:
- User must already belong to the room.

---

### send-message

Broadcasts a message to all users in the workspace.

Validation:
- User must be authenticated.
- Workspace membership is verified.
- Message cannot be empty.
- Maximum message length is enforced.

---

### typing-start

Notifies other users that a member has started typing.

Validation:
- User must belong to the workspace.

---

### typing-stop

Stops the typing indicator for other users.

Validation:
- User must belong to the workspace.

---

## Connection Recovery

Previously joined workspaces are restored when a user reconnects.

---

## Logging

The Socket.IO module logs:

- Successful connections
- Authentication failures
- Workspace joins
- Workspace leaves
- Duplicate join attempts
- Message broadcasts
- Disconnect events

These logs simplify debugging during development and integration testing.

---

## Testing Checklist

- Backend starts successfully.
- MongoDB connects successfully.
- Socket.IO initializes.
- JWT authentication succeeds.
- Users can join workspaces.
- Users can leave workspaces.
- Messages are broadcast successfully.
- Typing indicators work correctly.
- Duplicate workspace joins are prevented.
- Project builds successfully.