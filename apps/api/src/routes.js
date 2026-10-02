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

export const apiRouter = Router();

// Health checks
apiRouter.use('/health', healthRoutes);

// Auth routes
apiRouter.use('/auth', authRoutes);

// Public singleton content (/site, /pages/:key)
apiRouter.use('/', contentPublicRoutes);

// Admin routes (requires authentication on all admin endpoints)
export const adminRouter = Router();
adminRouter.use(authenticate);
adminRouter.use('/users', userAdminRoutes);
adminRouter.use('/roles', roleAdminRoutes);
adminRouter.use('/pages', pageAdminRoutes);
adminRouter.use('/settings', settingsAdminRoutes);
adminRouter.use('/navigation', navigationAdminRoutes);

apiRouter.use('/admin', adminRouter);
