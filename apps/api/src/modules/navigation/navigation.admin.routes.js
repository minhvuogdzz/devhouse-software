import { Router } from 'express';
import { navigationAdminController } from './navigation.admin.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';

export const navigationAdminRoutes = Router();

navigationAdminRoutes.get(
  '/',
  requirePermission('navigation:read'),
  navigationAdminController.list,
);
navigationAdminRoutes.get(
  '/:key',
  requirePermission('navigation:read'),
  navigationAdminController.getByKey,
);
navigationAdminRoutes.put(
  '/:key',
  requirePermission('navigation:update'),
  navigationAdminController.update,
);
