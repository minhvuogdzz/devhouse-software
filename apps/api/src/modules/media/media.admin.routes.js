import { Router } from 'express';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { validate } from '../../core/middleware/validate.js';
import {
  MediaSignatureRequestSchema,
  MediaRegistrationSchema,
  MediaUpdateSchema,
} from '@devhouse/shared';
import { mediaController } from './media.controller.js';

const router = Router();

router.post(
  '/signature',
  requirePermission('media:upload'),
  validate({ body: MediaSignatureRequestSchema }),
  mediaController.getUploadSignature,
);

router.post(
  '/',
  requirePermission('media:upload'),
  validate({ body: MediaRegistrationSchema }),
  mediaController.registerMedia,
);

router.get('/', requirePermission('media:read'), mediaController.listMedia);

router.get('/:id', requirePermission('media:read'), mediaController.getMediaById);

router.patch(
  '/:id',
  requirePermission('media:update'),
  validate({ body: MediaUpdateSchema }),
  mediaController.updateMedia,
);

router.get('/:id/usage', requirePermission('media:read'), mediaController.getMediaUsage);

router.delete('/:id', requirePermission('media:delete'), mediaController.deleteMedia);

export const mediaAdminRoutes = router;
