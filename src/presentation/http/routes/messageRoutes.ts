import { Router } from 'express';
import {
  sendMessage,
  getWorkspaceMessagesHandler,
} from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { sendMessageSchema, getWorkspaceMessagesSchema } from '../validators/messageValidation';

const router = Router();

// Secure all messaging endpoints
router.use(authMiddleware);

router.post('/', validateRequest(sendMessageSchema), sendMessage);
router.get(
  '/workspace/:workspaceId',
  validateRequest(getWorkspaceMessagesSchema),
  getWorkspaceMessagesHandler
);

export default router;
