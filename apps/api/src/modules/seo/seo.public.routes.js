import { Router } from 'express';
import { seoController } from './seo.controller.js';

const router = Router();

router.get('/sitemap', seoController.getSitemap);
router.get('/redirects/resolve', seoController.resolveRedirect);

export const seoPublicRoutes = router;
