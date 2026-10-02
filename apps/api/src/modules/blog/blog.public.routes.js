import { Router } from 'express';
import { blogController } from './blog.controller.js';

const router = Router();

router.get('/posts', blogController.listPosts);
router.get('/posts/:slug', blogController.getPostBySlug);
router.get('/tags', blogController.listTags);
router.get('/authors/:slug', blogController.getAuthor);

export const blogPublicRouter = router;
