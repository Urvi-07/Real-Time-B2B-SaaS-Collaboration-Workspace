import { Router } from 'express';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} from '../controllers/workspaceController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../dtos/workspaceDto';

const router = Router();

// Secure all workspace endpoints
router.use(authMiddleware);

router.post('/', validateRequest(createWorkspaceSchema), createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspaceById);
router.put('/:id', validateRequest(updateWorkspaceSchema), updateWorkspace);
router.delete('/:id', deleteWorkspace);

export default router;
