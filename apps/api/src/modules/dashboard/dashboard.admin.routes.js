import { Router } from 'express';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { dashboardController } from './dashboard.controller.js';

const router = Router();

router.get('/', requirePermission('dashboard:read'), dashboardController.getSummary);

export const dashboardAdminRoutes = router;
