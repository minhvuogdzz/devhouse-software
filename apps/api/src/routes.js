import { Router } from 'express';
import { healthRoutes } from './modules/health/health.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { contentPublicRoutes } from './modules/content/content.public.routes.js';
import { pageAdminRoutes } from './modules/content/page.admin.routes.js';
import { settingsAdminRoutes } from './modules/settings/settings.admin.routes.js';
import { navigationAdminRoutes } from './modules/navigation/navigation.admin.routes.js';
import { userAdminRoutes } from './modules/users/user.admin.routes.js';
import { roleAdminRoutes } from './modules/roles/role.admin.routes.js';
import { authenticate } from './core/middleware/authenticate.js';

import { servicePublicRoutes } from './modules/services/service.public.routes.js';
import { serviceAdminRoutes } from './modules/services/service.admin.routes.js';
import { solutionPublicRoutes } from './modules/solutions/solution.public.routes.js';
import { solutionAdminRoutes } from './modules/solutions/solution.admin.routes.js';
import { projectPublicRoutes } from './modules/projects/project.public.routes.js';
import { projectAdminRoutes } from './modules/projects/project.admin.routes.js';
import { technologyPublicRoutes } from './modules/technologies/technology.public.routes.js';
import { technologyAdminRoutes } from './modules/technologies/technology.admin.routes.js';
import { categoryPublicRoutes } from './modules/categories/category.public.routes.js';
import { categoryAdminRoutes } from './modules/categories/category.admin.routes.js';
import { blogPublicRouter } from './modules/blog/blog.public.routes.js';
import { postAdminRouter } from './modules/blog/post.admin.routes.js';
import { authorAdminRouter } from './modules/blog/author.admin.routes.js';
import { tagAdminRouter } from './modules/blog/tag.admin.routes.js';
import { mediaAdminRoutes } from './modules/media/media.admin.routes.js';
import { contactPublicRoutes } from './modules/contact/contact.public.routes.js';
import { contactAdminRoutes } from './modules/contact/contact.admin.routes.js';
import { seoPublicRoutes } from './modules/seo/seo.public.routes.js';
import { dashboardAdminRoutes } from './modules/dashboard/dashboard.admin.routes.js';
import { redirectAdminRoutes } from './modules/redirects/redirect.admin.routes.js';
import { auditLogAdminRoutes } from './modules/audit-logs/audit-log.admin.routes.js';

export const apiRouter = Router();

// Health checks
apiRouter.use('/health', healthRoutes);

// Auth routes
apiRouter.use('/auth', authRoutes);

// Public singleton content (/site, /pages/:key)
apiRouter.use('/', contentPublicRoutes);

// Public catalog routes
apiRouter.use('/services', servicePublicRoutes);
apiRouter.use('/solutions', solutionPublicRoutes);
apiRouter.use('/projects', projectPublicRoutes);
apiRouter.use('/technologies', technologyPublicRoutes);
apiRouter.use('/categories', categoryPublicRoutes);
apiRouter.use('/blog', blogPublicRouter);
apiRouter.use('/contact', contactPublicRoutes);
apiRouter.use('/seo', seoPublicRoutes);

// Admin routes (requires authentication on all admin endpoints)
export const adminRouter = Router();
adminRouter.use(authenticate);
adminRouter.use('/dashboard', dashboardAdminRoutes);
adminRouter.use('/users', userAdminRoutes);
adminRouter.use('/roles', roleAdminRoutes);
adminRouter.use('/pages', pageAdminRoutes);
adminRouter.use('/settings', settingsAdminRoutes);
adminRouter.use('/navigation', navigationAdminRoutes);
adminRouter.use('/services', serviceAdminRoutes);
adminRouter.use('/solutions', solutionAdminRoutes);
adminRouter.use('/projects', projectAdminRoutes);
adminRouter.use('/technologies', technologyAdminRoutes);
adminRouter.use('/categories', categoryAdminRoutes);
adminRouter.use('/blog/posts', postAdminRouter);
adminRouter.use('/blog/authors', authorAdminRouter);
adminRouter.use('/blog/tags', tagAdminRouter);
adminRouter.use('/media', mediaAdminRoutes);
adminRouter.use('/contact-requests', contactAdminRoutes);
adminRouter.use('/contact', contactAdminRoutes);
adminRouter.use('/redirects', redirectAdminRoutes);
adminRouter.use('/audit-logs', auditLogAdminRoutes);

apiRouter.use('/admin', adminRouter);
