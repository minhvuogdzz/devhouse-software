import { Router } from 'express';
import { categoryController } from './category.controller.js';

export const categoryPublicRoutes = Router();

categoryPublicRoutes.get('/', categoryController.listPublic);
