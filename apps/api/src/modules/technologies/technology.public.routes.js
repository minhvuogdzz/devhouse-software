import { Router } from 'express';
import { technologyController } from './technology.controller.js';

export const technologyPublicRoutes = Router();

technologyPublicRoutes.get('/', technologyController.list);
technologyPublicRoutes.get('/:slug', technologyController.getBySlug);
