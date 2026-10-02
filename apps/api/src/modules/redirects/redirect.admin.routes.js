import { Router } from 'express';
import { z } from 'zod';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { validate } from '../../core/middleware/validate.js';
import { redirectController } from './redirect.controller.js';

const router = Router();

const RedirectInputSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  sourcePath: z.string().optional(),
  targetPath: z.string().optional(),
  statusCode: z.union([z.literal(301), z.literal(302)]).default(301),
  isActive: z.boolean().optional().default(true),
  note: z.string().optional().default(''),
});

router.get('/', requirePermission('redirects:read'), redirectController.adminList);

router.post(
  '/',
  requirePermission('redirects:manage'),
  validate({ body: RedirectInputSchema }),
  redirectController.adminCreate,
);

router.get('/:id', requirePermission('redirects:read'), redirectController.adminGetById);

router.patch(
  '/:id',
  requirePermission('redirects:manage'),
  validate({ body: RedirectInputSchema.partial() }),
  redirectController.adminUpdate,
);

router.delete('/:id', requirePermission('redirects:manage'), redirectController.adminDelete);

export const redirectAdminRoutes = router;
