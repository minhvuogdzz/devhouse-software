import { Router } from 'express';
import { pageAdminController } from './page.admin.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';

export const pageAdminRoutes = Router();

pageAdminRoutes.get('/', requirePermission('pages:read'), pageAdminController.list);
pageAdminRoutes.get('/:key', requirePermission('pages:read'), pageAdminController.getByKey);
pageAdminRoutes.put('/:key', requirePermission('pages:update'), pageAdminController.update);
pageAdminRoutes.delete(
  '/:key/sections/:section',
  requirePermission('pages:update'),
  pageAdminController.resetSection,
);
pageAdminRoutes.post('/:key/reset', requirePermission('pages:update'), pageAdminController.reset);
