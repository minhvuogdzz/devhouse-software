import { Router } from 'express';
import { packageController } from './package.controller.js';

export const packagePublicRoutes = Router();

packagePublicRoutes.get('/', packageController.list);
packagePublicRoutes.get('/:slug', packageController.getBySlug);
