import { Router } from 'express';
import { solutionController } from './solution.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';

export const solutionAdminRoutes = Router();

solutionAdminRoutes.get('/', requirePermission('solutions:read'), solutionController.adminList);
solutionAdminRoutes.post(
  '/',
  requirePermission('solutions:create'),
  solutionController.adminCreate,
);
solutionAdminRoutes.get(
  '/:id',
  requirePermission('solutions:read'),
  solutionController.adminGetById,
);
solutionAdminRoutes.patch(
  '/:id',
  requirePermission('solutions:update'),
  solutionController.adminUpdate,
);
solutionAdminRoutes.patch(
  '/:id/status',
  requirePermission('solutions:publish'),
  solutionController.adminUpdateStatus,
);
solutionAdminRoutes.patch(
  '/reorder',
  requirePermission('solutions:update'),
  solutionController.adminReorder,
);
solutionAdminRoutes.delete(
  '/:id',
  requirePermission('solutions:delete'),
  solutionController.adminDelete,
);
solutionAdminRoutes.post(
  '/:id/restore',
  requirePermission('solutions:delete'),
  solutionController.adminRestore,
);
