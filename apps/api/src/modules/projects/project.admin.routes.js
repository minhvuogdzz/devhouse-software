import { Router } from 'express';
import { ProjectSchema, ProjectUpdateSchema } from '@devhouse/shared';
import { projectController } from './project.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { validateBody } from '../../core/middleware/validate-body.js';

export const projectAdminRoutes = Router();

projectAdminRoutes.get('/', requirePermission('projects:read'), projectController.adminList);
projectAdminRoutes.post(
  '/',
  requirePermission('projects:create'),
  ...validateBody(ProjectSchema),
  projectController.adminCreate,
);
projectAdminRoutes.patch(
  '/reorder',
  requirePermission('projects:update'),
  projectController.adminReorder,
);
projectAdminRoutes.get('/:id', requirePermission('projects:read'), projectController.adminGetById);
projectAdminRoutes.patch(
  '/:id',
  requirePermission('projects:update'),
  ...validateBody(ProjectUpdateSchema),
  projectController.adminUpdate,
);
projectAdminRoutes.patch(
  '/:id/status',
  requirePermission('projects:publish'),
  projectController.adminUpdateStatus,
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
