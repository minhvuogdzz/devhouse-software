import { Router } from 'express';
import { siteController } from './site.controller.js';

export const contentPublicRoutes = Router();

contentPublicRoutes.get('/site', siteController.getSite);
contentPublicRoutes.get('/pages/:key', siteController.getPage);
