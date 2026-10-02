import { Router } from 'express';
import { requirePermission } from '../../core/middleware/require-permission.js';
import { validate } from '../../core/middleware/validate.js';
import { ContactStatusUpdateSchema, ContactNoteCreateSchema } from '@devhouse/shared';
import { contactController } from './contact.controller.js';

const router = Router();

router.get('/', requirePermission('contact:read'), contactController.adminList);

router.get('/:id', requirePermission('contact:read'), contactController.adminGetById);

router.patch(
  '/:id',
  requirePermission('contact:update'),
  validate({ body: ContactStatusUpdateSchema }),
  contactController.adminUpdate,
);

router.post(
  '/:id/notes',
  requirePermission('contact:update'),
  validate({ body: ContactNoteCreateSchema }),
  contactController.adminAddNote,
);

router.delete('/:id', requirePermission('contact:delete'), contactController.adminDelete);

export const contactAdminRoutes = router;
