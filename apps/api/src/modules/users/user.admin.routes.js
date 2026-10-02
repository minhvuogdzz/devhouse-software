import { Router } from 'express';
import { userController } from './user.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { validate } from '../../core/middleware/validate.js';
import { UserSchema } from '@devhouse/shared';

export const userAdminRoutes = Router();

userAdminRoutes.get('/', requirePermission('users:read'), userController.list);
userAdminRoutes.post(
  '/',
  requirePermission('users:create'),
  validate({ body: UserSchema }),
  userController.create,
);
userAdminRoutes.get('/:id', requirePermission('users:read'), userController.getById);
userAdminRoutes.patch(
  '/:id',
  requirePermission('users:update'),
  validate({ body: UserSchema.partial() }),
  userController.update,
);
userAdminRoutes.delete('/:id', requirePermission('users:delete'), userController.delete);
