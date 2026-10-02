import { Router } from 'express';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { validate } from '../../core/middleware/validate.js';
import { AuthorSchema } from '@devhouse/shared';
import { blogController } from './blog.controller.js';

const router = Router();

router.get('/', requirePermission('authors:read'), blogController.adminListAuthors);

router.post(
  '/',
  requirePermission('authors:manage'),
  validate({ body: AuthorSchema }),
  blogController.adminCreateAuthor,
);

router.patch(
  '/:id',
  requirePermission('authors:manage'),
  validate({ body: AuthorSchema.partial() }),
  blogController.adminUpdateAuthor,
);

router.delete('/:id', requirePermission('authors:manage'), blogController.adminDeleteAuthor);

export const authorAdminRouter = router;
