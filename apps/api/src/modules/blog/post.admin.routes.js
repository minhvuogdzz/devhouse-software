import { Router } from 'express';
import { z } from 'zod';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { validate } from '../../core/middleware/validate.js';
import { BlogPostSchema } from '@devhouse/shared';
import { blogController } from './blog.controller.js';

const router = Router();

const StatusUpdateSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
});

router.get('/', requirePermission('blog:read'), blogController.adminListPosts);

router.post(
  '/',
  requirePermission('blog:create'),
  validate({ body: BlogPostSchema }),
  blogController.adminCreatePost,
);

router.get('/:id', requirePermission('blog:read'), blogController.adminGetPostById);

router.patch(
  '/:id',
  requirePermission('blog:update'),
  validate({ body: BlogPostSchema.partial() }),
  blogController.adminUpdatePost,
);

router.patch(
  '/:id/status',
  requirePermission('blog:publish'),
  validate({ body: StatusUpdateSchema }),
  blogController.adminUpdatePostStatus,
);

router.delete('/:id', requirePermission('blog:delete'), blogController.adminDeletePost);

router.post('/:id/restore', requirePermission('blog:delete'), blogController.adminRestorePost);

export const postAdminRouter = router;
