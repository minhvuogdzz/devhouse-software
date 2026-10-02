import { Router } from 'express';
import { validate } from '../../core/middleware/validate.js';
import { ContactRequestSchema } from '@devhouse/shared';
import { contactController } from './contact.controller.js';

const router = Router();

router.post('/', validate({ body: ContactRequestSchema }), contactController.submitContact);

export const contactPublicRoutes = router;
