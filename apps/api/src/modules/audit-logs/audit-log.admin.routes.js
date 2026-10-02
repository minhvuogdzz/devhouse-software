import { Router } from 'express';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { auditLogController } from './audit-log.controller.js';

const router = Router();

router.get('/', requirePermission('audit:read'), auditLogController.adminList);

router.get('/:id', requirePermission('audit:read'), auditLogController.adminGetById);

export const auditLogAdminRoutes = router;
