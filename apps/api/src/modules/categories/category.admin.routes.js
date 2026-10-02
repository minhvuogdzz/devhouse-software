import { Router } from 'express';
import { categoryController } from './category.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';

export const categoryAdminRoutes = Router();

categoryAdminRoutes.get('/', requirePermission('categories:read'), categoryController.adminList);
categoryAdminRoutes.post(
  '/',
  requirePermission('categories:manage'),
  categoryController.adminCreate,
);
categoryAdminRoutes.patch(
  '/reorder',
  requirePermission('categories:manage'),
  categoryController.adminReorder,
);
categoryAdminRoutes.patch(
  '/:id',
  requirePermission('categories:manage'),
  categoryController.adminUpdate,
);
categoryAdminRoutes.delete(
  '/:id',
  requirePermission('categories:manage'),
  categoryController.adminDelete,
);
