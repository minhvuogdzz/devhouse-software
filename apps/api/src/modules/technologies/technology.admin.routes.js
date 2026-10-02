import { Router } from 'express';
import { technologyController } from './technology.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';

export const technologyAdminRoutes = Router();

technologyAdminRoutes.get(
  '/',
  requirePermission('technologies:read'),
  technologyController.adminList,
);
technologyAdminRoutes.post(
  '/',
  requirePermission('technologies:create'),
  technologyController.adminCreate,
);
technologyAdminRoutes.get(
  '/:id',
  requirePermission('technologies:read'),
  technologyController.adminGetById,
);
technologyAdminRoutes.patch(
  '/:id',
  requirePermission('technologies:update'),
  technologyController.adminUpdate,
);
technologyAdminRoutes.patch(
  '/:id/status',
  requirePermission('technologies:publish'),
  technologyController.adminUpdateStatus,
);
technologyAdminRoutes.patch(
  '/reorder',
  requirePermission('technologies:update'),
  technologyController.adminReorder,
);
technologyAdminRoutes.delete(
  '/:id',
  requirePermission('technologies:delete'),
  technologyController.adminDelete,
);
technologyAdminRoutes.post(
  '/:id/restore',
  requirePermission('technologies:delete'),
  technologyController.adminRestore,
);
