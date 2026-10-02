import { Router } from 'express';
import { serviceController } from './service.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';

export const serviceAdminRoutes = Router();

serviceAdminRoutes.get('/', requirePermission('services:read'), serviceController.adminList);
serviceAdminRoutes.post('/', requirePermission('services:create'), serviceController.adminCreate);
serviceAdminRoutes.get('/:id', requirePermission('services:read'), serviceController.adminGetById);
serviceAdminRoutes.patch(
  '/:id',
  requirePermission('services:update'),
  serviceController.adminUpdate,
);
serviceAdminRoutes.patch(
  '/:id/status',
  requirePermission('services:publish'),
  serviceController.adminUpdateStatus,
);
serviceAdminRoutes.patch(
  '/reorder',
  requirePermission('services:update'),
  serviceController.adminReorder,
);
serviceAdminRoutes.delete(
  '/:id',
  requirePermission('services:delete'),
  serviceController.adminDelete,
);
serviceAdminRoutes.post(
  '/:id/restore',
  requirePermission('services:delete'),
  serviceController.adminRestore,
);
