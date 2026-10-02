import { Router } from 'express';
import { projectController } from './project.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';

export const projectAdminRoutes = Router();

projectAdminRoutes.get('/', requirePermission('projects:read'), projectController.adminList);
projectAdminRoutes.post('/', requirePermission('projects:create'), projectController.adminCreate);
projectAdminRoutes.get('/:id', requirePermission('projects:read'), projectController.adminGetById);
projectAdminRoutes.patch(
  '/:id',
  requirePermission('projects:update'),
  projectController.adminUpdate,
);
projectAdminRoutes.patch(
  '/:id/status',
  requirePermission('projects:publish'),
  projectController.adminUpdateStatus,
);
projectAdminRoutes.patch(
  '/reorder',
  requirePermission('projects:update'),
  projectController.adminReorder,
);
projectAdminRoutes.delete(
  '/:id',
  requirePermission('projects:delete'),
  projectController.adminDelete,
);
projectAdminRoutes.post(
  '/:id/restore',
  requirePermission('projects:delete'),
  projectController.adminRestore,
);
