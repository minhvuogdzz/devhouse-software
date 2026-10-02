import { Router } from 'express';
import { solutionController } from './solution.controller.js';

export const solutionPublicRoutes = Router();

solutionPublicRoutes.get('/', solutionController.list);
solutionPublicRoutes.get('/:slug', solutionController.getBySlug);
