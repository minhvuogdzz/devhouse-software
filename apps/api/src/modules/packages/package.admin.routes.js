import { Router } from 'express';
import { PackageSchema, PackageUpdateSchema } from '@devhouse/shared';
import { packageController } from './package.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { validateBody } from '../../core/middleware/validate-body.js';

export const packageAdminRoutes = Router();

packageAdminRoutes.get('/', requirePermission('packages:read'), packageController.adminList);
packageAdminRoutes.post(
  '/',
  requirePermission('packages:create'),
  ...validateBody(PackageSchema),
  packageController.adminCreate,
);
packageAdminRoutes.patch(
  '/reorder',
  requirePermission('packages:update'),
  packageController.adminReorder,
);
packageAdminRoutes.get('/:id', requirePermission('packages:read'), packageController.adminGetById);
packageAdminRoutes.patch(
  '/:id',
  requirePermission('packages:update'),
  ...validateBody(PackageUpdateSchema),
  packageController.adminUpdate,
);
packageAdminRoutes.patch(
  '/:id/status',
  requirePermission('packages:publish'),
  packageController.adminUpdateStatus,
);
packageAdminRoutes.delete(
  '/:id',
  requirePermission('packages:delete'),
  packageController.adminDelete,
);
packageAdminRoutes.post(
  '/:id/restore',
  requirePermission('packages:delete'),
  packageController.adminRestore,
);
