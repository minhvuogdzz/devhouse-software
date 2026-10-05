import { Router } from 'express';
import { ProductSchema, ProductUpdateSchema } from '@devhouse/shared';
import { productController } from './product.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { validateBody } from '../../core/middleware/validate-body.js';

export const productAdminRoutes = Router();

productAdminRoutes.get('/', requirePermission('products:read'), productController.adminList);
productAdminRoutes.post(
  '/',
  requirePermission('products:create'),
  ...validateBody(ProductSchema),
  productController.adminCreate,
);
productAdminRoutes.patch(
  '/reorder',
  requirePermission('products:update'),
  productController.adminReorder,
);
productAdminRoutes.get('/:id', requirePermission('products:read'), productController.adminGetById);
productAdminRoutes.patch(
  '/:id',
  requirePermission('products:update'),
  ...validateBody(ProductUpdateSchema),
  productController.adminUpdate,
);
productAdminRoutes.patch(
  '/:id/status',
  requirePermission('products:publish'),
  productController.adminUpdateStatus,
);
productAdminRoutes.delete(
  '/:id',
  requirePermission('products:delete'),
  productController.adminDelete,
);
productAdminRoutes.post(
  '/:id/restore',
  requirePermission('products:delete'),
  productController.adminRestore,
);
