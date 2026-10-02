import { Router } from 'express';
import { settingsAdminController } from './settings.admin.controller.js';
import { requirePermission } from '../../core/middleware/require-permission.js';

export const settingsAdminRoutes = Router();

settingsAdminRoutes.get(
  '/',
  requirePermission('settings:read'),
  settingsAdminController.getSettings,
);
settingsAdminRoutes.put(
  '/',
  requirePermission('settings:update'),
  settingsAdminController.updateSettings,
);
