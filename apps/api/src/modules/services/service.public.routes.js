import { Router } from 'express';
import { serviceController } from './service.controller.js';

export const servicePublicRoutes = Router();

servicePublicRoutes.get('/', serviceController.list);
servicePublicRoutes.get('/:slug', serviceController.getBySlug);
