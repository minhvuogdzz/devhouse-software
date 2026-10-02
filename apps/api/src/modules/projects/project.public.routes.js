import { Router } from 'express';
import { projectController } from './project.controller.js';

export const projectPublicRoutes = Router();

projectPublicRoutes.get('/', projectController.list);
projectPublicRoutes.get('/:slug', projectController.getBySlug);
