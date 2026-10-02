import { Router } from 'express';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { validate } from '../../core/middleware/validate.js';
import { TagSchema } from '@devhouse/shared';
import { blogController } from './blog.controller.js';

const router = Router();

router.get('/', requirePermission('tags:read'), blogController.adminListTags);

router.post(
  '/',
  requirePermission('tags:manage'),
  validate({ body: TagSchema }),
  blogController.adminCreateTag,
);

router.patch(
  '/:id',
  requirePermission('tags:manage'),
  validate({ body: TagSchema.partial() }),
  blogController.adminUpdateTag,
);

router.delete('/:id', requirePermission('tags:manage'), blogController.adminDeleteTag);

export const tagAdminRouter = router;
