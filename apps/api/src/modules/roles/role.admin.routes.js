import { Router } from 'express';
import { roleController } from './role.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { validate } from '../../core/middleware/validate.js';
import { RoleSchema } from '@devhouse/shared';

export const roleAdminRoutes = Router();

roleAdminRoutes.get(
  '/permissions',
  requirePermission('roles:read'),
  roleController.listPermissions,
);
roleAdminRoutes.get('/', requirePermission('roles:read'), roleController.list);
roleAdminRoutes.post(
  '/',
  requirePermission('roles:manage'),
  validate({ body: RoleSchema }),
  roleController.create,
);
roleAdminRoutes.get('/:id', requirePermission('roles:read'), roleController.getById);
roleAdminRoutes.patch(
  '/:id',
  requirePermission('roles:manage'),
  validate({ body: RoleSchema.partial() }),
  roleController.update,
);
roleAdminRoutes.delete('/:id', requirePermission('roles:manage'), roleController.delete);
