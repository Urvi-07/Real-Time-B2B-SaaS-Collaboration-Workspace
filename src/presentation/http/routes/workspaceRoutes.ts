import { Router } from 'express';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
} from '../controllers/workspaceController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createWorkspaceSchema, updateWorkspaceSchema, addMemberSchema } from '../dtos/workspaceDto';

const router = Router();

// Secure all workspace endpoints
router.use(authMiddleware);

router.post('/', validateRequest(createWorkspaceSchema), createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspaceById);
router.put('/:id', validateRequest(updateWorkspaceSchema), updateWorkspace);
router.delete('/:id', deleteWorkspace);
router.post('/:workspaceId/members', validateRequest(addMemberSchema), addWorkspaceMember);

export default router;
