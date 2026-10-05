import { Router } from 'express';
import { productController } from './product.controller.js';

export const productPublicRoutes = Router();

productPublicRoutes.get('/', productController.list);
productPublicRoutes.get('/:slug', productController.getBySlug);
